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

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export function DragAndDrop({ setDropItems }) {
  const [activeItem, setActiveItem] = useState(null);
  const [box1Items, setBox1Items] = useState([]);
  const [box2Items, setBox2Items] = useState(initialItemsBox2);
  const [box3Items, setBox3Items] = useState([]);
  const [localDropItems, setLocalDropItems] = useState([]); // Local state for dropItems
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchResultsReady, setIsSearchResultsReady] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const fetchSongs = async () => {
        try {
          const response = await fetch("/api/songs");
          const data = await response.json();

          if (Array.isArray(data)) {
            const accessToken = session?.accessToken;
            const songsWithImages = await Promise.all(
              data.map(async (song) => ({
                id: song.track_id,
                title: song.track_name,
                artist: song.artist_name,
                album: song.album_name,
                image: await fetchAlbumImage(song.track_id, accessToken),
              }))
            );
            setBox1Items(songsWithImages);
          } else {
            console.error("Unexpected API response:", data);
            setBox1Items([]);
          }
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
                };
              }
              return null;
            }).filter(Boolean);
  
            setBox2Items(shuffleArray(topSongs)); // Shuffle the songs before setting them
          } else {
            console.error("No top songs available.");
            setBox2Items([]);
          }
        } catch (error) {
          console.error("Error fetching top songs:", error);
          setBox2Items([]);
        }
      };
  
      fetchTopSongs();
    }
  }, [session]);

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
        setBox3Items(removeItem(box3Items));
        setSearchResults(removeItem(searchResults)); // Remove from search results
      }
    } else if (over.id === "box1") {
      if (!box1Items.find((item) => item.id === itemId)) {
        setBox1Items((prev) => [draggedItem, ...prev]);
        setLocalDropItems(removeItem(localDropItems));
        setBox2Items(removeItem(box2Items));
        setBox3Items(removeItem(box3Items));
      }
    } else if (over.id === "box2") {
      if (!box2Items.find((item) => item.id === itemId)) {
        setBox2Items((prev) => [draggedItem, ...prev]);
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
            items={box2Items}
            title="Songs from your Listening History"
            session={session}
            setSearchResults={setSearchResults}
            searchResults={searchResults}
            isSearchResultsReady={isSearchResultsReady}
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

function DraggableBox({ id, items, title, session, setSearchResults, searchResults, isSearchResultsReady }) {
  const { setNodeRef } = useDroppable({ id });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchResultsUpdated, setIsSearchResultsUpdated] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allSongsLoaded, setAllSongsLoaded] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = async (query, page = 1) => {
    setSearchQuery(query);
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
      {id === "box3" && (
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
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
        {(id === "box3" && searchQuery.trim() ? searchResults : items).map((item) => (
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

