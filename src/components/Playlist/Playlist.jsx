import { useCallback, useState, useEffect } from "react";
import Tracklist from "../TrackList/Tracklist";

const Playlist = (props) => {
  const {
    onNameChange,
    isLoading,
    playlistTracks,
    onRemove,
    playlistName,
    onSave,
  } = props;
  const [shown, setShown] = useState(50);
  const [page, setPage] = useState(1);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [tracks, setTracks] = useState(playlistTracks || []);

  // Reset pagination and tracks when playlistTracks changes
  useEffect(() => {
    setPage(1);
    setTracks(playlistTracks || []);
  }, [playlistTracks]);

  // Drag and drop handlers
  const handleDragStart = (idx) => setDraggedIdx(idx);
  const handleDragEnter = (idx) => {
    if (draggedIdx === null || draggedIdx === idx) return;
    const updated = [...tracks];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(idx, 0, removed);
    setTracks(updated);
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => {
    setDraggedIdx(null);
    // Update parent playlistTracks order
    if (
      JSON.stringify(tracks.map((t) => t.id)) !==
      JSON.stringify((playlistTracks || []).map((t) => t.id))
    ) {
      if (props.onReorder) props.onReorder(tracks);
    }
  };

  const handleNameChange = useCallback(
    (event) => {
      onNameChange(event.target.value);
    },
    [onNameChange],
  );

  const total = tracks.length;
  const lastPage = Math.max(1, Math.ceil(total / shown));
  const startIdx = total === 0 ? 0 : shown * (page - 1) + 1;
  const endIdx = Math.min(page * shown, total);

  const displayedTracks = tracks.slice((page - 1) * shown, page * shown);

  return (
    <div className="Playlist">
      <label
        htmlFor="playlist-name-input"
        style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}
      >
        Playlist Name
      </label>
      <input
        id="playlist-name-input"
        className="input-primary"
        value={props.playlistName}
        onChange={handleNameChange}
        style={{
          background: "var(--gray-100)",
          color: "var(--gray-900)",
          border: "1px solid var(--accent)",
          borderRadius: "6px",
          padding: "8px",
          fontSize: "1rem",
          marginBottom: "8px",
          transition: "border 0.2s",
        }}
        onFocus={(e) => (e.target.style.border = "2px solid var(--accent)")}
        onBlur={(e) => (e.target.style.border = "1px solid var(--accent)")}
        aria-label="Playlist Name"
      />

      <div className="Playlist-pagination" style={{ marginBottom: "0.5rem" }}>
        <div style={{ marginBottom: "0.25rem" }}>
          <button
            className="button-secondary"
            disabled={page <= 1}
            onClick={() => setPage(1)}
          >
            First
          </button>
          <button
            className="button-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span style={{ margin: "0 0.5rem" }}>
            Page {page} of {lastPage}
          </span>
          <button
            className="button-secondary"
            disabled={page >= lastPage}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
          >
            Next
          </button>
          <button
            className="button-secondary"
            disabled={page >= lastPage}
            onClick={() => setPage(lastPage)}
          >
            Last
          </button>
        </div>

        <div>
          <label htmlFor="playlist-shown">Per page: </label>
          <select
            id="playlist-shown"
            value={shown}
            onChange={(e) => {
              setShown(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span style={{ marginLeft: "1rem" }}>
            {total === 0
              ? "No tracks"
              : `Showing ${startIdx}–${endIdx} of ${total} tracks`}
          </span>
        </div>
      </div>

      <div
        className="PlaylistTracklist-header"
        style={{
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            color: "var(--accent)",
            fontSize: "1.1rem",
          }}
        >
          Tracks in Playlist ({displayedTracks.length})
        </span>
      </div>
      <ul className="PlaylistTracklist">
        {props.isLoading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <li
                key={`skeleton-${idx}`}
                className="PlaylistTracklist-row"
                style={{
                  borderBottom: idx < 4 ? "1px solid var(--gray-400)" : "none",
                  paddingBottom: "8px",
                  paddingTop: "8px",
                  alignItems: "center",
                  display: "flex",
                  opacity: 0.7,
                }}
                aria-hidden="true"
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    marginRight: "14px",
                    background: "var(--gray-300)",
                    border: "1px solid var(--gray-400)",
                    flexShrink: 0,
                    animation: "pulse 1.2s infinite",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      height: "16px",
                      width: "60%",
                      background: "var(--gray-200)",
                      borderRadius: "4px",
                      marginBottom: "6px",
                      animation: "pulse 1.2s infinite",
                    }}
                  />
                  <div
                    style={{
                      height: "12px",
                      width: "40%",
                      background: "var(--gray-100)",
                      borderRadius: "4px",
                      animation: "pulse 1.2s infinite",
                    }}
                  />
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    background: "var(--gray-200)",
                    border: "2px solid var(--accent)",
                    animation: "pulse 1.2s infinite",
                  }}
                />
              </li>
            ))
          : displayedTracks.map((track, idx) => (
              <li
                key={track.id}
                className="PlaylistTracklist-row"
                style={{
                  borderBottom:
                    idx < displayedTracks.length - 1
                      ? "1px solid var(--gray-400)"
                      : "none",
                  paddingBottom: "8px",
                  paddingTop: "8px",
                  alignItems: "center",
                  display: "flex",
                  background:
                    draggedIdx === idx ? "var(--color-peach)" : undefined,
                  opacity: draggedIdx === idx ? 0.7 : 1,
                  transition: "background 0.2s, opacity 0.2s",
                }}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                tabIndex={0}
                aria-grabbed={draggedIdx === idx}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" && idx > 0) {
                    const updated = [...tracks];
                    [updated[idx - 1], updated[idx]] = [
                      updated[idx],
                      updated[idx - 1],
                    ];
                    setTracks(updated);
                    if (props.onReorder) props.onReorder(updated);
                    // Move focus to the new position
                    setTimeout(() => {
                      const list = document.querySelectorAll(
                        ".PlaylistTracklist-row",
                      );
                      if (list[idx - 1]) list[idx - 1].focus();
                    }, 0);
                    e.preventDefault();
                  }
                  if (e.key === "ArrowDown" && idx < tracks.length - 1) {
                    const updated = [...tracks];
                    [updated[idx], updated[idx + 1]] = [
                      updated[idx + 1],
                      updated[idx],
                    ];
                    setTracks(updated);
                    if (props.onReorder) props.onReorder(updated);
                    setTimeout(() => {
                      const list = document.querySelectorAll(
                        ".PlaylistTracklist-row",
                      );
                      if (list[idx + 1]) list[idx + 1].focus();
                    }, 0);
                    e.preventDefault();
                  }
                }}
              >
                <span
                  className="PlaylistTracklist-draghandle"
                  style={{
                    cursor: "grab",
                    marginRight: "10px",
                    fontSize: "1.3em",
                    color: "var(--accent)",
                    userSelect: "none",
                  }}
                  title="Drag to reorder"
                  aria-label="Drag to reorder"
                >
                  &#x2630;
                </span>
                <img
                  src={
                    track.albumImages?.[2]?.url ||
                    track.albumImages?.[1]?.url ||
                    track.albumImages?.[0]?.url ||
                    (track.album && track.album.images && track.album.images[2]
                      ? track.album.images[2].url
                      : null)
                  }
                  alt={`${track.name} album art`}
                  className="PlaylistTracklist-img"
                  width={48}
                  height={48}
                  style={{
                    borderRadius: "8px",
                    marginRight: "14px",
                    objectFit: "cover",
                    background: "var(--gray-400)",
                    border: "1px solid var(--gray-400)",
                    flexShrink: 0,
                  }}
                />
                <div
                  className="PlaylistTracklist-info"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <div
                    className="PlaylistTracklist-title"
                    style={{
                      fontWeight: "bold",
                      color: "var(--gray-900)",
                      fontSize: "1rem",
                      marginBottom: "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {track.name}
                  </div>
                  <div
                    className="PlaylistTracklist-meta"
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--gray-700)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <span>{track.artist}</span> &mdash;{" "}
                    <span>{track.album}</span>
                  </div>
                </div>
                <button
                  className="PlaylistTracklist-action button-secondary"
                  onClick={() => onRemove(track)}
                  aria-label={`Remove ${track.name} from playlist`}
                  style={{
                    marginLeft: "auto",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    border: "2px solid var(--accent)",
                    background: "var(--gray-200)",
                    color: "var(--accent)",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s, border 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "var(--accent)";
                    e.currentTarget.style.color = "var(--gray-100)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "var(--gray-200)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                >
                  &minus;
                </button>
              </li>
            ))}
      </ul>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
        `}
      </style>

      <button
        className="button-primary playlist-save"
        onClick={props.onSave}
        disabled={
          isLoading ||
          !props.playlistTracks ||
          props.playlistTracks.length === 0
        }
      >
        {isLoading ? "Saving..." : "Save to Spotify"}
      </button>
    </div>
  );
};

export default Playlist;
