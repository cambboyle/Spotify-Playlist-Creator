import { useCallback, useState, useEffect } from "react";
import "./App.css";
import Playlist from "../Playlist/Playlist";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Spotify from "../util/Spotify";
import Track from "../Track/Track";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [removingTrackIds, setRemovingTrackIds] = useState([]);

  // Search using Spotify API
  const search = useCallback(async (term) => {
    if (!term) return;
    setError(null);
    setIsLoading(true);
    try {
      const results = await Spotify.search(term);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for token on mount (when Spotify redirects back with token in URL)
  useEffect(() => {
    (async () => {
      try {
        const token = await Spotify.getAccessToken();
        setIsConnected(!!token);
        if (token) {
          setIsLoading(true);
          try {
            const profile = await Spotify.getCurrentUser();
            if (profile && profile.display_name)
              setUserDisplayName(profile.display_name);
          } catch (err) {
            // Detect private/forbidden profile access and display a clearer error
            if (err && err.code === 403) {
              setError(
                "Spotify profile access is restricted. If your account is private or has restricted visibility, make your profile visible or adjust privacy settings."
              );
            } else {
              console.error("Failed to get profile", err);
              setError("Failed to load Spotify profile.");
            }
          } finally {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to parse access token", err);
        setError("Failed to connect to Spotify.");
        setIsLoading(false);
      }
    })();
  }, []);

  const addTrack = useCallback((track) => {
    return new Promise((resolve) => {
      setPlaylistTracks((prevTracks) => {
        if (prevTracks.some((savedTrack) => savedTrack.id === track.id)) {
          resolve(prevTracks);
          return prevTracks;
        }
        const next = [...prevTracks, track];
        resolve(next);
        return next;
      });

      // mark track as removing so it can animate out of search results
      setRemovingTrackIds((prev) => [...prev, track.id]);
      // after animation duration, actually remove from searchResults and clear removing flag
      setTimeout(() => {
        setSearchResults((prevResults) =>
          prevResults.filter((t) => t.id !== track.id)
        );
        setRemovingTrackIds((prev) => prev.filter((id) => id !== track.id));
      }, 260);
    });
  }, []);

  const removeTrack = useCallback((track) => {
    setPlaylistTracks((prevTracks) =>
      prevTracks.filter((currentTrack) => currentTrack.id !== track.id)
    );
    // add back to search results if not already present
    setSearchResults((prevResults) => {
      if (prevResults.some((t) => t.id === track.id)) return prevResults;
      return [track, ...prevResults];
    });
  }, []);

  const updatePlaylistName = useCallback((name) => {
    setPlaylistName(name);
  }, []);

  const savePlaylist = useCallback(() => {
    setError(null);
    setIsLoading(true);
    const trackUris = playlistTracks.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, trackUris)
      .then(() => {
        setPlaylistName("New Playlist");
        setPlaylistTracks([]);
      })
      .catch((err) => {
        console.error("Save playlist failed", err);
        setError("Failed to save playlist.");
      })
      .finally(() => setIsLoading(false));
  }, [playlistName, playlistTracks]);

  return (
    <div>
      <h1>
        Ja<span className="highlight">mmm</span>ing
      </h1>
      <div className="App">
        <SearchBar onSearch={search} />
        <div>
          {isConnected ? (
            <div>
              <div>Connected as {userDisplayName || "Spotify user"}</div>
              <button
                type="button"
                onClick={() => {
                  Spotify.logout();
                  setUserDisplayName(null);
                  setIsConnected(false);
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => Spotify.authorize()}>
              Connect to Spotify
            </button>
          )}
        </div>
        {error && (
          <div className="App-error" role="alert">
            {error}
          </div>
        )}
        <div className="TrackTest">
          <Track />
          <Track />
          <Track />
        </div>
        <div className="App-playlist">
          <SearchResults
            searchResults={searchResults}
            onAdd={addTrack}
            playlistTracks={playlistTracks}
            removingTrackIds={removingTrackIds}
          />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onNameChange={updatePlaylistName}
            onRemove={removeTrack}
            onSave={savePlaylist}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
