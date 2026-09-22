import { Router } from "express";
import { verifyToken, authSystemUser } from "@bank/shared";

export const createTransactionRouter = (transactionController) => {
  const router = Router();

  /* P2P Transfer (Protected) */
  router.route("/").post(verifyToken(), transactionController.createTransaction);

  /* System Initial Funds (System User only) */
  router.route("/system/initialfunds").post(authSystemUser(), transactionController.createInitialFundsTransaction);

  /* Account Dynamic Balance check (Protected) */
  router.route("/balance/:accountId").get(verifyToken(), transactionController.getAccountBalance);

  /* Account Transactions History (Protected) */
  router.route("/history/:accountId").get(verifyToken(), transactionController.getAccountTransactions);

  return router;
};
