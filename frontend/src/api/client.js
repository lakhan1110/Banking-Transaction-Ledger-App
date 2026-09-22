const BASE_URL = import.meta.env.VITE_API_URL || "";

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("nexus_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    throw err;
  }
};

/* Auth API */
export const authApi = {
  register: (name, email, password) =>
    apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email, password) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  verifyOtp: (email, otp) =>
    apiRequest("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),
  getProfile: () => apiRequest("/api/auth/profile"),
};

/* Account API */
export const accountApi = {
  createAccount: (currency = "INR") =>
    apiRequest("/api/accounts/createaccount", {
      method: "POST",
      body: JSON.stringify({ currency }),
    }),
  getAccounts: () => apiRequest("/api/accounts/getaccounts"),
  getAccountById: (id) => apiRequest(`/api/accounts/${id}`),
};

/* Transaction API */
export const transactionApi = {
  transfer: (fromAccount, toAccount, amount, idempotencyKey = crypto.randomUUID()) =>
    apiRequest("/api/transactions", {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({ fromAccount, toAccount, amount, idempotencyKey }),
    }),
  getBalance: (accountId) => apiRequest(`/api/transactions/balance/${accountId}`),
  getTransactions: (accountId) => apiRequest(`/api/transactions/history/${accountId}`),
  depositInitialFunds: (toAccount, amount, systemToken, idempotencyKey = crypto.randomUUID()) =>
    apiRequest("/api/transactions/system/initialfunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${systemToken}`,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({ toAccount, amount, idempotencyKey }),
    }),
};

/* Gateway & Microservices Health */
export const healthApi = {
  checkGateway: () => apiRequest("/health"),
};
