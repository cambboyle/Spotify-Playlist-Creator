import React, { useEffect, useState } from "react";
import Spotify from "../util/Spotify";
import PlaylistListItem from "./PlaylistListItem";

export default function PlaylistList({ onSelect }) {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      try {
        const items = await Spotify.getUserPlaylists();
        if (mounted) setPlaylists(items || []);
      } catch (err) {
        console.error("Failed to load user playlists", err);
        if (mounted) setError("Failed to load playlists");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (error) return <div className="PlaylistList-error">{error}</div>;

  return (
    <div className="PlaylistList">
      <h3>Select Playlists</h3>
      <ul>
        {playlists.map((p) => (
          <PlaylistListItem
            key={p.id}
            id={p.id}
            name={p.name}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}
