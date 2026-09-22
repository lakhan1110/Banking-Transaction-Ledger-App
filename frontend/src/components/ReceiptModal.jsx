import React from "react";
import { X, CheckCircle2, Copy, Download, Share2 } from "lucide-react";

export const ReceiptModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isCredit = transaction.type === "credit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-panel rounded-3xl p-6 border border-gray-800 shadow-2xl overflow-hidden text-center">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 glow-emerald">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-white">Payment Receipt</h3>
        <p className="text-xs text-gray-400 font-sans">
          {isCredit ? "Money Added / Received" : "Money Sent"}
        </p>

        {/* Amount */}
        <div className="my-4">
          <span className={`text-3xl font-extrabold ${isCredit ? "text-emerald-400" : "text-white"}`}>
            {isCredit ? "+" : "-"}₹{Number(transaction.amount).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Breakdown Card */}
        <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 text-left text-xs space-y-2.5 text-gray-300 font-sans">
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="text-emerald-400 font-bold">Successful</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Date & Time</span>
            <span className="font-medium text-gray-200">
              {new Date(transaction.timestamp).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">{isCredit ? "From" : "To"}</span>
            <span className="font-mono text-gray-200">
              {isCredit
                ? transaction.from
                : `${transaction.to?.slice(0, 8)}...${transaction.to?.slice(-4)}`}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-800">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-mono text-[11px] text-gray-400">
              {transaction.id?.slice(0, 14)}...
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-all"
        >
          Close Receipt
        </button>
      </div>
    </div>
  );
};
