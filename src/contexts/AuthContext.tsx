import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/apiService';
import type { User, LoginRequest, SignupRequest, VerifyOTPRequest, ResendOTPRequest, ApiError } from '../interfaces';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string, fcmToken?: string) => Promise<boolean>;
  signup: (userData: SignupRequest) => Promise<any>;
  logout: () => void;
  isAdmin: boolean;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (token: string, email: string, newPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyOTP: (userId: number, otp: string) => Promise<any>;
  resendOTP: (userId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    try {
      const token = apiService.getToken();
      const userData = apiService.getUserData();
      
      if (token && userData) {
        // Validate that the user data has required fields
        if (userData?.id && userData?.email && userData?.firstName && userData?.lastName) {
          setUser(userData as User);
          setIsLoggedIn(true);
        } else {
          // Invalid user data, clear it
          apiService.clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error restoring user session:', error);
      // Clear corrupted data
      apiService.clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, fcmToken?: string): Promise<boolean> => {
    try {
      const loginData: LoginRequest = {
        email,
        password,
        fcmToken: fcmToken || 'web_fcm_token', // Default FCM token for web
      };

      const response = await apiService.login(loginData);
      
      if (response.status && response.data) {
        // Create user object from API response
        const userData: User = {
          id: response.data.user.id.toString(),
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          image: response.data.user.image || '', // Get image from API or default
          latitude: response.data.user.latitude || undefined,
          longitude: response.data.user.longitude || undefined,
          createdAt: response.data.user.createdAt || new Date().toISOString(),
          role: response.data.user.role || 'user',
        };

        // Store user data and token
        setUser(userData);
        setIsLoggedIn(true);
        apiService.setAuthData(response.data.accessToken, userData);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      const apiError = error as ApiError;
      
      // Handle specific error cases
      if (apiError.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (apiError.status === 0) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      } else {
        throw new Error(apiError.message || 'Login failed. Please try again.');
      }
    }
  };

  const signup = async (userData: SignupRequest): Promise<any> => {
    try {
      const response = await apiService.signup(userData);
      
      // Check if signup was successful (status true or 200/201)
      if (response.status === true || response.status === 200 || response.status === 201) {
        return response; // Return the full response with userId
      }
      
      throw new Error(response.message || 'Signup failed');
    } catch (error) {
      console.error('Signup error:', error);
      const apiError = error as ApiError;
      
      // Handle specific error cases
      if (apiError.status === 400) {
        if (apiError.message === 'Email already in use') {
          throw new Error('This email is already registered. Please use a different email or try logging in.');
        } else         if (Array.isArray(apiError.message)) {
          // Handle validation errors
          throw new TypeError(`Validation error: ${apiError.message[0]}`);
        } else {
          throw new TypeError(apiError.message || 'Invalid data provided');
        }
      } else if (apiError.status === 0) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      } else {
        throw new Error(apiError.message || 'Signup failed. Please try again.');
      }
    }
  };

  const logout = () => {
    try {
      setUser(null);
      setIsLoggedIn(false);
      apiService.clearAuthData();
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear the state even if localStorage fails
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Password reset functionality
  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    console.log('Password reset email sent to:', email);
  };

  const resetPassword = async (token: string, email: string, newPassword: string): Promise<void> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    console.log('Password reset for:', email, 'with token:', token);
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    console.log('Password updated for user:', user?.email);
  };

  // OTP functionality
  const verifyOTP = async (userId: number, otp: string): Promise<any> => {
    try {
      const otpData: VerifyOTPRequest = {
        userId,
        otp,
      };

      const response = await apiService.verifyOTP(otpData);
      
      // Check if verification was successful (status true or 200/201)
      if (response.status === true || response.status === 200 || response.status === 201) {
        // If OTP verification includes user data and token, auto-login the user
        if (response.data?.user && response.data?.accessToken) {
          const userData: User = {
            id: response.data.user.id.toString(),
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            email: response.data.user.email,
            image: response.data.user.image || '',
            latitude: response.data.user.latitude || undefined,
            longitude: response.data.user.longitude || undefined,
            createdAt: response.data.user.createdAt || new Date().toISOString(),
            role: response.data.user.role || 'user', // Get role from API, default to 'user'
          };

          // Auto-login the user
          setUser(userData);
          setIsLoggedIn(true);
          apiService.setAuthData(response.data.accessToken, userData);
        }
        
        return response; // Return the full response
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const apiError = error as ApiError;
      
      if (apiError.status === 400) {
        throw new Error('Invalid OTP. Please check your code and try again.');
      } else if (apiError.status === 0) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      } else {
        throw new Error(apiError.message || 'OTP verification failed. Please try again.');
      }
    }
  };

  const resendOTP = async (userId: number): Promise<void> => {
    try {
      const resendData: ResendOTPRequest = {
        userId,
      };

      const response = await apiService.resendOTP(resendData);
      
      // Check if resend was successful (status true or 200/201)
      if (response.status === true || response.status === 200 || response.status === 201) {
        return; // Success
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      const apiError = error as ApiError;
      
      if (apiError.status === 400) {
        if (apiError.message === 'User not found') {
          throw new Error('User not found. Please try signing up again.');
        } else {
          throw new Error(apiError.message || 'Failed to resend OTP');
        }
      } else if (apiError.status === 0) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      } else {
        throw new Error(apiError.message || 'Failed to resend OTP. Please try again.');
      }
    }
  };

  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  const contextValue = useMemo(() => ({
    user, 
    isLoggedIn, 
    loading, 
    login, 
    signup,
    logout, 
    isAdmin,
    sendPasswordResetEmail,
    resetPassword,
    updatePassword,
    verifyOTP,
    resendOTP
  }), [user, isLoggedIn, loading, isAdmin]);

  return (
    <AuthContext.Provider value={contextValue}>
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
