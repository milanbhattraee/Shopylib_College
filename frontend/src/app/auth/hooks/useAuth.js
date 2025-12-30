const { useMutation } = require("@tanstack/react-query");
import { useMutation } from "@tanstack/react-query";
import {
  registerUser,
  logoutUser,
  updateUser,
  loginUser,
} from "../auth/authApi";

const useSignupUser = () => {
  useMutation({
    mutationFn: async (userData) => {
      const resposne = await registerUser(userData);
      return resposne;
    },
    onSuccess: (data) => {
      console.log("User Registered Successfully", data);
    },
    onError: (error) => {
      console.error("Error Registering User", error);
    },
  });
};

const useLoginUser = () => {
  useMutation({
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

const useUpdateUser = () => {
  useMutation({
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

const useLogoutUser = () => {
  useMutation({
    mutationFn: async () => {
      const response = await logoutUser();
      return response;
    },
  });
};

