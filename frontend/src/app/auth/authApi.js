import axios from 'axios';
import { toast } from 'react-toastify';
import handleRequest from '../utils/apiHandler';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


// Register user
export const registerUser = async(userData) => {
  const url = `${apiUrl}/users/signUp`;
  const response = await handleRequest({ url, method: 'POST', data: userData });
  return response;
};

// Login user
export const loginUser = async (userData) => {
  const url = `${apiUrl}/users/login`;
  const response = await handleRequest({ url, method: 'POST', data: userData });
  return response;
};

// Logout user
export const logoutUser = async () => {
  const url = `${apiUrl}/users/logout`;
  const response = await handleRequest({ url, method: 'GET' });
  if (response?.success) {
    toast.success("Logged Out Successfully!");
  }
  return response;
};

// Authenticate user (refresh token)
export const authenticateUser = async () => {
  const url = `${apiUrl}/users/refreshToken`;
  try {
    const response = await axios.get(url, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user details
export const updateUser = async (userData) => {
  const url = `${apiUrl}/users/updateUser`;
  try {
    const response = await axios.post(url, userData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || 'Failed to update user!';
    toast.error(errorMessage);
    console.error(error);
    throw error;
  }
};

// Generate new OTP
export const generateNewOtp = async (userId) => {
  const url = `${apiUrl}/users/generate-otp`;
  const response = await handleRequest({ url, method: 'POST',data: {userId} });
  if (response?.success) {
    toast.success(" enter your otp!");
  }
  return response;
};

export const verifyOtp = async (otp,userId) => {
  const url = `${apiUrl}/users/verify-otp`;
  
  const response = await handleRequest({ url, method: 'POST',data: {otp,userId} });
  
  return response;
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  const url = `${apiUrl}/auth/change-password`;
  const response = await handleRequest({ 
    url, 
    method: 'POST', 
    data: { currentPassword, newPassword } 
  });
  if (response?.success) {
    toast.success("Password changed successfully!");
  }
  return response;
};

// Get current user
export const getCurrentUser = async () => {
  const url = `${apiUrl}/auth/current-user`;
  const response = await handleRequest({ url, method: 'GET' });
  return response;
};

// Send email verification
export const sendEmailVerification = async () => {
  const url = `${apiUrl}/auth/send-verification`;
  const response = await handleRequest({ url, method: 'POST' });
  if (response?.success) {
    toast.success("Verification email sent!");
  }
  return response;
};

// Verify email
export const verifyEmail = async (token) => {
  const url = `${apiUrl}/auth/verify-email`;
  const response = await handleRequest({ url, method: 'POST', data: { token } });
  if (response?.success) {
    toast.success("Email verified successfully!");
  }
  return response;
};

// Request password reset
export const requestPasswordReset = async (email) => {
  const url = `${apiUrl}/auth/request-reset`;
  const response = await handleRequest({ url, method: 'POST', data: { email } });
  if (response?.success) {
    toast.success("Password reset email sent!");
  }
  return response;
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const url = `${apiUrl}/auth/reset-password`;
  const response = await handleRequest({ 
    url, 
    method: 'POST', 
    data: { token, newPassword } 
  });
  if (response?.success) {
    toast.success("Password reset successfully!");
  }
  return response;
};

// Get active sessions
export const getActiveSessions = async () => {
  const url = `${apiUrl}/auth/sessions`;
  const response = await handleRequest({ url, method: 'GET' });
  return response;
};

// Logout from specific device
export const logoutDevice = async (tokenId, password) => {
  const url = `${apiUrl}/auth/logout-device`;
  const response = await handleRequest({ 
    url, 
    method: 'POST', 
    data: { tokenId, password } 
  });
  if (response?.success) {
    toast.success("Device logged out successfully!");
  }
  return response;
};

// Authenticate with Google
export const authenticateWithGoogle = async (googleProfile) => {
  const url = `${apiUrl}/auth/google`;
  const response = await handleRequest({ 
    url, 
    method: 'POST', 
    data: { googleProfile } 
  });
  return response;
};
