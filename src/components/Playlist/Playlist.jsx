import { useCallback, useState, useEffect } from "react";
import Tracklist from "../TrackList/Tracklist";

const Playlist = (props) => {
  const { onNameChange, isLoading } = props;
  const [shown, setShown] = useState(50);
  const [page, setPage] = useState(1);

  // Reset pagination when playlistTracks changes
  useEffect(() => {
    setPage(1);
  }, [props.playlistTracks]);

  const handleNameChange = useCallback(
    (event) => {
      onNameChange(event.target.value);
    },
    [onNameChange],
  );

  const total = (props.playlistTracks || []).length;
  const lastPage = Math.max(1, Math.ceil(total / shown));
  const startIdx = total === 0 ? 0 : shown * (page - 1) + 1;
  const endIdx = Math.min(page * shown, total);

  const displayedTracks = (props.playlistTracks || []).slice(
    (page - 1) * shown,
    page * shown,
  );

  return (
    <div className="Playlist">
      <input
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

      <ul className="PlaylistTracklist">
        {displayedTracks.map((track) => (
          <li key={track.id} className="PlaylistTracklist-row">
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
                marginRight: "12px",
                objectFit: "cover",
                background: "var(--gray-400)",
                border: "1px solid var(--gray-400)",
              }}
            />
            <div className="PlaylistTracklist-info">
              <div className="PlaylistTracklist-title">{track.name}</div>
              <div className="PlaylistTracklist-meta">
                <span>{track.artist}</span> &mdash; <span>{track.album}</span>
              </div>
            </div>
            <button
              className="Track-action button-secondary"
              onClick={() => props.onRemove(track)}
              aria-label={`Remove ${track.name} from playlist`}
              style={{ marginLeft: "auto" }}
            >
              &minus;
            </button>
          </li>
        ))}
      </ul>

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
