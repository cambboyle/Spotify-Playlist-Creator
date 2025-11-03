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
          <li
            key={track.id}
            className="Tracklist-row"
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--color-card-bg)",
              borderRadius: "16px",
              border: "2px solid var(--color-stroke)",
              marginBottom: "18px",
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(245, 130, 174, 0.04)",
              transition:
                "box-shadow 0.22s, border-color 0.22s, transform 0.18s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow =
                "0 6px 32px rgba(245, 130, 174, 0.10)";
              e.currentTarget.style.borderColor = "var(--color-button)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(245, 130, 174, 0.04)";
              e.currentTarget.style.borderColor = "var(--color-stroke)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
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
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                objectFit: "cover",
                background: "var(--color-background)",
                border: "2px solid var(--color-stroke)",
                marginRight: "18px",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  color: "var(--color-headline)",
                  fontSize: "1.08rem",
                  marginBottom: "2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "'Inter', 'Nunito', Arial, sans-serif",
                }}
              >
                {track.name}
              </span>
              <span
                style={{
                  fontSize: "0.98rem",
                  color: "var(--color-paragraph)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "'Inter', 'Nunito', Arial, sans-serif",
                }}
              >
                {track.artist} &mdash; {track.album}
              </span>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Track
                track={track}
                isAdded={isAdded}
                isRemoval={props.isRemoval}
                onAdd={props.onAdd}
                onRemove={props.onRemove}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default Tracklist;
