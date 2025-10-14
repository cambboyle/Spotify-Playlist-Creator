import React, { useCallback } from "react";
import "./Track.css";

const defaultTrack = {
  id: "placeholder-1",
  name: "Placeholder Track",
  artist: "Placeholder Artist",
  album: "Placeholder Album",
  image: null,
  albumImages: [
    {
      url: "https://placehold.co/150",
    },
  ],
};

const Track = ({
  onAdd = () => {},
  onRemove = () => {},
  track = defaultTrack,
  isRemoval = false,
}) => {
  const addTrack = useCallback(() => {
    onAdd(track);
  }, [onAdd, track]);

  const removeTrack = useCallback(() => {
    onRemove(track);
  }, [onRemove, track]);

  const renderAction = () => {
    if (isRemoval) {
      return (
        <button className="Track-action" onClick={removeTrack}>
          -
        </button>
      );
    }
    return (
      <button className="Track-action" onClick={addTrack}>
        +
      </button>
    );
  };

  const imageUrl =
    track?.image ||
    track?.albumImages?.[0]?.url ||
    (track?.album && track.album.images && track.album.images[0]
      ? track.album.images[0].url
      : null);

  return (
    <div className="Track">
      <div className="Track-information">
        <h3>{track?.name}</h3>
        <div className="Image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${track?.name} album art`}
              className="Track-img"
            />
          ) : null}
          {renderAction()}
        </div>

        <p>
          <strong>{track?.artist}</strong> <br /> {track?.album}
        </p>
      </div>
    </div>
  );
};

export default Track;
