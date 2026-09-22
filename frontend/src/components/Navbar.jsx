import React from "react";
import { useAuth } from "../context/AuthContext";
import { useBank } from "../context/BankContext";
import {
  Bell,
  LogOut,
  User,
  Shield,
  CreditCard,
  ChevronDown,
} from "lucide-react";

export const Navbar = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { accounts, activeAccount, setActiveAccount } = useBank();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-[#0B0F19]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] flex items-center justify-center glow-emerald">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white">
              NEXUS<span className="text-emerald-400">BANK</span>
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {/* Account Switcher (if multiple accounts) */}
              {accounts.length > 1 && (
                <div className="relative hidden sm:block">
                  <select
                    value={activeAccount?.id || ""}
                    onChange={(e) => {
                      const sel = accounts.find((a) => a.id === e.target.value);
                      if (sel) setActiveAccount(sel);
                    }}
                    className="glass-input text-xs font-medium rounded-xl px-3 py-1.5 pr-8 appearance-none cursor-pointer focus:outline-none"
                  >
                    {accounts.map((acc, idx) => (
                      <option key={acc.id} value={acc.id} className="bg-gray-900 text-white">
                        Account {idx + 1} ({acc.currency})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              )}

              {/* Notification Bell */}
              <button
                className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
              </button>

              {/* User Profile Info & Logout */}
              <div className="flex items-center space-x-2.5 pl-2 border-l border-gray-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                  {user?.name ? user.name[0] : "U"}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {user?.name || "Customer"}
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans truncate max-w-[120px]">
                    {user?.email}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold text-xs transition-all shadow-md glow-emerald"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
