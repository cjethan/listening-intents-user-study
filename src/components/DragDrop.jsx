"use client";
import React, { useState, useEffect, useRef } from "react";
import { DndContext, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";

// Remove all useSession and session logic

// Placeholder for fetching album images (replace with Last.fm or your own logic)
async function fetchAlbumImagePlaceholder(trackId) {
  // TODO: Replace with Last.fm or your own API call
  return "/default-cover.png";
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

  // Placeholder: Replace with your own logic to fetch songs for Box 1
  useEffect(() => {
    const fetchSongs = async () => {
      setBox1Loading(true);
      // TODO: Replace with your own API or static data
      setBox1Items([]);
      setBox1Loading(false);
    };
    fetchSongs();
  }, []);

  // Placeholder: Replace with your own logic to fetch songs for Box 2
  useEffect(() => {
    const fetchTopSongs = async () => {
      // TODO: Replace with your own API or static data
      setBox2Items([]);
      setFilteredBox2Items([]);
    };
    fetchTopSongs();
  }, []);

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
        <div className="drag-box-wrapper">
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
          <DraggableBox
            id="box2"
            items={filteredBox2Items}
            title="Songs from your Listening History"
            setSearchResults={setSearchResults}
            searchResults={searchResults}
            isSearchResultsReady={isSearchResultsReady}
          />
          <DraggableBox
            id="box3"
            items={box3Items}
            title="Search for Song, Artist, or Album"
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
    <div>
      <p className="text-gray-500 text-sm italic mb-2">
        Drag and drop songs here to associate them with the current intent. To remove items, place them in any box below. The more songs, the better.
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

function DraggableBox({ id, items, title, setSearchResults, searchResults, isSearchResultsReady }) {
  const { setNodeRef } = useDroppable({ id });
  const [searchQueryBox3, setSearchQueryBox3] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const debounceTimer = useRef(null);

  const handleSearch = async (query) => {
    setSearchQueryBox3(query);
    if (id === "box3" && query.trim()) {
      setIsSearching(true);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(async () => {
        // Placeholder: Replace with your own search logic or API call
        setSearchResults([]);
        setIsSearching(false);
      }, 500);
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
            value={searchQueryBox3}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search..."
            className="search-input"
          />
          {isSearching && (
            <div className="loading-spinner">
              <div className="spinner-circle"></div>
            </div>
          )}
        </div>
      )}
      <div
        className="drag-box-content"
        style={{ maxHeight: "500px", overflowY: "auto" }}
      >
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
                  album_name: formData.get("album")?.trim() || "Unknown Album",
                  image: "/default-cover.png",
                  added_by_userdata: 1,
                };

                setSearchResults((prev) => [...prev, newSong]);
                // Placeholder: Add the new song to your database if needed
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
        src={item.image || "https://via.placeholder.com/50"}
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
