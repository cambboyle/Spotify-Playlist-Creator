import Track from "../Track/Track";

const Tracklist = (props) => {
  const tracks = props.tracks || [];

  return (
    <div className="Tracklist">
      {tracks.map((track) => {
        return (
          <Track
            track={track}
            key={track.id}
            onAdd={props.onAdd}
            isRemoval={props.isRemoval}
            onRemove={props.onRemove}
          />
        );
      })}
    </div>
  );
};

export default Tracklist;
