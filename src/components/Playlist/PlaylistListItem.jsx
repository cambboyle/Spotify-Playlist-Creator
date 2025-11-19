import React from "react";

/**
 * PlaylistListItem
 * - Renders a playlist item for the listbox.
 * - ARIA: aria-selected is only on the <li role="option"> for accessibility.
 * - Touch target and color contrast handled via CSS.
 */
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
        tabIndex={tabIndex}
        style={{
          background: selected ? "var(--accent)" : "transparent",
          color: selected ? "var(--gray-100)" : "var(--gray-900)",
          fontWeight: selected ? "bold" : "normal",
          outline: selected ? "2px solid var(--accent)" : "none",
          border: "none",
          boxShadow: selected ? "0 0 0 2px var(--accent)" : "none",
          transition: "background 0.2s, color 0.2s, outline 0.2s",
        }}
      >
        {name} {typeof trackCount === "number" ? `(${trackCount}) Tracks` : ""}
      </button>
    </li>
  );
}
