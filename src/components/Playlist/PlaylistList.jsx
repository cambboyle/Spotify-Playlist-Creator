import React, { useEffect, useState } from "react";
import Spotify from "../util/Spotify";
import PlaylistListItem from "./PlaylistListItem";

const CACHE_KEY = "writablePlaylists";

export default function PlaylistList({ onSelect }) {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper to fetch playlists and cache them
  const fetchAndCachePlaylists = async () => {
    setError(null);
    setLoading(true);
    try {
      const items = await Spotify.getUserPlaylists();
      const currentUserId = await Spotify.getCurrentUserId();
      const writable = (items || []).filter(
        (p) => p.ownerId === currentUserId || p.collaborative === true,
      );
      setPlaylists(writable);
      window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(writable));
    } catch (err) {
      console.error("Failed to load user playlists", err);
      setError("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  // On mount, use cache if available, otherwise fetch
  useEffect(() => {
    let mounted = true;
    const cached = window.sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (mounted) setPlaylists(parsed);
      } catch (e) {
        // Ignore cache parse errors
      }
    }
    fetchAndCachePlaylists();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, []);

  // Handler for refresh button
  const handleRefresh = () => {
    window.sessionStorage.removeItem(CACHE_KEY);
    fetchAndCachePlaylists();
  };

  if (error) return <div className="PlaylistList-error">{error}</div>;

  return (
    <div className="PlaylistList">
      <h3>Select Playlists</h3>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        style={{ marginBottom: "1em" }}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      {playlists.length === 0 && !loading ? (
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
      {loading && (
        <div className="PlaylistList-loading">Loading playlists...</div>
      )}
    </div>
  );
}
