'use client'
import React, { useState, useEffect, useRef } from 'react';
import ThreeBlocks from "../components/ThreeBlocks";
import { DragAndDrop } from '../components/DragDrop';
import { useUserStore } from "../store/store";
import { useRouter } from "next/navigation";

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
  title_new: string;
  description_new: string;
};

// Placeholder for fetching album images (replace with Last.fm or your own logic)
async function fetchAlbumImagePlaceholder(trackId: string): Promise<string> {
  // TODO: Replace with Last.fm or your own API call
  return "/default-cover.png";
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

  const router = useRouter();

  const [howOften, setHowOften] = useState<number | null>(null);
  const [howImp, setHowImp] = useState<number | null>(null);

  const [dropItems, setDropItems] = useState<Song[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [adjectives, setAdjectives] = useState([]);

   const [infoCollapsed, setInfoCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const submissionComplete = localStorage.getItem('submissionComplete');
      if (submissionComplete === 'true') {
        router.push('/end');
        return;
      }

      const consentGiven = localStorage.getItem('consentGiven');
      const storedUserData = localStorage.getItem('userData');
      const rankedIntents = localStorage.getItem('rankedIntents');

      if (!consentGiven) {
        router.push('/consent');
      } else if (!storedUserData || storedUserData === 'null') {
        router.push('/user-info');
      } else if (!rankedIntents) {
        router.push('/rank-intents');
      } else {
        setUserData(JSON.parse(storedUserData));
        try {
          const rankedIntentIds = JSON.parse(rankedIntents);
          if (Array.isArray(rankedIntentIds)) {
            localStorage.setItem('classificationIntents', JSON.stringify(rankedIntentIds.slice(0, 10)));
          }
        } catch (e) {
          console.error('DEBUG: Error parsing rankedIntents', e);
        }
      }
    }
  }, [router, setUserData]);

  useEffect(() => {
  if (typeof window !== "undefined") {
    const collapsed = localStorage.getItem("infoCollapsed");
    if (collapsed === "true") setInfoCollapsed(true);
  }
}, []);

useEffect(() => {
  if (typeof window !== "undefined") {
    localStorage.setItem("infoCollapsed", infoCollapsed ? "true" : "false");
  }
}, [infoCollapsed]);

  useEffect(() => {
    // Placeholder: Replace with your own logic to fetch songs (e.g., from Last.fm or your backend)
    const fetchSongs = async () => {
      try {
        // Example: Fetch from your own API or static file
        const response = await fetch("/api/songs");
        const data = await response.json();

        if (Array.isArray(data)) {
          const songsWithImages = await Promise.all(
            data.map(async (song: Song) => ({
              ...song,
              image: await fetchAlbumImagePlaceholder(song.track_id)
            }))
          );
          setSongs(songsWithImages);
        } else {
          setSongs([]);
        }
      } catch (error) {
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Replace all usage of randomIntent with the next intent from the top 10 ranked intents
  const [classificationIntents, setClassificationIntents] = useState<string[]>([]);
  const [currentIntentIdx, setCurrentIntentIdx] = useState(() => {
    if (typeof window !== 'undefined') {
      const idx = localStorage.getItem('currentIntentIdx');
      //console.log('DEBUG: currentIntentIdx from localStorage:', idx);
      return idx ? parseInt(idx, 10) : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('classificationIntents');
      if (stored) {
        setClassificationIntents(JSON.parse(stored));
      }
    }
  }, []);

  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);

  useEffect(() => {
    // fetch intent data for the current intent id
    async function fetchIntentById(intentId: string) {
      if (intentId === undefined || intentId === null || intentId === "") {
        return;
      }
      const response = await fetch('/intent_data_new_titles_v02.json');
      const data = await response.json();
      const ids = Object.keys(data.intent_id);
      const idx = ids.find((k) => String(data.intent_id[k]) === String(intentId));
      if (idx !== undefined) {
        setCurrentIntent({
          intent_id: data.intent_id[idx],
          intent_name: data.intent_name[idx],
          main_listening_function: data.main_listening_function[idx],
          listening_functions: data.listening_functions[idx],
          listening_function_factors: data.listening_function_factors[idx],
          survey_intent_names: data.survey_intent_names[idx],
          generated_augmented_texts: data.generated_augmented_texts[idx],
          title_new: data.title_new[idx],
          description_new: data.description_new[idx],
        });
      } else {
        console.warn('DEBUG: No intent found for id', intentId);
      }
    }
    if (classificationIntents.length > 0 && currentIntentIdx < classificationIntents.length) {
      fetchIntentById(classificationIntents[currentIntentIdx]);
    }
  }, [classificationIntents, currentIntentIdx]);

  useEffect(() => {
    const storedCounter = localStorage.getItem("counter");
    if (storedCounter) {
      resetCounter();
      const parsedCounter = parseInt(storedCounter, 10);
      for (let i = 0; i < parsedCounter; i++) {
        incrementCounter();
      }
    }
  }, [resetCounter, incrementCounter]);

  function handleButtonClick(action: () => void) {
    if (!howOften || !howImp) {
      setErrorMessage("Please answer both questions before proceeding.");
      setTimeout(() => setErrorMessage(null), 3000);
    } else if (dropItems.length < 5) {
      setErrorMessage("Please choose at least 5 songs to proceed.");
      setTimeout(() => setErrorMessage(null), 3000);
    } else if (adjectives.length === 0) {
      setErrorMessage("Please select at least one adjective before proceeding.");
      setTimeout(() => setErrorMessage(null), 3000);
    } else {
      action();
    }
  }

  // Track if user info has been saved already
  const userInfoSavedRef = useRef(false);

  // Save user info and current intent to DB
  async function saveToDB(updatedUserData: any, onlyIntent: boolean = false) {
    try {
      const payload = onlyIntent
        ? { user_id: updatedUserData.user_id, intents: updatedUserData.intents }
        : updatedUserData;

      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save user results');
      }
      return await response.json();
    } catch (error) {
      console.error('Error saving to DB:', error);
      throw error;
    }
  }

  async function handleNext() {
    const updatedCounter = counter + 1;
    const currentIntents = userData?.intents || {};

    const newIntent = {
      intent_id: currentIntent?.intent_id || "",
      intent_name: currentIntent?.intent_name || "",
      how_often: howOften || 0,
      how_imp: howImp || 0,
      adjectives: adjectives.map((adj) => (adj as any).value.toLowerCase()),
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

    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    localStorage.setItem("counter", updatedCounter.toString());

    // Save user info only once, then only save intents
    if (!userInfoSavedRef.current) {
      await saveToDB(updatedUserData, false);
      userInfoSavedRef.current = true;
    } else {
      await saveToDB(updatedUserData, true);
    }

    if (currentIntentIdx < classificationIntents.length - 1) {
      setCurrentIntentIdx(currentIntentIdx + 1);
      const nextIdx = currentIntentIdx + 1;
      localStorage.setItem('currentIntentIdx', nextIdx.toString());
      window.location.reload();
    } else {
      localStorage.removeItem('currentIntentIdx');
      window.location.reload();
    }
  }

  async function handleSaveToDB() {
    const currentIntents = userData?.intents || {};

    const newIntent = {
      intent_id: currentIntent?.intent_id ?? "",
      intent_name: currentIntent?.intent_name || "",
      how_often: howOften || 0,
      how_imp: howImp || 0,
      adjectives: adjectives.map((adj) => (adj as any).value.toLowerCase()),
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

    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    // Always save everything on submit
    await saveToDB(updatedUserData, false);

    router.push('/end');
    resetCounter();
    localStorage.setItem("counter", "0");
    localStorage.setItem('submissionComplete', 'true');
    localStorage.removeItem('currentIntentIdx');
    localStorage.removeItem('classificationIntents');
    localStorage.removeItem('rankedIntents');
  }

  // Calculate progress
  const totalIntents = classificationIntents.length || 0;
  const progress =
    totalIntents === 0
      ? 0 // Default to 0% while loading
      : Math.min(((currentIntentIdx + 1) / totalIntents) * 100, 100);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-4">
      {/* Collapsible Info Box - only show on first intent */}
      {currentIntentIdx === 0 && (
        <div className="w-full max-w-6xl mx-auto mb-6">
          <div className="relative">
            <button
              onClick={() => setInfoCollapsed((prev) => !prev)}
              className="absolute top-4 right-4 z-10 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full p-2 shadow transition"
              aria-label={infoCollapsed ? "Expand info" : "Collapse info"}
              type="button"
            >
              <svg
                className={`w-6 h-6 transition-transform ${infoCollapsed ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            {!infoCollapsed && (
              <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded shadow">
                <h2 className="text-lg font-bold mb-2 text-blue-800">Instructions</h2>
                <p className="mb-2 text-blue-900">
                  You are now classifying songs for a specific <b>music listening intent</b> - that is, a reason or motivation for listening to music.
                </p>
                <p className="mb-2 text-blue-900">
                  <b>What should you do?</b><br />
                  For each intent:
                </p>
                <ul className="list-disc pl-5 text-blue-900 mb-2">
                  <li>Please answer the questions about how often you listen with this intent and how important this intent is for you.</li>
                  <li>Select adjectives that, for you, describe songs for this intent.</li>
                  <li>Drag and drop songs that fit this intent into the box.</li>
                  <li>You can use the genre, history, or search boxes to find songs.</li>
                  <li>Click <b>NEXT</b> to continue to the next intent.</li>
                  <li>On the last intent, click <b>SUBMIT</b> to finish.</li>
                </ul>
                <p className="text-blue-900">
                  If unsure, use the <b>i</b> button in the top right corner of the components for additional information about the intent.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            Progress
          </span>
          <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, rgba(6,182,212,0.7) 0%, rgba(96,165,250,0.7) 50%, rgba(124,58,237,0.7) 100%)"
            }}
          ></div>
        </div>
      </div>
      <h1 className="text-center">
        <span className="block text-lg font-semibold text-gray-600">🎵 Intent: 🎵</span>
        <span className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-400 to-cyan-500 text-transparent bg-clip-text">
          {currentIntent?.title_new || 'Loading...'}
        </span>
      </h1>

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
          {currentIntent ? currentIntent.main_listening_function : 'Intent infomation loading...'}
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
    </div>
  );
}