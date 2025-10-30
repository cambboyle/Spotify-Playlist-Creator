import Track from "../Track/Track";

const Tracklist = (props) => {
  const tracks = props.tracks || [];

  return (
    <div className="Tracklist">
      {tracks.map((track) => {
        const isAdded = (props.playlistTracks || []).some(
          (t) => t.id === track.id,
        );
        return (
          <Track
            track={track}
            key={track.id}
            onAdd={props.onAdd}
            isRemoval={props.isRemoval}
            onRemove={props.onRemove}
            isAdded={isAdded}
          />
        );
      })}
    </div>
  );
};

export default Tracklist;
