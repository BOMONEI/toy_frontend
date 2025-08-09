import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬스토리지에서 사용자 정보 및 토큰 복구
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    console.log("AuthContext login 호출:", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // JWT 토큰도 저장
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }

    console.log("localStorage에 저장됨:", localStorage.getItem("user"));
    console.log("토큰 저장됨:", localStorage.getItem("token"));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
