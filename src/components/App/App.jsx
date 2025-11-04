import { useCallback, useState, useEffect, useRef } from "react";
import "./App.css";
import Playlist from "../Playlist/Playlist";
import PlaylistList from "../Playlist/PlaylistList";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Spotify from "../util/Spotify";
import Track from "../Track/Track";
import ConfirmModal from "../Common/ConfirmModal";

function App() {
  const [searchResults, setSearchResults] = useState({ items: [], total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTotal, setSearchTotal] = useState(0);
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

  // In-memory search result cache
  const searchCacheRef = useRef({});

  // Search using Spotify API with in-memory caching
  // search(term, limit, offset)
  const search = useCallback(
    async (term, limit = 10, offset = 0) => {
      if (!term) return;
      setError(null);
      setIsLoading(true);
      setSearchTerm(term);

      // Cache key: term|limit|offset
      const cacheKey = `${term}|${limit}|${offset}`;
      const cache = searchCacheRef.current;

      if (cache[cacheKey]) {
        const results = cache[cacheKey];
        if (offset === 0) {
          setSearchTotal(results.total);
          setSearchResults(results);
        } else {
          setSearchResults({ items: results.items, total: searchTotal });
        }
        setIsLoading(false);
        return;
      }

      try {
        const results = await Spotify.search(term, limit, offset);
        // If this is a new search term (offset === 0), update total
        if (offset === 0) {
          setSearchTotal(results.total);
          setSearchResults(results);
        } else {
          // For paging, keep the original total
          setSearchResults({ items: results.items, total: searchTotal });
        }
      } catch (err) {
        console.error("Search failed", err);
        // Enhanced error messaging for rate-limit and server errors
        if (err && err.response && err.response.status === 429) {
          setError(
            "You are being rate-limited by Spotify (429). Please wait a moment and try again.",
          );
        } else if (
          err &&
          err.response &&
          err.response.status >= 500 &&
          err.response.status < 600
        ) {
          setError("Spotify server error (5xx). Please try again later.");
        } else {
          setError("Search failed. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [searchTotal],
  );

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
            // Store profile for photo
            Spotify.profile = profile;
          } catch (err) {
            // Detect private/forbidden profile access and display a clearer error
            if (err && err.code === 403) {
              setError(
                "Spotify profile access is restricted. If your account is private or has restricted visibility, make your profile visible or adjust privacy settings.",
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
      prevTracks.filter((currentTrack) => currentTrack.id !== track.id),
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
        // Enhanced error messaging for rate-limit and server errors
        if (err && err.response && err.response.status === 429) {
          setError(
            "You are being rate-limited by Spotify (429). Please wait a moment and try again.",
          );
        } else if (
          err &&
          err.response &&
          err.response.status >= 500 &&
          err.response.status < 600
        ) {
          setError("Spotify server error (5xx). Please try again later.");
        } else {
          setError("Failed to save playlist.");
        }
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
      // Enhanced error messaging for rate-limit and server errors
      if (err && err.response && err.response.status === 429) {
        setError(
          "You are being rate-limited by Spotify (429). Please wait a moment and try again.",
        );
      } else if (
        err &&
        err.response &&
        err.response.status >= 500 &&
        err.response.status < 600
      ) {
        setError("Spotify server error (5xx). Please try again later.");
      } else {
        setError("Failed to load selected playlist.");
      }
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
    [isDirty, selectPlaylist],
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

  // Track Preview toggle state
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="AppLayout">
      <header
        className="AppHeader"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
        }}
      >
        <div
          className="AppHeader-left"
          style={{ display: "flex", alignItems: "center" }}
        >
          <h1 style={{ marginTop: "25px" }}>Crate</h1>
        </div>
        <div
          className="AppHeader-right"
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "25px",
            gap: "18px",
          }}
        >
          {isConnected ? (
            <>
              {Spotify.profile &&
                Spotify.profile.images &&
                Spotify.profile.images.length > 0 && (
                  <img
                    src={Spotify.profile.images[0].url}
                    alt="Profile"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid var(--color-button)",
                      objectFit: "cover",
                    }}
                  />
                )}
              <span
                className="AppHeader-userName"
                style={{ fontWeight: "bold" }}
              >
                {userDisplayName || "Spotify user"}
              </span>
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  Spotify.logout();
                  setUserDisplayName(null);
                  setIsConnected(false);
                }}
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              className="button-primary"
              onClick={() => Spotify.authorize()}
            >
              Connect to Spotify
            </button>
          )}
        </div>
      </header>
      <main className="AppMain">
        <section className="AppSection AppSection--search">
          <SearchBar onSearch={search} />
        </section>
        {error && (
          <div className="App-error" role="alert">
            {error}
          </div>
        )}
        <button
          className="button-secondary"
          onClick={() => setShowPreview((prev) => !prev)}
          style={{ marginBottom: "1em" }}
        >
          {showPreview ? "Hide Track Preview" : "Show Track Preview"}
        </button>
        {showPreview && (
          <section className="AppSection AppSection--tracks">
            <h2 className="AppSection-title">Track Preview</h2>
            <div className="TrackTest">
              <Track />
              <Track />
              <Track />
            </div>
          </section>
        )}
        <section className="AppSection AppSection--results">
          <h2 className="AppSection-title">Search Results</h2>
          <SearchResults
            searchTerm={searchTerm}
            onSearch={search}
            searchResults={searchResults}
            onAdd={addTrack}
            playlistTracks={playlistTracks}
            isLoading={isLoading}
          />
        </section>
        <section className="AppSection AppSection--playlist">
          <div className="App-playlistGrid">
            <div className="App-playlistList">
              <h2 className="AppSection-title">Your Playlists</h2>
              <PlaylistList onSelect={attemptSelectPlaylist} />
            </div>
            <div className="App-playlistContent">
              <h2 className="AppSection-title">Playlist Editor</h2>
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
        </section>
        <ConfirmModal
          isOpen={isConfirmOpen}
          title="Discard changes?"
          message="You have unsaved changes. If you continue, your edits will be lost."
          onCancel={handleConfirmCancel}
          onConfirm={handleConfirmContinue}
        />
      </main>
      <footer className="AppFooter">
        © 2024 Crate &mdash; Built with React & Spotify API
      </footer>
    </div>
  );
}

export default App;
