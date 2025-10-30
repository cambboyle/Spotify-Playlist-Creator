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
        className={`PlaylistListItem-btn ${selected ? "button-primary" : "button-secondary"}`}
        onClick={() => onSelect && onSelect(id)}
        style={{
          background: selected ? "var(--accent)" : "transparent",
          color: selected ? "var(--gray-100)" : "var(--gray-900)",
          fontWeight: selected ? "bold" : "normal",
          outline: selected ? "2px solid var(--accent)" : "none",
          border: "none",
          boxShadow: selected ? "0 0 0 2px var(--accent)" : "none",
          transition: "background 0.2s, color 0.2s, outline 0.2s",
        }}
        aria-selected={selected}
      >
        {name} {typeof trackCount === "number" ? `(${trackCount}) Tracks` : ""}
      </button>
    </li>
  );
}
