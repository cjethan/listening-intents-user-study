"use client";
import React, { useState, useEffect } from "react";
import { DndContext, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import { useSession } from "next-auth/react";
import { useMemo } from 'react';

const initialItemsBox2 = [
  { id: "item3", title: "Track Three", artist: "Artist C", album: "Album Z" },
];
//const initialItemsBox3 = [ {id: "item4",title: "Track Four",artist: "Artist D",album: "Album W",image: '/default-cover.png',}];

async function fetchAlbumImage(trackId, accessToken) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 429) {
      console.error(`Rate limit exceeded while fetching album image for ${trackId}.`);
      return "/default-cover.png"; // Return default image
    }

    const trackData = await response.json();
    return trackData.album.images?.[0]?.url || "/default-cover.png"; // Updated path
  } catch (error) {
    console.error(`Error fetching album image for ${trackId}:`, error);
    return "/default-cover.png"; // Updated path
  }
}

export function DragAndDrop() {
  const [activeItem, setActiveItem] = useState(null);
  const [box1Items, setBox1Items] = useState([]);
  const [box2Items, setBox2Items] = useState(initialItemsBox2);
  const [box3Items, setBox3Items] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [dropItems, setDropItems] = useState([]);
  const allItems = useMemo(() => {
    return [...box1Items, ...box2Items, ...box3Items, ...dropItems, ...searchResults];
  }, [box1Items, box2Items, box3Items, dropItems, searchResults]);
  const [isLoadingMore, setIsLoadingMore] = useState(false); 

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
      const fetchTopAndRecentSongs = async () => {
        const accessToken = session?.accessToken;
        if (!accessToken) {
          console.error("No access token available.");
          return;
        }

        try {
          // Fetch top songs
          const topSongsResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const topSongsData = await topSongsResponse.json();

          // Fetch recently played songs
          const recentSongsResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const recentSongsData = await recentSongsResponse.json();

          const uniqueSongs = new Map();

          // Process top songs
          const topSongs = (topSongsData.items || []).map((item) => {
            const trackName = item.name;
            const trackArtists = item.artists.map((artist) => artist.name).join(", ");
            if (!uniqueSongs.has(item.id)) {
              uniqueSongs.set(item.id, true);
              return {
                id: item.id,
                title: trackName,
                artist: trackArtists,
                album: item.album.name,
                image: item.album.images?.[0]?.url || "/default-cover.png",
              };
            }
            return null;
          }).filter(Boolean);

          // Process recently played songs
          const recentSongs = (recentSongsData.items || []).map((item) => {
            const track = item.track;
            const trackName = track.name;
            const trackArtists = track.artists.map((artist) => artist.name).join(", ");
            if (!uniqueSongs.has(track.id)) {
              uniqueSongs.set(track.id, true);
              return {
                id: track.id,
                title: trackName,
                artist: trackArtists,
                album: track.album.name,
                image: track.album.images?.[0]?.url || "/default-cover.png",
              };
            }
            return null;
          }).filter(Boolean);

          // Combine top and recent songs
          setBox2Items([...topSongs, ...recentSongs]);
        } catch (error) {
          console.error("Error fetching top or recent songs:", error);
          setBox2Items([]);
        }
      };

      fetchTopAndRecentSongs();
    }
  }, [session]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!active || !over) return;

    const itemId = active.id;

    const draggedItem = allItems.find((item) => item.id === itemId);

    const removeItem = (items) => {
      return items.filter((item) => item.id !== itemId);
    };

    if (over.id === "dropArea") {
      if (!dropItems.find((item) => item.id === itemId)) {
        setDropItems((prev) => [...prev, draggedItem]);
        setBox1Items(removeItem(box1Items));
        setBox2Items(removeItem(box2Items));
        setBox3Items(removeItem(box3Items));
      }
    } else if (over.id === "box1") {
      if (!box1Items.find((item) => item.id === itemId)) {
        setBox1Items((prev) => [draggedItem, ...prev]);
        setDropItems(removeItem(dropItems));
        setBox2Items(removeItem(box2Items));
        setBox3Items(removeItem(box3Items));
      }
    }

    console.log("Box 1 Items:", box1Items);
    console.log("Search Items", searchResults);
    console.log("Drop Items:", dropItems);
    console.log("All Items:", allItems);
  };

  const handleDragStart = (event) => {
    if (isLoadingMore) {
      console.log("Loading search results, cannot drag yet.");
      return;
    }

    const { active } = event;
    const itemId = active.id;

    // Dynamically calculate allItems to ensure it's up-to-date
    const currentAllItems = [
      ...box1Items,
      ...box2Items,
      ...box3Items,
      ...dropItems,
      ...searchResults,
    ];

    console.log(currentAllItems);

    const draggedItem = currentAllItems.find((item) => item.id === itemId);
    setActiveItem(draggedItem);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="drag-container">
        <DropArea items={dropItems} setDropItems={setDropItems} />
        <div className="drag-box-wrapper">
          <DraggableBox id="box1" items={box1Items} title="Box 1" session={session} />
          <DraggableBox id="box2" items={box2Items} title="Box 2" session={session} />
          <DraggableBox id="box3" items={box3Items} title="Box 3" session={session} setDropItems={setDropItems} />
        </div>
        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeItem ? <DraggableItem item={activeItem} isOverlay /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

function DropArea({ items, setDropItems }) {
  const { setNodeRef } = useDroppable({ id: "dropArea" });

  const handleRemoveItem = (itemId) => {
    setDropItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <div ref={setNodeRef} className="drop-area">
      {items.length === 0 ? (
        <p className="drop-placeholder">Drop Here</p>
      ) : null}
      {items.map((item) => {
        if (!item || !item.id) {
          console.error("Invalid item in DropArea:", item);
          return null; // Safeguard to prevent crashes
        }
        return (
          <div
            key={item.id}
            onClick={() => handleRemoveItem(item.id)} // Handle click for removal
            className="clickable-item" // Add a class for styling clickable items
          >
            <DraggableItem item={item} disableDrag={true} /> {/* Disable dragging */}
          </div>
        );
      })}
    </div>
  );
}

function DraggableBox({ id, items, title, session, setDropItems }) {
  const { setNodeRef } = useDroppable({ id });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(1); // Track the current page
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allSongsLoaded, setAllSongsLoaded] = useState(false); // Track if all songs are loaded
  const [noResults, setNoResults] = useState(false); // Track if no results are found

  const handleSearch = async (query, page = 1) => {
    setIsLoadingMore(true);
    setSearchQuery(query);

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

        setSearchResults((prevResults) => {
          const merged =
            page === 1
              ? resultsWithImages // if page 1: fresh search
              : [...prevResults, ...resultsWithImages]; // else: append to old results

          // remove duplicates (by id)
          const uniqueResults = merged.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
          );

          return uniqueResults;
        });
        console.log("Search results:", resultsWithImages);

        if (resultsWithImages.length === 0 && page === 1) {
          setNoResults(true); // no results at all
        } else {
          setNoResults(false);
        }

        if (resultsWithImages.length === 0 && page > 1) {
          setAllSongsLoaded(true); // no more songs to load
        }
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
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !isLoadingMore) {
      // Load more results when the user scrolls to the bottom
      setIsLoadingMore(true);
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        handleSearch(searchQuery, nextPage);
        return nextPage;
      });
    }
  };

  const handleItemClick = (item) => {
    if (id === "box3") {
      setDropItems((prev) => {
        if (!prev.find((dropItem) => dropItem.id === item.id)) {
          return [...prev, item];
        }
        return prev;
      });
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
              setPage(1); // Reset to the first page on new search
              handleSearch(e.target.value);
            }}
            placeholder="Search..."
            className="search-input"
          />
        </div>
      )}
      <div
        className="drag-box-content"
        onScroll={id === "box3" ? handleScroll : undefined} // Attach scroll handler for Box 3
        style={{ maxHeight: "300px", overflowY: "auto" }} // Ensure the box is scrollable
      >
        {(id === "box3" && searchQuery.trim() ? searchResults : items).map(
          (item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={id === "box3" ? "clickable-item" : ""} // Add a class for clickable items in Box 3
            >
              <DraggableItem
                item={item}
                isOverlay={false}
                disableDrag={id === "box3"} // Disable drag only for Box 3
              />
            </div>
          )
        )}
        {isLoadingMore && !allSongsLoaded && <p>Loading more...</p>}{" "}
        {/* Show loading indicator */}
        {allSongsLoaded && <p>All songs are displayed.</p>}{" "}
        {/* Show message when all songs are loaded */}
        {noResults && <p>No results found for your search.</p>}{" "}
        {/* Show message when no results are found */}
      </div>
    </div>
  );
}

function DraggableItem({ item, isOverlay = false, disableDrag = false }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    disabled: disableDrag, // Disable dragging if specified
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
      {...(disableDrag ? {} : listeners)} // Disable drag listeners if dragging is disabled
      {...attributes}
      className={`drag-item ${disableDrag ? "non-draggable" : ""}`} // Add a class for non-draggable items
      style={style}
    >
      <img
        src={item.image || "/default-cover.png"}
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
