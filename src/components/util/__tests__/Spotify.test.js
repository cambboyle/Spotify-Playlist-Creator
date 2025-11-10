/**
 * @vitest-environment jsdom
 */

import { describe, it, beforeEach, expect, vi } from "vitest";
import Spotify from "../Spotify";

// Mock fetch globally
window.fetch = vi.fn();

describe("Spotify utility module", () => {
  beforeEach(() => {
    fetch.mockClear();
    // Optionally reset any cached userId in Spotify
    if ("userId" in Spotify) {
      Spotify.userId = null;
    }
  });

  describe("search", () => {
    it("should return items and total from API response", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tracks: {
            items: [{ id: "1", name: "Track 1" }],
            total: 1,
          },
        }),
      });

      // Mock getAccessToken
      Spotify.getAccessToken = vi.fn().mockResolvedValue("mock-token");

      const result = await Spotify.search("test");
      expect(fetch).toHaveBeenCalled();
      expect(result.items[0]).toEqual(
        expect.objectContaining({ id: "1", name: "Track 1" }),
      );
      expect(result.total).toBe(1);
    });

    it("should return empty items if response is not ok", async () => {
      fetch.mockResolvedValueOnce({ ok: false });
      Spotify.getAccessToken = vi.fn().mockResolvedValue("mock-token");
      const result = await Spotify.search("test");
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("getUserPlaylists", () => {
    it("should return playlists from API", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "playlist1",
              name: "My Playlist",
              owner: { id: "user1" },
              collaborative: false,
              public: true,
              tracks: { total: 10 },
            },
          ],
          next: null,
        }),
      });
      Spotify.getAccessToken = vi.fn().mockResolvedValue("mock-token");
      const playlists = await Spotify.getUserPlaylists();
      expect(Array.isArray(playlists)).toBe(true);
      expect(playlists[0].id).toBe("playlist1");
      expect(playlists[0].name).toBe("My Playlist");
    });
  });

  describe("getPlaylist", () => {
    it("should return playlist details and tracks", async () => {
      // 1. Metadata
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "playlist1",
          name: "Test Playlist",
          owner: { id: "user1" },
          collaborative: false,
          public: true,
          tracks: { total: 2 },
        }),
      });

      describe("token handling and error cases", () => {
        beforeEach(() => {
          fetch.mockClear();
          if ("userId" in Spotify) {
            Spotify.userId = null;
          }
          // Clear tokens and storage
          window.sessionStorage.clear();
          if ("accessToken" in Spotify) Spotify.accessToken = null;
          if ("refreshToken" in Spotify) Spotify.refreshToken = null;
          if ("expiresAt" in Spotify) Spotify.expiresAt = null;
        });

        it("should throw if no access token and no code in URL", async () => {
          // Remove tokens from storage
          window.sessionStorage.removeItem("spotify_access_token");
          window.sessionStorage.removeItem("spotify_refresh_token");
          window.sessionStorage.removeItem("spotify_expires_at");
          // Simulate no code in URL
          const originalLocation = window.location;
          delete window.location;
          window.location = { ...originalLocation, href: "http://localhost/" };
          await expect(Spotify.getAccessToken()).rejects.toThrow(
            /No access token/,
          );
          window.location = originalLocation;
        });

        it("should refresh token if expired and refresh token exists", async () => {
          // Set expired token in storage
          window.sessionStorage.setItem(
            "spotify_access_token",
            "expired-token",
          );
          window.sessionStorage.setItem(
            "spotify_refresh_token",
            "refresh-token",
          );
          window.sessionStorage.setItem(
            "spotify_expires_at",
            (Date.now() - 10000).toString(),
          );
          // Mock refreshAccessToken
          Spotify.refreshAccessToken = vi.fn().mockResolvedValue({
            access_token: "new-token",
            expires_in: 3600,
            refresh_token: "refresh-token",
          });
          const token = await Spotify.getAccessToken();
          expect(token).toBe("new-token");
          expect(Spotify.refreshAccessToken).toHaveBeenCalled();
        });

        it("should throw if refresh token fails", async () => {
          window.sessionStorage.setItem(
            "spotify_access_token",
            "expired-token",
          );
          window.sessionStorage.setItem(
            "spotify_refresh_token",
            "refresh-token",
          );
          window.sessionStorage.setItem(
            "spotify_expires_at",
            (Date.now() - 10000).toString(),
          );
          Spotify.refreshAccessToken = vi
            .fn()
            .mockRejectedValue(new Error("refresh failed"));
          await expect(Spotify.getAccessToken()).rejects.toThrow(
            /refresh failed/,
          );
        });

        it("should exchange code for token if code is in URL", async () => {
          // Simulate code in URL
          const originalLocation = window.location;
          delete window.location;
          window.location = {
            ...originalLocation,
            href: "http://localhost/?code=abc123",
            search: "?code=abc123",
            assign: vi.fn(),
          };
          // Mock exchangeCodeForToken
          Spotify.exchangeCodeForToken = vi.fn().mockResolvedValue({
            access_token: "code-token",
            expires_in: 3600,
            refresh_token: "refresh-token",
          });
          // Also mock sessionStorage.setItem to avoid side effects
          const setItemSpy = vi.spyOn(
            window.sessionStorage.__proto__,
            "setItem",
          );
          setItemSpy.mockImplementation(() => {});
          const token = await Spotify.getAccessToken();
          expect(token).toBe("code-token");
          expect(Spotify.exchangeCodeForToken).toHaveBeenCalled();
          setItemSpy.mockRestore();
          window.location = originalLocation;
        });

        it("refreshAccessToken should throw on bad response", async () => {
          fetch.mockResolvedValueOnce({ ok: false, status: 400 });
          await expect(Spotify.refreshAccessToken()).rejects.toThrow();
        });

        it("exchangeCodeForToken should throw on bad response", async () => {
          fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => "bad",
          });
          await expect(
            Spotify.exchangeCodeForToken("badcode", "verifier"),
          ).rejects.toThrow();
        });

        it("refreshAccessToken should return new tokens on success", async () => {
          fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              access_token: "fresh-token",
              expires_in: 3600,
              refresh_token: "fresh-refresh",
            }),
          });
          const result = await Spotify.refreshAccessToken("refresh-token");
          expect(result.access_token).toBe("fresh-token");
          expect(result.refresh_token).toBe("fresh-refresh");
        });
      });
      // 2. Tracks page 1 (with total)
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              track: {
                id: "t1",
                name: "Song 1",
                artists: [{ name: "Artist 1" }],
                album: { name: "Album 1", images: [] },
                uri: "uri1",
              },
            },
            {
              track: {
                id: "t2",
                name: "Song 2",
                artists: [{ name: "Artist 2" }],
                album: { name: "Album 2", images: [] },
                uri: "uri2",
              },
            },
          ],
          total: 2,
        }),
      });
      Spotify.getAccessToken = vi.fn().mockResolvedValue("mock-token");
      const playlist = await Spotify.getPlaylist("playlist1");
      expect(playlist.name).toBe("Test Playlist");
      expect(playlist.tracks.length).toBe(2);
      expect(playlist.tracks[0].id).toBe("t1");
      expect(playlist.tracks[1].id).toBe("t2");
    });
  });

  describe("savePlaylist", () => {
    it("should create a new playlist and add tracks in batches", async () => {
      // Mock create playlist response
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "newplaylist" }),
        })
        // Mock add tracks response (one batch)
        .mockResolvedValueOnce({ ok: true });

      Spotify.getAccessToken = vi.fn().mockResolvedValue("mock-token");
      Spotify.getCurrentUserId = vi.fn().mockResolvedValue("user1");

      const result = await Spotify.savePlaylist("My Playlist", [
        "spotify:track:1",
        "spotify:track:2",
      ]);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result.id).toBe("newplaylist");
      expect(Array.isArray(result.batchResults)).toBe(true);
      expect(result.batchResults[0].success).toBe(true);
    });

    it("should handle clearing an existing playlist", async () => {
      fetch
        // Mock update playlist name
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({}),
        })
        // Mock clear tracks
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({}),
        });

      Spotify.getAccessToken = vi.fn().mockResolvedValue("mock-token");
      Spotify.getCurrentUserId = vi.fn().mockResolvedValue("user1");

      // Pass playlistId as the third argument (per implementation)
      const result = await Spotify.savePlaylist(
        "My Playlist",
        [],
        "playlistid", // playlistId as third argument
      );
      expect(fetch).toHaveBeenCalledTimes(2); // update name + clear tracks
      expect(result.id).toBe("playlistid");
      expect(result.batchResults[0].type).toBe("clear");
      expect(result.batchResults[0].success).toBe(true);
    });
  });
});
