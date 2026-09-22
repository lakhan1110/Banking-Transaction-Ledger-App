import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import { X, Send, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export const SendMoneyModal = ({ isOpen, onClose }) => {
  const { activeAccount, balance, currency, sendTransfer } = useBank();
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
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
      setError("Please enter the recipient's Account Number.");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    try {
      setLoading(true);
      const res = await sendTransfer(toAccount.trim(), numAmount);
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
      setAmount("");
      setToAccount("");
      setNote("");
    } catch (err) {
      setError(err.message || "Transfer failed. Please check the account number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Send Money</h3>
              <p className="text-xs text-gray-400">Instant Free Bank Transfer</p>
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
            <h4 className="text-xl font-extrabold text-white">Transfer Successful!</h4>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">
              ₹{successData.amount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Sent to Account: {successData.toAccount.slice(0, 8)}...{successData.toAccount.slice(-4)}
            </p>

            <div className="mt-5 p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-left text-xs space-y-1.5 text-gray-300 font-sans">
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{successData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ref ID:</span>
                <span className="font-mono text-gray-400">{successData.transactionId.slice(0, 14)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="text-emerald-400 font-bold">Completed</span>
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

            {/* Source Account Info */}
            <div className="p-3 rounded-2xl bg-gray-900/50 border border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400">Paying from:</span>
              <span className="font-semibold text-white">
                Main Account (Bal: ₹{balance.toLocaleString("en-IN")})
              </span>
            </div>

            {/* Recipient Account Number */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Recipient Account Number
              </label>
              <input
                type="text"
                placeholder="Enter Recipient Account ID"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full glass-input rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  className="w-full glass-input rounded-2xl px-4 py-3 text-base font-bold focus:outline-none pl-9 text-white"
                  required
                />
                <span className="absolute left-4 top-3 text-gray-400 font-bold">₹</span>
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Add a note (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Dinner with friends, Rent"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs focus:outline-none text-gray-200"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg glow-emerald disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Sending Money...</span>
              ) : (
                <>
                  <span>Send Money Now</span>
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
