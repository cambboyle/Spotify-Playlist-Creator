# Crate: Spotify Playlist Creator

[![codecov](https://app.codecov.io/github/cambboyle/Crate/branch/main/graph/badge.svg)](https://app.codecov.io/github/cambboyle/Crate)
<!-- Replace the above URL with your actual Codecov badge URL after setup -->

Crate is a modern, accessible React + Vite application for searching Spotify tracks and building custom playlists using the Spotify Web API. It features a polished UI, keyboard-accessible drag-and-drop, robust error handling, and a strong focus on testing and code quality.

---

## Features

- **Spotify OAuth Integration:** Secure login and playlist management via the Spotify Web API.
- **Track Search:** Fast, cached search with real-time results.
- **Playlist Editor:** Add, remove, and reorder tracks with drag-and-drop and keyboard controls.
- **Multiple Playlists:** View, select, and edit your Spotify playlists.
- **Responsive & Accessible:** Works great on desktop and mobile, with full keyboard navigation.
- **Robust Testing:** 80%+ coverage with Vitest and Testing Library; CI-ready.
- **Professional Documentation:** Clear roadmap, manual QA checklist, and coverage badge.

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/your-repo.git
cd crate
npm install
```

### 2. Register a Spotify Application

- Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications) and create a new app.
- Add your local or tunnel URL as a Redirect URI (e.g., `http://localhost:3000/` or a public tunnel like ngrok).
- Copy your **Client ID**.

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```properties
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/
```

**Do NOT commit `.env`** — it contains sensitive credentials.

### 4. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and click "Connect to Spotify" to begin.

---

## OAuth Flow

Crate uses the [Authorization Code Flow with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow) for secure, client-side authentication. Tokens are stored in sessionStorage and never committed.

---

## Testing & Coverage

- **Unit & Integration Tests:** Written with [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/).
- **Coverage:** See the badge above for current status. Run locally with:

  ```bash
  npx vitest run --coverage
  ```

- **CI Integration:** Tests and coverage run automatically on every push via GitHub Actions and Codecov.

### Manual QA Checklist

Due to Spotify OAuth restrictions, some flows require manual testing:

- Spotify login (OAuth flow)
- Track search
- Add/remove/reorder tracks
- Save playlist to Spotify
- Load/edit existing playlists
- Unsaved changes modal
- Error handling (invalid token, network errors, rate limiting)

---

## Roadmap

- [x] Theming and UI polish
- [x] Skeleton loaders and spinners
- [x] Drag-and-drop and keyboard accessibility
- [x] Robust unit/integration tests
- [x] Manual QA checklist
- [x] CI with coverage badge
- [ ] Backend API (future)
- [ ] TypeScript migration (future)

---

## Professional Practices

- **Commit Hygiene:** Conventional commit messages and clear PRs.
- **EditorConfig & Prettier:** Consistent code style.
- **Documentation:** README, roadmap, and in-code comments.
- **Security:** No secrets in git; `.env` is gitignored.

---

## Contributing

Pull requests are welcome! Please open an issue to discuss major changes.

---

## License

MIT

---
