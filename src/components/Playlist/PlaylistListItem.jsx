import React from "react";

export default function PlaylistListItem({
  id,
  name,
  onSelect,
  trackCount = 0,
  selected = false,
  ariaSelected = false,
  tabIndex = -1,
}) {
  return (
    <li
      className={`PlaylistListItem${selected ? " PlaylistListItem--selected" : ""}`}
      role="option"
      aria-selected={ariaSelected}
    >
      <button
        type="button"
        onClick={() => onSelect && onSelect(id)}
        style={{
          background: selected ? "#007a4d" : undefined, // darker green for better contrast
          color: selected ? "#fff" : undefined,
          fontWeight: selected ? "bold" : undefined,
          border: selected ? "2px solid #33cc33" : undefined,
          outline: selected ? "2px solid #33cc33" : undefined,
          boxShadow: selected ? "0 0 0 2px #33cc33" : undefined,
        }}
      >
        {name} {typeof trackCount === "number" ? `(${trackCount}) Tracks` : ""}
      </button>
    </li>
  );
}
