'use client';
/*
* todo Page to collect user information
*/
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from "@/store/store";

export default function UserInfo() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [userId, setUserId] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [filteredGenres, setFilteredGenres] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState('');
  const { setUserData } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Generate a random user ID
    const generatedUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(generatedUserId);

    // Fetch genres from the file
    fetch('/all_genres.txt')
      .then((response) => response.text())
      .then((data) => {
        const genreList = data.split('\n').map((genre) => genre.trim()).filter(Boolean);
        setGenres(genreList);
        setFilteredGenres(genreList);
      });
  }, []);

  useEffect(() => {
    // Filter genres based on the search term
    setFilteredGenres(
      genres.filter((genre) => genre.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, genres]);

  function handleGenreClick(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setError(''); // Clear error when a genre is selected
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedGenres.length < 3) {
      setError('Please select at least 3 genres.');
      return;
    }
    const userData = { user_id: userId, name, age: parseInt(age, 10), genres: selectedGenres };
    setUserData(userData);
    localStorage.setItem("userData", JSON.stringify(userData)); // Persist user data
    router.push('/'); // Redirect to the main page
  }

  return (
    <div className="p-6 bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-extrabold text-blue-700 mb-6">Tell us about yourself</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your age"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Search Genres</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search genres..."
          />
          <div className="max-h-40 overflow-y-auto border rounded mt-2">
            {filteredGenres.map((genre) => (
              <div
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`flex items-center px-4 py-2 cursor-pointer ${
                  selectedGenres.includes(genre) ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-sm text-gray-700">{genre}</span>
              </div>
            ))}
          </div>
        </div>
        {selectedGenres.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Selected Genres</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
