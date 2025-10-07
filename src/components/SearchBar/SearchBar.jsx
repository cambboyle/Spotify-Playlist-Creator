import { useState, useCallback } from "react";

const SearchBar = (props) => {
  const [term, setTerm] = useState("");

  const handleChange = useCallback((e) => {
    setTerm(e.target.value);
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (props.onSearch) props.onSearch(term.trim());
    },
    [props, term]
  );

  return (
    <form onSubmit={handleSearch}>
      <input
        type="search"
        placeholder="Search for a track"
        value={term}
        onChange={handleChange}
        aria-label="Search"
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
