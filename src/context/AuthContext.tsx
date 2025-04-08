
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'http://localhost:5000/api';

type User = {
  id: string;
  username: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Configure axios to use the token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['auth-token'];
    }
  }, [token]);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsInitialized(true);
        return;
      }

      setIsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/auth/current`);
        setUser(res.data.user);
      } catch (err) {
        console.error('Error loading user', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      setToken(res.data.token);
      setUser(res.data.user);
      
      localStorage.setItem('token', res.data.token);
      
      toast({
        title: 'Success',
        description: 'You have successfully logged in!',
      });
      
      navigate('/');
    } catch (err: any) {
      console.error('Login error', err);
      const errorMessage = err.response?.data?.message || 'An error occurred during login';
      setError(errorMessage);
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      
      setToken(res.data.token);
      setUser(res.data.user);
      
      localStorage.setItem('token', res.data.token);
      
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
      
      navigate('/');
    } catch (err: any) {
      console.error('Registration error', err);
      const errorMessage = err.response?.data?.message || 'An error occurred during registration';
      setError(errorMessage);
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
    
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
