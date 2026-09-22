import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import { useAuth } from "../context/AuthContext";
import {
  Landmark,
  Plus,
  Send,
  PlusCircle,
  Copy,
  Check,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

export const SystemAdminDashboard = ({
  onOpenIssueFunds,
  onOpenSend,
  onOpenNewAccount,
}) => {
  const { user } = useAuth();
  const {
    activeAccount,
    balance,
    currency,
    fetchBalance,
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
    <div className="w-full max-w-5xl mx-auto my-6 space-y-6">
      {/* Central Treasury Card with 3D Treasury Emblem */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        {/* 3D Treasury Emblem Watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-72 opacity-15 pointer-events-none">
          <img
            src="/assets/treasury_emblem.jpg"
            alt="3D Treasury Emblem"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Top Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center glow-amber">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white">
                  Central Bank Treasury Console
                </h2>
                <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  System Administrator
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Logged in as: <span className="text-gray-200 font-semibold">{user?.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Treasury Controls & Balance */}
        <div className="relative z-10 py-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
              <span>System Operating Account Balance</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title={showBalance ? "Hide Balance" : "Show Balance"}
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleRefresh}
                className={`p-1 text-gray-400 hover:text-amber-400 transition-colors ${
                  refreshing ? "animate-spin text-amber-400" : ""
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

            {/* Account ID */}
            <div className="flex items-center space-x-2 mt-3 text-xs">
              <span className="text-gray-400">System Account ID:</span>
              <span className="font-mono font-semibold text-gray-200">
                {activeAccount?.id || "No Account"}
              </span>
              {activeAccount?.id && (
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                  title="Copy Account Number"
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

          {/* Admin Operations Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Primary Action: Issue Funds to Anyone */}
            <button
              onClick={onOpenIssueFunds}
              className="flex items-center space-x-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs transition-all shadow-lg"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Deposit Funds to Customer</span>
            </button>

            {/* Normal Send Transfer */}
            <button
              onClick={onOpenSend}
              className="flex items-center space-x-2 py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Send Money</span>
            </button>

            {/* Open Account */}
            <button
              onClick={onOpenNewAccount}
              className="flex items-center space-x-2 py-3.5 px-4 rounded-2xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold text-xs transition-all"
            >
              <PlusCircle className="w-4 h-4 text-gray-300" />
              <span>New Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
