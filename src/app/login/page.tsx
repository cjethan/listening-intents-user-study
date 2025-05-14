"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consentGiven = localStorage.getItem('consentGiven');
      if (!consentGiven) {
        router.replace('/consent'); // Redirect to the consent page if consent is not given
        return;
      }
    }

    if (status === "authenticated") {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true'); // Mark user as logged in
      }
      router.replace("/user-info"); // Redirect to the user-info page
    }
  }, [status, router]);

  if (status === "authenticated") return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
      <div className="text-center max-w-lg px-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-4xl font-extrabold mb-6 text-[#1f2937]">
          Login to Continue
        </h1>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          Please log in using your Spotify account to proceed with the study. Your account information will only be used to retrieve your top songs and recently listened songs. The data is not linked to you.
        </p>
        <button
          onClick={() => signIn("spotify")}
          className="bg-[#1f2937] text-white px-8 py-3 rounded-full text-xl font-semibold shadow-lg hover:bg-gray-900 transition-all duration-200"
        >
          Login with Spotify
        </button>
      </div>
    </div>
  );
}
