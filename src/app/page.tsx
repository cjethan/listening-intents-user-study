'use client'
import React, {useState, useEffect} from 'react';
import ThreeBlocks from "../components/ThreeBlocks";
import {DragAndDrop} from '../components/DragDrop';

// für db code
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// für speichern
import { useUserStore } from "../store/store";
import dynamic from 'next/dynamic';


type Song = {
  track_id: string;
  artist_name: string;
  track_uri: string;
  artist_uri: string | null;
  track_name: string;
  album_name: string;
  album_uri: string;
  duration_ms: number;
  genres: string[];
  image: string;
};

type Intent = {
  intent_id: string;
  intent_name: string;
  main_listening_function: string;
  listening_functions: string[];
  listening_function_factors: number[];
  survey_intent_names: string[];
  generated_augmented_texts: string[];
};

async function fetchAlbumImage(trackId: string, accessToken: string): Promise<string> {
    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const trackData = await response.json();
        return trackData.album.images?.[0]?.url || "/default-cover.png"; // Fallback if no image
    } catch {
        return "/default-cover.png"; // Fallback image
    }
}

 export default function Home() {

  // db stuff
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  // intent stuff
  const [randomIntent, setRandomIntent] = useState<Intent | null>(null);
  const [loading, setLoading] = useState(true);

  //für speichern
  const { setUserData, resetCounter, counter, incrementCounter } = useUserStore();
  const { userData } = useUserStore();

  const { data: session, status } = useSession();
  const router = useRouter();

  const [howOften, setHowOften] = useState<number | null>(null);
  const [howImp, setHowImp] = useState<number | null>(null);

  const [dropItems, setDropItems] = useState<Song[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [adjectives, setAdjectives] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login'); // Redirect to Spotify login
    } else if (status === 'authenticated' && typeof window !== 'undefined') {
      const consentGiven = localStorage.getItem('consentGiven');
      const storedUserData = localStorage.getItem('userData');
      const rankedIntents = localStorage.getItem('rankedIntents');

      console.log('DEBUG: consentGiven', consentGiven);
      console.log('DEBUG: storedUserData', storedUserData);
      console.log('DEBUG: rankedIntents', rankedIntents);

      if (!consentGiven) {
        router.push('/consent'); // Redirect to consent form
      } else if (!storedUserData || storedUserData === 'null') {
        router.push('/user-info'); // Redirect to user info page
      } else if (!rankedIntents) {
        router.push('/rank-intents'); // Redirect to intent ranking
      } else {
        setUserData(JSON.parse(storedUserData)); // Load persisted user data
        // Set top 10 ranked intents for classification
        try {
          const rankedIntentIds = JSON.parse(rankedIntents);
         console.log('DEBUG: rankedIntentIds (parsed)', rankedIntentIds);
          if (Array.isArray(rankedIntentIds)) {
            localStorage.setItem('classificationIntents', JSON.stringify(rankedIntentIds.slice(0, 10)));
            console.log('DEBUG: classificationIntents set', rankedIntentIds.slice(0, 10));
          }
        } catch (e) {
          console.error('DEBUG: Error parsing rankedIntents', e);
        }
      }
    }
  }, [status, router, setUserData]);

  useEffect(() => {
if (session) {
    const fetchSongs = async () => {
      try {
        const response = await fetch("/api/songs");
        const data = await response.json();
        console.log("test2");
        console.log("API Response:", data); // 🔍 Debugging output

        if (Array.isArray(data)) {
          const accessToken = (session as any)?.accessToken; // as any)a  )Assumin acces en is part of the session
          console.log("Access Token:", accessToken); // 🔍 Debugging output
          const songsWithImages = await Promise.all(
            data.map(async (song: Song) => ({
              ...song,
              image: await fetchAlbumImage(song.track_id, accessToken)
            }))
          );
          setSongs(songsWithImages); // ✅ Set songs with images
        } else {
          console.error("Unexpected API response:", data);
          setSongs([]); // 🚨 Default to empty array
        }
      } catch (error) {
        console.error("Error fetching songs:", error);
        setSongs([]); // 🚨 Handle fetch failure
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
}
  }, [session]);

  // Replace all usage of randomIntent with the next intent from the top 10 ranked intents
  const [classificationIntents, setClassificationIntents] = useState<string[]>([]);
  const [currentIntentIdx, setCurrentIntentIdx] = useState(() => {
    if (typeof window !== 'undefined') {
      const idx = localStorage.getItem('currentIntentIdx');
      return idx ? parseInt(idx, 10) : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('classificationIntents');
      console.log('DEBUG: classificationIntents from localStorage', stored);
      if (stored) {
        setClassificationIntents(JSON.parse(stored));
      }
    }
  }, []);

  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);

  useEffect(() => {
    // fetch intent data for the current intent id
    async function fetchIntentById(intentId: string) {
      console.log('DEBUG: im fetchIntentById');
      if (!intentId) return;
      console.log('DEBUG: fetchIntentById', intentId);
      const response = await fetch('/intent_data.json');
      const data = await response.json();
      const ids = Object.keys(data.intent_id);
      const idx = ids.find((k) => String(data.intent_id[k]) === String(intentId));
      if (idx !== undefined) {
        console.log('DEBUG: intent found for id', intentId, data.intent_name[idx]);
        setCurrentIntent({
          intent_id: data.intent_id[idx],
          intent_name: data.intent_name[idx],
          main_listening_function: data.main_listening_function[idx],
          listening_functions: data.listening_functions[idx],
          listening_function_factors: data.listening_function_factors[idx],
          survey_intent_names: data.survey_intent_names[idx],
          generated_augmented_texts: data.generated_augmented_texts[idx],
        });
      } else {
        console.warn('DEBUG: No intent found for id', intentId);
      }
    }
    console.log('DEBUG Aufruf: geleich Aufrug für fetchIntentById');
    console.log('DEBUG Aufruf: classificationIntents.length > 0 ', classificationIntents.length > 0);
    console.log('DEBUG Aufruf: currentIntentIdx < classificationIntents.length', currentIntentIdx < classificationIntents.length);
    console.log('DEBUG Aufruf: currentIntentIdx', currentIntentIdx);
    console.log('DEBUG Aufruf: classificationIntents.length', classificationIntents.length);
    if (classificationIntents.length > 0 && currentIntentIdx < classificationIntents.length) {
      console.log('DEBUG Aufruf: Aufruf für fetchIntentById true');
      fetchIntentById(classificationIntents[currentIntentIdx]);
    }
  }, [classificationIntents, currentIntentIdx]);

  useEffect(() => {
    console.log("Loaded userData from localStorage:", userData); // Verify persistence
  }, [userData]);

  useEffect(() => {
    const storedCounter = localStorage.getItem("counter");
    if (storedCounter) {
      resetCounter(); // Reset the store counter
      const parsedCounter = parseInt(storedCounter, 10);
      for (let i = 0; i < parsedCounter; i++) {
        incrementCounter(); // Increment the store counter to match the stored value
      }
    }
  }, [resetCounter, incrementCounter]);

  if (status === "loading") return <p>Loading...</p>;

  if (status === "unauthenticated") return null;

  function handleButtonClick(action: () => void) {
    if (!howOften || !howImp) {
      setErrorMessage("Please answer both questions before proceeding.");
      setTimeout(() => setErrorMessage(null), 3000); // Clear message after 3 seconds
    } else if (dropItems.length < 5) {
      setErrorMessage("Please choose at least 5 songs to proceed.");
      setTimeout(() => setErrorMessage(null), 3000); // Clear message after 3 seconds
    } else if (adjectives.length === 0) {
      setErrorMessage("Please select at least one adjective before proceeding.");
      setTimeout(() => setErrorMessage(null), 3000); // Clear message after 3 seconds
    } else {
      action();
    }
  }

  function handleNext() {
    const updatedCounter = counter + 1; // Increment the counter

    // Ensure intents is initialized as an object
    const currentIntents = userData?.intents || {};
    console.log("dropItems", dropItems);

    // Create a new intent with each dropItem saved as one song in songs[]
    const newIntent = {
      intent_id: currentIntent?.intent_id || "",
      intent_name: currentIntent?.intent_name || "",
      how_often: howOften || 0,
      how_imp: howImp || 0,
      adjectives: adjectives.map((adj) => (adj as any).value.toLowerCase()), // Convert adjectives to lowercase
      songs: dropItems.map((song) => ({
        track_id: song.track_id,
        track_uri: song.track_uri,
        track_name: song.track_name,
        artist_name: song.artist_name,
        album_name: song.album_name,
        album_uri: song.album_uri,
        duration_ms: song.duration_ms,
        artist_uri: song.artist_uri,
        genres: song.genres || [],
        image: song.image || "/default-cover.png",
      })),
    };

    const updatedUserData = {
      ...userData,
      intents: {
        ...currentIntents,
        [newIntent.intent_id]: newIntent,
      },
    };

    // Save updated user data to localStorage
    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    console.log("DEBUG: Updated user data", updatedUserData);

    // Save updated counter to localStorage
    localStorage.setItem("counter", updatedCounter.toString());

    // Move to next intent or reload if done
    if (currentIntentIdx < classificationIntents.length - 1) {
      console.log('DEBUG: Moving to next intent', currentIntentIdx + 1);
      setCurrentIntentIdx(currentIntentIdx + 1);
      // Save the next intent index before reload
      const nextIdx = currentIntentIdx + 1;
      localStorage.setItem('currentIntentIdx', nextIdx.toString());
      window.location.reload();
    } else {
      localStorage.removeItem('currentIntentIdx');
      window.location.reload();
    }
  }

  async function handleSaveToDB() {
    // Ensure intents is initialized as an object
    const currentIntents = userData?.intents || {};
    console.log("dropItems", dropItems);

    // Create a new intent with each dropItem saved as one song in songs[]
    const newIntent = {
      intent_id: currentIntent?.intent_id || "",
      intent_name: currentIntent?.intent_name || "",
      how_often: howOften || 0,
      how_imp: howImp || 0,
      adjectives: adjectives.map((adj) => (adj as any).value.toLowerCase()), // Convert adjectives to lowercase
      songs: dropItems.map((song) => ({
        track_id: song.track_id,
        track_uri: song.track_uri,
        track_name: song.track_name,
        artist_name: song.artist_name,
        album_name: song.album_name,
        album_uri: song.album_uri,
        duration_ms: song.duration_ms,
        artist_uri: song.artist_uri,
        genres: song.genres || [], // Default to an empty array if genres are missing
        image: song.image || "/default-cover.png", // Default image if missing
      })),
    };

    const updatedUserData = {
      ...userData,
      intents: {
        ...currentIntents,
        [newIntent.intent_id]: newIntent,
      },
    };

    // Save updated user data to localStorage
    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    console.log("Updated user data saved locally:", updatedUserData);

    try {
      // Send updated user data to the database
      /* TODO wieder rein
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) {
        throw new Error('Failed to save user results');
      }

      const data = await response.json();
      console.log('Success:', data);
      todo weg bis hier*/

      router.push('/end');

      // Reset the global counter after successful save
      resetCounter();
      localStorage.setItem("counter", "0"); // Reset counter in localStorage
      console.log("Counter reset to 0");

      //return data; todo wieder rein
    } catch (error) {
      console.error('Error saving to DB:', error);
      throw error;
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-4">
      <h1 className="text-center">
        <span className="block text-lg font-semibold text-gray-600">🎵 Intent: 🎵</span>
        <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-400 to-cyan-500 text-transparent bg-clip-text">
          {currentIntent?.intent_name}
        </span>
      </h1>

      {/* Centered Additional Information about the Intent */}
      <div className="p-4 bg-gray-100 rounded shadow relative max-w-2xl mx-auto">
        <h3 className="font-bold mb-2">Additional Information about the Intent</h3>
        <div className="absolute top-2 right-2 group">
          <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">
            i
          </div>
          <div className="absolute top-8 right-0 hidden group-hover:block bg-white text-gray-700 text-sm p-4 rounded shadow-lg w-64 z-10">
            Additional ideas about how to categorize songs with this intent.
          </div>
        </div>
        <p className="italic text-gray-700">
          {currentIntent ? currentIntent.main_listening_function : 'No intent available'}
        </p>
        <p className="text-gray-700">
          {currentIntent?.listening_functions.slice(0, 3).map((functionName, index) => (
            functionName && functionName !== currentIntent.main_listening_function ? (
              <React.Fragment key={index}>
                {functionName}<br />
              </React.Fragment>
            ) : null
          ))}
        </p>
      </div>

      <div className="pl-6">
        <ThreeBlocks
          randomIntent={currentIntent}
          setHowOften={setHowOften}
          setHowImp={setHowImp}
          setAdjectives={setAdjectives}
        />
      </div>
      
      <DragAndDrop setDropItems={setDropItems} />

      {/*
      <div className="">
        <p>
          {counter}, , {JSON.stringify(userData, null, 2)}
        </p>
        <pre>{JSON.stringify(dropItems, null, 2)}</pre>
      </div>
      */}      

      <div className="fixed bottom-6 right-6 space-x-4">
        {currentIntentIdx < classificationIntents.length - 1 ? (
          <button
            onClick={() => handleButtonClick(handleNext)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 font-semibold rounded-full shadow-md hover:from-gray-300 hover:to-gray-400 hover:shadow-lg transition-all duration-600 ease-in-out"
          >
            NEXT
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => handleButtonClick(handleSaveToDB)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-full shadow-md hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            SUBMIT
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
      {errorMessage && (
        <div className="fixed bottom-20 right-6 bg-red-500 text-white px-4 py-2 rounded shadow-md">
          {errorMessage}
        </div>
      )}

      {/* Debug button to clear rankedIntents */}
      <div className="fixed bottom-6 left-6">
        <button
          onClick={() => {
            localStorage.removeItem('rankedIntents');
            localStorage.removeItem('discardedIntents');
            localStorage.removeItem('classificationIntents');
            localStorage.removeItem('currentIntentIdx');
            localStorage.removeItem('counter');
            // Optionally also clear any other state related to ranking/classification
            window.location.href = '/rank-intents';
          }}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded shadow hover:bg-red-600"
        >
          Debug: Reset ranking progress
        </button>
      </div>

      {/*<div className="mt-6 p-4 bg-white rounded shadow-md">
        <button
          onClick={() => {
            const debugData = null;
            localStorage.setItem("userData", JSON.stringify(debugData));
            setUserData(debugData);
            console.log("Debug userData set:", debugData);
          }}
          className="mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600"
        >
          Set Debug User Data
        </button>
        <h2 className="text-lg font-bold">Current User Data</h2>
        <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>*/}
    </div>
  );
}
