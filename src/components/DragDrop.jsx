"use client";
import React, { useState, useEffect } from "react";
import { DndContext, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import { useSession } from "next-auth/react";

const initialItemsBox2 = [
  { id: "item3", title: "Track Three", artist: "Artist C", album: "Album Z" },
];

async function fetchAlbumImage(trackId, accessToken) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error("Failed to fetch album image");

    const trackData = await response.json();
    return trackData.album.images?.[0]?.url || "/default-cover.png"; // Updated path
  } catch (error) {
    console.error(`Error fetching album image for ${trackId}:`, error);
    return "/default-cover.png"; // Updated path
  }
}

async function checkAndAddToDatabase(songs) {
  try {
    const response = await fetch("/api/check-and-add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ songs }),
    });

    if (!response.ok) {
      throw new Error(`Failed to check/add songs to the database: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error checking/adding songs to the database:", error);
  }
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function fetchRandomSongsByGenre(genre, accessToken) {
  try {
    const response = await fetch(`/api/songs?genre=${encodeURIComponent(genre)}`);
    const data = await response.json();

    if (Array.isArray(data)) {
      const songsWithGenres = data.filter((song) => song.genres && song.genres.includes(genre));
      const randomSongs = shuffleArray(songsWithGenres).slice(0, 10);

      const songsWithImages = await Promise.all(
        randomSongs.map(async (song) => ({
          id: song.track_id,
          title: song.track_name,
          artist: song.artist_name,
          album: song.album_name,
          image: await fetchAlbumImage(song.track_id, accessToken),
          track_uri: song.track_uri,
          artist_uri: song.artist_uri,
          album_uri: song.album_uri,
          duration_ms: song.duration_ms,
        }))
      );

      return songsWithImages;
    } else {
      console.error("Unexpected API response:", data);
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
  const [box2Items, setBox2Items] = useState(initialItemsBox2);
  const [filteredBox2Items, setFilteredBox2Items] = useState([]); // Filtered items for box2
  const [box3Items, setBox3Items] = useState([]);
  const [localDropItems, setLocalDropItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchResultsReady, setIsSearchResultsReady] = useState(false);
  const [box2SearchQuery, setBox2SearchQuery] = useState(""); // Search query for box2

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const fetchSongs = async () => {
        try {
          console.log("Fetching songs for Box 1...");
          const accessToken = session?.accessToken;

          // Retrieve genres from localStorage
          const userData = JSON.parse(localStorage.getItem("userData"));
          const genres = userData?.genres || [];
          console.log(`Retrieved genres from localStorage: ${genres}`);

          let allSongs = [];
          for (const genre of genres) {
            console.log(`Fetching songs for genre: ${genre}`);
            const songsByGenre = await fetchRandomSongsByGenre(genre, accessToken);
            console.log(`Fetched ${songsByGenre.length} songs for genre: ${genre}`);
            allSongs = [...allSongs, ...songsByGenre];
          }

          // Display all fetched songs without shuffling
          setBox1Items(allSongs);

          // Check and add songs to the database
          console.log("Checking and adding songs to the database...");
          await checkAndAddToDatabase(allSongs);
          console.log("Songs successfully checked and added to the database.");
        } catch (error) {
          console.error("Error fetching songs:", error);
          setBox1Items([]);
        }
      };
      fetchSongs();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      const fetchTopSongs = async () => {
        const accessToken = session?.accessToken;
        if (!accessToken) {
          console.error("No access token available.");
          return;
        }

        try {
          const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await response.json();

          if (Array.isArray(data.items) && data.items.length > 0) {
            const uniqueSongs = new Map();
            const topSongs = data.items.map((item) => {
              const trackName = item.name;
              const trackArtists = item.artists.map((artist) => artist.name).join(", ");
              if (!uniqueSongs.has(trackName)) {
                uniqueSongs.set(trackName, trackArtists);
                return {
                  id: item.id,
                  title: trackName,
                  artist: trackArtists,
                  album: item.album.name,
                  image: item.album.images?.[0]?.url || "default-image.jpg",
                  track_uri: item.uri,
                  artist_uri: item.artists?.[0]?.uri || null,
                  album_uri: item.album.uri,
                  duration_ms: item.duration_ms,
                };
              }
              return null;
            }).filter(Boolean);

            const shuffledSongs = shuffleArray(topSongs);
            setBox2Items(shuffledSongs);
            setFilteredBox2Items(shuffledSongs); // Initialize filtered items

            // Check and add songs to the database
            await checkAndAddToDatabase(shuffledSongs);
          } else {
            console.error("No top songs available.");
            setBox2Items([]);
            setFilteredBox2Items([]);
          }
        } catch (error) {
          console.error("Error fetching top songs:", error);
          setBox2Items([]);
          setFilteredBox2Items([]);
        }
      };

      fetchTopSongs();
    }
  }, [session]);

  useEffect(() => {
    // Filter box2 items based on the search query
    if (box2SearchQuery.trim()) {
      setFilteredBox2Items(
        box2Items.filter((item) =>
          item.title.toLowerCase().includes(box2SearchQuery.toLowerCase()) ||
          item.artist.toLowerCase().includes(box2SearchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredBox2Items(box2Items); // Reset to original items if query is empty
    }
  }, [box2SearchQuery, box2Items]);

  useEffect(() => {
    if (searchResults.length > 0) {
      setIsSearchResultsReady(true); // Mark searchResults as ready
    } else {
      setIsSearchResultsReady(false); // Reset if searchResults is empty
    }
  }, [searchResults]);

  useEffect(() => {
    setDropItems(localDropItems); // Sync localDropItems with parent state
  }, [localDropItems, setDropItems]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!active || !over) return;

    const itemId = active.id;

    const allItems = [...box1Items, ...box2Items, ...box3Items, ...localDropItems, ...searchResults];
    const draggedItem = allItems.find((item) => item.id === itemId);

    const removeItem = (items) => items.filter((item) => item.id !== itemId);

    if (over.id === "dropArea") {
      if (!localDropItems.find((item) => item.id === itemId)) {
        setLocalDropItems((prev) => [...prev, draggedItem]);
        setBox1Items(removeItem(box1Items));
        setBox2Items(removeItem(box2Items));
        setFilteredBox2Items(removeItem(filteredBox2Items)); // Update filtered items
        setBox3Items(removeItem(box3Items));
        setSearchResults(removeItem(searchResults));
      }
    } else if (over.id === "box1") {
      if (!box1Items.find((item) => item.id === itemId)) {
        setBox1Items((prev) => [draggedItem, ...prev]);
        setLocalDropItems(removeItem(localDropItems));
        setBox2Items(removeItem(box2Items));
        setFilteredBox2Items(removeItem(filteredBox2Items)); // Update filtered items
        setBox3Items(removeItem(box3Items));
      }
    } else if (over.id === "box2") {
      if (!box2Items.find((item) => item.id === itemId)) {
        setBox2Items((prev) => [draggedItem, ...prev]);
        setFilteredBox2Items((prev) => [draggedItem, ...prev]); // Update filtered items
        setLocalDropItems(removeItem(localDropItems));
        setBox1Items(removeItem(box1Items));
        setBox3Items(removeItem(box3Items));
      }
    } else if (over.id === "box3") {
      if (!box3Items.find((item) => item.id === itemId)) {
        setBox3Items((prev) => [draggedItem, ...prev]);
        setLocalDropItems(removeItem(localDropItems));
        setBox1Items(removeItem(box1Items));
        setBox2Items(removeItem(box2Items));
        setFilteredBox2Items(removeItem(filteredBox2Items)); // Update filtered items
      }
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const itemId = active?.id;

    if (!itemId) {
      console.error("Active item ID is undefined.");
      return;
    }

    const allItems = [...box1Items, ...box2Items, ...box3Items, ...localDropItems, ...searchResults];
    console.log("All items:", allItems); // Debugging line
    console.log("dropItems:", localDropItems); // Debugging line
    const draggedItem = allItems.find((item) => item.id === itemId);

    if (!draggedItem) {
      console.error("Dragged item not found:", itemId);
      return;
    }

    setActiveItem(draggedItem);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="drag-container">
        <DropArea items={localDropItems} />
        <div className="drag-box-wrapper">
          <DraggableBox
            id="box1"
            items={box1Items}
            title="Random Songs"
            session={session}
            setSearchResults={setSearchResults}
            searchResults={searchResults}
            isSearchResultsReady={isSearchResultsReady}
          />
          <DraggableBox
            id="box2"
            items={filteredBox2Items} // Use filtered items
            title="Songs from your Listening History"
            session={session}
            setSearchResults={setSearchResults}
            searchResults={searchResults}
            isSearchResultsReady={isSearchResultsReady}
            searchQuery={box2SearchQuery} // Pass search query
            setSearchQuery={setBox2SearchQuery} // Pass search query setter
          />
          <DraggableBox
            id="box3"
            items={box3Items}
            title="Box 3"
            session={session}
            setSearchResults={setSearchResults}
            searchResults={searchResults}
            isSearchResultsReady={isSearchResultsReady}
          />
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
    <div ref={setNodeRef} className="drop-area relative">
      <div className="absolute top-2 right-2 group">
        <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full cursor-pointer">
          i
        </div>
        <div className="absolute top-8 right-0 hidden group-hover:block bg-white text-gray-700 text-sm p-4 rounded shadow-lg w-85">
          Drag and drop songs here to associate them with the current intent. <br />
          To remove songs, place them in Box 1.
        </div>
      </div>
      {items.length === 0 ? (
        <p className="drop-placeholder">Drop Here</p>
      ) : null}
      {items.map((item) => {
        if (!item || !item.id) {
          console.error("Invalid item in DropArea:", item);
          return null; // Safeguard to prevent crashes
        }
        return <DraggableItem key={item.id} item={item} />;
      })}
    </div>
  );
}

function DraggableBox({ id, items, title, session, setSearchResults, searchResults, isSearchResultsReady, searchQuery, setSearchQuery }) {
  const { setNodeRef } = useDroppable({ id });
  const [searchQueryBox3, setSearchQueryBox3] = useState("");
  const [isSearchResultsUpdated, setIsSearchResultsUpdated] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allSongsLoaded, setAllSongsLoaded] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = async (query, page = 1) => {
    setSearchQueryBox3(query);
    if (id === "box3" && query.trim()) {
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, page }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          const accessToken = session?.accessToken;
          const resultsWithImages = await Promise.all(
            data.map(async (item) => ({
              id: item.track_id,
              title: item.track_name,
              artist: item.artist_name,
              album: item.album_name,
              image: await fetchAlbumImage(item.track_id, accessToken),
            }))
          );
          setSearchResults(resultsWithImages);
          setIsSearchResultsUpdated(true);
        } else {
          console.error("Unexpected search API response:", data);
          if (page === 1) setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching database:", error);
        if (page === 1) setSearchResults([]);
      } finally {
        setIsLoadingMore(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div ref={setNodeRef} className="drag-box">
      <p className="drag-box-title">{title}</p>
      {id === "box2" && (
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in Box 2..."
            className="search-input"
          />
        </div>
      )}
      {id === "box3" && (
        <div className="search-bar">
          <input
            type="text"
            value={searchQueryBox3}
            onChange={(e) => {
              setPage(1);
              handleSearch(e.target.value);
            }}
            placeholder="Search..."
            className="search-input"
          />
        </div>
      )}
      <div
        className="drag-box-content"
        style={{ maxHeight: "300px", overflowY: "auto" }}
      >
        {(id === "box3" && searchQueryBox3.trim() ? searchResults : items).map((item) => (
          <DraggableItem key={item.id} item={item} />
        ))}
        {isLoadingMore && !allSongsLoaded && <p>Loading more...</p>}
        {allSongsLoaded && <p>All songs are displayed.</p>}
        {noResults && <p>No results found for your search.</p>}
      </div>
    </div>
  );
}

function DraggableItem({ item, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
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
        src={item.image || "https://via.placeholder.com/50"}
        alt={item.title}
        className="drag-item-image"
      />
      <div className="drag-item-info">
        <strong>{item.title}</strong>
        <p>{item.artist}</p>
        <small>{item.album}</small>
      </div>
    </div>
  );
}
