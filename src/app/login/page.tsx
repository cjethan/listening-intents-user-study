"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Updated import
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/"); // Use replace to avoid adding to history stack
    }
  }, [status, router]);

  if (status === "authenticated") return null; // Prevent rendering if already logged in

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome to My Spotify App</h1>
      <button
        onClick={() => signIn("spotify")}
        className="bg-green-500 px-6 py-3 rounded-lg text-xl font-semibold hover:bg-green-600"
      >
        Login with Spotify
      </button>
    </div>
  );
}
