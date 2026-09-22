import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import { useAuth } from "../context/AuthContext";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Send,
  PlusCircle,
  RefreshCw,
  Landmark,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

export const AccountSummary = ({ onOpenSend, onOpenNewAccount }) => {
  const { user } = useAuth();
  const {
    accounts,
    activeAccount,
    setActiveAccount,
    balance,
    currency,
    fetchBalance,
    loading,
  } = useBank();
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCopy = () => {
    if (activeAccount?.id) {
      navigator.clipboard.writeText(activeAccount.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    if (activeAccount?.id) {
      setRefreshing(true);
      await fetchBalance(activeAccount.id);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(balance || 0);

  return (
    <div className="w-full max-w-5xl mx-auto my-6">
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-gray-800 shadow-2xl">
        {/* Top Header: Account Switcher & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  {user?.name ? `${user.name}'s Account` : "Bank Account"}
                </h2>
                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {activeAccount?.status || "Active"}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Primary Banking Ledger Account
              </p>
            </div>
          </div>

          {/* Account Switcher if user has multiple accounts */}
          {accounts.length > 1 && (
            <div className="relative">
              <select
                value={activeAccount?.id || ""}
                onChange={(e) => {
                  const sel = accounts.find((a) => a.id === e.target.value);
                  if (sel) setActiveAccount(sel);
                }}
                className="glass-input text-xs rounded-xl px-3.5 py-2 pr-9 appearance-none cursor-pointer focus:outline-none text-white font-medium"
              >
                {accounts.map((acc, idx) => (
                  <option key={acc.id} value={acc.id} className="bg-gray-900 text-white">
                    Account #{idx + 1} ({acc.currency}) - {acc.id.slice(0, 8)}...
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Main Balance Display */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
              <span>Available Balance</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title={showBalance ? "Hide Balance" : "Show Balance"}
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleRefresh}
                className={`p-1 text-gray-400 hover:text-emerald-400 transition-colors ${
                  refreshing ? "animate-spin text-emerald-400" : ""
                }`}
                title="Refresh Balance"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {showBalance ? formattedBalance : "₹ ••••••••"}
              </h1>
            </div>

            {/* Account Number & Copy Button */}
            <div className="flex items-center space-x-2 mt-3 text-xs">
              <span className="text-gray-400">Account Number:</span>
              <span className="font-mono font-semibold text-gray-200">
                {activeAccount?.id || "No Account"}
              </span>
              {activeAccount?.id && (
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                  title="Copy Full Account Number"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSend}
              className="flex items-center space-x-2 py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg glow-emerald"
            >
              <Send className="w-4 h-4" />
              <span>Send Money</span>
            </button>

            <button
              onClick={onOpenNewAccount}
              className="flex items-center space-x-2 py-3.5 px-5 rounded-2xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold text-xs transition-all"
            >
              <PlusCircle className="w-4 h-4 text-gray-300" />
              <span>Open New Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
