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
    <form onSubmit={handleSearch}>
      <label htmlFor="search-input" className="visually-hidden">
        Search
      </label>
      <input
        id="search-input"
        type="search"
        className="input-primary"
        placeholder="Search for a track"
        value={term}
        onChange={handleChange}
        aria-label="Search"
        disabled={isLoading}
      />
      <button type="submit" className="button-primary" disabled={isLoading}>
        {isLoading ? "Loading..." : "Search"}
      </button>
    </form>
  );
};

export default SearchBar;
