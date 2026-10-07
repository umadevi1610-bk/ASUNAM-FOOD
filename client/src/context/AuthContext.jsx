import { createContext, useContext, useEffect, useState } from "react";

import {
  registerUser,
  loginUser,
  customerLogin,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("asunam_food_token") || null
  );

  const [loading, setLoading] = useState(true);

  // ======================================
  // LOAD LOGGED-IN USER
  // ======================================
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem(
        "asunam_food_token"
      );

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser(savedToken);

        if (data.success) {
          setUser(data.user);
          setToken(savedToken);
        }
      } catch (error) {
        console.error(
          "Session expired:",
          error.message
        );

        localStorage.removeItem(
          "asunam_food_token"
        );

        localStorage.removeItem(
          "asunam_food_user"
        );

        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ======================================
  // REGISTER
  // ======================================
  const register = async (userData) => {
    const data = await registerUser(userData);

    if (data.success) {
      localStorage.setItem(
        "asunam_food_token",
        data.token
      );

      localStorage.setItem(
        "asunam_food_user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  // ======================================
  // NORMAL LOGIN
  // EMAIL + PASSWORD
  // ======================================
  const login = async (loginData) => {
    const data = await loginUser(loginData);

    if (data.success) {
      localStorage.setItem(
        "asunam_food_token",
        data.token
      );

      localStorage.setItem(
        "asunam_food_user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  // ======================================
  // CUSTOMER LOGIN
  // NAME + PHONE
  // OTP WILL BE ADDED LATER
  // ======================================
  const loginAsCustomer = async (customerData) => {
    const data = await customerLogin(customerData);

    if (data.success) {
      localStorage.setItem(
        "asunam_food_token",
        data.token
      );

      localStorage.setItem(
        "asunam_food_user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  // ======================================
  // LOGOUT
  // ======================================
  const logout = () => {
    localStorage.removeItem(
      "asunam_food_token"
    );

    localStorage.removeItem(
      "asunam_food_user"
    );

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,

        // Auth methods
        login,
        loginAsCustomer,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ======================================
// CUSTOM HOOK
// ======================================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};