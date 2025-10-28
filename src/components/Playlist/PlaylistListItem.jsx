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
    >
      <button
        type="button"
        onClick={() => onSelect && onSelect(id)}
        style={
          selected
            ? {
                background: "#e0ffe0",
                fontWeight: "bold",
                border: "2px solid #33cc33",
                outline: "none",
              }
            : {}
        }
      >
        {name} {typeof trackCount === "number" ? `(${trackCount}) Tracks` : ""}
      </button>
    </li>
  );
}
