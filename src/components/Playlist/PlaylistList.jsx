import React, { useEffect, useState, useRef } from "react";
import Spotify from "../util/Spotify";
import PlaylistListItem from "./PlaylistListItem";

const CACHE_KEY = "writablePlaylists";

export default function PlaylistList({ onSelect }) {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const listRef = useRef(null);

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
        <>
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Playlist list"
            tabIndex={0}
            onKeyDown={(e) => {
              const visible = playlists.slice(0, visibleCount);
              const currentIdx = visible.findIndex((p) => p.id === selectedId);
              if (e.key === "ArrowDown") {
                e.preventDefault();
                let nextIdx = currentIdx + 1;
                if (nextIdx >= visible.length) nextIdx = 0;
                setSelectedId(visible[nextIdx].id);
                // Focus the button for accessibility
                setTimeout(() => {
                  const btn =
                    listRef.current.querySelectorAll("button")[nextIdx];
                  if (btn) btn.focus();
                }, 0);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                let prevIdx = currentIdx - 1;
                if (prevIdx < 0) prevIdx = visible.length - 1;
                setSelectedId(visible[prevIdx].id);
                setTimeout(() => {
                  const btn =
                    listRef.current.querySelectorAll("button")[prevIdx];
                  if (btn) btn.focus();
                }, 0);
              } else if (e.key === "Home") {
                e.preventDefault();
                setSelectedId(visible[0].id);
                setTimeout(() => {
                  const btn = listRef.current.querySelectorAll("button")[0];
                  if (btn) btn.focus();
                }, 0);
              } else if (e.key === "End") {
                e.preventDefault();
                setSelectedId(visible[visible.length - 1].id);
                setTimeout(() => {
                  const btn =
                    listRef.current.querySelectorAll("button")[
                      visible.length - 1
                    ];
                  if (btn) btn.focus();
                }, 0);
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (onSelect && selectedId) onSelect(selectedId);
              }
            }}
          >
            {playlists.slice(0, visibleCount).map((p, idx) => (
              <PlaylistListItem
                key={p.id}
                id={p.id}
                name={p.name}
                trackCount={p.trackCount}
                selected={selectedId === p.id}
                aria-selected={selectedId === p.id}
                tabIndex={selectedId === p.id ? 0 : -1}
                onSelect={(id) => {
                  setSelectedId(id);
                  if (onSelect) onSelect(id);
                }}
              />
            ))}
          </ul>
          {visibleCount < playlists.length && (
            <button
              type="button"
              className="PlaylistList-showMore"
              style={{ marginTop: "1em" }}
              onClick={() => setVisibleCount(visibleCount + 10)}
            >
              Show More
            </button>
          )}
        </>
      )}
      {loading && (
        <div className="PlaylistList-loading">Loading playlists...</div>
      )}
    </div>
  );
}
