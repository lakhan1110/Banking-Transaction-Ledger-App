import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import { X, PlusCircle, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export const CreateAccountModal = ({ isOpen, onClose }) => {
  const { createNewAccount } = useBank();
  const [currency, setCurrency] = useState("INR");
  const [accountType, setAccountType] = useState("savings");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await createNewAccount(currency);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to open account. Please try again.");
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
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Open New Account</h3>
              <p className="text-xs text-gray-400">Instant Online Account Opening</p>
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
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 glow-emerald">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-white">Account Opened!</h4>
            <p className="text-xs text-gray-400 mt-1">
              Your new {currency} account is active and ready to use.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
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

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Account Currency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: "INR", name: "Indian Rupee (₹)" },
                  { code: "USD", name: "US Dollar ($)" },
                  { code: "EUR", name: "Euro (€)" },
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setCurrency(item.code)}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center ${
                      currency === item.code
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "border-gray-800 bg-gray-900/40 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>{item.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg glow-emerald disabled:opacity-50 mt-4"
            >
              {loading ? "Opening Account..." : "Confirm & Open Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
