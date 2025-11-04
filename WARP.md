# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Running the app
```bash
npm run dev
```
Opens dev server at `http://localhost:3000`

### Building
```bash
npm run build
```

### Linting
```bash
npm run lint
```
Run this before committing changes.

### Testing
```bash
npm run test        # Run tests in watch mode
npm run test:ui     # Run tests with Vitest UI
```

Test framework: Vitest with jsdom environment. Tests are located in `__tests__/` directories alongside components.

## Project Architecture

### Overview
React + Vite SPA that integrates with Spotify Web API using OAuth 2.0 with PKCE. Users can search tracks, create/edit playlists, and sync them to their Spotify account.

### OAuth Flow (Authorization Code with PKCE)
- `src/components/util/Spotify.js` handles all Spotify API interactions
- Access tokens are stored in `sessionStorage`
- Refresh tokens are used to obtain new access tokens when expired
- The app uses client-side token exchange (no backend)

### Key Components

**App.jsx** — Root component, manages global state:
- Search results with in-memory caching (per term/limit/offset)
- Playlist editor state (name, tracks, isDirty flag)
- User connection state
- Modals for unsaved changes confirmation

**Spotify.js** — API client with these methods:
- `authorize()` — Initiates OAuth flow
- `getAccessToken()` — Returns token or null, handles refresh
- `search(term, limit, offset)` — Search tracks with pagination
- `savePlaylist(name, trackUris, playlistId)` — Create or update playlist (batches of 100 tracks)
- `getUserPlaylists()` — Fetch all user playlists (paginated)
- `getPlaylist(playlistId)` — Load playlist metadata and all tracks
- `getCurrentUser()` — Get user profile
- `fetchWithRetry()` — Helper for rate-limit/server error retry with exponential backoff

**Component Structure**:
- `SearchBar/` — Search input
- `SearchResults/` — Display search results
- `Playlist/` — Playlist editor (name input, track list, save button)
- `PlaylistList/` — User's playlists list
- `Track/` — Individual track display
- `Common/ConfirmModal` — Confirmation dialog for unsaved changes

### Environment Variables
Required in `.env`:
```
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/  # Optional override
```

**Never commit `.env`**. If accidentally committed, remove with `git rm --cached .env` and rotate credentials in Spotify Dashboard.

### Spotify API Notes
- Rate limits: 429 status codes handled with retry logic
- Batch operations: Playlists updated in chunks of 100 tracks
- Scopes: `playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative`

### Style Guide
The project follows a monochrome grayscale design with rotating accent colors (see `STYLEGUIDE.md`):
- CSS custom properties for theming (`--gray-100` through `--gray-900`, `--accent`)
- 60% grayscale, 30% support greys, 10% accent color
- Accent colors: Teal, Coral, Electric Blue, Gold, Neon Green
- Base spacing unit: 8px
- Typography: Inter font family

### Testing Strategy
- Component tests using Vitest and Testing Library
- Mock `fetch` for API calls
- Test files use `@vitest-environment jsdom` directive
- Focus on user interactions and API integration

## Code Conventions
- ESLint configured with React Hooks and Refresh plugins
- Unused vars allowed if they start with capital letter or underscore
- Use `useCallback` for functions passed to child components
- Prefer functional components with hooks
