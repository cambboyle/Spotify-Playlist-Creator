const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
// Allow overriding redirect URI via environment variable for cases where
// Spotify no longer allows localhost redirects. Set VITE_SPOTIFY_REDIRECT_URI
// in your .env to a secure (https) public URL provided by a tunneling service
// such as ngrok, localtunnel, or Cloudflare Tunnel.
const redirectUri =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI ||
  (typeof window !== "undefined"
    ? `${window.location.origin}/`
    : "http://localhost:3000/");

let accessToken = null;
let refreshToken = null;
let expiresAt = null; // epoch ms
let userId = null; // cached current user id

const STORAGE_KEY = "spotify_pkce_verifier";

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

function generateCodeVerifier() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

async function exchangeCodeForToken(code, codeVerifier) {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("client_id", clientId);
  params.append("code_verifier", codeVerifier);

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed: ${resp.status} ${text}`);
  }

  return await resp.json();
}

async function refreshAccessToken() {
  if (!refreshToken) return null;
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("client_id", clientId);

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!resp.ok) {
    console.warn("Refresh token request failed");
    return null;
  }

  const json = await resp.json();
  accessToken = json.access_token;
  if (json.refresh_token) refreshToken = json.refresh_token;
  const expiresIn = json.expires_in || 3600;
  expiresAt = Date.now() + expiresIn * 1000;
  sessionStorage.setItem("spotify_access_token", accessToken);
  sessionStorage.setItem("spotify_refresh_token", refreshToken || "");
  sessionStorage.setItem("spotify_expires_at", String(expiresAt));

  return accessToken;
}

const Spotify = {
  // Returns access token string or null if not authorized yet
  async getAccessToken() {
    // If already in memory and not expired, return
    if (accessToken && expiresAt && Date.now() < expiresAt - 5000)
      return accessToken;

    // Try to load from sessionStorage
    if (!accessToken) {
      const at = sessionStorage.getItem("spotify_access_token");
      const rt = sessionStorage.getItem("spotify_refresh_token");
      const exp = sessionStorage.getItem("spotify_expires_at");
      if (at && exp && Number(exp) > Date.now()) {
        accessToken = at;
        refreshToken = rt || null;
        expiresAt = Number(exp);
        return accessToken;
      }
      if (rt) {
        refreshToken = rt;
      }
    }

    // If refresh token exists, try refreshing
    if (refreshToken) {
      const newToken = await refreshAccessToken();
      if (newToken) return newToken;
    }

    // Check for authorization code in the URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      const storedVerifier = sessionStorage.getItem(STORAGE_KEY);
      try {
        const tokenResponse = await exchangeCodeForToken(code, storedVerifier);
        accessToken = tokenResponse.access_token;
        refreshToken = tokenResponse.refresh_token || null;
        expiresAt = Date.now() + (tokenResponse.expires_in || 3600) * 1000;
        // Persist tokens in sessionStorage
        sessionStorage.setItem("spotify_access_token", accessToken);
        sessionStorage.setItem("spotify_refresh_token", refreshToken || "");
        sessionStorage.setItem("spotify_expires_at", String(expiresAt));
        // Clean up URL (remove code)
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        return accessToken;
      } catch (err) {
        console.error("Failed to exchange code for token", err);
        return null;
      } finally {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    // Not authorized yet
    return null;
  },

  async authorize() {
    if (!clientId) {
      throw new Error(
        "VITE_SPOTIFY_CLIENT_ID is not set. Register an app at https://developer.spotify.com and set VITE_SPOTIFY_CLIENT_ID in your .env file.",
      );
    }

    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem(STORAGE_KEY, codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    // Request read scopes so we can list private and collaborative playlists
    const scope =
      "playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative";
    const authEndpoint = "https://accounts.spotify.com/authorize";
    const authUrl = `${authEndpoint}?client_id=${encodeURIComponent(
      clientId,
    )}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&code_challenge_method=S256&code_challenge=${encodeURIComponent(
      codeChallenge,
    )}&scope=${encodeURIComponent(scope)}`;

    window.location = authUrl;
  },

  // Search tracks with pagination: limit (default 10), offset (default 0)
  async search(term, limit = 10, offset = 0) {
    const token = await this.getAccessToken();
    if (!token)
      throw new Error(
        "Not authorized. Call authorize() to connect to Spotify.",
      );

    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
        term,
      )}&limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) return { items: [], total: 0 };

    const jsonResponse = await response.json();
    if (!jsonResponse.tracks) return { items: [], total: 0 };

    const items = jsonResponse.tracks.items.map((track) => {
      const images =
        track.album && track.album.images ? track.album.images : [];
      const image640 = images[0] && images[0].url ? images[0].url : null;
      const image300 = images[1] && images[1].url ? images[1].url : null;
      const image64 = images[2] && images[2].url ? images[2].url : null;
      return {
        id: track.id,
        name: track.name,
        artist: track.artists && track.artists[0] ? track.artists[0].name : "",
        album: track.album ? track.album.name : "",
        albumImages: images,
        image640,
        image300,
        image64,
        image:
          image300 ||
          image640 ||
          image64 ||
          (images[0] && images[0].url) ||
          null,
        uri: track.uri,
      };
    });
    return { items, total: jsonResponse.tracks.total || items.length };
  },

  // Helper: fetch with retry/backoff for transient errors
  async fetchWithRetry(url, options, maxRetries = 3, initialDelay = 500) {
    let attempt = 0;
    let delay = initialDelay;
    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, options);
        // Retry on 429 (rate limit) or 5xx server errors
        if (
          response.status === 429 ||
          (response.status >= 500 && response.status < 600)
        ) {
          if (attempt === maxRetries) return response;
          await new Promise((res) => setTimeout(res, delay));
          attempt++;
          delay *= 2; // Exponential backoff
          continue;
        }
        return response;
      } catch (err) {
        if (attempt === maxRetries) throw err;
        await new Promise((res) => setTimeout(res, delay));
        attempt++;
        delay *= 2;
      }
    }
    throw new Error("fetchWithRetry: exceeded max retries");
  },

  // savePlaylist(name, trackUris, onProgress)
  // onProgress: optional callback(progressObj) called after each batch
  async savePlaylist(name, trackUris, onProgress) {
    if (!name) return;

    const token = await this.getAccessToken();
    if (!token)
      throw new Error(
        "Not authorized. Call authorize() to connect to Spotify.",
      );

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const fetchWithRetry = this.fetchWithRetry.bind(this);

    // Get the user's Spotify ID (cached)
    const currentUserId = await this.getCurrentUserId();

    // Helper: split array into chunks
    const chunkArray = (arr, size) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size)
        chunks.push(arr.slice(i, i + size));
      return chunks;
    };

    // If an id is provided, update existing playlist; otherwise create a new one
    const maybeId = arguments[2] || null;

    // Helper to collect batch results
    const batchResults = [];
    let batchIndex = 0;

    if (maybeId) {
      const playlistId = maybeId;

      // Update playlist name
      const patchResponse = await fetchWithRetry(
        `https://api.spotify.com/v1/playlists/${encodeURIComponent(
          playlistId,
        )}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ name }),
        },
      );
      if (patchResponse && !patchResponse.ok)
        throw new Error("Failed to update playlist name");

      // If trackUris is provided, replace/add in batches of 100
      if (Array.isArray(trackUris)) {
        // If empty array, explicitly replace with empty list (clears playlist)
        if (trackUris.length === 0) {
          const clearResp = await fetchWithRetry(
            `https://api.spotify.com/v1/playlists/${encodeURIComponent(
              playlistId,
            )}/tracks`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({ uris: [] }),
            },
          );
          batchResults.push({
            type: "clear",
            uris: [],
            success: clearResp.ok,
            error: clearResp.ok ? null : "Failed to clear playlist tracks",
          });
          if (typeof onProgress === "function") {
            onProgress({
              batchIndex,
              totalBatches: 1,
              type: "clear",
              uris: [],
              success: clearResp.ok,
              error: clearResp.ok ? null : "Failed to clear playlist tracks",
            });
          }
          batchIndex++;
        } else if (trackUris.length <= 100) {
          // Single replace
          const replaceResp = await fetchWithRetry(
            `https://api.spotify.com/v1/playlists/${encodeURIComponent(
              playlistId,
            )}/tracks`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({ uris: trackUris }),
            },
          );
          batchResults.push({
            type: "replace",
            uris: trackUris,
            success: replaceResp.ok,
            error: replaceResp.ok ? null : "Failed to replace playlist tracks",
          });
          if (typeof onProgress === "function") {
            onProgress({
              batchIndex,
              totalBatches: 1,
              type: "replace",
              uris: trackUris,
              success: replaceResp.ok,
              error: replaceResp.ok
                ? null
                : "Failed to replace playlist tracks",
            });
          }
          batchIndex++;
        } else {
          // Replace first 100, then append remaining in POST batches
          const first = trackUris.slice(0, 100);
          const replaceResp = await fetchWithRetry(
            `https://api.spotify.com/v1/playlists/${encodeURIComponent(
              playlistId,
            )}/tracks`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({ uris: first }),
            },
          );
          batchResults.push({
            type: "replace",
            uris: first,
            success: replaceResp.ok,
            error: replaceResp.ok
              ? null
              : "Failed to replace playlist tracks (initial chunk)",
          });
          if (typeof onProgress === "function") {
            onProgress({
              batchIndex,
              totalBatches: 1 + chunks.length,
              type: "replace",
              uris: first,
              success: replaceResp.ok,
              error: replaceResp.ok
                ? null
                : "Failed to replace playlist tracks (initial chunk)",
            });
          }
          batchIndex++;

          const remaining = trackUris.slice(100);
          const chunks = chunkArray(remaining, 100);
          for (const chunk of chunks) {
            const addResp = await fetchWithRetry(
              `https://api.spotify.com/v1/playlists/${encodeURIComponent(
                playlistId,
              )}/tracks`,
              {
                method: "POST",
                headers,
                body: JSON.stringify({ uris: chunk }),
              },
            );
            batchResults.push({
              type: "append",
              uris: chunk,
              success: addResp.ok,
              error: addResp.ok ? null : "Failed to append playlist tracks",
            });
            if (typeof onProgress === "function") {
              onProgress({
                batchIndex,
                totalBatches: 1 + chunks.length,
                type: "append",
                uris: chunk,
                success: addResp.ok,
                error: addResp.ok ? null : "Failed to append playlist tracks",
              });
            }
            batchIndex++;
          }
        }
      }

      // If all batches failed, throw error
      if (batchResults.length > 0 && batchResults.every((r) => !r.success)) {
        throw new Error("All playlist track batches failed");
      }

      return { id: playlistId, batchResults };
    }

    // Create a new playlist
    const createResponse = await fetchWithRetry(
      `https://api.spotify.com/v1/users/${encodeURIComponent(
        currentUserId,
      )}/playlists`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ name }),
      },
    );
    if (!createResponse.ok) throw new Error("Failed to create playlist");
    const createJson = await createResponse.json();
    const playlistId = createJson.id;

    // Add tracks to the playlist in batches of 100
    if (Array.isArray(trackUris) && trackUris.length > 0) {
      const chunks = chunkArray(trackUris, 100);
      for (const chunk of chunks) {
        const addResponse = await fetchWithRetry(
          `https://api.spotify.com/v1/playlists/${encodeURIComponent(
            playlistId,
          )}/tracks`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ uris: chunk }),
          },
        );
        batchResults.push({
          type: "append",
          uris: chunk,
          success: addResponse.ok,
          error: addResponse.ok ? null : "Failed to add tracks to playlist",
        });
        if (typeof onProgress === "function") {
          onProgress({
            batchIndex,
            totalBatches: chunks.length,
            type: "append",
            uris: chunk,
            success: addResponse.ok,
            error: addResponse.ok ? null : "Failed to add tracks to playlist",
          });
        }
        batchIndex++;
      }
      if (batchResults.length > 0 && batchResults.every((r) => !r.success)) {
        throw new Error("All playlist track batches failed");
      }
    }

    return { id: playlistId, batchResults };
  },

  // Return cached current user's id (string)
  async getCurrentUserId() {
    if (userId) return userId;
    const profile = await this.getCurrentUser();
    if (!profile || !profile.id)
      throw new Error("Failed to get current user id");
    userId = profile.id;
    return userId;
  },

  // Retrieve all of the current user's playlists (id + name only), paginated
  async getUserPlaylists() {
    const token = await this.getAccessToken();
    if (!token)
      throw new Error(
        "Not authorized. Call authorize() to connect to Spotify.",
      );
    // Use /me/playlists to return playlists for the current user (owned and followed)
    let url = `https://api.spotify.com/v1/me/playlists?limit=50`;
    let allItems = [];
    while (url) {
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to fetch user playlists");
      const json = await resp.json();
      if (json.items && Array.isArray(json.items)) {
        allItems = allItems.concat(
          // include track count so UI can display size without extra calls
          // also include owner id and collaborative flag so callers can
          // filter to playlists the current user can write to.
          json.items.map((p) => ({
            id: p.id,
            name: p.name,
            trackCount:
              p.tracks && typeof p.tracks.total === "number"
                ? p.tracks.total
                : 0,
            ownerId: p.owner && p.owner.id ? p.owner.id : null,
            collaborative: !!p.collaborative,
            public: typeof p.public === "boolean" ? p.public : null,
          })),
        );
      }
      url = json.next;
    }
    return allItems;
  },

  // Retrieve playlist metadata and all tracks for a playlist id (paginated)
  // Returns an object: { name: string, tracks: Array<Track> }
  async getPlaylist(playlistId) {
    const token = await this.getAccessToken();
    if (!token)
      throw new Error(
        "Not authorized. Call authorize() to connect to Spotify.",
      );

    // Fetch playlist details (to obtain name)
    const metaResp = await fetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!metaResp.ok) throw new Error("Failed to fetch playlist metadata");
    const metaJson = await metaResp.json();
    const playlistName = metaJson && metaJson.name ? metaJson.name : "";

    // Fetch all playlist tracks using offset-based pagination (limit 100)
    const limit = 100;
    let offset = 0;
    let allTracks = [];
    let total = null;

    do {
      const pageUrl = `https://api.spotify.com/v1/playlists/${encodeURIComponent(
        playlistId,
      )}/tracks?limit=${limit}&offset=${offset}`;
      const resp = await fetch(pageUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to fetch playlist tracks");
      const json = await resp.json();

      if (total === null) {
        // json.total is the total number of tracks in the playlist
        total = typeof json.total === "number" ? json.total : null;
      }

      const tracks = (json.items || [])
        .map((item) => item.track)
        .filter(Boolean)
        .map((track) => {
          const images =
            track.album && track.album.images ? track.album.images : [];
          const image640 = images[0] && images[0].url ? images[0].url : null;
          const image300 = images[1] && images[1].url ? images[1].url : null;
          const image64 = images[2] && images[2].url ? images[2].url : null;
          return {
            id: track.id,
            name: track.name,
            artist:
              track.artists && track.artists[0] ? track.artists[0].name : "",
            album: track.album ? track.album.name : "",
            albumImages: images,
            image640,
            image300,
            image64,
            image:
              image300 ||
              image640 ||
              image64 ||
              (images[0] && images[0].url) ||
              null,
            uri: track.uri,
          };
        });

      allTracks = allTracks.concat(tracks);
      offset += limit;
      // Stop if we've fetched all tracks (when total is known)
    } while (total === null || allTracks.length < total);

    return { name: playlistName, tracks: allTracks };
  },

  // Return current user's profile (me)
  async getCurrentUser() {
    const token = await this.getAccessToken();
    if (!token) return null;
    const resp = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) {
      // If the API forbids access to the profile (e.g., account restrictions/privacy),
      // surface a specific error the app can detect and display a helpful message.
      if (resp.status === 403) {
        const text = await resp.text();
        const err = new Error("Access to Spotify profile is forbidden");
        err.code = 403;
        err.body = text;
        throw err;
      }
      return null;
    }
    return resp.json();
  },

  // Clear stored tokens (client-side logout)
  logout() {
    accessToken = null;
    refreshToken = null;
    expiresAt = null;
    sessionStorage.removeItem("spotify_access_token");
    sessionStorage.removeItem("spotify_refresh_token");
    sessionStorage.removeItem("spotify_expires_at");
    sessionStorage.removeItem(STORAGE_KEY);
  },
};

export default Spotify;
