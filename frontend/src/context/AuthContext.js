import { createContext, useContext, useState, useEffect } from "react";
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

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API}/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmin(response.data);
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/admin/login`, { email, password });
    const { access_token } = response.data;
    
    localStorage.setItem("arar_admin_token", access_token);
    setToken(access_token);
    
    // Fetch admin info
    const adminResponse = await axios.get(`${API}/admin/me`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    setAdmin(adminResponse.data);
    
    return adminResponse.data;
  };

  const logout = () => {
    localStorage.removeItem("arar_admin_token");
    setToken(null);
    setAdmin(null);
  };

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`
  });

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
