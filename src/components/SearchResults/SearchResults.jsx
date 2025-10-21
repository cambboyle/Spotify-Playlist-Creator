import { useState } from "react";
import Tracklist from "../TrackList/Tracklist";

const SearchResults = ({
  searchTerm,
  onSearch,
  searchResults,
  onAdd,
  playlistTracks,
  isLoading,
}) => {
  // searchResults: { items, total }
  const [shown, setShown] = useState(10);

  const handleShowMore = (count) => {
    setShown(count);
    if (onSearch && searchTerm) {
      onSearch(searchTerm, count, 0);
    }
  };

  return (
    <div>
      <h2>Results</h2>
      <div style={{ marginBottom: "0.5em" }}>
        <button
          disabled={isLoading || shown === 10}
          onClick={() => handleShowMore(10)}
        >
          Show 10
        </button>
        <button
          disabled={isLoading || shown === 50}
          onClick={() => handleShowMore(50)}
        >
          Show 50
        </button>
        <button
          disabled={isLoading || shown === 100}
          onClick={() => handleShowMore(100)}
        >
          Show 100
        </button>
        <span style={{ marginLeft: "1em" }}>
          Showing {searchResults?.items?.length || 0} of{" "}
          {searchResults?.total || 0} results
        </span>
      </div>
      <Tracklist
        tracks={searchResults?.items || []}
        onAdd={onAdd}
        playlistTracks={playlistTracks}
      />
    </div>
  );
};

export default SearchResults;
