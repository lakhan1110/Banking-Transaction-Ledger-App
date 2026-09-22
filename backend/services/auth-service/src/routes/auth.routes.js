import { Router } from "express";
import { verifyToken } from "@bank/shared";

export const createAuthRouter = (authController) => {
  const router = Router();

  /* Public routes */
  router.route("/register").post(authController.registerUser);
  router.route("/login").post(authController.loginUser);
  router.route("/verify-otp").post(authController.verifyOtp);

  /* Protected routes */
  router.route("/profile").get(verifyToken(), authController.getProfile);

  /* Internal inter-service routes */
  router.route("/internal/users/:id").get(authController.getUserById);
  router.route("/internal/system-user").get(authController.getSystemUser);

  return router;
};
