"use client"; // This ensures this context is used on the client-side

import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

console.log("That is jwt_decode", jwtDecode);
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext); // Custom hook to access the auth context
};

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    userId: null,
    role: null,
    token: null,
  });

  // Check for token in localStorage when the app loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token); // Decode the token
      setAuthData({
        userId: decodedToken.userId,
        role: decodedToken.role,
        token: token,
      });
    }
  }, []);

  console.log("That is a authContect", authData);
  // Function to log out the user
  const logout = () => {
    setAuthData({ userId: null, role: null, token: null });
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ authData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};