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
      url: "https://placehold.co/300",
    },
  ],
};

const Track = ({
  onAdd = () => {},
  onRemove = () => {},
  track = defaultTrack,
  isRemoval = false,
}) => {
  const safeTrack = track || defaultTrack;
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
    safeTrack?.image300 ||
    safeTrack?.image ||
    safeTrack?.albumImages?.[0]?.url ||
    (safeTrack?.album && safeTrack.album.images && safeTrack.album.images[0]
      ? safeTrack.album.images[0].url
      : null);

  return (
    <div className="Track">
      <div className="Track-information">
        <h3>{safeTrack?.name}</h3>
        <div className="Image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${safeTrack?.name} album art`}
              className="Track-img"
            />
          ) : null}
          {renderAction()}
        </div>

        <p>
          <strong>{safeTrack?.artist}</strong> <br /> {safeTrack?.album}
        </p>
      </div>
    </div>
  );
};

export default Track;
