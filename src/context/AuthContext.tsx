import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id?: string;
  name?: string;
  email: string;
  token?: string;
  role?: boolean;
  valid?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  birth: string;
  gender: boolean;
  username: string;
  role: boolean;
  valid: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user khi reload trang
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // === LOGIN ===
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('https://yoursubdomain.loca.lt/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      setUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // === SIGNUP ===
  const signup = async (signupData: SignupData): Promise<boolean> => {
    try {
      const response = await fetch('https://yoursubdomain.loca.lt/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) return false;

      const data = await response.json();
      setUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  // === LOGOUT ===
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAdmin: user?.role === true || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
