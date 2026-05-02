// src/hooks/useAuth.ts

"use client";

import { signIn, signOut } from "next-auth/react";

export function useAuth() {
  const login = async (email: string, password: string) => {
    return signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  };

  const logout = async () => {
    return signOut({ redirect: true, callbackUrl: "/login" });
  };

  return { login, logout };
}