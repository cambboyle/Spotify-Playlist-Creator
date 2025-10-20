import React from "react";

export default function PlaylistListItem({ id, name, onSelect }) {
  return (
    <li className="PlaylistListItem">
      <button type="button" onClick={() => onSelect && onSelect(id)}>
        {name}
      </button>
    </li>
  );
}
