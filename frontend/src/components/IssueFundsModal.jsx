import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import { useAuth } from "../context/AuthContext";
import { transactionApi } from "../api/client";
import { X, Landmark, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";

export const IssueFundsModal = ({ isOpen, onClose, onDepositSuccess }) => {
  const { token } = useAuth();
  const { fetchBalance, activeAccount } = useBank();
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("10000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessData(null);

    const numAmount = Number(amount);
    if (!toAccount || toAccount.trim() === "") {
      setError("Please enter the Target Account Number.");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    try {
      setLoading(true);
      const idempotencyKey = crypto.randomUUID();
      const res = await transactionApi.depositInitialFunds(
        toAccount.trim(),
        numAmount,
        token, // Uses the logged-in System User's JWT token
        idempotencyKey
      );

      setSuccessData({
        amount: numAmount,
        toAccount: toAccount.trim(),
        transactionId: res.data?.transaction?._id || "TXN_" + Date.now(),
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // If deposited to active account, refresh balance
      if (activeAccount?.id === toAccount.trim()) {
        await fetchBalance(activeAccount.id);
      }

      if (onDepositSuccess) {
        onDepositSuccess();
      }

      setToAccount("");
      setAmount("10000");
    } catch (err) {
      setError(err.message || "Failed to issue funds to target account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Central Bank Treasury</h3>
              <p className="text-xs text-amber-400/80 font-mono">Issue / Deposit Initial Funds</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError("");
              setSuccessData(null);
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {successData ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 glow-emerald">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-white">Funds Deposited!</h4>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">
              +₹{successData.amount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Credited to Target Account: {successData.toAccount.slice(0, 8)}...{successData.toAccount.slice(-4)}
            </p>

            <div className="mt-5 p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-left text-xs space-y-1.5 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">Source:</span>
                <span className="text-amber-400 font-medium">Central Reserve Bank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{successData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ref ID:</span>
                <span className="font-mono text-gray-400">{successData.transactionId.slice(0, 14)}...</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessData(null);
                onClose();
              }}
              className="mt-6 w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="flex items-start space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Account Input */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Target Customer Account Number (toAccount)
              </label>
              <input
                type="text"
                placeholder="e.g. 6a994a1b9f5c36e43d727f7c"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full glass-input rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none text-white"
                required
              />
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Amount to Issue (INR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-base font-bold focus:outline-none pl-9 text-white"
                  required
                />
                <span className="absolute left-4 top-3 text-gray-400 font-bold">₹</span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[1000, 5000, 10000, 50000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      amount === String(preset)
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                        : "border-gray-800 bg-gray-900/40 text-gray-400 hover:text-white"
                    }`}
                  >
                    +₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs transition-all shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <span>Depositing Funds from Central Bank...</span>
              ) : (
                <>
                  <Landmark className="w-4 h-4" />
                  <span>Deposit Funds to Account</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
