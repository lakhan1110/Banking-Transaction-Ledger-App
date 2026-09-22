import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  CreditCard,
  ChevronDown,
  ShieldCheck,
  PlusCircle,
  Zap,
} from "lucide-react";

export const HeroCard = ({ onCreateAccount, onOpenTransfer, onOpenDeposit }) => {
  const { accounts, activeAccount, setActiveAccount, balance, currency } = useBank();
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (activeAccount?.id) {
      navigator.clipboard.writeText(activeAccount.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(balance || 0);

  return (
    <div className="relative w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-6">
      {/* 3D Holographic Visual Card (Left Column) */}
      <div className="lg:col-span-7 relative group rounded-2xl overflow-hidden glass-card p-6 flex flex-col justify-between min-h-[300px] shadow-2xl transition-all duration-300 hover:border-emerald-500/40">
        {/* Background 3D Render Overlay */}
        <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
          <img
            src="/assets/fintech_card.jpg"
            alt="3D Holographic Card"
            className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent" />
        </div>

        {/* Card Header */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              IMMUTABLE DOUBLE-ENTRY LEDGER
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2 tracking-tight">
              Primary Treasury Account
            </h2>
          </div>

          {/* Account Selector Dropdown */}
          {accounts.length > 1 && (
            <div className="relative">
              <select
                value={activeAccount?.id || ""}
                onChange={(e) => {
                  const selected = accounts.find((a) => a.id === e.target.value);
                  if (selected) setActiveAccount(selected);
                }}
                className="glass-input text-xs font-mono rounded-lg px-2.5 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none"
              >
                {accounts.map((acc, idx) => (
                  <option key={acc.id} value={acc.id} className="bg-gray-900 text-white">
                    Account #{idx + 1} ({acc.id.slice(0, 6)}...)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Real-time Dynamic Balance */}
        <div className="relative z-10 my-6">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono">
            <span>Aggregated Live Balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 hover:text-white transition-colors"
            >
              {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-baseline space-x-3 mt-1">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono drop-shadow-md">
              {showBalance ? formattedBalance : "₹ ••••••••"}
            </h1>
            <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              100% Auditable
            </span>
          </div>
        </div>

        {/* Card Footer with Account ID */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-mono">Account ID:</span>
            <span className="text-xs font-mono font-bold text-gray-200">
              {activeAccount?.id
                ? `${activeAccount.id.slice(0, 10)}...${activeAccount.id.slice(-6)}`
                : "No Active Account"}
            </span>
            {activeAccount?.id && (
              <button
                onClick={handleCopy}
                className="p-1 rounded bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
                title="Copy Full Account ID"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Active
            </span>
            <span className="text-xs font-mono text-gray-300 font-bold">
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* 3D Bank Vault Mini-Card (Right Column) */}
      <div className="lg:col-span-5 relative rounded-2xl overflow-hidden glass-panel p-6 flex flex-col justify-between border border-cyan-500/20 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none">
          <img
            src="/assets/bank_vault.jpg"
            alt="3D Vault"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
            FAST OPERATIONS
          </span>
          <h3 className="text-lg font-bold text-white mt-2">
            Instant Ledger Actions
          </h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Execute distributed atomic transactions, mint initial funds, or provision additional currency accounts.
          </p>
        </div>

        {/* Quick Action Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onOpenTransfer}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-br from-emerald-600/30 to-emerald-900/40 hover:from-emerald-500/40 hover:to-emerald-800/50 border border-emerald-500/30 text-white font-medium text-xs transition-all duration-200 group glow-emerald"
          >
            <CreditCard className="w-5 h-5 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span>Send Money</span>
            <span className="text-[9px] text-gray-400 font-mono">P2P Transfer</span>
          </button>

          <button
            onClick={onOpenDeposit}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-br from-cyan-600/30 to-cyan-900/40 hover:from-cyan-500/40 hover:to-cyan-800/50 border border-cyan-500/30 text-white font-medium text-xs transition-all duration-200 group glow-cyan"
          >
            <Zap className="w-5 h-5 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span>Add Funds</span>
            <span className="text-[9px] text-gray-400 font-mono">Central Mint</span>
          </button>

          <button
            onClick={onCreateAccount}
            className="col-span-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-gray-700 bg-gray-800/40 hover:bg-gray-700/50 text-gray-200 font-medium text-xs transition-all"
          >
            <PlusCircle className="w-4 h-4 text-gray-400" />
            <span>Create New Bank Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
