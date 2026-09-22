import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Clock,
  Key,
} from "lucide-react";

export const LedgerTable = () => {
  const { recentTransactions, activeAccount, currency } = useBank();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filtered = recentTransactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "credit") return matchesSearch && tx.type === "credit";
    if (filterType === "debit") return matchesSearch && tx.type === "debit";
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="rounded-2xl glass-panel border border-gray-800 p-6 shadow-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800/80">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/30 flex-shrink-0 glow-emerald">
              <img
                src="/assets/ledger_cube.jpg"
                alt="3D Ledger Cube"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Immutable Ledger Records
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Double-Entry Append-Only Financial Audit Trail
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Tx ID, Account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:outline-none"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex rounded-xl bg-gray-900/60 p-1 border border-gray-800 text-xs font-mono">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === "all"
                    ? "bg-emerald-500 text-black font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("credit")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === "credit"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Credits
              </button>
              <button
                onClick={() => setFilterType("debit")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === "debit"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Debits
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="mt-4 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-gray-800/40 border border-gray-700/60 flex items-center justify-center mx-auto mb-3 text-gray-500">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-300">No Ledger Entries Yet</h4>
              <p className="text-xs text-gray-500 font-mono mt-1">
                Execute a transfer or add initial funds to see real-time balanced entries.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-800/60 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Transaction ID / Key</th>
                  <th className="pb-3 font-semibold">Counterparty</th>
                  <th className="pb-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {filtered.map((tx) => {
                  const isCredit = tx.type === "credit";
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-800/20 transition-colors group"
                    >
                      {/* Type Badge */}
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            isCredit
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          <span>{isCredit ? "CREDIT" : "DEBIT"}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 pr-4 font-bold text-sm">
                        <span className={isCredit ? "text-emerald-400" : "text-rose-400"}>
                          {isCredit ? "+" : "-"}₹{tx.amount}
                        </span>
                      </td>

                      {/* Transaction ID & Idempotency Key */}
                      <td className="py-3.5 pr-4">
                        <div className="flex flex-col">
                          <span className="text-gray-200 font-bold">
                            {tx.id.slice(0, 12)}...{tx.id.slice(-4)}
                          </span>
                          {tx.idempotencyKey && (
                            <span className="text-[10px] text-gray-500 flex items-center mt-0.5">
                              <Key className="w-2.5 h-2.5 mr-1" />
                              {tx.idempotencyKey.slice(0, 14)}...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Counterparty */}
                      <td className="py-3.5 pr-4 text-gray-400">
                        {isCredit ? (
                          <span>From: {tx.from?.slice(0, 12)}...</span>
                        ) : (
                          <span>To: {tx.to?.slice(0, 12)}...</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 text-right text-gray-500 text-[11px]">
                        <div className="flex items-center justify-end space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
