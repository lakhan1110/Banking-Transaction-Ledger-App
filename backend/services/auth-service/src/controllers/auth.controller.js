import { User } from "../models/user.model.js";
import { asyncHandler, ApiError, ApiResponse, EventTypes } from "@bank/shared";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

export const createAuthController = (eventBus) => {
  /**
   * - User Registration
   * - Route: POST /api/auth/register
   */
  const registerUser = asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;

    if ([email, name, password].some((field) => !field || field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(422, "Email already exists, please use a different email address");
    }

    const user = await User.create({
      email,
      name,
      password,
    });

    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
    const token = jwt.sign(
      { _id: user._id, email: user.email, systemUser: user.systemUser || false },
      jwtSecret,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // 📬 Asynchronously publish domain event for Welcome Email
    if (eventBus) {
      eventBus.publish(EventTypes.AUTH_USER_REGISTERED, {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      });
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
          },
          token,
        },
        "User registered successfully"
      )
    );
  });

  /**
   * - User Login
   * - Route: POST /api/auth/login
   */
  const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => !field || field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email }).select("+password +systemUser");

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Generate a 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const ttl = Number(process.env.OTP_TTL_SECONDS) || 300; // default 5 minutes
    const key = `login_otp:${user._id}`;

    const payload = {
      otp,
      attempts: 0,
      createdAt: Date.now(),
    };

    try {
      await redisClient.set(key, JSON.stringify(payload), { EX: ttl });
    } catch (err) {
      console.error("Redis error storing OTP:", err?.message || err);
      throw new ApiError(500, "Internal server error storing OTP");
    }

    // 📬 Asynchronously publish domain event for OTP Email
    if (eventBus) {
      eventBus.publish(EventTypes.AUTH_OTP_REQUESTED, {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        otp,
        ttlMinutes: Math.ceil(ttl / 60),
      });
    }

    return res.status(200).json(
      new ApiResponse(200, null, "OTP sent to registered email")
    );
  });

  /**
   * - Verify OTP and complete login
   * - Route: POST /api/auth/verify-otp
   */
  const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if ([email, otp].some((field) => !field || String(field)?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email }).select("+systemUser");

    if (!user) throw new ApiError(404, "User not found");

    const key = `login_otp:${user._id}`;

    let stored = null;
    try {
      stored = await redisClient.get(key);
    } catch (err) {
      console.error("Redis error reading OTP:", err?.message || err);
      throw new ApiError(500, "Internal server error reading OTP");
    }

    if (!stored) {
      throw new ApiError(401, "OTP expired or not found");
    }

    let data = null;
    try {
      data = JSON.parse(stored);
    } catch (e) {
      data = { otp: stored, attempts: 0 };
    }

    const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 5;

    if (data.attempts >= MAX_ATTEMPTS) {
      await redisClient.del(key).catch(() => {});
      throw new ApiError(429, "Too many attempts, please login again");
    }

    if (data.otp !== String(otp).trim()) {
      data.attempts = (data.attempts || 0) + 1;
      try {
        await redisClient.set(key, JSON.stringify(data), {
          EX: Number(process.env.OTP_TTL_SECONDS) || 300,
        });
      } catch (err) {
        console.warn("Failed to update OTP attempts in redis", err?.message || err);
      }
      throw new ApiError(401, "Invalid verification code");
    }

    // OTP matched — remove key and issue JWT
    try {
      await redisClient.del(key);
    } catch (err) {
      /* ignore */
    }

    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
    const token = jwt.sign(
      { _id: user._id, email: user.email, systemUser: user.systemUser || false },
      jwtSecret,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            systemUser: user.systemUser || false,
          },
          token,
        },
        "User logged in successfully"
      )
    );
  });

  /**
   * - Get current user profile
   * - Route: GET /api/auth/profile
   */
  const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password +systemUser");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, { user }, "User profile retrieved successfully"));
  });

  /**
   * - Internal: Get user by ID (for other microservices)
   * - Route: GET /api/auth/internal/users/:id
   */
  const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("+systemUser");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
      new ApiResponse(200, {
        _id: user._id,
        name: user.name,
        email: user.email,
        systemUser: user.systemUser || false,
      }, "User details retrieved successfully")
    );
  });

  /**
   * - Internal: Get system user
   * - Route: GET /api/auth/internal/system-user
   */
  const getSystemUser = asyncHandler(async (req, res) => {
    const systemUser = await User.findOne({ systemUser: true }).select("+systemUser");
    if (!systemUser) {
      throw new ApiError(404, "System user not found");
    }
    return res.status(200).json(
      new ApiResponse(200, {
        _id: systemUser._id,
        name: systemUser.name,
        email: systemUser.email,
        systemUser: true,
      }, "System user retrieved successfully")
    );
  });

  return {
    registerUser,
    loginUser,
    verifyOtp,
    getProfile,
    getUserById,
    getSystemUser,
  };
};
