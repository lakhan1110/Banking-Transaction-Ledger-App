import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Receipt,
  FileText,
  Clock,
  ShoppingBag,
  Send,
  Plus,
} from "lucide-react";

export const TransactionList = ({ onSelectTransaction }) => {
  const { recentTransactions } = useBank();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "money_in" | "money_out"

  const filtered = recentTransactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "money_in") return matchesSearch && tx.type === "credit";
    if (filter === "money_out") return matchesSearch && tx.type === "debit";
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto my-6">
      <div className="rounded-3xl glass-panel border border-gray-800 p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800/80">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Recent Transactions
            </h3>
            <p className="text-xs text-gray-400">
              Live updates of your spending and deposits
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-input rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex rounded-2xl bg-gray-900/60 p-1 border border-gray-800 text-xs">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-xl transition-all ${
                  filter === "all"
                    ? "bg-emerald-500 text-black font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("money_in")}
                className={`px-3 py-1 rounded-xl transition-all ${
                  filter === "money_in"
                    ? "bg-emerald-500/20 text-emerald-400 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Money In
              </button>
              <button
                onClick={() => setFilter("money_out")}
                className={`px-3 py-1 rounded-xl transition-all ${
                  filter === "money_out"
                    ? "bg-rose-500/20 text-rose-400 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Money Out
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Items */}
        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-gray-800/40 border border-gray-700/50 flex items-center justify-center mx-auto mb-3 text-gray-500">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-gray-300">No transactions yet</h4>
              <p className="text-xs text-gray-500 mt-1">
                When you send money or add funds, your activity will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {filtered.map((tx) => {
                const isCredit = tx.type === "credit";
                return (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="flex items-center justify-between py-4 hover:bg-gray-800/20 px-3 rounded-2xl cursor-pointer transition-all group"
                  >
                    {/* Left: Icon & Title */}
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isCredit
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-gray-800 text-gray-300 border border-gray-700"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {isCredit ? "Deposit / Top Up" : "Transfer to Account"}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {isCredit
                            ? "From: Instant Top Up"
                            : `To: ${tx.to?.slice(0, 6)}...${tx.to?.slice(-4)}`}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount & Timestamp */}
                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-extrabold ${
                          isCredit ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(tx.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
