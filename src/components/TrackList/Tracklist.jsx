import Track from "../Track/Track";

const Tracklist = (props) => {
  const tracks = props.tracks || [];

  return (
    <ul
      className="Tracklist"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "32px",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "0",
        boxSizing: "border-box",
        justifyContent: "center",
      }}
    >
      {tracks.map((track, idx) => {
        const isAdded = (props.playlistTracks || []).some(
          (t) => t.id === track.id,
        );
        return (
          <li
            key={track.id}
            style={{
              background: "var(--color-card-bg)",
              borderRadius: "18px",
              border: "2px solid var(--color-stroke)",
              boxShadow: "0 2px 8px rgba(245, 130, 174, 0.04)",
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
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
