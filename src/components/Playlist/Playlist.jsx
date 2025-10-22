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
    [onNameChange]
  );

  const total = (props.playlistTracks || []).length;
  const lastPage = Math.max(1, Math.ceil(total / shown));
  const startIdx = total === 0 ? 0 : shown * (page - 1) + 1;
  const endIdx = Math.min(page * shown, total);

  const displayedTracks = (props.playlistTracks || []).slice(
    (page - 1) * shown,
    page * shown
  );

  return (
    <div className="Playlist">
      <input value={props.playlistName} onChange={handleNameChange} />

      <div className="Playlist-pagination" style={{ marginBottom: "0.5rem" }}>
        <div style={{ marginBottom: "0.25rem" }}>
          <button disabled={page <= 1} onClick={() => setPage(1)}>
            First
          </button>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span style={{ margin: "0 0.5rem" }}>
            Page {page} of {lastPage}
          </span>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
          >
            Next
          </button>
          <button disabled={page >= lastPage} onClick={() => setPage(lastPage)}>
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

      <Tracklist
        tracks={displayedTracks}
        isRemoval={true}
        onRemove={props.onRemove}
        playlistTracks={props.playlistTracks}
      />

      <button
        className="playlist-save"
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
