"use client";
import { createContext, useContext, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/app/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await authApi.getCurrentUser();
      return res.data;
    },
    retry: false,
    staleTime: 2 * 60 * 1000,
  });

  const user = data?.user || null;
  const auth = data?.auth || null;
  const isAuthenticated = !!user && !!auth;

  const invalidateUser = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  }, [queryClient]);

  const clearAuth = useCallback(() => {
    queryClient.setQueryData(["currentUser"], null);
    queryClient.removeQueries({ queryKey: ["currentUser"] });
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, auth, isAuthenticated, isLoading, error, invalidateUser, clearAuth }),
    [user, auth, isAuthenticated, isLoading, error, invalidateUser, clearAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
