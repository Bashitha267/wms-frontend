import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication on load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          // Set temporary local state first to prevent flashing
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify with backend that the token is still valid
          const response = await axios.get(`${apiBaseUrl}/api/user`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          
          // Update user state with fresh data from the server
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
          console.error("Token verification failed:", error);
          // If the token is invalid or expired, clear it
          handleClearAuth();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleClearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/api/login`, {
        username,
        password,
      });

      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.username?.[0] ||
        "Invalid credentials or network error.";
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(
          `${apiBaseUrl}/api/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout request to backend failed:", error);
    } finally {
      handleClearAuth();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
