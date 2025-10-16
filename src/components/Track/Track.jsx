import React, { useCallback, useEffect, useState } from "react";
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
  isAdded: isAddedProp = false,
}) => {
  const safeTrack = track || defaultTrack;
  const addTrack = useCallback(() => {
    onAdd(track);
  }, [onAdd, track]);

  // local UI state: `added` mirrors parent-provided `isAddedProp` (pessimistic)
  const [added, setAdded] = useState(Boolean(isAddedProp));
  // `pending` is true while we've requested an add but parent hasn't confirmed yet
  const [pending, setPending] = useState(false);

  // sync `added` when parent confirms/unconfirms via prop
  useEffect(() => {
    setAdded(Boolean(isAddedProp));
    // if parent confirmed addition, clear pending
    if (isAddedProp) setPending(false);
  }, [isAddedProp]);

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
    const onClick = async () => {
      // start pending UI immediately
      setPending(true);
      try {
        // call parent add (parent will update `isAdded` prop when done)
        await addTrack();
      } catch (err) {
        // if add failed, clear pending and leave added false
        setPending(false);
        console.error("addTrack failed", err);
      }
    };

    const ariaLabel = added
      ? "Added to playlist"
      : pending
      ? "Adding to playlist"
      : "Add to playlist";

    return (
      <button
        className={`Track-action ${added ? "Track-action--added" : ""} ${
          pending ? "pending" : ""
        }`}
        onClick={onClick}
        aria-pressed={added}
        aria-label={ariaLabel}
      >
        {added ? "✔" : pending ? "…" : "+"}
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

  // mount animation class
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className={`Track ${mounted ? "Track--mounted" : ""}`}>
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
