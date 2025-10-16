import Tracklist from "../TrackList/Tracklist";

const SearchResults = (props) => {
  return (
    <div>
      <h2>Results</h2>
      <Tracklist
        tracks={props.searchResults}
        onAdd={props.onAdd}
        playlistTracks={props.playlistTracks}
      />
    </div>
  );
};

export default SearchResults;
