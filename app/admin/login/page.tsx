"use client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    document.cookie = "admin=true; path=/";
    router.push("/admin");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4 text-center">
          FactoryAdmin Login
        </h2>

        <button
          onClick={handleLogin}
          className="w-full bg-gray-900 text-white py-2 rounded"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
}
