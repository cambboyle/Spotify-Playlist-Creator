import { useState, useCallback, useRef } from "react";

const SearchBar = (props) => {
  const { isLoading } = props;
  const [term, setTerm] = useState("");
  const debounceRef = useRef(null);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      setTerm(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (props.onSearch) props.onSearch(value.trim());
      }, 400);
    },
    [props],
  );

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (props.onSearch) props.onSearch(term.trim());
    },
    [props, term],
  );

  return (
    <div className="SearchBar-container">
      <form className="SearchBar-form" onSubmit={handleSearch}>
        <label htmlFor="search-input" className="visually-hidden">
          Search
        </label>
        <div className="SearchBar-row">
          <input
            id="search-input"
            type="search"
            className="input-primary SearchBar-input"
            placeholder="Search for a track"
            value={term}
            onChange={handleChange}
            aria-label="Search"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="button-primary SearchBar-button"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Search"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
