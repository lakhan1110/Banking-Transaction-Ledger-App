import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export const AuthModal = ({ isOpen, onClose }) => {
  const { loginWithCredentials, verifyOtpAndLogin, registerUser } = useAuth();
  const [tab, setTab] = useState("login"); // "login" | "register" | "otp"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpInputRefs = useRef([]);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await registerUser(name, email, password);
      onClose();
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await loginWithCredentials(email, password);
      setTab("otp");
    } catch (err) {
      setError(err.message || "Incorrect email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit security code.");
      return;
    }

    try {
      setLoading(true);
      await verifyOtpAndLogin(email, fullOtp);
      onClose();
    } catch (err) {
      setError(err.message || "Invalid or expired security code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-white">
              {tab === "otp" ? "Security Verification" : tab === "login" ? "Welcome Back" : "Open Your Account"}
            </h3>
            <p className="text-xs text-gray-400">
              {tab === "otp" ? "Enter the 6-digit code sent to your email" : "Secure Online Banking Portal"}
            </p>
          </div>
          <button
            onClick={() => {
              setError("");
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {tab !== "otp" && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-gray-900/80 border border-gray-800 my-5 text-xs font-semibold">
            <button
              onClick={() => {
                setTab("login");
                setError("");
              }}
              className={`py-2.5 rounded-xl transition-all ${
                tab === "login"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("register");
                setError("");
              }}
              className={`py-2.5 rounded-xl transition-all ${
                tab === "register"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start space-x-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* OTP Screen */}
        {tab === "otp" ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center py-2">
              <p className="text-xs text-gray-300">
                A 6-digit code was sent to:
              </p>
              <span className="text-xs font-semibold text-emerald-400 block mt-1">
                {email}
              </span>
            </div>

            {/* 6 Digit Inputs */}
            <div className="flex justify-between space-x-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-bold glass-input rounded-2xl focus:border-emerald-400 focus:outline-none text-white"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg glow-emerald disabled:opacity-50"
            >
              {loading ? "Verifying Code..." : "Verify & Sign In"}
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("login");
                setOtp(["", "", "", "", "", ""]);
                setError("");
              }}
              className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Sign In
            </button>
          </form>
        ) : tab === "login" ? (
          /* Sign In */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none pl-10 text-white"
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none pl-10 text-white"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg glow-emerald disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Sending Security Code...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Register */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Lakhan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none pl-10 text-white"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none pl-10 text-white"
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Create Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none pl-10 text-white"
                  required
                  minLength={6}
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg glow-emerald disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
