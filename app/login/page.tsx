"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res || res.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-[380px] rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center">
          FactoryAdmin
        </h1>
        <p className="text-gray-300 text-center mb-6">
          Admin Login
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-500/20 p-2 rounded text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full mb-3 px-4 py-3 rounded-lg bg-black/40 text-white border border-white/10"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-5 px-4 py-3 rounded-lg bg-black/40 text-white border border-white/10"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      
      
      
      </div>
    </div>
  );
}
