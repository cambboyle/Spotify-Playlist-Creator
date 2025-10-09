import React, { useCallback } from "react";

const Track = (props) => {
  const { onAdd, onRemove, track, isRemoval } = props;

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
    track.image ||
    (track.albumImages && track.albumImages[0]?.url) ||
    (track.album && track.album.images && track.album.images[0]
      ? track.album.images[0].url
      : null);

  return (
    <div className="Track">
      <div className="Track-information">
        <h3>{props.track.name}</h3>
        <p>
          {props.track.artist} | {props.track.album}
        </p>
        {imageUrl ? (
          <img src={imageUrl} alt={`${track.name} album art`} />
        ) : null}
      </div>
      {renderAction()}
    </div>
  );
};

export default Track;
