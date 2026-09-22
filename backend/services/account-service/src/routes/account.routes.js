import { Router } from "express";
import { verifyToken } from "@bank/shared";
import {
  createAccount,
  getAccounts,
  getAccountById,
  validateAccount,
  getSystemAccount,
} from "../controllers/account.controller.js";

const router = Router();

/* Public protected routes */
router.route("/createaccount").post(verifyToken(), createAccount);
router.route("/getaccounts").get(verifyToken(), getAccounts);
router.route("/:id").get(verifyToken(), getAccountById);

/* Internal inter-service routes */
router.route("/internal/:id/validate").get(validateAccount);
router.route("/internal/system-account/:systemUserId").get(getSystemAccount);

export default router;
