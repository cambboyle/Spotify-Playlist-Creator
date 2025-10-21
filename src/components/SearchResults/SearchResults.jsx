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
  const [page, setPage] = useState(1);

  const handleShowMore = (count) => {
    setShown(count);
    setPage(1);
    if (onSearch && searchTerm) {
      onSearch(searchTerm, count, 0);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (onSearch && searchTerm) {
      onSearch(searchTerm, shown, (newPage - 1) * shown);
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
          Showing {searchResults?.items?.length || 0} of {searchResults?.total || 0} results
        </span>
      </div>
      <div style={{ marginBottom: "0.5em" }}>
        <button
          disabled={isLoading || page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </button>
        <span style={{ margin: "0 1em" }}>
          Page {page} of {Math.max(1, Math.ceil((searchResults?.total || 0) / shown))}
        </span>
        <button
          disabled={
            isLoading ||
            page >= Math.ceil((searchResults?.total || 0) / shown)
          }
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>
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
