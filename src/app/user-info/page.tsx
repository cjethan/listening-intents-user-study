'use client';
/*
* todo Page to collect user information
*/
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from "@/store/store";
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';

export default function UserInfo() {
  const [userId, setUserId] = useState('');
  const [prolificId, setProlificId] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState('');
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
    if (typeof window !== 'undefined') {
      const consentGiven = localStorage.getItem('consentGiven');
      const isAuthenticated = localStorage.getItem('isAuthenticated');

      if (!consentGiven) {
        router.replace('/consent'); // Redirect to the consent page if consent is not given
        return;
      }

      // Generate a random user ID
      const uniqueId = uuidv4();
      setUserId(uniqueId);

      // Fetch genres from the file
      fetch('/all_genres.txt')
        .then((response) => response.text())
        .then((data) => {
          const genreList = data.split('\n').map((genre) => genre.trim()).filter(Boolean);
          setGenres(genreList);
        });
    }
  }, [router]);

  // Helper for react-select options
  const genreOptions = genres.map((g) => ({ value: g, label: g }));

  // Handler for react-select
  function handleGenreSelect(selected: any) {
    setSelectedGenres(selected ? selected.map((opt: any) => opt.value) : []);
    setError('');
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

    // Map user input to enum values
    const playInstrumentEnum = playsInstrument.toLowerCase();
    const formalEducationEnum = formalEducation
      .toLowerCase()
      .replace('yes, ongoing', 'ongoing')
      .replace('yes, completed', 'yes');
    const composeMusicEnum = musicProduction
      .toLowerCase()
      .replace('yes, regularly', 'yes')
      .replace('occasionally', 'occasionally')
      .replace('no', 'no');
    const instrumentsPlayedYearsEnum = yearsPlayed
      ? yearsPlayed
          .toLowerCase()
          .replace('less than 1 year', 'less than 1 year')
          .replace('1-2 years', '1-2 years')
          .replace('3-5 years', '3-5 years')
          .replace('6-10 years', '6-10 years')
          .replace('more than 10 years', 'more than 10 years')
      : null; // Map empty string to null

    // Prepare user data according to the model
    const userData = {
      user_id: userId,
      prolific_id: prolificId,
      genres: selectedGenres,
      play_instrument: playInstrumentEnum,
      instruments_played: [...instrumentsPlayed, otherInstrument].filter(Boolean),
      instruments_played_years: instrumentsPlayedYearsEnum,
      formal_education: formalEducationEnum,
      compose_music: composeMusicEnum,
      hours_listening_weekly: musicHours,
      intents: {}, // Placeholder for intents
    };

    setUserData(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userData', JSON.stringify(userData)); // Persist user data
    }
    router.push('/rank-intents'); // Redirect to the intent ranking page
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
          <label className="block text-lg font-medium text-gray-800 mb-2">Please select music genres that you listen to:</label>
          <Select
            isMulti
            options={genreOptions}
            value={genreOptions.filter(opt => selectedGenres.includes(opt.value))}
            onChange={handleGenreSelect}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Search and select genres..."
            closeMenuOnSelect={false}
            noOptionsMessage={() => "No genres found"}
          />
        </div>
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
          <div className="relative mt-10">
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
              className="absolute -top-10 text-sm font-medium text-gray-800 bg-white px-3 py-1 rounded-full shadow-md pointer-events-none"
              style={{
                left: `calc(${((musicHours - 5) / 31) * 100}% - 10px)`, // 10px is half the thumb width (20px)
                width: 'max-content',
                minWidth: '60px',
                textAlign: 'center',
                transform: 'translateX(-50%)',
              }}
            >
              {musicHours === 5 ? '< 5 hours' : musicHours === 36 ? '> 35 hours' : `${musicHours} hours`}
            </div>
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