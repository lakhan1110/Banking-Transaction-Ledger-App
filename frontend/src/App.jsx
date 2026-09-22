import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BankProvider, useBank } from "./context/BankContext";
import { Navbar } from "./components/Navbar";
import { AccountSummary } from "./components/AccountSummary";
import { SystemAdminDashboard } from "./components/SystemAdminDashboard";
import { TransactionList } from "./components/TransactionList";
import { SendMoneyModal } from "./components/SendMoneyModal";
import { IssueFundsModal } from "./components/IssueFundsModal";
import { CreateAccountModal } from "./components/CreateAccountModal";
import { ReceiptModal } from "./components/ReceiptModal";
import { AuthModal } from "./components/AuthModal";
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Globe,
  Sparkles,
} from "lucide-react";

const MainBankingApp = () => {
  const { isAuthenticated, user } = useAuth();
  const [showSendModal, setShowSendModal] = useState(false);
  const [showIssueFundsModal, setShowIssueFundsModal] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const isSystemUser = user?.systemUser === true;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar onOpenAuth={() => setShowAuthModal(true)} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isAuthenticated ? (
            <>
              {/* Conditional Dashboard: System User vs Normal Customer */}
              {isSystemUser ? (
                <SystemAdminDashboard
                  onOpenIssueFunds={() => setShowIssueFundsModal(true)}
                  onOpenSend={() => setShowSendModal(true)}
                  onOpenNewAccount={() => setShowNewAccountModal(true)}
                />
              ) : (
                <AccountSummary
                  onOpenSend={() => setShowSendModal(true)}
                  onOpenNewAccount={() => setShowNewAccountModal(true)}
                />
              )}

              {/* Transaction Statement Feed */}
              <TransactionList
                onSelectTransaction={(tx) => setSelectedReceipt(tx)}
              />
            </>
          ) : (
            /* Customer Landing View with 3D Visual Scene */
            <div className="max-w-4xl mx-auto text-center py-10 px-4">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 glow-emerald">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Digital Banking</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Banking Built for the
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Modern Digital World.
                </span>
              </h1>

              <p className="max-w-2xl mx-auto text-gray-400 text-sm sm:text-base mt-4 leading-relaxed font-sans">
                Experience instant fee-free money transfers, multi-currency accounts,
                and real-time fraud protection.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-8 mb-12">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-xl glow-emerald flex items-center space-x-2"
                >
                  <span>Sign In or Open Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 3D Visual Asset Showcase */}
              <div className="relative rounded-3xl overflow-hidden glass-panel border border-emerald-500/20 shadow-2xl p-2 mb-12">
                <img
                  src="/assets/banking_hero.jpg"
                  alt="3D Digital Banking Platform"
                  className="w-full h-auto max-h-[380px] object-cover rounded-2xl"
                />
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-6 rounded-3xl glass-card border border-gray-800">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Instant Transfers</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Send money instantly to any bank account with zero fees and immediate confirmation.
                  </p>
                </div>

                <div className="p-6 rounded-3xl glass-card border border-gray-800">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Secure 2FA Protection</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Protected by two-factor authentication, one-time security codes, and fraud monitoring.
                  </p>
                </div>

                <div className="p-6 rounded-3xl glass-card border border-gray-800">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Multi-Currency Accounts</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Hold and manage INR, USD, and EUR bank accounts under one unified customer profile.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0B0F19]/90 py-6 text-center text-xs text-gray-500 font-sans">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Nexus Bank. All rights reserved.</span>
          <span className="text-gray-400">Secure 256-Bit Encrypted Banking</span>
        </div>
      </footer>

      {/* Modals */}
      <SendMoneyModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
      />
      <IssueFundsModal
        isOpen={showIssueFundsModal}
        onClose={() => setShowIssueFundsModal(false)}
      />
      <CreateAccountModal
        isOpen={showNewAccountModal}
        onClose={() => setShowNewAccountModal(false)}
      />
      <ReceiptModal
        transaction={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BankProvider>
        <MainBankingApp />
      </BankProvider>
    </AuthProvider>
  );
}
