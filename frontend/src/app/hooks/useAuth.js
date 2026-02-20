import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/app/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/app/provider/AuthProvider";

export const useLogin = () => {
  const { invalidateUser } = useAuth();
  return useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: () => {
      toast.success("Logged in successfully!");
      invalidateUser();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Login failed"),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data) => authApi.register(data),
    onSuccess: () => toast.success("Registration successful! Please verify your email."),
    onError: (err) => toast.error(err.response?.data?.message || "Registration failed"),
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success("Logged out successfully");
      window.location.href = "/";
    },
    onError: () => toast.error("Logout failed"),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data) => authApi.forgotPassword(data),
    onSuccess: () => toast.success("If the email exists, a reset link has been sent"),
    onError: (err) => toast.error(err.response?.data?.message || "Failed to send reset email"),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data) => authApi.resetPassword(data),
    onSuccess: () => toast.success("Password reset successfully!"),
    onError: (err) => toast.error(err.response?.data?.message || "Password reset failed"),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => toast.success("Password changed. Please login again."),
    onError: (err) => toast.error(err.response?.data?.message || "Password change failed"),
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (data) => authApi.verifyEmail(data),
    onSuccess: () => toast.success("Email verified successfully!"),
    onError: (err) => toast.error(err.response?.data?.message || "Verification failed"),
  });
};

export const useSendVerification = () => {
  return useMutation({
    mutationFn: () => authApi.sendVerification(),
    onSuccess: () => toast.success("Verification email sent!"),
    onError: (err) => toast.error(err.response?.data?.message || "Failed to send verification"),
  });
};
