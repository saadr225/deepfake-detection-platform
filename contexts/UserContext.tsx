// contexts/UserContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';

// Constants
const API_URL_MAIN = "http://localhost:8000";
const API_URL_JSON = "https://localhost:3001";

// User interface
interface User {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
}

// Context type
interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (username: string, email: string) => Promise<boolean>;
  loginError: string | null;
  registerError: string | null;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State variables
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Use router for navigation
  const router = useRouter();

  // Check if refresh token is in cookies and set user accordingly
  useEffect(() => {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      // Mock user data
      setUser({ id: 1, username: 'User', email: 'user@example.com', isVerified: true });
    }
  }, []);

  // Login method
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoginError(null);

    try {
      const is_email = true;
      const response = await axios.post(`${API_URL_MAIN}/api/user/login/`, { email, password, is_email });

      if (response.status === 200) {
        const { access, refresh, authenticated_user } = response.data;

        // Store tokens in cookies
        Cookies.set('accessToken', access);
        Cookies.set('refreshToken', refresh);

        // Set user details
        const { user, user_data } = authenticated_user;
        setUser({
          id: user.id,
          username: user.username,
          email: user.email,
          isVerified: user_data.is_verified
        });

        router.push('/dashboard');
        return true;
      } else {
        setLoginError(response.data.message || 'Invalid email or password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError((error as any).response?.data?.message || 'An error occurred during login');
      return false;
    }
  };

  // Registration method
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setRegisterError(null);

    if (username.length < 3) {
      setRegisterError('Username must be at least 3 characters long');
      return false;
    }

    if (password.length < 8) {
      setRegisterError('Password must be at least 8 characters long');
      return false;
    }

    try {
      const response = await axios.post(`${API_URL_MAIN}/api/user/signup/`, { username, email, password });

      if (response.status === 201) {
        router.push('/login');
        return true;
      } else {
        setRegisterError(response.data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError((error as any).response?.data?.message || 'An error occurred during registration');
      return false;
    }
  };

  const logout = async () => {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      try {
        await axios.post(`${API_URL_MAIN}/user/logout/`, { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setUser(null);
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    await router.push('/login');
  };

  // Add the changePassword method in the UserProvider:
  const changePassword = async (
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Verify current password
      const response = await fetch(`${API_URL_JSON}/users?email=${user?.email}`);
      const users = await response.json();
      const currentUser = users[0];
  
      if (!currentUser || currentUser.password !== currentPassword) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }
  
      // Update password
      const updateResponse = await fetch(`${API_URL_JSON}/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentUser,
          password: newPassword
        })
      });
  
      if (!updateResponse.ok) {
        throw new Error('Failed to update password');
      }
  
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'An error occurred while changing the password'
      };
    }
  };
  
  // Add updateProfile method
  const updateProfile = async (username: string, email: string): Promise<boolean> => {
    try {
      // Find the current user in the database
      const response = await fetch(`${API_URL_JSON}/users?email=${user?.email}`);
      const users = await response.json();

      if (users.length === 0) {
        throw new Error('User not found');
      }

      // Get the first (should be only) user
      const currentUser = users[0];

      // Update the user's profile
      const updateResponse = await fetch(`${API_URL_JSON}/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: username,
          email: email
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile');
      }

      // Update the user in the context
      const updatedUser = await updateResponse.json();
      setUser({
        id: updatedUser.id,
        username: updatedUser.name,
        email: updatedUser.email,
        isVerified: updatedUser.is_verified
      });

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  // New forgot password method
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if user exists
      const response = await fetch(`${API_URL_JSON}/users?email=${email}`);
      const users = await response.json();
  
      if (users.length === 0) {
        return {
          success: false,
          message: 'No account exists with this email address. Please check your email or sign up for a new account.'
        };
      }
  
      // Get the user
      const user = users[0];
  
      // Generate a random token
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
  
      // Create expiration date (1 hour from now)
      const expirationDate = new Date(Date.now() + 3600000).toISOString();
  
      // Update user with reset token
      const updateResponse = await fetch(`${API_URL_JSON}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          resetPasswordToken: token,
          resetPasswordExpires: expirationDate
        })
      });
  
      if (!updateResponse.ok) {
        throw new Error('Failed to update user with reset token');
      }
  
      // Verify the token was set
      const updatedUser = await updateResponse.json();
      if (!updatedUser.resetPasswordToken) {
        throw new Error('Failed to set reset token');
      }
  
      // In a real app, you would send an email here
      console.log('Reset token generated:', token);
      console.log('Reset link:', `http://localhost:3000/reset-password/${token}`);
      console.log('Token expires:', expirationDate);
  
      return {
        success: true,
        message: 'Password reset instructions have been sent to your email. For testing, check the console for the reset link.'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'An error occurred while processing your request. Please try again.'
      };
    }
  };

  // New reset password method
  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters long'
        };
      }
  
      // Get all users and find the one with matching token
      const response = await fetch(`${API_URL_JSON}/users`);
      const users = await response.json();
      
      // Find user with the exact matching token
      const user = users.find((u: any) => u.resetPasswordToken === token);
  
      if (!user) {
        return {
          success: false,
          message: 'Invalid or expired reset token'
        };
      }
  
      // Check if token is expired
      if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
        return {
          success: false,
          message: 'Reset token has expired. Please request a new one.'
        };
      }
  
      // Update user's password and remove reset token
      const updateResponse = await fetch(`${API_URL_JSON}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          password: newPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        })
      });
  
      if (!updateResponse.ok) {
        throw new Error('Failed to update password');
      }
  
      // Verify the update was successful
      const updatedUser = await updateResponse.json();
      if (updatedUser.resetPasswordToken !== null) {
        throw new Error('Failed to clear reset token');
      }
  
      return {
        success: true,
        message: 'Password has been successfully reset. Please login with your new password.'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'An error occurred while resetting your password.'
      };
    }
  };


  // Updated context value with new methods
  const contextValue = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loginError,
    registerError,
    forgotPassword,
    resetPassword,
    changePassword
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};