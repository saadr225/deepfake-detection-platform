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

  // Logout method
  const logout = () => {
    setUser(null);
    router.push('/login');
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

  // Context value
  const contextValue = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loginError,
    registerError
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