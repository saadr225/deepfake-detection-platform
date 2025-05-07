import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';

// Constants
const API_URL_MAIN = "http://localhost:8000";
const API_URL_JSON = "https://localhost:3001";

// User interface
interface User {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  avatar?: string;
}

// Context type
// Update the UserContextType interface
interface UserContextType {
  user: User | null;
  authInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (username: string, email: string) => Promise<{ success: boolean; message: string }>;
  loginError: string | null;
  registerError: string | null;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (oldPassword: string, newPassword: string, newPasswordRepeat: string) => Promise<{ success: boolean; message: string }>;
  changeEmail: (new_email: string) => Promise<{ success: boolean; message: string }>;
}


// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State variables
  //const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false); // Add this line
  
  // Use router for navigation
  const router = useRouter();

  // Check if refresh token is in cookies, refresh access token, and set user accordingly
  useEffect(() => {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      axios.post(`${API_URL_MAIN}/api/auth/refresh_token/`, { refresh: refreshToken })
        .then(response => {
          const { access } = response.data;
          Cookies.set('accessToken', access);
  
          axios.get(`${API_URL_MAIN}/api/user/info/`, {
            headers: {
              Authorization: `Bearer ${access}`
            }
          })
          .then(userResponse => {
            const { data } = userResponse.data;
            const { id, username, email } = data.user;
            const { is_verified } = data.user_data;
            
            setUser({
              id,
              username,
              email,
              isVerified: is_verified
            });
          })
          .catch(userError => {
            console.error('Failed to fetch user details:', userError);
            logout();
          });
        })
        .catch(refreshError => {
          console.error('Failed to refresh access token:', refreshError);
          logout();
        });
    } else {
      logout();
    }
    setAuthInitialized(true);
  }, []);

  // Check if refresh token is in cookies and set user accordingly
  // useEffect(() => {
  //   const refreshToken = Cookies.get('refreshToken');
  //   if (refreshToken) {
  //     // Set basic user data immediately
  //     setUser({ id: 1, username: 'User', email: 'user@example.com', isVerified: false });
  //   }
  //   setAuthInitialized(true);
  // }, []);

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
        setRegisterError(response.data.error.username || response.data.error.email || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError((error as any).response?.data?.error.username || (error as any).response?.data?.error.email || 'An error occurred during registration');
      return false;
    }
  };

  const logout = async () => {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      try {
        await axios.post(`${API_URL_MAIN}/api/user/logout/`, { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setUser(null);
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    //router.push('/login');
  };

  // Add the changePassword method in the UserProvider:
  const changePassword = async (
    oldPassword: string, 
    newPassword: string, 
    newPasswordRepeat: string
  ): Promise<{ success: boolean; message: string }> => {
    const changePasswordUrl = `${API_URL_MAIN}/api/user/change_password/`;
    const refreshTokenUrl = `${API_URL_MAIN}/api/auth/refresh_token/`;
  
    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');
  
    // Function to make the change password request
    const makeChangePasswordRequest = async (token: string) => {
      return axios.put(changePasswordUrl, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_repeat: newPasswordRepeat
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    };
  
    try {
      // Try to change the password with the current access token
      await makeChangePasswordRequest(accessToken!);
  
      return {
        success: true,
        message: 'Password changed successfully.'
      };
    } catch (error) {
      // If access token is invalid (e.g., 401 Unauthorized), try to refresh it
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          const refreshResponse = await axios.post(refreshTokenUrl, { refresh: refreshToken });
  
          const newAccessToken = refreshResponse.data.access;
          Cookies.set('accessToken', newAccessToken);
  
          // Retry the change password request with the new access token
          await makeChangePasswordRequest(newAccessToken);
  
          return {
            success: true,
            message: 'Password changed successfully.'
          };
        } catch (refreshError) {
          if (axios.isAxiosError(refreshError)) {
            return {
              success: false,
              message: refreshError.response?.data?.message || 'Failed to refresh access token. Please log in again.'
            };
          }
          return {
            success: false,
            message: 'Failed to refresh access token. Please log in again.'
          };
        }
      } else if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'An error occurred while changing the password.'
        };
      } else {
        return {
          success: false,
          message: 'An error occurred while changing the password.'
        };
      }
    }
  };

  // Add the changeEmail method in the UserProvider:  
const changeEmail = async (new_email: string): Promise<{ success: boolean; message: string }> => {
  const changeEmailUrl = `${API_URL_MAIN}/api/user/change_email/`;
  const refreshTokenUrl = `${API_URL_MAIN}/api/auth/refresh_token/`;

  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');

  const makeChangeEmailRequest = async (token: string) => {
    return axios.put(changeEmailUrl, { new_email }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  try {
    const response = await makeChangeEmailRequest(accessToken!);

    // Print the server response on success
    console.log('Server response:', response.data);

    // Update the email in the user state
    if (user) {
      setUser({ ...user, email: new_email });
    }

    return {
      success: true,
      message: 'Email changed successfully.'
    };
  } catch (error) {
    // Print the server response on error
    if (axios.isAxiosError(error)) {
      console.error('Server response:', error.response?.data);
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        const refreshResponse = await axios.post(refreshTokenUrl, { refresh: refreshToken });

        const newAccessToken = refreshResponse.data.access;
        Cookies.set('accessToken', newAccessToken);

        const retryResponse = await makeChangeEmailRequest(newAccessToken);

        // Print the server response on success
        console.log('Server response:', retryResponse.data);

        if (user) {
          setUser({ ...user, email: new_email });
        }

        return {
          success: true,
          message: 'Email changed successfully.'
        };
      } catch (refreshError) {
        // Print the server response on error
        if (axios.isAxiosError(refreshError)) {
          console.error('Server response:', refreshError.response?.data);
          return {
            success: false,
            message: refreshError.response?.data?.message || 'Failed to refresh access token. Please log in again.'
          };
        }
        return {
          success: false,
          message: 'Failed to refresh access token. Please log in again.'
        };
      }
    } else if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred while changing the email.'
      };
    } else {
      return {
        success: false,
        message: 'An error occurred while changing the email.'
      };
    }
  }
};
  
  // Add updateProfile method
  const updateProfile = async (username: string, email: string): Promise<{ success: boolean; message: string }> => {
    // We will remove the ability to update the username and only allow the email to be updated.
    try {
      const { success, message } = await changeEmail(email);
      return { success, message };
    } catch (error) {
      console.error('Profile update error:', error);
      if (axios.isAxiosError(error)) {
        return { success: false, message: error.response?.data?.message || 'An unexpected error occurred' };
      }
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  // New forgot password method
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await axios.post(`${API_URL_MAIN}/api/user/forgot_password/`, { 
        email 
      });
      
      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'An error occurred while processing your request.'
        };
      }
      return {
        success: false,
        message: 'An error occurred while processing your request.'
      };
    }
  };

  // New reset password method
  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await axios.post(
        `${API_URL_MAIN}/api/user/reset_password/${token}/`, 
        { new_password: newPassword }
      );

      return {
        success: true,
        message: 'Password has been successfully reset. Please login with your new password.'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'An error occurred while resetting your password.'
        };
      }
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
    changePassword,
    changeEmail,
    authInitialized,
  };

    // Don't render children until auth is initialized
    if (!authInitialized) {
      return <div>Loading...</div>; // Or a spinner
    }

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