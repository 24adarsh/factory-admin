"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/admin",
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Glow */}
      <div className="absolute w-[420px] h-[420px] bg-purple-500/20 blur-3xl rounded-full"></div>

      <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl w-[380px]">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Factory Admin
        </h1>
        <p className="text-gray-300 text-center mb-6">
          Sign in to manage operations
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-200 text-sm p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <input
          className="w-full mb-4 px-4 py-3 rounded-lg bg-black/40 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Admin Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-6 px-4 py-3 rounded-lg bg-black/40 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold tracking-wide hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-6">
          Authorized access only
        </p>
      </div>
    </div>
  );
}
