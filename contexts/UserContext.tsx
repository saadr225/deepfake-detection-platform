// contexts/UserContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';

// Constants
const API_URL = 'http://localhost:3001';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
}

// Interface for full user data (including password)
interface UserData extends User {
  password: string;
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
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;}

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

  // Login method
  const login = async (email: string, password: string): Promise<boolean> => {
    // Reset previous errors
    setLoginError(null);

    try {
      // Check if user exists with matching credentials
      const response = await fetch(`${API_URL}/users?email=${email}`);
      const users = await response.json();

      // Find user with matching email and password
      const foundUser = users.find((u: UserData) => 
        u.email === email && u.password === password
      );

      if (foundUser) {
        // Successful login
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        
        // Redirect to dashboard
        router.push('/dashboard');

        return true;
      } else {
        // Failed login
        setLoginError('Invalid email or password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred during login');
      return false;
    }
  };

  // Registration method
  const register = async (
    username: string, 
    email: string, 
    password: string
  ): Promise<boolean> => {
    // Reset previous errors
    setRegisterError(null);

    // Input validations
    if (username.length < 3) {
      setRegisterError('Username must be at least 3 characters long');
      return false;
    }

    if (password.length < 8) {
      setRegisterError('Password must be at least 8 characters long');
      return false;
    }

    try {
      // Check if email already exists
      const checkResponse = await fetch(`${API_URL}/users?email=${email}`);
      const existingUsers = await checkResponse.json();

      if (existingUsers.length > 0) {
        setRegisterError('Email already in use');
        return false;
      }

      // Create new user
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: username,
          email: email,
          password: password // In a real app, this would be hashed
        })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const newUser = await response.json();

      // Set user in context (omit password)
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      
      // Redirect to dashboard
      router.push('/dashboard');

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('Registration failed');
      return false;
    }
  };

  // In UserContext.tsx, update the logout method
const logout = async () => {
  try {
    // First set user to null
    setUser(null);
    // Then redirect after a small delay to ensure state is updated
    await router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

  // Add the changePassword method in the UserProvider:
  const changePassword = async (
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Verify current password
      const response = await fetch(`${API_URL}/users?email=${user?.email}`);
      const users = await response.json();
      const currentUser = users[0];
  
      if (!currentUser || currentUser.password !== currentPassword) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }
  
      // Update password
      const updateResponse = await fetch(`${API_URL}/users/${currentUser.id}`, {
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
      const response = await fetch(`${API_URL}/users?email=${user?.email}`);
      const users = await response.json();

      if (users.length === 0) {
        throw new Error('User not found');
      }

      // Get the first (should be only) user
      const currentUser = users[0];

      // Update the user's profile
      const updateResponse = await fetch(`${API_URL}/users/${currentUser.id}`, {
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
        name: updatedUser.name,
        email: updatedUser.email
      });

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  // New forgot password method
  // In UserContext.tsx, modify the forgotPassword method:
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if user exists
      const response = await fetch(`${API_URL}/users?email=${email}`);
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
      const updateResponse = await fetch(`${API_URL}/users/${user.id}`, {
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
  // In UserContext.tsx, modify the resetPassword method:
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
      const response = await fetch(`${API_URL}/users`);
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
      const updateResponse = await fetch(`${API_URL}/users/${user.id}`, {
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
// Keep the existing useUser hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};