import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext();

const parseJwtPayload = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("nexus_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("nexus_token");
      if (storedToken) {
        const decoded = parseJwtPayload(storedToken);
        try {
          const res = await authApi.getProfile();
          if (res?.data?.user) {
            setUser({
              ...res.data.user,
              systemUser: res.data.user.systemUser ?? decoded?.systemUser ?? false,
            });
          } else if (decoded) {
            setUser({
              _id: decoded._id,
              email: decoded.email,
              systemUser: decoded.systemUser ?? false,
            });
          }
        } catch (err) {
          console.warn("Session expired or invalid token:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const loginWithCredentials = async (email, password) => {
    return await authApi.login(email, password);
  };

  const verifyOtpAndLogin = async (email, otp) => {
    const res = await authApi.verifyOtp(email, otp);
    if (res?.data?.token) {
      const decoded = parseJwtPayload(res.data.token);
      localStorage.setItem("nexus_token", res.data.token);
      setToken(res.data.token);
      setUser({
        ...(res.data.user || {}),
        systemUser: res.data.user?.systemUser ?? decoded?.systemUser ?? false,
      });
      return res.data;
    }
    throw new Error("Invalid OTP response");
  };

  const registerUser = async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    if (res?.data?.token) {
      const decoded = parseJwtPayload(res.data.token);
      localStorage.setItem("nexus_token", res.data.token);
      setToken(res.data.token);
      setUser({
        ...(res.data.user || {}),
        systemUser: res.data.user?.systemUser ?? decoded?.systemUser ?? false,
      });
      return res.data;
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem("nexus_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        loginWithCredentials,
        verifyOtpAndLogin,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
