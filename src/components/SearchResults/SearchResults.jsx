import { useState } from "react";
import Tracklist from "../TrackList/Tracklist";

const SearchResults = ({
  searchTerm,
  onSearch,
  searchResults,
  onAdd,
  playlistTracks,
  isLoading,
  error,
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
    <div className="SearchContainer">
      <h2>Results</h2>
      {error && (
        <div
          className="SearchResults-error"
          role="alert"
          style={{ color: "var(--color-error, #c00)", marginBottom: "1em" }}
        >
          {error}
        </div>
      )}
      <div className="SearchResults-show" style={{ marginBottom: "0.5em" }}>
        <button
          className={`button-secondary${shown === 10 ? " button-disabled" : ""}`}
          disabled={isLoading || shown === 10}
          onClick={() => handleShowMore(10)}
        >
          Show 10
        </button>
        <button
          className={`button-secondary${shown === 50 ? " button-disabled" : ""}`}
          disabled={isLoading || shown === 50}
          onClick={() => handleShowMore(50)}
        >
          Show 50
        </button>
        <span className="SearchResults-count" style={{ marginLeft: "1em" }}>
          {total === 0
            ? "No results"
            : `Showing ${startIdx}\u2013${endIdx} of ${total} results`}
        </span>
      </div>
      <div
        className="SearchResults-pagination"
        style={{ marginBottom: "0.5em" }}
      >
        <button
          className={`button-secondary${page <= 1 ? " button-disabled" : ""}`}
          disabled={isLoading || page <= 1}
          onClick={() => handlePageChange(1)}
        >
          First
        </button>
        <button
          className={`button-secondary${page <= 1 ? " button-disabled" : ""}`}
          disabled={isLoading || page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </button>
        <span className="SearchResults-page" style={{ margin: "0 1em" }}>
          Page {page} of {lastPage}
        </span>
        <button
          className={`button-secondary${page >= lastPage ? " button-disabled" : ""}`}
          disabled={isLoading || page >= lastPage}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>
        <button
          className={`button-secondary${page >= lastPage ? " button-disabled" : ""}`}
          disabled={isLoading || page >= lastPage}
          onClick={() => handlePageChange(lastPage)}
        >
          Last
        </button>
      </div>
      {isLoading ? (
        <div
          className="SearchResults-skeleton"
          role="status"
          aria-live="polite"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1em",
            marginTop: "1em",
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                background: "var(--color-background)",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "1em",
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                gap: "0.5em",
                opacity: 0.7,
                border: "1px solid var(--color-main)",
                animation: "pulse 1.2s infinite",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--color-main)",
                  borderRadius: "8px",
                  marginBottom: "0.5em",
                }}
              />
              <div
                style={{
                  height: "1.1em",
                  width: "70%",
                  background: "var(--color-secondary)",
                  borderRadius: "4px",
                }}
              />
              <div
                style={{
                  height: "0.9em",
                  width: "40%",
                  background: "var(--color-peach)",
                  borderRadius: "4px",
                }}
              />
            </div>
          ))}
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 0.7; }
                50% { opacity: 0.4; }
                100% { opacity: 0.7; }
              }
            `}
          </style>
        </div>
      ) : (
        <Tracklist
          tracks={searchResults?.items || []}
          onAdd={onAdd}
          playlistTracks={playlistTracks}
        />
      )}
    </div>
  );
};

export default SearchResults;
