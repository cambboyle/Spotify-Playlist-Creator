/jamming/src/components/util/__tests__/Spotify.test.js
/**
 * @vitest-environment jsdom
 */

import { describe, it, beforeEach, expect, vi } from 'vitest';
import Spotify from '../Spotify';

// Mock fetch globally
global.fetch = vi.fn();

describe('Spotify utility module', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Optionally reset any cached userId in Spotify
    if ('userId' in Spotify) {
      Spotify.userId = null;
    }
  });

  describe('search', () => {
    it('should return items and total from API response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tracks: {
            items: [{ id: '1', name: 'Track 1' }],
            total: 1,
          },
        }),
      });

      // Mock getAccessToken
      Spotify.getAccessToken = vi.fn().mockResolvedValue('mock-token');

      const result = await Spotify.search('test');
      expect(fetch).toHaveBeenCalled();
      expect(result.items).toEqual([{ id: '1', name: 'Track 1' }]);
      expect(result.total).toBe(1);
    });

    it('should return empty items if response is not ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false });
      Spotify.getAccessToken = vi.fn().mockResolvedValue('mock-token');
      const result = await Spotify.search('test');
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getUserPlaylists', () => {
    it('should return playlists from API', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'playlist1',
              name: 'My Playlist',
              owner: { id: 'user1' },
              collaborative: false,
              public: true,
              tracks: { total: 10 },
            },
          ],
          next: null,
        }),
      });
      Spotify.getAccessToken = vi.fn().mockResolvedValue('mock-token');
      const playlists = await Spotify.getUserPlaylists();
      expect(Array.isArray(playlists)).toBe(true);
      expect(playlists[0].id).toBe('playlist1');
      expect(playlists[0].name).toBe('My Playlist');
    });
  });

  describe('getPlaylist', () => {
    it('should return playlist details and tracks', async () => {
      // First call: playlist metadata
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'playlist1',
          name: 'Test Playlist',
          owner: { id: 'user1' },
          collaborative: false,
          public: true,
          tracks: { total: 2 },
        }),
      });
      // Second call: playlist tracks
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            { track: { id: 't1', name: 'Song 1' } },
            { track: { id: 't2', name: 'Song 2' } },
          ],
          next: null,
        }),
      });
      Spotify.getAccessToken = vi.fn().mockResolvedValue('mock-token');
      const playlist = await Spotify.getPlaylist('playlist1');
      expect(playlist.id).toBe('playlist1');
      expect(playlist.name).toBe('Test Playlist');
      expect(playlist.tracks.length).toBe(2);
    });
  });

  describe('savePlaylist', () => {
    it('should create a new playlist and add tracks in batches', async () => {
      // Mock create playlist response
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'newplaylist' }),
        })
        // Mock add tracks response (one batch)
        .mockResolvedValueOnce({ ok: true });

      Spotify.getAccessToken = vi.fn().mockResolvedValue('mock-token');
      Spotify.getCurrentUserId = vi.fn().mockResolvedValue('user1');

      const result = await Spotify.savePlaylist('My Playlist', [
        'spotify:track:1',
        'spotify:track:2',
      ]);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result.id).toBe('newplaylist');
      expect(Array.isArray(result.batchResults)).toBe(true);
      expect(result.batchResults[0].success).toBe(true);
    });

    it('should handle clearing an existing playlist', async () => {
      fetch
        // Mock update playlist name
        .mockResolvedValueOnce({ ok: true })
        // Mock clear tracks
        .mockResolvedValueOnce({ ok: true });

      Spotify.getAccessToken = vi.fn().mockResolvedValue('mock-token');
      Spotify.getCurrentUserId = vi.fn().mockResolvedValue('user1');

      // Note: The 4th argument is the playlist ID for updating
      const result = await Spotify.savePlaylist('My Playlist', [], () => {}, 'playlistid');
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result.id).toBe('playlistid');
      expect(result.batchResults[0].type).toBe('clear');
      expect(result.batchResults[0].success).toBe(true);
    });
  });
});
