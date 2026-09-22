import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import { useAuth } from "../context/AuthContext";
import { X, Zap, AlertCircle, CheckCircle2, Key, ShieldAlert } from "lucide-react";

export const DepositModal = ({ isOpen, onClose }) => {
  const { activeAccount, depositFunds } = useBank();
  const { systemToken, updateSystemToken } = useAuth();
  const [amount, setAmount] = useState("10000");
  const [customToken, setCustomToken] = useState(systemToken);
  const [showTokenField, setShowTokenField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    try {
      setLoading(true);
      if (customToken !== systemToken) {
        updateSystemToken(customToken);
      }
      await depositFunds(numAmount, activeAccount?.id);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to add initial funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Central Reserve Mint</h3>
              <p className="text-xs text-gray-400 font-mono">Deposit Initial Treasury Funds</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError("");
              setSuccess(false);
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3 glow-cyan">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white">Funds Minted Successfully!</h4>
            <p className="text-xs text-gray-300 mt-1 font-mono">
              Deposited ₹{amount} from Central Reserve Bank to your account.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-left text-xs font-mono text-gray-400">
              <span className="text-emerald-400 font-bold">Double-Entry Verification:</span>
              <ul className="mt-1 space-y-0.5 text-[11px]">
                <li>• Debit: Central Reserve Bank (-₹{amount})</li>
                <li>• Credit: Your Account (+₹{amount})</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleDeposit} className="mt-5 space-y-4">
            {error && (
              <div className="flex items-start space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Account Display */}
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Deposit Target:</span>
              <span className="text-cyan-400 font-bold">
                {activeAccount?.id ? `${activeAccount.id.slice(0, 14)}...` : "Select Account"}
              </span>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">
                Amount to Mint / Deposit (INR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none transition-all pl-8"
                  required
                />
                <span className="absolute left-3 top-2.5 text-gray-400 font-mono text-xs">₹</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex space-x-2 mt-2">
                {[1000, 5000, 10000, 50000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono border transition-all ${
                      amount === String(preset)
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold"
                        : "border-gray-800 bg-gray-900/40 text-gray-400 hover:text-white"
                    }`}
                  >
                    ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* System Token Accordion */}
            <div className="pt-2 border-t border-gray-800/80">
              <button
                type="button"
                onClick={() => setShowTokenField(!showTokenField)}
                className="flex items-center space-x-1.5 text-[11px] font-mono text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showTokenField ? "Hide System Token" : "Inspect / Edit System Bearer Token"}</span>
              </button>

              {showTokenField && (
                <div className="mt-2">
                  <textarea
                    rows={2}
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="System Bearer Token"
                    className="w-full glass-input rounded-xl p-2.5 text-[10px] font-mono text-gray-300 focus:outline-none resize-none"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs transition-all shadow-lg glow-cyan disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Minting Initial Funds...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute Initial Deposit</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
