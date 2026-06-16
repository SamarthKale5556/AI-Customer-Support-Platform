import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (token) => {
    try {
      const response = await api.get('/profile', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUser(response.data);
      return true;
    } catch (error) {
      console.error("Error fetching user profile", error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const success = await fetchUser(token);
        if (!success) {
          // If token fails, clear session
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Fetch profile to get role and details
      const success = await fetchUser(access_token);
      
      if (success) {
        return { success: true };
      } else {
        return { success: false, error: "Failed to fetch user profile" };
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.detail || "Invalid credentials. Please try again." 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Create account
      await api.post('/register', { 
        name, 
        email, 
        password,
        role: 'Customer' // default
      });
      
      return { success: true };
    } catch (error) {
      console.error("Registration Error:", error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.detail || "Failed to create account. Email may be taken." 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
