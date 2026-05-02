// src/app/login/page.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const res = await login(email, password);

      if (res?.error) {
        setError(res.error);
      } else {
        const callbackUrl =
          new URLSearchParams(window.location.search).get(
            "callbackUrl"
          ) ?? "/dashboard";

        window.location.href = callbackUrl;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 border rounded w-80">
        <h1 className="text-xl mb-4">Login</h1>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className="bg-blue-500 text-white w-full py-2"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-sm">
          No account?{" "}
          <Link className="text-blue-600 underline" href="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
