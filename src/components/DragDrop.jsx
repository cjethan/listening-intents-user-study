"use client";
import React, { useState, useEffect, useRef } from "react";
import { DndContext, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import ReactSelect from "react-select";

async function checkAndAddToDatabase(songs) {
  //console.log("Checking and adding songs to the database...");
  try {
    const response = await fetch("/api/check-and-add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ songs }),
    });

    const responseData = await response.json();
    //console.log("Response from check-and-add API:", responseData);
    return responseData; // Return the response which should contain info about existing songs
  } catch (error) {
    //console.error("Error checking/adding songs to the database:", error);
    return null; // Return null or an empty object on error
  }
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function fetchRandomSongsByGenre(genre, limit = 10) {
  try {
    const response = await fetch(`/api/songs?genre=${encodeURIComponent(genre)}&limit=${limit}`);
    const songs = await response.json();

    if (Array.isArray(songs)) {
      const songsWithGenres = songs.filter((song) => song.genres && song.genres.includes(genre));
      const randomSongs = shuffleArray(songsWithGenres).slice(0, 10);

      const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

      // Helper to fetch album image from Last.fm
      async function getLastFmImage(artist, track) {
        // Temporarily disabled - just return default cover
        return "/default-cover.png";
        
        /* if (!artist || !track) return "/default-cover.png";
        const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(
          artist
        )}&track=${encodeURIComponent(track)}&format=json`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          return Array.isArray(data?.track?.album?.image) && data.track.album.image.length
            ? (
                data.track.album.image.find(img => img.size === "medium")?.["#text"] ||
                data.track.album.image.find(img => img.size === "small")?.["#text"] ||
                "/default-cover.png"
              )
            : "/default-cover.png";
        } catch {
          return "/default-cover.png";
        } */
      }

      // Enrich each song with its album image from Last.fm
      const songsWithImages = await Promise.all(
        randomSongs.map(async (song) => ({
          ...song,
          image: await getLastFmImage(song.artist_name, song.track_name),
        }))
      );

      return songsWithImages;
    } else {
      console.error("Unexpected API response:", songs);
      return [];
    }
  } catch (error) {
    console.error("Error fetching songs by genre:", error);
    return [];
  }
}

export function DragAndDrop({ setDropItems }) {
  const [activeItem, setActiveItem] = useState(null);
  const [box1Items, setBox1Items] = useState([]);
  const [box1Loading, setBox1Loading] = useState(true);
  const [box2Items, setBox2Items] = useState([]);
  const [filteredBox2Items, setFilteredBox2Items] = useState([]);
  const [box3Items, setBox3Items] = useState([]);
  const [localDropItems, setLocalDropItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchResultsReady, setIsSearchResultsReady] = useState(false);
  const [box2SearchQuery, setBox2SearchQuery] = useState("");
  const [box2FullHistory, setBox2FullHistory] = useState([]); // Store all history for search

  useEffect(() => {
    const fetchSongs = async () => {
      try {
          setBox1Loading(true); // Start loading
          //console.log("Fetching songs for Box 1...");
          // Retrieve genres from localStorage
          if (typeof window !== 'undefined') {
            const userData = JSON.parse(localStorage.getItem("userData"));
            const genres = userData?.genres || [];
            //console.log(`Retrieved genres from localStorage: ${genres}`);

            // Fetch songs for all genres in parallel
            const genrePromises = genres.map((genre) =>
              fetchRandomSongsByGenre(genre)
            );
            const songsByGenre = await Promise.all(genrePromises);

            // Flatten and limit the total number of songs
            const allSongs = songsByGenre.flat().slice(0, 100); // Limit to 100 songs
            //console.log(`Fetched ${allSongs.length} songs in total.`);
            //console.log("Songs by genre:", allSongs);

            // Display all fetched songs without shuffling
            setBox1Items(allSongs);
          }
        } catch (error) {
          console.error("Error fetching songs:", error);
          setBox1Items([]);
        } finally {
          setBox1Loading(false); // End loading
        }
      };
      fetchSongs();
  }, []);

 // Fetch songs from Last.fm listening history for Box 2
  /*useEffect(() => {
    const fetchTopSongs = async () => {
      let lastfmUsername = "";
      if (typeof window !== "undefined") {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            lastfmUsername = userData.lastfm_username || "";
          } catch {
            lastfmUsername = "";
          }
        }
      }
      if (!lastfmUsername) {
        setBox2Items([]);
        setFilteredBox2Items([]);
        return;
      }

      if (!localStorage.getItem("lastfmTopSongs")) {

        const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
        const user = lastfmUsername;

        const recentUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&limit=50`;
        const top3mUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&period=3month&limit=50`;
        const topOverallUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&period=overall&limit=50`;

        try {
          const [recentRes, top3mRes, topOverallRes] = await Promise.all([
            fetch(recentUrl),
            fetch(top3mUrl),
            fetch(topOverallUrl),
          ]);

          const recentData = await recentRes.json();
          const top3mData = await top3mRes.json();
          console.log("Top 3m tracks from Last.fm 1:", top3mData);
          const topOverallData = await topOverallRes.json();

          const recentTracks = Array.isArray(recentData?.recenttracks?.track)
            ? recentData.recenttracks.track.map((track, idx) => {
                const artistName = track?.artist?.["#text"] || "";
                const albumName = track?.album?.["#text"] || "";
                return {
                  track_id: track?.mbid || `${artistName}-${track?.name || ""}-${idx}`,
                  artist_name: artistName,
                  track_name: track?.name || "",
                  album_name: albumName,
                  image:
                    Array.isArray(track?.image) && track.image.length
                      ? (
                          track.image.find(img => img.size === "medium")?.["#text"] ||
                          track.image.find(img => img.size === "small")?.["#text"] ||
                          "/default-cover.png"
                        )
                      : "/default-cover.png",
                  duration_ms: track?.duration ? parseInt(track.duration, 10) : 0,
                  added_by_userdata: 1,
                  genres: [],
                  artist_uri: artistName
                    ? `https://www.last.fm/music/${encodeURIComponent(artistName)}`
                    : "",
                  album_uri: artistName && albumName
                    ? `https://www.last.fm/music/${encodeURIComponent(artistName)}/${encodeURIComponent(albumName)}`
                    : "",
                  track_uri: track?.url || "",
                };
              })
            : [];

          const top3mTracksRaw = Array.isArray(top3mData?.toptracks?.track)
            ? top3mData.toptracks.track
            : [];
          const topOverallTracksRaw = Array.isArray(topOverallData?.toptracks?.track)
            ? topOverallData.toptracks.track
            : [];

          async function enrichTrackWithAlbum(track) {
            const artist = encodeURIComponent(track?.artist?.name || "");
            const name = encodeURIComponent(track?.name || "");
            if (!artist || !name) return null;

            const infoUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${artist}&track=${name}&format=json`;
            try {
              const infoRes = await fetch(infoUrl);
              const infoData = await infoRes.json();
              const albumName = infoData?.track?.album?.title || "";
              const albumImage =
                Array.isArray(infoData?.track?.album?.image) && infoData.track.album.image.length
                  ? (
                      infoData.track.album.image.find(img => img.size === "medium")?.["#text"] ||
                      infoData.track.album.image.find(img => img.size === "small")?.["#text"] ||
                      "/default-cover.png"
                    )
                  : "/default-cover.png";
              const albumUri = albumName && track.artist?.name
                ? `https://www.last.fm/music/${encodeURIComponent(track.artist.name)}/${encodeURIComponent(albumName)}`
                : "";
              const duration_ms = infoData?.track?.duration
                ? parseInt(infoData.track.duration, 10)
                : 0;
              return {
                track_id: track?.mbid || `${track?.artist?.name || ""}-${track?.name || ""}`,
                artist_name: track?.artist?.name || "",
                track_name: track?.name || "",
                artist_uri: track.artist?.url || "",
                track_uri: track.url || "",
                album_name: albumName,
                album_uri: albumUri,
                image: albumImage,
                duration_ms,
                added_by_userdata: 1,
                genres: [],
              };
            } catch {
              return {
                track_id: track?.mbid || `${track?.artist?.name || ""}-${track?.name || ""}`,
                artist_name: track?.artist?.name || "",
                track_name: track?.name || "",
                artist_uri: track.artist?.url || "",
                track_uri: track.url || "",
                album_name: "",
                album_uri: "",
                image: Array.isArray(track?.image) && track.image.length
                  ? track.image[track.image.length - 1]["#text"] || "/default-cover.png"
                  : "/default-cover.png",
                duration_ms: 0,
                added_by_userdata: 1,
                genres: [],
              };
            }
          }

          // Enrich top tracks with album info
          const top3mTracks = (await Promise.all(top3mTracksRaw.map(enrichTrackWithAlbum))).filter(Boolean);
          const topOverallTracks = (await Promise.all(topOverallTracksRaw.map(enrichTrackWithAlbum))).filter(Boolean);

          console.log("Top 3 months tracks from Last.fm:", top3mTracks);
          console.log("Top overall tracks from Last.fm:", topOverallTracks);

          // Combine and deduplicate by artist+track_name
          const allTracks = [...recentTracks, ...top3mTracks, ...topOverallTracks];
          const uniqueTracks = [];
          const seen = new Set();

          for (const t of allTracks) {
            const key = `${t.artist_name} - ${t.track_name}`;
            if (t.artist_name && t.track_name && !seen.has(key)) {
              seen.add(key);
              uniqueTracks.push(t);
            }
          }

          localStorage.setItem("lastfmTopSongs", JSON.stringify(uniqueTracks));
          console.log("Combined Last.fm tracks:", uniqueTracks);
          setBox2Items(uniqueTracks);
          setFilteredBox2Items(uniqueTracks);  
          
          // Check songs against the database to get their status
          console.log("Checking and adding songs to the database...");
          const checkData = await checkAndAddToDatabase(uniqueTracks);
          const existingTrackIds = new Set(checkData?.existingTrackIds || []);
          console.log("Songs successfully checked and added to the database.");

          // Sort uniqueTracks: songs in the database first, with original DB songs prioritized
          uniqueTracks.sort((a, b) => {
            const aInDb = existingTrackIds.has(a.track_id);
            const bInDb = existingTrackIds.has(b.track_id);
            //const aIsOriginal = a.added_by_userdata === null || a.added_by_userdata === undefined;
            //const bIsOriginal = b.added_by_userdata === null || b.added_by_userdata === undefined;

            //if (aInDb && aIsOriginal && !(bInDb && bIsOriginal)) return -1;
            //if (!(aInDb && aIsOriginal) && bInDb && bIsOriginal) return 1;

            if (aInDb && !bInDb) return -1;
            if (!aInDb && bInDb) return 1;
            
            return 0;
          });

          localStorage.setItem("lastfmTopSongs", JSON.stringify(uniqueTracks));
          console.log("Combined Last.fm tracks:", uniqueTracks);
          setBox2Items(uniqueTracks);
          setFilteredBox2Items(uniqueTracks); 
          console.log("TOP SONGS") 

        } catch (error) {
          setBox2Items([]);
          setFilteredBox2Items([]);
          console.error("Error fetching Last.fm tracks:", error);
        }
      } else {
        // Not first intent, or already fetched: load from localStorage
        const stored = localStorage.getItem("lastfmTopSongs");
        console.log("Loading Last.fm top songs from localStorage");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setBox2Items(parsed);
            setFilteredBox2Items(parsed);
          } catch {
            setBox2Items([]);
            setFilteredBox2Items([]);
          }
        } else {
          setBox2Items([]);
          setFilteredBox2Items([]);
        }
      }
    };
  fetchTopSongs();
  }, []);*/

  // Fetch full listening history for Box 2 (capped to 1000 tracks)
  useEffect(() => {
    const fetchFullHistory = async () => {
      let lastfmUsername = "";
      if (typeof window !== "undefined") {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            lastfmUsername = userData.last_fm_id || "";
          } catch {
            lastfmUsername = "";
          }
        }
      }
      if (!lastfmUsername) {
        setBox2Items([]);
        setFilteredBox2Items([]);
        setBox2FullHistory([]);
        return;
      }

      // Try to load from localStorage first
      if (localStorage.getItem("lastfmListeningHistory")) {
        const stored = localStorage.getItem("lastfmListeningHistory");
        try {
          let parsed = JSON.parse(stored);

            // Deduplicate by track_id
            const seen = new Set();
            parsed = parsed.filter(item => {
              if (!item.track_id || seen.has(item.track_id)) return false;
              seen.add(item.track_id);
              return true;
            });

            setBox2FullHistory(parsed);
            setBox2Items(parsed.slice(0, 300));
            setFilteredBox2Items(parsed.slice(0, 300));
          } catch {
            setBox2FullHistory([]);
            setBox2Items([]);
            setFilteredBox2Items([]);
          }
        return;
      }

      // Otherwise, fetch from Last.fm API (capped to 1000 tracks)
      const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
      const user = lastfmUsername;
      const limit = 300; // max per page
      const maxTracks = 1000;
      let allTracks = [];
      let page = 1;
      let totalPages = 1;

      try {
        while (allTracks.length < maxTracks && page <= totalPages) {
          const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&limit=${limit}&page=${page}`;
          const res = await fetch(url);
          const data = await res.json();
          const tracks = Array.isArray(data?.recenttracks?.track) ? data.recenttracks.track : [];
          if (data?.recenttracks?.["@attr"]?.totalPages) {
            totalPages = parseInt(data.recenttracks["@attr"].totalPages, 10);
          }
          allTracks = allTracks.concat(
            tracks.map((track, idx) => {
              const artistName = track?.artist?.["#text"] || "";
              const albumName = track?.album?.["#text"] || "";
              return {
                track_id: track?.mbid || `${artistName}-${track?.name || ""}-${page}-${idx}`,
                artist_name: artistName,
                track_name: track?.name || "",
                album_name: albumName,
                image:
                  Array.isArray(track?.image) && track.image.length
                    ? (
                        track.image.find(img => img.size === "medium")?.["#text"] ||
                        track.image.find(img => img.size === "small")?.["#text"] ||
                        "/default-cover.png"
                      )
                    : "/default-cover.png",
                duration_ms: track?.duration ? parseInt(track.duration, 10) : 0,
                added_by_userdata: 1,
                genres: [],
                artist_uri: artistName
                  ? `https://www.last.fm/music/${encodeURIComponent(artistName)}`
                  : "",
                album_uri: artistName && albumName
                  ? `https://www.last.fm/music/${encodeURIComponent(artistName)}/${encodeURIComponent(albumName)}`
                  : "",
                track_uri: track?.url || "",
                date_uts: track?.date?.uts ? parseInt(track.date.uts, 10) : 0,
              };
            })
          );
          if (tracks.length < limit) break;
          page++;
        }
        // Sort by most recent (date_uts descending)
        allTracks = allTracks
          .filter(t => t.track_name && t.artist_name)
          .sort((a, b) => (b.date_uts || 0) - (a.date_uts || 0))
          .slice(0, maxTracks);

        // log first 10 tracks
        //console.log("Fetched Last.fm listening history tracks:", allTracks.slice(0, 10));

        // Deduplicate by track_id
        const seen = new Set();
        let uniqueTracks = allTracks.filter(item => {
          if (!item.track_id || seen.has(item.track_id)) return false;
          seen.add(item.track_id);
          return true;
        });

        setBox2Items(uniqueTracks);
        setFilteredBox2Items(uniqueTracks);

        // Check songs against the database and sort them
        const checkData = await checkAndAddToDatabase(uniqueTracks);
        // UPDATE THE SORTING LOGIC HERE
        if (checkData && checkData.existingTrackIds_originalDB) {
          const originalDbTrackIds = new Set(checkData.existingTrackIds_originalDB);
          //const allExistingTrackIds = new Set(checkData.existingTrackIds);

          uniqueTracks.sort((a, b) => {
            const aIsOriginal = originalDbTrackIds.has(a.track_id);
            const bIsOriginal = originalDbTrackIds.has(b.track_id);
            //const aInDb = allExistingTrackIds.has(a.track_id);
            //const bInDb = allExistingTrackIds.has(b.track_id);

            // Priority 1: Original DB songs
            if (aIsOriginal && !bIsOriginal) return -1;
            if (!aIsOriginal && bIsOriginal) return 1;

            // Priority 2: Other songs that exist in the DB
            //if (aInDb && !bInDb) return -1;
            //if (!aInDb && bInDb) return 1;

            // Otherwise, keep original order (most recent)
            return 0;
          });
        }

        localStorage.setItem("lastfmListeningHistory", JSON.stringify(uniqueTracks));
        setBox2FullHistory(uniqueTracks);
        setBox2Items(uniqueTracks);           // Show all 1000 by default
        setFilteredBox2Items(uniqueTracks); // Initially, filtered items are all items
        //console.log("FULL HISTORY")
      } catch (error) {
        setBox2FullHistory([]);
        setBox2Items([]);
        setFilteredBox2Items([]);
        console.error("Error fetching Last.fm listening history:", error);
      }
    };
    fetchFullHistory();
  }, []);

  // Box 2 search: filter through the full listening history
  useEffect(() => {
    if (!box2SearchQuery.trim()) {
      setFilteredBox2Items(box2FullHistory.slice(0, 100));
      return;
    }
    const query = box2SearchQuery.trim().toLowerCase();
    const filtered = box2FullHistory.filter(
      item =>
        item.track_name.toLowerCase().includes(query) ||
        item.artist_name.toLowerCase().includes(query) ||
        (item.album_name && item.album_name.toLowerCase().includes(query))
    );
    setFilteredBox2Items(filtered.slice(0, 100));
  }, [box2SearchQuery, box2FullHistory]);

  useEffect(() => {
    if (searchResults.length > 0) {
      setIsSearchResultsReady(true);
    } else {
      setIsSearchResultsReady(false);
    }
  }, [searchResults]);

  useEffect(() => {
    setDropItems(localDropItems);
  }, [localDropItems, setDropItems]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!active || !over) return;

    const itemId = active.id;
    const allItems = [...box1Items, ...box2Items, ...box3Items, ...localDropItems, ...searchResults];
    const draggedItem = allItems.find((item) => item.track_id === itemId);

    const removeItem = (items) => items.filter((item) => item.track_id !== itemId);

    if (over.id === "dropArea") {
      if (!localDropItems.find((item) => item.track_id === itemId)) {
        setLocalDropItems((prev) => [...prev, draggedItem]);
        setBox1Items(removeItem(box1Items));
        setBox2Items(removeItem(box2Items));
        setFilteredBox2Items(removeItem(filteredBox2Items));
        setBox3Items(removeItem(box3Items));
        setSearchResults(removeItem(searchResults));
      }
    } else if (over.id === "box1") {
      if (!box1Items.find((item) => item.track_id === itemId)) {
        setBox1Items((prev) => [draggedItem, ...prev]);
        setLocalDropItems(removeItem(localDropItems));
        setBox2Items(removeItem(box2Items));
        setFilteredBox2Items(removeItem(filteredBox2Items));
        setBox3Items(removeItem(box3Items));
      }
    } else if (over.id === "box2") {
      if (!box2Items.find((item) => item.track_id === itemId)) {
        setBox2Items((prev) => [draggedItem, ...prev]);
        setFilteredBox2Items((prev) => [draggedItem, ...prev]);
        setLocalDropItems(removeItem(localDropItems));
        setBox1Items(removeItem(box1Items));
        setBox3Items(removeItem(box3Items));
      }
    } else if (over.id === "box3") {
      if (!box3Items.find((item) => item.track_id === itemId)) {
        setBox3Items((prev) => [draggedItem, ...prev]);
        setLocalDropItems(removeItem(localDropItems));
        setBox1Items(removeItem(box1Items));
        setBox2Items(removeItem(box2Items));
        setFilteredBox2Items(removeItem(filteredBox2Items));
      }
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const itemId = active?.id;
    if (!itemId) return;
    const allItems = [...box1Items, ...box2Items, ...box3Items, ...localDropItems, ...searchResults];
    const draggedItem = allItems.find((item) => item.track_id === itemId);
    if (!draggedItem) return;
    setActiveItem(draggedItem);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="drag-container">
        <DropArea items={localDropItems} />
        <div className="drag-box-wrapper flex-col md:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <DraggableBox
                id="box1"
                items={box1Items}
                title="Random Songs from your Genres"
                setSearchResults={setSearchResults}
                searchResults={searchResults}
                isSearchResultsReady={isSearchResultsReady}
              />
              {box1Loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <p className="text-gray-700 font-semibold">Loading songs... Please wait.</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <DraggableBox
              id="box2"
              items={filteredBox2Items} // This will be all 1000 by default, or filtered by search
              title="Songs from your Listening History"
              setSearchResults={setSearchResults}
              searchResults={searchResults}
              isSearchResultsReady={isSearchResultsReady}
              box2SearchQuery={box2SearchQuery}
              setBox2SearchQuery={setBox2SearchQuery}
              enableBox2Search={true}
            />
          </div>
          <div className="flex-1 min-w-0">
            <DraggableBox
              id="box3"
              items={box3Items}
              title="Search for any Song, Artist, or Album"
              setSearchResults={setSearchResults}
              searchResults={searchResults}
              isSearchResultsReady={isSearchResultsReady}
            />
          </div>
        </div>
        <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.25, 0.8, 0.5, 1)" }}>
          {activeItem ? (
            <DraggableItem item={activeItem} isOverlay />
          ) : (
            <div className="drag-overlay-placeholder">Dragging...</div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

function DropArea({ items }) {
  const { setNodeRef } = useDroppable({ id: "dropArea" });

  return (
    <div>
      <p className="text-gray-500 text-sm italic mb-2">
        Drag and drop songs here to associate them with the current intent. The more songs, the better. <br />
        Drag songs from any of the boxes below and drop them in the dashed box. If you want to remove a song from this list, simply drag it back into any of the boxes below (such as your listening history or genre suggestions).<br />
        Any problems with the drag and drop? Please refresh the page.
      </p>
      <div ref={setNodeRef} className="drop-area relative">
        <div className="absolute top-2 right-2 group">
          <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full cursor-pointer">
            i
          </div>
          <div className="absolute top-8 right-0 hidden group-hover:block bg-white text-gray-700 text-sm p-4 rounded shadow-lg w-85">
            Drag and drop songs here to associate them with the current intent. Choose at least 5 songs, the more the better.<br />
            To remove items, place them in any box below.
          </div>
        </div>
        {items.length === 0 ? (
          <p className="drop-placeholder">Drop songs here</p>
        ) : null}
        {items.map((item) => {
          if (!item || !item.track_id) {
            return null;
          }
          return <DraggableItem key={item.track_id} item={item} />;
        })}
      </div>
    </div>
  );
}

function DraggableBox({ id, items, title, setSearchResults, searchResults, isSearchResultsReady, box2SearchQuery, setBox2SearchQuery, enableBox2Search }) {
  const { setNodeRef } = useDroppable({ id });
  const [searchQueryBox3, setSearchQueryBox3] = useState("");
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const [searchType, setSearchType] = useState({ value: "track_name", label: "Song" });

  const searchTypeOptions = [
    { value: "all", label: "All" },
    { value: "track_name", label: "Song"},
    { value: "artist_name", label: "Artist" },
    { value: "album_name", label: "Album" },
  ];

  const debounceTimer = useRef(null);

  const handleSearch = async (query) => {
    setSearchQueryBox3(query);
    if (id === "box3" && query.trim()) {
      setIsSearching(true);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(async () => {
        try {
          // Pass searchType to the API
          const response = await fetch("/api/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, page, searchType: searchType.value }),
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }

          const data = await response.json();
          if (Array.isArray(data)) {
            const queryWords = query.toLowerCase().split(/\s+/);

            const filteredResults = data.map((item) => ({
              track_id: item.track_id,
              track_name: item.track_name,
              artist_name: item.artist_name,
              album_name: item.album_name,
            })).filter((item) =>
              queryWords.some(
                (word) =>
                  item.track_id.toLowerCase().includes(word) ||
                  item.artist_name.toLowerCase().includes(word) ||
                  item.album_name.toLowerCase().includes(word)
              )
            );

            const prioritizedResults = filteredResults.sort((a, b) => {
              const aMatchCount = queryWords.filter(
                (word) =>
                  a.track_id.toLowerCase().includes(word) ||
                  a.artist_name.toLowerCase().includes(word) ||
                  a.album_name.toLowerCase().includes(word)
              ).length;
              const bMatchCount = queryWords.filter(
                (word) =>
                  b.track_id.toLowerCase().includes(word) ||
                  b.artist_name.toLowerCase().includes(word) ||
                  b.album_name.toLowerCase().includes(word)
              ).length;
              return bMatchCount - aMatchCount;
            });

            setSearchResults(prioritizedResults);
          } else {
            console.error("Unexpected search API response:", data);
            if (page === 1) setSearchResults([]);
          }
        } catch (error) {
          console.error("Error searching database:", error);
          if (page === 1) setSearchResults([]);
        } finally {
          setIsSearching(false); // Stop loading spinner
        }
      }, 200);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div ref={setNodeRef} className="drag-box">
      <p className="drag-box-title">{title}</p>
      {/* Box 2 search bar */}
      {enableBox2Search && (
        <div className="search-bar mb-2 my-2">
          <input
            type="text"
            value={box2SearchQuery}
            onChange={e => setBox2SearchQuery(e.target.value)}
            placeholder="Search your listening history..."
            className="search-input"
          />
        </div>
      )}
      {/* Box 3 search bar */}
      {id === "box3" && (
        <div className="search-bar my-2 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <ReactSelect
              options={searchTypeOptions}
              value={searchType}
              onChange={setSearchType}
              className="w-36"
              classNamePrefix="react-select"
              isSearchable={false}
              menuPlacement="auto"
            />
            <input
              type="text"
              value={searchQueryBox3}
              onChange={(e) => {
                setPage(1);
                handleSearch(e.target.value);
              }}
              placeholder={`Search by ${searchType.label.toLowerCase()}...`}
              className="search-input flex-1"
            />
            {isSearching && (
              <div className="loading-spinner">
                <div className="spinner-circle"></div>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        className="drag-box-content min-h-[450px]"
        style={{ maxHeight: "500px", overflowY: "auto" }}
      >
        {/* Loading stage for Box 3 */}
        {id === "box3" && isSearching && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-5 w-5 border-t-4 border-solid"></div>
            <span className="ml-2 font-semibold">Loading search results...</span>
          </div>
        )}
        {/* Show results only when not loading */}
        {!(id === "box3" && isSearching) && (
          <>
            {id === "box3" && searchResults.length !== 0 && (
              <NotFoundAddSongButton setSearchResults={setSearchResults} />
            )}
            {(id === "box3" && searchQueryBox3.trim() ? searchResults : items).map((item) => (
              <DraggableItem key={item.track_id} item={item} />
            ))}
            {id === "box3" && searchQueryBox3.trim() && searchResults.length === 0 && !isSearching && (
              <div className="text-center mt-4">
                <p className="text-gray-500">No results found. You can add a new song:</p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const title = formData.get("title")?.trim();
                    const artist = formData.get("artist")?.trim();

                    if (!title || !artist) {
                      alert("Song Name and Artist Name are required.");
                      return;
                    }

                    const newSong = {
                      track_id: `custom-${Date.now()}`,
                    track_name: title,
                    artist_name: artist,
                    album_name: formData.get("album")?.trim() || null,
                    track_uri: null,
                    artist_uri: null,
                    album_uri: null,
                    duration_ms: 0,
                    genres: [],
                    image: "/default-cover.png",
                    added_by_userdata: 2,
                    };

                    setSearchResults((prev) => [...prev, newSong]);
                    try {
                      await fetch("/api/check-and-add", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ songs: [newSong] }),
                      });
                      console.log("Custom song added to the database:", newSong);
                    } catch (error) {
                      console.error("Error adding custom song to the database:", error);
                    }
                    e.target.reset();
                  }}
                  className="mt-2 space-y-2"
                >
                  <input
                    type="text"
                    name="title"
                    placeholder="Song Name"
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    name="artist"
                    placeholder="Artist Name"
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    name="album"
                    placeholder="Album Name (Optional)"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600"
                  >
                    Add Song
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DraggableItem({ item, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.track_id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        transition: isOverlay ? "transform 0.1s ease" : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...(isOverlay ? {} : listeners)}
      {...attributes}
      className="drag-item"
      style={style}
    >
      <img
        src={item.image || "/default-cover.png"}
        alt={item.track_name}
        className="drag-item-image"
      />
      <div className="drag-item-info">
        <strong>{item.track_name}</strong>
        <p>{item.artist_name}</p>
        <small>{item.album_name}</small>
      </div>
    </div>
  );
}

function NotFoundAddSongButton({ setSearchResults }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <>
      {!showAdd ? (
        <button
          type="button"
          className="w-full mt-2 px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
          onClick={() => setShowAdd(true)}
        >
          Not what you are looking for?
        </button>
      ) : (
        <div className="mt-2 p-3 bg-blue-50 rounded shadow">
          <p className="mb-2 text-blue-900 font-semibold">Add a new song:</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const title = formData.get("title")?.trim();
              const artist = formData.get("artist")?.trim();

              if (!title || !artist) {
                alert("Song Name and Artist Name are required.");
                return;
              }

              const newSong = {
                track_id: `custom-${Date.now()}`,
                track_name: title,
                artist_name: artist,
                album_name: formData.get("album")?.trim() || null,
                track_uri: null,
                artist_uri: null,
                album_uri: null,
                duration_ms: 0,
                genres: [],
                image: "/default-cover.png",
                added_by_userdata: 2,
              };

              setSearchResults((prev) => [newSong, ...prev]);
              try {
                await fetch("/api/check-and-add", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ songs: [newSong] }),
                });
                setShowAdd(false);
              } catch (error) {
                alert("Error adding song.");
              }
              e.target.reset();
            }}
            className="space-y-2"
          >
            <input
              type="text"
              name="title"
              placeholder="Song Name"
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              name="artist"
              placeholder="Artist Name"
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              name="album"
              placeholder="Album Name (Optional)"
              className="w-full px-3 py-2 border rounded"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
              >
                Add Song
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
