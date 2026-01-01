import { useMutation, useQuery } from "@tanstack/react-query";
import {
  registerUser,
  logoutUser,
  updateUser,
  loginUser,
  changePassword,
  getCurrentUser,
  sendEmailVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getActiveSessions,
  logoutDevice,
  authenticateWithGoogle,
  authenticateUser,
  generateNewOtp,
  verifyOtp,
} from "../authApi";

// Hook for user signup
export const useSignupUser = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await registerUser(userData);
      return response;
    },
    onSuccess: (data) => {
      console.log("User Registered Successfully", data);
    },
    onError: (error) => {
      console.error("Error Registering User", error);
    },
  });
};

// Hook for user login
export const useLoginUser = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await loginUser(userData);
      return response;
    },
    onSuccess: (data) => {
      console.log("User Logged In Successfully", data);
    },
    onError: (error) => {
      console.error("Error Logging In User", error);
    },
  });
};

// Hook for updating user
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await updateUser(userData);
      return response;
    },
    onSuccess: (data) => {
      console.log("User Updated Successfully", data);
    },
    onError: (error) => {
      console.error("Error Updating User", error);
    },
  });
};

// Hook for logout
export const useLogoutUser = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await logoutUser();
      return response;
    },
    onSuccess: (data) => {
      console.log("User Logged Out Successfully", data);
    },
    onError: (error) => {
      console.error("Error Logging Out User", error);
    },
  });
};

// Hook for changing password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const response = await changePassword(currentPassword, newPassword);
      return response;
    },
    onSuccess: (data) => {
      console.log("Password Changed Successfully", data);
    },
    onError: (error) => {
      console.error("Error Changing Password", error);
    },
  });
};

// Hook for getting current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response;
    },
    retry: false,
  });
};

// Hook for sending email verification
export const useSendEmailVerification = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await sendEmailVerification();
      return response;
    },
    onSuccess: (data) => {
      console.log("Verification Email Sent Successfully", data);
    },
    onError: (error) => {
      console.error("Error Sending Verification Email", error);
    },
  });
};

// Hook for verifying email
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token) => {
      const response = await verifyEmail(token);
      return response;
    },
    onSuccess: (data) => {
      console.log("Email Verified Successfully", data);
    },
    onError: (error) => {
      console.error("Error Verifying Email", error);
    },
  });
};

// Hook for requesting password reset
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await requestPasswordReset(email);
      return response;
    },
    onSuccess: (data) => {
      console.log("Password Reset Email Sent Successfully", data);
    },
    onError: (error) => {
      console.error("Error Sending Password Reset Email", error);
    },
  });
};

// Hook for resetting password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ token, newPassword }) => {
      const response = await resetPassword(token, newPassword);
      return response;
    },
    onSuccess: (data) => {
      console.log("Password Reset Successfully", data);
    },
    onError: (error) => {
      console.error("Error Resetting Password", error);
    },
  });
};

// Hook for getting active sessions
export const useActiveSessions = () => {
  return useQuery({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      const response = await getActiveSessions();
      return response;
    },
  });
};

// Hook for logging out from a specific device
export const useLogoutDevice = () => {
  return useMutation({
    mutationFn: async ({ tokenId, password }) => {
      const response = await logoutDevice(tokenId, password);
      return response;
    },
    onSuccess: (data) => {
      console.log("Device Logged Out Successfully", data);
    },
    onError: (error) => {
      console.error("Error Logging Out Device", error);
    },
  });
};

// Hook for Google authentication
export const useGoogleAuth = () => {
  return useMutation({
    mutationFn: async (googleProfile) => {
      const response = await authenticateWithGoogle(googleProfile);
      return response;
    },
    onSuccess: (data) => {
      console.log("Google Authentication Successful", data);
    },
    onError: (error) => {
      console.error("Error with Google Authentication", error);
    },
  });
};

// Hook for refreshing token
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await authenticateUser();
      return response;
    },
    onError: (error) => {
      console.error("Error Refreshing Token", error);
    },
  });
};

// Hook for generating new OTP
export const useGenerateOtp = () => {
  return useMutation({
    mutationFn: async (userId) => {
      const response = await generateNewOtp(userId);
      return response;
    },
    onSuccess: (data) => {
      console.log("OTP Generated Successfully", data);
    },
    onError: (error) => {
      console.error("Error Generating OTP", error);
    },
  });
};

// Hook for verifying OTP
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async ({ otp, userId }) => {
      const response = await verifyOtp(otp, userId);
      return response;
    },
    onSuccess: (data) => {
      console.log("OTP Verified Successfully", data);
    },
    onError: (error) => {
      console.error("Error Verifying OTP", error);
    },
  });
};

