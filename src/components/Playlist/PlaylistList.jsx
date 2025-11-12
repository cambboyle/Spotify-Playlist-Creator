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
      if (err && err.message && err.message.includes("Not authorized")) {
        setError("You are not authorized. Please connect to Spotify.");
        // Optionally, trigger an authorize flow or show a button here
      } else {
        console.error("Failed to load user playlists", err);
        setError("Failed to load playlists");
      }
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
      <h3 style={{ color: "var(--gray-900)" }}>Select Playlists</h3>
      <button
        type="button"
        className="button-primary"
        onClick={handleRefresh}
        disabled={loading}
        style={{ marginBottom: "1em" }}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      {loading ? (
        <div
          className="PlaylistList-loading"
          role="status"
          aria-live="polite"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75em",
            color: "var(--gray-900)",
            fontWeight: "bold",
            marginTop: "1em",
          }}
        >
          <span
            style={{
              width: "1.2em",
              height: "1.2em",
              border: "3px solid var(--accent)",
              borderTop: "3px solid var(--accent-coral)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              display: "inline-block",
              margin: "0 auto",
            }}
          />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: "2.2em",
                  background: "var(--gray-100)",
                  borderRadius: "8px",
                  margin: "0.2em 0",
                  width: "100%",
                  maxWidth: "320px",
                  boxShadow: "0 1px 4px 0 var(--gray-300)",
                  opacity: 0.7,
                  animation: "pulse 1.2s infinite",
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <span style={{ marginTop: "0.5em" }}>Loading playlists...</span>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
              }
            `}
          </style>
        </div>
      ) : playlists.length === 0 ? (
        <div
          className="PlaylistList-empty"
          style={{ color: "var(--gray-700)" }}
        >
          No writable playlists found.
        </div>
      ) : (
        <>
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Playlist list"
            tabIndex={0}
            style={{
              background: "var(--gray-200)",
              borderRadius: "8px",
              padding: "8px 0",
            }}
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
              className="button-secondary PlaylistList-showMore"
              style={{ marginTop: "1em" }}
              onClick={() => setVisibleCount(visibleCount + 10)}
            >
              Show More
            </button>
          )}
        </>
      )}
    </div>
  );
}
