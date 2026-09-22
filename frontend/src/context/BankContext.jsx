import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { accountApi, transactionApi, healthApi } from "../api/client";
import { useAuth } from "./AuthContext";

const BankContext = createContext();

export const BankProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);

  const fetchAccounts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await accountApi.getAccounts();
      const accList = res?.data?.accounts || [];
      setAccounts(accList);
      if (accList.length > 0) {
        setActiveAccount((prev) => {
          const exists = accList.find((a) => a.id === prev?.id);
          return exists || accList[0];
        });
      } else {
        setActiveAccount(null);
        setBalance(0);
        setRecentTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchBalance = useCallback(async (accountId) => {
    if (!accountId || !isAuthenticated) return;
    try {
      const res = await transactionApi.getBalance(accountId);
      if (res?.data?.account) {
        setBalance(res.data.account.balance || 0);
        setCurrency(res.data.account.currency || "INR");
      }
    } catch (err) {
      console.warn("Could not fetch ledger balance:", err.message);
    }
  }, [isAuthenticated]);

  const fetchTransactions = useCallback(async (accountId) => {
    if (!accountId || !isAuthenticated) return;
    try {
      const res = await transactionApi.getTransactions(accountId);
      if (res?.data?.transactions) {
        setRecentTransactions(res.data.transactions);
      }
    } catch (err) {
      console.warn("Could not fetch transactions:", err.message);
    }
  }, [isAuthenticated]);

  const checkHealth = useCallback(async () => {
    try {
      const res = await healthApi.checkGateway();
      setSystemHealth(res);
    } catch (err) {
      setSystemHealth({ status: "DOWN", error: err.message });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
      checkHealth();
    } else {
      setAccounts([]);
      setActiveAccount(null);
      setBalance(0);
      setRecentTransactions([]);
    }
  }, [isAuthenticated, fetchAccounts, checkHealth]);

  useEffect(() => {
    if (activeAccount?.id) {
      fetchBalance(activeAccount.id);
      fetchTransactions(activeAccount.id);
    }
  }, [activeAccount, fetchBalance, fetchTransactions]);

  const createNewAccount = async (curr = "INR") => {
    const res = await accountApi.createAccount(curr);
    await fetchAccounts();
    return res;
  };

  const sendTransfer = async (toAccountId, amount) => {
    if (!activeAccount?.id) throw new Error("No active account selected");
    const idempotencyKey = crypto.randomUUID();
    const res = await transactionApi.transfer(
      activeAccount.id,
      toAccountId,
      amount,
      idempotencyKey
    );

    // Refresh live balance and transactions directly from backend
    await Promise.all([
      fetchBalance(activeAccount.id),
      fetchTransactions(activeAccount.id),
    ]);
    return res;
  };

  const depositFunds = async (amount, targetAccountId) => {
    const accId = targetAccountId || activeAccount?.id;
    if (!accId) throw new Error("Target account ID is required");
    const idempotencyKey = crypto.randomUUID();
    const res = await transactionApi.depositInitialFunds(
      accId,
      amount,
      token,
      idempotencyKey
    );

    // Refresh live balance and transactions directly from backend
    if (activeAccount?.id === accId) {
      await Promise.all([
        fetchBalance(accId),
        fetchTransactions(accId),
      ]);
    }
    return res;
  };

  return (
    <BankContext.Provider
      value={{
        accounts,
        activeAccount,
        setActiveAccount,
        balance,
        currency,
        loading,
        recentTransactions,
        systemHealth,
        fetchAccounts,
        fetchBalance,
        fetchTransactions,
        createNewAccount,
        sendTransfer,
        depositFunds,
        checkHealth,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => useContext(BankContext);
