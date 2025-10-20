import { useCallback, useState, useEffect } from "react";
import "./App.css";
import Playlist from "../Playlist/Playlist";
import PlaylistList from "../Playlist/PlaylistList";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Spotify from "../util/Spotify";
import Track from "../Track/Track";
import ConfirmModal from "../Common/ConfirmModal";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setIsDirty(true);
        resolve(next);
        return next;
      });
    });
  }, []);

  const removeTrack = useCallback((track) => {
    setPlaylistTracks((prevTracks) =>
      prevTracks.filter((currentTrack) => currentTrack.id !== track.id)
    );
    setIsDirty(true);
  }, []);

  const updatePlaylistName = useCallback((name) => {
    setPlaylistName(name);
    setIsDirty(true);
  }, []);

  const savePlaylist = useCallback(() => {
    setError(null);
    setIsLoading(true);
    const trackUris = playlistTracks.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, trackUris, playlistId)
      .then(() => {
        setPlaylistName("New Playlist");
        setPlaylistTracks([]);
        setPlaylistId(null);
        setIsDirty(false);
      })
      .catch((err) => {
        console.error("Save playlist failed", err);
        setError("Failed to save playlist.");
      })
      .finally(() => setIsLoading(false));
  }, [playlistName, playlistTracks, playlistId]);

  const selectPlaylist = useCallback(async (id) => {
    if (!id) return;
    setError(null);
    setIsLoading(true);
    try {
      const result = await Spotify.getPlaylist(id);
      // result: { name, tracks }
      if (result) {
        setPlaylistName(result.name || "");
        setPlaylistTracks(result.tracks || []);
        setPlaylistId(id);
        setIsDirty(false);
      }
    } catch (err) {
      console.error("Failed to load playlist", err);
      setError("Failed to load selected playlist.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Called by PlaylistList when the user clicks a playlist; we check for dirty
  // state and confirm before delegating to selectPlaylist.
  const attemptSelectPlaylist = useCallback(
    (id) => {
      if (!id) return;
      if (isDirty) {
        setPendingSelectId(id);
        setIsConfirmOpen(true);
        return;
      }
      selectPlaylist(id);
    },
    [isDirty, selectPlaylist]
  );

  const handleConfirmCancel = useCallback(() => {
    setPendingSelectId(null);
    setIsConfirmOpen(false);
  }, []);

  const handleConfirmContinue = useCallback(() => {
    const id = pendingSelectId;
    setPendingSelectId(null);
    setIsConfirmOpen(false);
    // Discard local edits and load the Spotify version
    selectPlaylist(id);
  }, [pendingSelectId, selectPlaylist]);

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
          />
          <PlaylistList onSelect={attemptSelectPlaylist} />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onNameChange={updatePlaylistName}
            onRemove={removeTrack}
            onSave={savePlaylist}
            isLoading={isLoading}
          />
          <ConfirmModal
            isOpen={isConfirmOpen}
            title="Discard changes?"
            message="You have unsaved changes. If you continue, your edits will be lost."
            onCancel={handleConfirmCancel}
            onConfirm={handleConfirmContinue}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
