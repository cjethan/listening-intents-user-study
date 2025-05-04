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
  const [prolificId, setProlificId] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [filteredGenres, setFilteredGenres] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [musicExperience, setMusicExperience] = useState('');
  const [instruments, setInstruments] = useState('');
  const [duration, setDuration] = useState('');
  const [playsInstrument, setPlaysInstrument] = useState('');
  const [instrumentsPlayed, setInstrumentsPlayed] = useState<string[]>([]);
  const [otherInstrument, setOtherInstrument] = useState('');
  const [yearsPlayed, setYearsPlayed] = useState('');
  const [formalEducation, setFormalEducation] = useState('');
  const [musicProduction, setMusicProduction] = useState('');
  const [musicHours, setMusicHours] = useState(20); // Default to average value
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

  function handleInstrumentChange(instrument: string) {
    setInstrumentsPlayed((prev) =>
      prev.includes(instrument) ? prev.filter((i) => i !== instrument) : [...prev, instrument]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation for required fields
    if (!prolificId.trim()) {
        setError('Prolific ID is required.');
        return;
    }
    if (selectedGenres.length < 3) {
        setError('Please select at least 3 genres.');
        return;
    }
    if (!playsInstrument) {
        setError('Please specify if you play a musical instrument.');
        return;
    }
    if (
        (playsInstrument === 'Yes' || playsInstrument === 'I used to, but not anymore') &&
        instrumentsPlayed.length === 0 &&
        !otherInstrument.trim()
    ) {
        setError('Please specify at least one instrument you play or played.');
        return;
    }
    if (
        (playsInstrument === 'Yes' || playsInstrument === 'I used to, but not anymore') &&
        !yearsPlayed
    ) {
        setError('Please specify how many years you have played music.');
        return;
    }
    if (!formalEducation) {
        setError('Please specify your formal music education status.');
        return;
    }
    if (!musicProduction) {
        setError('Please specify if you compose, produce, or record music.');
        return;
    }

    // Prepare user data according to the model
    const userData = {
        user_id: userId,
        prolific_id: prolificId,
        genres: selectedGenres,
        play_instrument: playsInstrument.toLowerCase(),
        instruments_played: [...instrumentsPlayed, otherInstrument].filter(Boolean),
        instruments_played_years: [yearsPlayed],
        formal_education: formalEducation.toLowerCase(),
        compose_music: musicProduction.toLowerCase(),
        hours_listening_weekly: musicHours,
        intents: {}, // Placeholder for intents
    };

    setUserData(userData);
    localStorage.setItem('userData', JSON.stringify(userData)); // Persist user data
    router.push('/consent'); // Redirect to consent form
  }

  return (
    <div className="p-8 bg-gradient-to-b from-gray-100 to-gray-50 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-semibold text-gray-800 mb-10 tracking-tight">Tell us about yourself</h1>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-12 rounded-2xl shadow-2xl w-full max-w-3xl">
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">Prolific ID</label>
          <input
            type="text"
            value={prolificId}
            onChange={(e) => setProlificId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:outline-none transition-all"
            placeholder="Enter your Prolific ID"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">Search Genres</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:outline-none transition-all"
            placeholder="Search genres..."
          />
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg mt-3">
            {filteredGenres.map((genre) => (
              <div
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`flex items-center px-4 py-2 cursor-pointer transition-all ${
                  selectedGenres.includes(genre) ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-sm text-gray-700">{genre}</span>
              </div>
            ))}
          </div>
        </div>
        {selectedGenres.length > 0 && (
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-2">Selected Genres</label>
            <div className="flex flex-wrap gap-3 mt-3">
              {selectedGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-4 py-2 bg-gray-800 text-white text-sm rounded-full shadow-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">Do you play a musical instrument?</label>
          <div className="flex gap-6 mt-3">
            {['Yes', 'No', 'I used to, but not anymore'].map((option) => (
              <label key={option} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  checked={playsInstrument === option}
                  onChange={(e) => setPlaysInstrument(e.target.value)}
                  className="form-radio h-5 w-5 text-gray-800 focus:ring-gray-800"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
        {playsInstrument === 'Yes' || playsInstrument === 'I used to, but not anymore' ? (
          <>
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">If yes, which instrument(s) do/did you play?</label>
              <div className="space-y-3 mt-3">
                {[
                  'Piano/Keyboard',
                  'Guitar',
                  'Drums/Percussion',
                  'Violin/Viola',
                  'Cello/Double bass',
                  'Flute/Clarinet/Saxophone',
                  'Voice (Singing)',
                ].map((instrument) => (
                  <label key={instrument} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={instrument}
                      checked={instrumentsPlayed.includes(instrument)}
                      onChange={() => handleInstrumentChange(instrument)}
                      className="form-checkbox h-5 w-5 text-gray-800 focus:ring-gray-800"
                    />
                    <span className="text-gray-700">{instrument}</span>
                  </label>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Other (please specify)</label>
                  <input
                    type="text"
                    value={otherInstrument}
                    onChange={(e) => setOtherInstrument(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:outline-none transition-all"
                    placeholder="Specify other instrument"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">How many years have you played or did you play music actively?</label>
              <select
                value={yearsPlayed}
                onChange={(e) => setYearsPlayed(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:outline-none mt-3 transition-all"
              >
                <option value="" disabled>Select duration</option>
                {[
                  'Less than 1 year',
                  '1-2 years',
                  '3-5 years',
                  '6-10 years',
                  'More than 10 years',
                ].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </>
        ) : null}
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">Do you have any formal music education?</label>
          <div className="flex gap-6 mt-3">
            {['Yes, ongoing', 'Yes, completed', 'No'].map((option) => (
              <label key={option} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  checked={formalEducation === option}
                  onChange={(e) => setFormalEducation(e.target.value)}
                  className="form-radio h-5 w-5 text-gray-800 focus:ring-gray-800"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">Do you compose, produce, or record music?</label>
          <div className="flex gap-6 mt-3">
            {['Yes, regularly', 'Occasionally', 'No'].map((option) => (
              <label key={option} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  checked={musicProduction === option}
                  onChange={(e) => setMusicProduction(e.target.value)}
                  className="form-radio h-5 w-5 text-gray-800 focus:ring-gray-800"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">
            How many hours per week do you typically spend listening to music?
          </label>
          <div className="relative mt-6">
            <input
              type="range"
              min="5"
              max="36"
              step="1"
              value={musicHours}
              onChange={(e) => setMusicHours(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-gray-800"
              style={{
                background: `linear-gradient(to right, #1f2937 ${(musicHours - 5) / 31 * 100}%, #d1d5db ${(musicHours - 5) / 31 * 100}%)`,
              }}
            />
            <style jsx>{`
              input[type='range']::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                background: #1f2937;
                border: 2px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                transition: transform 0.2s ease-in-out;
              }
              input[type='range']::-webkit-slider-thumb:hover {
                transform: scale(1.2);
              }
              input[type='range']::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #1f2937;
                border: 2px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                transition: transform 0.2s ease-in-out;
              }
              input[type='range']::-moz-range-thumb:hover {
                transform: scale(1.2);
              }
              input[type='range']::-ms-thumb {
                width: 20px;
                height: 20px;
                background: #1f2937;
                border: 2px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                transition: transform 0.2s ease-in-out;
              }
              input[type='range']::-ms-thumb:hover {
                transform: scale(1.2);
              }
            `}</style>
            <div
              className="absolute -top-10 left-0 transform -translate-x-1/2 text-sm font-medium text-gray-800 bg-white px-3 py-1 rounded-full shadow-md"
              style={{
                left: `${((musicHours - 5) / 36) * 100}%`, // Calculate position based on slider value
              }}
            >
              {musicHours === 5 ? '< 5 hours' : musicHours === 36 ? '> 35 hours' : `${musicHours} hours`}
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-4 text-center">
            The average music consumption is around 20 hours per week.
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-3">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow hover:bg-gray-900 focus:ring-2 focus:ring-gray-800 focus:outline-none transition-all"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
