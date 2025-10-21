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

  // Calculate start/end indices for current page
  const total = searchResults?.total || 0;
  const startIdx = total === 0 ? 0 : shown * (page - 1) + 1;
  const endIdx = Math.min(page * shown, total);
  const lastPage = Math.max(1, Math.ceil(total / shown));

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
          {total === 0
            ? "No results"
            : `Showing ${startIdx}–${endIdx} of ${total} results`}
        </span>
      </div>
      <div style={{ marginBottom: "0.5em" }}>
        <button
          disabled={isLoading || page <= 1}
          onClick={() => handlePageChange(1)}
        >
          First
        </button>
        <button
          disabled={isLoading || page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </button>
        <span style={{ margin: "0 1em" }}>
          Page {page} of {lastPage}
        </span>
        <button
          disabled={isLoading || page >= lastPage}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>
        <button
          disabled={isLoading || page >= lastPage}
          onClick={() => handlePageChange(lastPage)}
        >
          Last
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
