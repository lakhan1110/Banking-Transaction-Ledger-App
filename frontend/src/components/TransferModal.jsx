import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import { X, Send, AlertCircle, CheckCircle2, Lock, ArrowRight } from "lucide-react";

export const TransferModal = ({ isOpen, onClose }) => {
  const { activeAccount, balance, currency, sendTransfer } = useBank();
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
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
      setError("Please enter a valid destination Account ID.");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (numAmount > balance) {
      setError(`Insufficient balance. Available: ₹${balance}, Requested: ₹${numAmount}`);
      return;
    }
    if (toAccount.trim() === activeAccount?.id) {
      setError("Cannot transfer to the same account.");
      return;
    }

    try {
      setLoading(true);
      const res = await sendTransfer(toAccount.trim(), numAmount);
      setSuccessData(res.data?.transaction || { amount: numAmount, toAccount });
      setAmount("");
      setToAccount("");
    } catch (err) {
      setError(err.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-emerald-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Peer-to-Peer Transfer</h3>
              <p className="text-xs text-gray-400 font-mono">Distributed Mutex Protected</p>
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

        {/* Success Alert */}
        {successData ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 glow-emerald">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white">Transfer Completed!</h4>
            <p className="text-xs text-gray-300 mt-1 font-mono">
              Successfully transferred ₹{successData.amount}
            </p>
            <div className="mt-4 p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-left text-xs font-mono space-y-1 text-gray-400">
              <div><span className="text-gray-500">From:</span> {activeAccount?.id}</div>
              <div><span className="text-gray-500">To:</span> {successData.toAccount}</div>
              <div><span className="text-gray-500">Status:</span> <span className="text-emerald-400 font-bold">Atomic Commit (2x Ledger Rows)</span></div>
            </div>
            <button
              onClick={() => {
                setSuccessData(null);
                onClose();
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-lg"
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

            {/* Source Account Info */}
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">From Account:</span>
              <span className="text-emerald-400 font-bold">
                {activeAccount?.id?.slice(0, 12)}... (Bal: ₹{balance})
              </span>
            </div>

            {/* Destination Account ID */}
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">
                Recipient Account ID (toAccount)
              </label>
              <input
                type="text"
                placeholder="e.g. 6a994a1b9f5c36e43d727f7c"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-all"
                required
              />
            </div>

            {/* Transfer Amount */}
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">
                Amount ({currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none transition-all pl-8"
                  required
                />
                <span className="absolute left-3 top-2.5 text-gray-400 font-mono text-xs">₹</span>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-mono bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Redis Mutex lock & client UUID idempotency auto-applied</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs transition-all shadow-lg glow-emerald disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Executing Distributed Transaction...</span>
              ) : (
                <>
                  <span>Confirm Transfer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
