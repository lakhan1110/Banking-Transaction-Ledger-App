import jwt from "jsonwebtoken";
import { ApiError } from "../errors/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const verifyToken = (jwtSecret = process.env.JWT_SECRET) => {
  return asyncHandler(async (req, res, next) => {
    // 1. Check if user is already populated from API Gateway headers
    const gatewayUserId = req.headers["x-user-id"];
    if (gatewayUserId) {
      req.user = {
        _id: gatewayUserId,
        email: req.headers["x-user-email"],
        systemUser: req.headers["x-user-system"] === "true",
      };
      return next();
    }

    // 2. Otherwise extract token from cookie or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "You are not authorized to access this resource");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret || process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      throw new ApiError(401, "Invalid or expired token");
    }
  });
};

export const authSystemUser = (jwtSecret = process.env.JWT_SECRET) => {
  return asyncHandler(async (req, res, next) => {
    // 1. Check if user is already attached by verifyToken
    if (req.user) {
      if (!req.user.systemUser) {
        throw new ApiError(403, "Forbidden access, not a system user");
      }
      return next();
    }

    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "You are not authorized to access this resource");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret || process.env.JWT_SECRET);
      if (!decoded.systemUser) {
        throw new ApiError(403, "Forbidden access, not a system user");
      }
      req.user = decoded;
      next();
    } catch (error) {
      throw new ApiError(401, "Invalid token");
    }
  });
};
