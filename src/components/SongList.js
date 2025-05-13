import Image from 'next/image';
import { useState } from 'react';

const songsData = [
  { id: "1", name: "Jocelyn Flores", artist: "XXXTENTACION", image: "https://via.placeholder.com/50" },
  { id: "2", name: "Lucid Dreams", artist: "Juice WRLD", image: "https://via.placeholder.com/50" },
  { id: "3", name: "God’s Plan", artist: "Drake", image: "https://via.placeholder.com/50" },
];

const SongList = () => {
  const [search, setSearch] = useState("");

  const filteredSongs = songsData.filter((song) =>
    song.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <input
        type="text"
        placeholder="Search for a song..."
        className="w-full p-2 border rounded"
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="mt-4 space-y-2">
        {filteredSongs.map((song) => (
          <div
            key={song.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("song", JSON.stringify(song))}
            className="p-2 flex items-center bg-white shadow rounded cursor-pointer"
          >
            <Image
              src={song.image}
              alt={song.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded mr-2"
            />
            <div>
              <p className="font-semibold">{song.name}</p>
              <p className="text-gray-500 text-sm">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongList;
