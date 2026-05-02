// src/app/register/page.tsx

"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed");
      } else {
        window.location.href = "/login";
      }
    } catch {
      setError("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 border rounded w-80">
        <h1 className="text-xl mb-4">Register</h1>

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
          onClick={handleRegister}
          disabled={isSubmitting}
          className="bg-green-500 text-white w-full py-2"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link className="text-blue-600 underline" href="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
