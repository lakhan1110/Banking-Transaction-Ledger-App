import { Account } from "../models/account.model.js";
import { asyncHandler, ApiError, ApiResponse } from "@bank/shared";

/**
 * - Create a new bank account for authenticated user
 * - Route: POST /api/accounts/createaccount
 */
export const createAccount = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user || !user._id) {
    throw new ApiError(401, "User authentication required");
  }

  const { currency = "INR" } = req.body || {};

  const account = await Account.create({
    user: user._id,
    currency,
    status: "active",
  });

  if (!account) {
    throw new ApiError(500, "Account creation failed");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        account: {
          id: account._id.toString(),
          status: account.status,
          currency: account.currency,
          user: account.user.toString(),
        },
      },
      "Account created successfully"
    )
  );
});

/**
 * - Get all accounts of the logged in user
 * - Route: GET /api/accounts/getaccounts
 */
export const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ user: req.user._id })
    .select("_id status currency createdAt")
    .lean()
    .exec();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accounts: accounts.map((acc) => ({
          id: acc._id.toString(),
          status: acc.status,
          currency: acc.currency,
          createdAt: acc.createdAt,
        })),
      },
      "Accounts retrieved successfully"
    )
  );
});

/**
 * - Get single account details by ID
 * - Route: GET /api/accounts/:id
 */
export const getAccountById = asyncHandler(async (req, res) => {
  const account = await Account.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).lean();

  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        account: {
          id: account._id.toString(),
          status: account.status,
          currency: account.currency,
          createdAt: account.createdAt,
        },
      },
      "Account details retrieved successfully"
    )
  );
});

/**
 * - Internal: Validate account status for transaction service
 * - Route: GET /api/accounts/internal/:id/validate
 */
export const validateAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id).lean();

  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: account._id.toString(),
        user: account.user.toString(),
        status: account.status,
        currency: account.currency,
        isActive: account.status === "active",
      },
      "Account validated successfully"
    )
  );
});

/**
 * - Internal: Get system user bank account
 * - Route: GET /api/accounts/internal/system-account/:systemUserId
 */
export const getSystemAccount = asyncHandler(async (req, res) => {
  const { systemUserId } = req.params;

  let account = await Account.findOne({
    user: systemUserId,
    status: "active",
  }).lean();

  // If system account doesn't exist yet, automatically create one
  if (!account) {
    account = await Account.create({
      user: systemUserId,
      status: "active",
      currency: "INR",
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: account._id.toString(),
        user: account.user.toString(),
        status: account.status,
        currency: account.currency,
      },
      "System account retrieved successfully"
    )
  );
});
