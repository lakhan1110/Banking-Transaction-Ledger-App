import { ApiError } from "@bank/shared";

const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || "http://localhost:5002";
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";

/**
 * Validate that an account exists and is in 'active' status
 */
export const validateAccount = async (accountId) => {
  try {
    const url = `${ACCOUNT_SERVICE_URL}/api/accounts/internal/${accountId}/validate`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 404) {
      throw new ApiError(404, `Account ${accountId} not found`);
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errData.message || "Failed to validate account");
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`Account service communication error for ${accountId}:`, error.message);
    throw new ApiError(503, "Account service is currently unavailable");
  }
};

/**
 * Retrieve system user details from Auth Service
 */
export const getSystemUser = async () => {
  try {
    const url = `${AUTH_SERVICE_URL}/api/auth/internal/system-user`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new ApiError(404, "System user not found in Auth Service");
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Auth service communication error for system user:", error.message);
    throw new ApiError(503, "Auth service is currently unavailable");
  }
};

/**
 * Retrieve user details by ID from Auth Service
 */
export const getUserById = async (userId) => {
  try {
    const url = `${AUTH_SERVICE_URL}/api/auth/internal/users/${userId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn(`Could not fetch user info for ${userId}:`, error.message);
    return null;
  }
};

/**
 * Retrieve or create system bank account from Account Service
 */
export const getSystemAccount = async (systemUserId) => {
  try {
    const url = `${ACCOUNT_SERVICE_URL}/api/accounts/internal/system-account/${systemUserId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new ApiError(500, "Failed to retrieve system account from Account Service");
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Account service communication error for system account:", error.message);
    throw new ApiError(503, "Account service is currently unavailable");
  }
};
