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
        className={selected ? "button-primary" : "button-secondary"}
        onClick={() => onSelect && onSelect(id)}
      >
        {name} {typeof trackCount === "number" ? `(${trackCount}) Tracks` : ""}
      </button>
    </li>
  );
}
