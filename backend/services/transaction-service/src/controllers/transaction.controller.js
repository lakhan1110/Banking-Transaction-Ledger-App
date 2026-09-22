import mongoose from "mongoose";
import { asyncHandler, ApiError, ApiResponse, EventTypes, acquireLock, releaseLock } from "@bank/shared";
import { Transaction } from "../models/transaction.model.js";
import { Ledger } from "../models/ledger.model.js";
import redisClient from "../config/redis.js";
import {
  validateAccount,
  getSystemUser,
  getSystemAccount,
  getUserById,
} from "../services/accountClient.service.js";

export const createTransactionController = (eventBus) => {
  /**
   * - Execute Peer-to-Peer Transfer
   * - Route: POST /api/transactions
   */
  const createTransaction = asyncHandler(async (req, res) => {
    const { fromAccount, toAccount, amount } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] || req.body.idempotencyKey;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      throw new ApiError(400, "All fields (fromAccount, toAccount, amount, idempotencyKey) are required");
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new ApiError(400, "Invalid amount: must be greater than 0");
    }

    if (String(fromAccount) === String(toAccount)) {
      throw new ApiError(400, "Cannot transfer to the same account");
    }

    // 🔒 1. Distributed Redis Mutex Lock
    const lockKey = `transaction:${idempotencyKey}`;
    const LOCK_TTL = process.env.LOCK_TTL_MS ? Number(process.env.LOCK_TTL_MS) : 30000;

    const lockAcquired = await acquireLock(redisClient, lockKey, LOCK_TTL);
    if (!lockAcquired) {
      throw new ApiError(429, "Transaction is already being processed");
    }

    // 🔍 2. Validate both accounts via Account Service
    const [fromAccData, toAccData] = await Promise.all([
      validateAccount(fromAccount),
      validateAccount(toAccount),
    ]);

    if (!fromAccData.isActive || !toAccData.isActive) {
      await releaseLock(redisClient, lockKey);
      throw new ApiError(400, "Both source and destination accounts must be active");
    }

    // Verify ownership of source account if authenticated user is attached
    if (req.user && req.user._id && fromAccData.user !== req.user._id.toString() && !req.user.systemUser) {
      await releaseLock(redisClient, lockKey);
      throw new ApiError(403, "You do not have permission to transfer from this account");
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // 🔍 3. Idempotency Check
      const existingTransaction = await Transaction.findOne({ idempotencyKey }).session(session);

      if (existingTransaction) {
        await session.abortTransaction();
        const status = existingTransaction.status;
        const statusCode = status === "failed" ? 400 : status === "reversed" ? 409 : 200;

        return res.status(statusCode).json(
          new ApiResponse(
            statusCode,
            { transaction: existingTransaction },
            `Transaction already ${status}`
          )
        );
      }

      // 💰 4. Balance check inside session using Ledger
      const currentBalance = await Ledger.getBalance(fromAccount, session);

      if (currentBalance < numAmount) {
        throw new ApiError(400, `Insufficient balance. Available: ₹${currentBalance}, Requested: ₹${numAmount}`);
      }

      // 📝 5. Create Transaction Record
      let transaction;
      try {
        [transaction] = await Transaction.create(
          [
            {
              fromAccount,
              toAccount,
              amount: numAmount,
              idempotencyKey,
              status: "pending",
            },
          ],
          { session }
        );
      } catch (createErr) {
        if (createErr?.code === 11000) {
          const existing = await Transaction.findOne({ idempotencyKey }).session(session);
          if (existing) {
            await session.abortTransaction();
            return res.status(200).json(
              new ApiResponse(200, { transaction: existing }, "Transaction already exists")
            );
          }
        }
        throw createErr;
      }

      // 📚 6. Create Double-Entry Immutable Ledger Records
      await Ledger.create(
        [
          {
            account: fromAccount,
            type: "debit",
            amount: numAmount,
            Transaction: transaction._id,
          },
          {
            account: toAccount,
            type: "credit",
            amount: numAmount,
            Transaction: transaction._id,
          },
        ],
        { session, ordered: true }
      );

      // ✅ 7. Complete Transaction & Commit Session
      transaction.status = "completed";
      await transaction.save({ session });

      await session.commitTransaction();

      // Fetch recipient user details for notification email
      const receiverUser = toAccData.user ? await getUserById(toAccData.user) : null;

      // 📬 8. Asynchronously Publish Event to RabbitMQ for BOTH sender and receiver
      if (eventBus) {
        // Sender Debit Alert
        if (req.user?.email) {
          eventBus.publish(EventTypes.TRANSACTION_COMPLETED, {
            transactionId: transaction._id.toString(),
            fromAccount,
            toAccount,
            amount: numAmount,
            userEmail: req.user.email,
            userName: req.user.name || "Customer",
            type: "debit",
          });
        }

        // Receiver Credit Alert
        if (receiverUser?.email && receiverUser.email !== req.user?.email) {
          eventBus.publish(EventTypes.TRANSACTION_COMPLETED, {
            transactionId: transaction._id.toString(),
            fromAccount,
            toAccount,
            amount: numAmount,
            userEmail: receiverUser.email,
            userName: receiverUser.name || "Customer",
            type: "credit",
          });
        }
      }

      return res.status(201).json(
        new ApiResponse(201, { transaction }, "Transaction completed successfully")
      );
    } catch (err) {
      await session.abortTransaction().catch(() => {});

      await Transaction.updateOne({ idempotencyKey }, { status: "failed" }).catch(() => {});

      if (eventBus) {
        eventBus.publish(EventTypes.TRANSACTION_FAILED, {
          fromAccount,
          toAccount,
          amount: numAmount,
          reason: err.message,
          userEmail: req.user?.email,
          userName: req.user?.name || "Customer",
        });
      }

      throw err;
    } finally {
      await releaseLock(redisClient, lockKey);
      session.endSession();
    }
  });

  /**
   * - System Initial Funds Deposit
   * - Route: POST /api/transactions/system/initialfunds
   */
  const createInitialFundsTransaction = asyncHandler(async (req, res) => {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
      throw new ApiError(400, "All fields (toAccount, amount, idempotencyKey) are required");
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new ApiError(400, "Invalid amount");
    }

    // 🔒 1. Distributed Lock
    const lockKey = `initial-fund:${toAccount}`;
    const lockAcquired = await acquireLock(redisClient, lockKey, 30000);
    if (!lockAcquired) {
      throw new ApiError(429, "Initial fund is already being processed");
    }

    // 🔍 2. Validate destination account
    const toAccData = await validateAccount(toAccount);
    if (!toAccData.isActive) {
      await releaseLock(redisClient, lockKey);
      throw new ApiError(400, "Destination account is not active");
    }

    // 🏛️ 3. Get system user and bank account
    const systemUser = await getSystemUser();
    const systemAccount = await getSystemAccount(systemUser._id);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Idempotency check
      const existing = await Transaction.findOne({ idempotencyKey }).session(session);
      if (existing) {
        await session.abortTransaction();
        return res.status(200).json(
          new ApiResponse(200, { transaction: existing }, "Initial funds transaction already completed")
        );
      }

      // Create transaction
      const [transaction] = await Transaction.create(
        [
          {
            fromAccount: systemAccount.id,
            toAccount,
            amount: numAmount,
            idempotencyKey,
            status: "pending",
          },
        ],
        { session }
      );

      // Ledger entries
      await Ledger.create(
        [
          {
            account: systemAccount.id,
            type: "debit",
            amount: numAmount,
            Transaction: transaction._id,
          },
          {
            account: toAccount,
            type: "credit",
            amount: numAmount,
            Transaction: transaction._id,
          },
        ],
        { session, ordered: true }
      );

      transaction.status = "completed";
      await transaction.save({ session });

      await session.commitTransaction();

      // Fetch recipient user details for notification email
      const receiverUser = await getUserById(toAccData.user);

      if (eventBus && receiverUser?.email) {
        eventBus.publish(EventTypes.INITIAL_FUNDS_ADDED, {
          transactionId: transaction._id.toString(),
          fromAccount: systemAccount.id,
          toAccount,
          amount: numAmount,
          userEmail: receiverUser.email,
          userName: receiverUser.name || "Customer",
          type: "credit",
        });
      }

      return res.status(201).json(
        new ApiResponse(201, { transaction }, "Initial funds credited successfully")
      );
    } catch (err) {
      await session.abortTransaction().catch(() => {});
      await Transaction.updateOne({ idempotencyKey }, { status: "failed" }).catch(() => {});
      throw err;
    } finally {
      await releaseLock(redisClient, lockKey);
      session.endSession();
    }
  });

  /**
   * - Get dynamic balance of an account from Ledger
   * - Route: GET /api/transactions/balance/:accountId
   */
  const getAccountBalance = asyncHandler(async (req, res) => {
    const { accountId } = req.params;

    // Validate account exists
    const accData = await validateAccount(accountId);

    // If authenticated user is attached, verify ownership
    if (req.user && req.user._id && accData.user !== req.user._id.toString() && !req.user.systemUser) {
      throw new ApiError(403, "You are not authorized to view this account's balance");
    }

    const balance = await Ledger.getBalance(accountId);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          account: {
            id: accountId,
            balance,
            currency: accData.currency || "INR",
          },
        },
        "Account balance retrieved successfully"
      )
    );
  });

  /**
   * - Fetch Account Transactions History
   * - Route: GET /api/transactions/history/:accountId
   */
  const getAccountTransactions = asyncHandler(async (req, res) => {
    const { accountId } = req.params;

    if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
      throw new ApiError(400, "Valid account ID is required");
    }

    const accData = await validateAccount(accountId);

    if (req.user && req.user._id && accData.user !== req.user._id.toString() && !req.user.systemUser) {
      throw new ApiError(403, "You are not authorized to view this account's transactions");
    }

    const txDocs = await Transaction.find({
      $or: [{ fromAccount: accountId }, { toAccount: accountId }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const transactions = txDocs.map((tx) => ({
      id: tx._id.toString(),
      type: tx.toAccount.toString() === accountId ? "credit" : "debit",
      amount: tx.amount,
      from: tx.fromAccount.toString(),
      to: tx.toAccount.toString(),
      status: tx.status,
      timestamp: tx.createdAt,
      idempotencyKey: tx.idempotencyKey,
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        { transactions },
        "Account transactions retrieved successfully"
      )
    );
  });

  return {
    createTransaction,
    createInitialFundsTransaction,
    getAccountBalance,
    getAccountTransactions,
  };
};
