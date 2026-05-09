import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("arar_admin_token"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("arar_admin_token");
    setToken(null);
    setAdmin(null);
  }, []);

  const verifyToken = useCallback(async (currentToken) => {
    try {
      const response = await axios.get(`${API}/admin/me`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setAdmin(response.data);
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [token, verifyToken]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/admin/login`, { email, password });
    const { access_token } = response.data;

    localStorage.setItem("arar_admin_token", access_token);
    setToken(access_token);

    const adminResponse = await axios.get(`${API}/admin/me`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    setAdmin(adminResponse.data);

    return adminResponse.data;
  };

  const getAuthHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  return (
    <AuthContext.Provider value={{
      admin,
      token,
      loading,
      isAuthenticated: !!admin,
      login,
      logout,
      getAuthHeaders
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
