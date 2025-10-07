import { useCallback } from "react";
import Tracklist from "../TrackList/Tracklist";

const Playlist = (props) => {
  const { onNameChange, isLoading } = props;

  const handleNameChange = useCallback(
    (event) => {
      onNameChange(event.target.value);
    },
    [onNameChange]
  );
  return (
    <div className="Playlist">
      <input value={props.playlistName} onChange={handleNameChange} />
      <Tracklist
        tracks={props.playlistTracks}
        isRemoval={true}
        onRemove={props.onRemove}
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
