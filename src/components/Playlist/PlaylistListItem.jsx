import React from "react";

export default function PlaylistListItem({
  id,
  name,
  onSelect,
  trackCount = 0,
}) {
  return (
    <li className="PlaylistListItem">
      <button type="button" onClick={() => onSelect && onSelect(id)}>
        {name} {typeof trackCount === "number" ? `(${trackCount})` : ""}
      </button>
    </li>
  );
}
