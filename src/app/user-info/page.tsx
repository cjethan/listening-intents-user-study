'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from "@/store/store";

export default function UserInfo() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [userId, setUserId] = useState('');
  const { setUserData } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Generate a random user ID
    const generatedUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(generatedUserId);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const userData = { user_id: userId, name, age: parseInt(age, 10) };
    setUserData(userData);
    localStorage.setItem("userData", JSON.stringify(userData)); // Persist user data
    router.push('/'); // Redirect to the main page
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Tell us about yourself</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
