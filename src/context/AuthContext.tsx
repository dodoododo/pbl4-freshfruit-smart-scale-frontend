import React, { createContext, useContext, useState, useEffect } from 'react';

// =======================
// Interfaces
// =======================
export interface User {
  id?: string;
  name?: string;
  email: string;
  token?: string;
  role?: boolean;
  valid?: boolean;
  phone?: string;
  birthday?: string;
  gender?: boolean;
  address?: string;
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

// =======================
// Context setup
// =======================
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

  // =======================
  // Load user from localStorage
  // =======================
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('accessToken');

    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchUserProfile(savedToken);
    }
  }, []);

  // =======================
  // Fetch user profile with token
  // =======================
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('https://wrap-jefferson-volumes-encounter.trycloudflare.com/user/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch user profile');
        logout();
        return;
      }

      const profile = await response.json();
      const fullUser: User = {
        id: profile.id?.toString(),
        name: profile.name,
        email: profile.email,
        token,
        role: profile.role,
        valid: profile.valid,
        phone: profile.phone,
        birthday: profile.birth,
        gender: profile.gender,
        address: profile.address,
      };

      setUser(fullUser);
      localStorage.setItem('currentUser', JSON.stringify(fullUser));
    } catch (error) {
      console.error('Fetch user profile error:', error);
      logout();
    }
  };

  // =======================
  // LOGIN
  // =======================
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('https://wrap-jefferson-volumes-encounter.trycloudflare.com/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        return false;
      }

      const data = await response.json();

      if (!data.access_token) {
        console.error('No access_token found in response');
        return false;
      }

      // Save access token
      localStorage.setItem('accessToken', data.access_token);

      // Fetch profile
      await fetchUserProfile(data.access_token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // =======================
  // SIGNUP
  // =======================
  const signup = async (signupData: SignupData): Promise<boolean> => {
    try {
      const response = await fetch('https://wrap-jefferson-volumes-encounter.trycloudflare.com/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        console.error('Signup failed with status:', response.status);
        return false;
      }

      const data = await response.json();
      console.log('Signup success:', data);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  // =======================
  // LOGOUT
  // =======================
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
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
