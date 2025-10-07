import { useCallback } from "react";
import Tracklist from "../TrackList/Tracklist";

const Playlist = (props) => {
  const { onNameChange } = props;

  const handleNameChange = useCallback(
    (event) => {
      onNameChange(event.target.value);
    },
    [onNameChange]
  );
  return (
    <div className="Playlist">
      <input onChange={handleNameChange} defaultValue={"New Playlist"} />
      <Tracklist
        tracks={props.playlistTracks}
        isRemoval={true}
        onRemove={props.onRemove}
      />
      <button className="playlist-save" onClick={props.onSave}>
        Save to Spotify
      </button>
    </div>
  );
};

export default Playlist;
