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
          window.location.pathname
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
        "VITE_SPOTIFY_CLIENT_ID is not set. Register an app at https://developer.spotify.com and set VITE_SPOTIFY_CLIENT_ID in your .env file."
      );
    }

    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem(STORAGE_KEY, codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const scope = "playlist-modify-public playlist-modify-private";
    const authEndpoint = "https://accounts.spotify.com/authorize";
    const authUrl = `${authEndpoint}?client_id=${encodeURIComponent(
      clientId
    )}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&code_challenge_method=S256&code_challenge=${encodeURIComponent(
      codeChallenge
    )}&scope=${encodeURIComponent(scope)}`;

    window.location = authUrl;
  },

  async search(term) {
    const token = await this.getAccessToken();
    if (!token)
      throw new Error(
        "Not authorized. Call authorize() to connect to Spotify."
      );

    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
        term
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return [];

    const jsonResponse = await response.json();
    if (!jsonResponse.tracks) return [];

    return jsonResponse.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists && track.artists[0] ? track.artists[0].name : "",
      album: track.album ? track.album.name : "",
      albumImages: track.album && track.album.images ? track.album.images : [],
      image:
        track.album && track.album.images && track.album.images[0]
          ? track.album.images[0].url
          : null,
      uri: track.uri,
    }));
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris || trackUris.length === 0) return;

    const token = await this.getAccessToken();
    if (!token)
      throw new Error(
        "Not authorized. Call authorize() to connect to Spotify."
      );

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Get the user's Spotify ID
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers,
    });
    if (!userResponse.ok) throw new Error("Failed to get user ID from Spotify");
    const userJson = await userResponse.json();
    const userId = userJson.id;

    // Create a new playlist
    const createResponse = await fetch(
      `https://api.spotify.com/v1/users/${encodeURIComponent(
        userId
      )}/playlists`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ name }),
      }
    );
    if (!createResponse.ok) throw new Error("Failed to create playlist");
    const createJson = await createResponse.json();
    const playlistId = createJson.id;

    // Add tracks to the playlist
    const addResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(
        playlistId
      )}/tracks`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ uris: trackUris }),
      }
    );

    if (!addResponse.ok) throw new Error("Failed to add tracks to playlist");

    return addResponse.json();
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
