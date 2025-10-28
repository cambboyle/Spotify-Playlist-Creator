import React from "react";

export default function PlaylistListItem({
  id,
  name,
  onSelect,
  trackCount = 0,
  selected = false,
}) {
  return (
    <li
      className={`PlaylistListItem${selected ? " PlaylistListItem--selected" : ""}`}
      style={selected ? { background: "#e0ffe0", fontWeight: "bold" } : {}}
    >
      <button type="button" onClick={() => onSelect && onSelect(id)}>
        {name} {typeof trackCount === "number" ? `(${trackCount}) Tracks` : ""}
      </button>
    </li>
  );
}
