'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProlificIdPage() {
  const router = useRouter();
  const [prolificId, setProlificId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prolificId.trim()) {
      setError('Please enter your Prolific ID.');
      return;
    }

    // Save Prolific ID to localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      const parsedData = userData ? JSON.parse(userData) : {};
      parsedData.prolific_id = prolificId.trim();
      localStorage.setItem('userData', JSON.stringify(parsedData));
    }

    // Navigate to user-info page
    router.push('/user-info');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-white to-blue-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="prolific-id" className="block text-lg font-medium text-gray-700 mb-2">
              <b>Please enter your Prolific ID below</b>
            </label>
            <input
              id="prolific-id"
              type="text"
              value={prolificId}
              onChange={(e) => {
                setProlificId(e.target.value);
                setError('');
              }}
              placeholder="Enter your Prolific ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}