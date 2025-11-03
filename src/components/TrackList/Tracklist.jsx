import Track from "../Track/Track";

const Tracklist = (props) => {
  const tracks = props.tracks || [];

  return (
    <ul className="Tracklist">
      {tracks.map((track, idx) => {
        const isAdded = (props.playlistTracks || []).some(
          (t) => t.id === track.id,
        );
        return (
          <li key={track.id} style={{ listStyle: "none" }}>
            <Track
              track={track}
              isAdded={isAdded}
              isRemoval={props.isRemoval}
              onAdd={props.onAdd}
              onRemove={props.onRemove}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default Tracklist;
