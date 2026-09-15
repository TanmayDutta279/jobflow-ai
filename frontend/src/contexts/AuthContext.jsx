import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking an initial auth check
    const checkAuth = () => {
      const savedUser = localStorage.getItem('jobflow_mock_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    // Mock login
    const user = { uid: 'mock-uid-123', email, name: 'Test User' };
    localStorage.setItem('jobflow_mock_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const signup = async (email, password) => {
    // Mock signup
    const user = { uid: 'mock-uid-123', email, name: 'Test User' };
    localStorage.setItem('jobflow_mock_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    localStorage.removeItem('jobflow_mock_user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
