'use client'
import React, {useState} from 'react';
import ThreeBlocks from "../components/ThreeBlocks";
import {DragAndDrop} from '../components/DragDrop';

// für db code
import { useEffect} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// für speichern
import { useUserStore } from "../store/store";

type Song = {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name: string;
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

        //if (!response.ok) throw new Error("Failed to fetch album image");

        const trackData = await response.json();
        return trackData.album.images?.[0]?.url || "/default-cover.png"; // Fallback if no image
    } catch (error) {
        //console.error(`Error fetching album image for ${trackId}:`, error);
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
  const { setUserData, resetCounter } = useUserStore();
  const { userData, counter, incrementCounter } = useUserStore();

  const { data: session, status } = useSession();
  const router = useRouter();

  const [howOften, setHowOften] = useState<number | null>(null);
  const [howImp, setHowImp] = useState<number | null>(null);

  const [dropAreaSongs, setDropAreaSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const storedUserData = localStorage.getItem("userData");
      if (!storedUserData) {
        router.push("/user-info");
      } else {
        setUserData(JSON.parse(storedUserData)); // Load persisted user data
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
          const accessToken = session?.accessToken; // Assuming accessToken is part of the session
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

  useEffect(() => {
    const fetchRandomIntent = async () => {
      try {
        const response = await fetch('/api/random-intent');
        console.log(response);
        const data = await response.json();
        console.log(data);
        setRandomIntent(data);
      } catch (error) {
        console.error('Error fetching random intent:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomIntent();
  }, []);

  useEffect(() => {
    console.log("Loaded userData from localStorage:", userData); // Verify persistence
  }, [userData]);

  if (status === "loading") return <p>Loading...</p>;

  if (status === "unauthenticated") return null;

  function handleNext() {
    setUserData({
      user_id: "00123",
      name: 'John',
      age: 25,
    });
    incrementCounter(); // Increment the counter
    console.log("userdata:", userData);
    console.log("counter:", counter);

    // Reload the page while preserving the counter
    window.location.reload();
  }

  async function handleSaveToDB() {
    try {
      // Collect data to save
      const intentData = {
        how_often: howOften || 0, // Save the selected value for "how often"
        how_imp: howImp || 0, // Save the selected value for "how important"
        songs: dropAreaSongs, // Save the songs in the drop area
      };

      const dataToSave = {
        user_id: userData.user_id,
        age: userData.age,
        country: userData.country || "", // Add country if available
        gender: userData.gender || "", // Add gender if available
        intents: {
          [randomIntent?.intent_id || ""]: intentData,
        },
      };

      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save user results');
      }

      const data = await response.json();
      console.log('Success:', data);

      resetCounter(); // Reset the counter after successful save
      console.log("Counter reset to 0");

      return data;
    } catch (error) {
      console.error('Error saving to DB:', error);
      throw error;
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">🎵 Intent: {randomIntent?.intent_name}</h1>
      <div className="p-6">
        <ThreeBlocks
          randomIntent={randomIntent}
          setHowOften={setHowOften}
          setHowImp={setHowImp}
        />
      </div>
      
      <h3 className="font-semibold mt-4">Chosen Songs</h3>
      <DragAndDrop setDropAreaSongs={setDropAreaSongs} />

      <div className="bg-black">
        <p>{counter}</p>
      </div>

      <div className="fixed bottom-6 right-6 space-x-4">
        {counter < 3 ? ( // Show "NEXT" button for the first 10 clicks
          <button
            onClick={handleNext}
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
        ) : ( // Show "SUBMIT" button after 10 clicks
          <button
            onClick={handleSaveToDB}
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
    </div>
  );
}
