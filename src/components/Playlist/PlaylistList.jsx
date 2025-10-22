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
        // Filter to playlists the current user can write to: either they own it
        // or it's collaborative. Use the current user id for ownership check.
        const currentUserId = await Spotify.getCurrentUserId();
        const writable = (items || []).filter(
          (p) => p.ownerId === currentUserId || p.collaborative === true
        );
        if (mounted) setPlaylists(writable);
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
      {playlists.length === 0 ? (
        <div className="PlaylistList-empty">No writable playlists found.</div>
      ) : (
        <ul>
          {playlists.map((p) => (
            <PlaylistListItem
              key={p.id}
              id={p.id}
              name={p.name}
              trackCount={p.trackCount}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
