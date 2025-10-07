# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

# Spotify Playlist Creator

A small React + Vite app that lets you search Spotify tracks and create playlists using the Spotify Web API.

This project implements the client-side implicit grant OAuth flow to obtain a short-lived access token that allows creating playlists on behalf of the authenticated user.

## What this repo contains

- A minimal React app (Vite) with components to search tracks and manage a playlist.
- `src/components/util/Spotify.js` — client helper that handles OAuth and calls to the Spotify Web API.
- No styling: CSS files have been intentionally left empty so you can add your own styles.

## Quick start

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/cambboyle/Spotify-Playlist-Creator.git
cd jamming
npm install
```

2. Register a Spotify application

- Go to https://developer.spotify.com/dashboard/applications and create an app.
- Spotify sometimes rejects `http://localhost` redirect URIs for security. If that happens, use a secure (https) public URL from a tunneling service such as ngrok, localtunnel, or Cloudflare Tunnel and add that URL as the Redirect URI in the app settings.
- Examples:
  - `https://my-ngrok-subdomain.ngrok.io/`
  - `https://random-ttl-123.localtunnel.app/`
  - `https://<your-cloudflare-tunnel>.trycloudflare.com/`
- Copy the Client ID.

3. Create a `.env` file in the project root and fill the values. Example contents:

Create a file named `.env` (do NOT commit it) and add:

```properties
# Spotify Client ID from Spotify Developer Dashboard
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here

# Optional: override redirect URI (for public tunnels / deployed sites)
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/
```

Do NOT commit `.env` — it may contain sensitive values. Vite exposes env variables prefixed with `VITE_` to the client, so keep secrets out of version control.

4. Run the app

```bash
npm run dev
```

Open http://localhost:3000 in your browser. The app includes a "Connect to Spotify" button — use that to authorize the client. When you approve, Spotify will redirect back with an access token.

## How OAuth works here (Authorization Code Flow with PKCE)

Spotify deprecated the implicit grant flow. This app uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange), which is the recommended method for single-page applications.

High level:

- The client generates a random `code_verifier` and derives a `code_challenge` from it.
- The app redirects the user to Spotify's authorization endpoint with `response_type=code` and includes the `code_challenge`.
- After approval, Spotify redirects back with an authorization code (query parameter).
- The client exchanges that code together with the original `code_verifier` for access and refresh tokens via Spotify's token endpoint.
- Access tokens are stored in `sessionStorage`; refresh tokens (when provided) are used to obtain new access tokens when they expire.

Notes:

- This implementation does the code exchange from the browser over HTTPS. For stronger security and to persist refresh tokens longer-term, consider a small backend to handle token exchange and storage.
- Use the "Connect to Spotify" button in the UI to initiate authorization. After approving, you'll be redirected back and the app will exchange the code automatically.

## Files you may want to change

- `src/components/util/Spotify.js` — OAuth scopes and implementation. The current scope includes `playlist-modify-public playlist-modify-private`.
- `src/index.css` and `src/components/App/App.css` — intentionally empty for you to style.

## Development notes

- This app assumes the redirect URI is `http://localhost:3000/`. If you change ports or host, update `redirectUri` in `src/components/util/Spotify.js` and your Spotify app settings.
- If `VITE_SPOTIFY_CLIENT_ID` is missing, the Spotify helper will throw a helpful error.

## Troubleshooting

- If you get redirected to Spotify but no token appears in the app, check the redirect URI configured in your Spotify application and ensure it exactly matches the app's URL (including trailing slash).
- For CORS or network issues, confirm your dev server is running and you have an internet connection.

### Accidentally committed your .env?

If you (or someone) accidentally committed a `.env` with secrets, remove it from the repository history as soon as possible.

1. Remove the file and commit the change:

```bash
git rm --cached .env
git commit -m "Remove .env from repository"
```

2. To purge it from history (this rewrites commits — only do this on personal branches or coordinate with your team):

```bash
# Using git filter-repo (recommended)
git filter-repo --path .env --invert-paths

# Or with BFG (simpler):
# bfg --delete-files .env
```

3. Force-push the rewritten history to remote (only when you're sure):

```bash
git push --force
```

If you don't want to rewrite history, at minimum rotate the credentials (create a new Spotify client secret/ID) and delete the old one in the Spotify Dashboard.

## License

MIT
