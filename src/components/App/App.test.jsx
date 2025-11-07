/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import App from "./App";

// Mock Spotify API module
vi.mock("../util/Spotify", () => ({
  __esModule: true,
  default: {
    getAccessToken: vi.fn(),
    getCurrentUser: vi.fn(),
    getCurrentUserId: vi.fn(), // <-- Add this line
    search: vi.fn(),
    getUserPlaylists: vi.fn(),
    getPlaylist: vi.fn(),
    savePlaylist: vi.fn(),
    authorize: vi.fn(),
    logout: vi.fn(),
    profile: null,
  },
}));

import Spotify from "../util/Spotify";

describe("App integration", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    Spotify.profile = null;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders app and connects to Spotify", async () => {
    Spotify.getAccessToken.mockResolvedValue("mock-token");
    Spotify.getCurrentUser.mockResolvedValue({
      display_name: "Test User",
      images: [],
    });

    render(<App />);
    expect(screen.getByRole("heading", { name: /Crate/i })).toBeInTheDocument();

    // Wait for user info to appear
    await waitFor(() => {
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /Disconnect/i }),
    ).toBeInTheDocument();
  });

  it("performs a search and displays results", async () => {
    Spotify.getAccessToken.mockResolvedValue("mock-token");
    Spotify.getCurrentUser.mockResolvedValue({
      display_name: "Test User",
      images: [],
    });
    Spotify.search.mockResolvedValue({
      items: [
        {
          id: "1",
          name: "Track 1",
          artist: "Artist 1",
          album: "Album 1",
          albumImages: [],
        },
        {
          id: "2",
          name: "Track 2",
          artist: "Artist 2",
          album: "Album 2",
          albumImages: [],
        },
      ],
      total: 2,
    });

    render(<App />);
    // Wait for user info
    await screen.findByText(/Test User/);

    // Enter search term and submit
    const input = screen.getByPlaceholderText(/Search for a track/i);
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Wait for search results to appear
    await screen.findByText(/Track 1/);
    expect(screen.queryByText(/Track 2/)).not.toBeNull();
  });

  it("adds and removes tracks from playlist", async () => {
    Spotify.getAccessToken.mockResolvedValue("mock-token");
    Spotify.getCurrentUser.mockResolvedValue({
      display_name: "Test User",
      images: [],
    });
    Spotify.search.mockResolvedValue({
      items: [
        {
          id: "1",
          name: "Track 1",
          artist: "Artist 1",
          album: "Album 1",
          albumImages: [],
        },
      ],
      total: 1,
    });

    render(<App />);
    await screen.findByText(/Test User/);

    // Search for a track
    const input = screen.getByPlaceholderText(/Search for a track/i);
    fireEvent.change(input, { target: { value: "track" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Wait for search result
    await screen.findByText(/Track 1/);

    // Add track to playlist
    const addButton = screen.getAllByRole("button", { name: /Add/i })[0];
    fireEvent.click(addButton);

    // Track should appear in playlist editor
    await screen.findByText(/Tracks in Playlist/i);
    expect(screen.getByText(/Tracks in Playlist \(1\)/)).toBeInTheDocument();

    // Remove track from playlist
    const removeButton = screen.getByRole("button", {
      name: /Remove Track 1 from playlist/i,
    });
    fireEvent.click(removeButton);

    // Track count should reflect removal
    await waitFor(() => {
      expect(screen.getByText(/Tracks in Playlist \(0\)/)).toBeInTheDocument();
    });
  });

  it("saves playlist to Spotify", async () => {
    Spotify.getAccessToken.mockResolvedValue("mock-token");
    Spotify.getCurrentUser.mockResolvedValue({
      display_name: "Test User",
      images: [],
    });
    Spotify.search.mockResolvedValue({
      items: [
        {
          id: "1",
          name: "Track 1",
          artist: "Artist 1",
          album: "Album 1",
          albumImages: [],
          uri: "uri1",
        },
      ],
      total: 1,
    });
    Spotify.savePlaylist.mockResolvedValue({
      id: "playlist123",
      batchResults: [{ success: true }],
    });

    render(<App />);
    await screen.findByText(/Test User/);

    // Search and add track
    const input = screen.getByPlaceholderText(/Search for a track/i);
    fireEvent.change(input, { target: { value: "track" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await screen.findByText(/Track 1/);

    const addButton = screen.getAllByRole("button", { name: /Add/i })[0];
    fireEvent.click(addButton);

    // Save playlist
    const saveButton = screen.getByRole("button", { name: /Save to Spotify/i });
    fireEvent.click(saveButton);

    // SavePlaylist should be called
    await waitFor(() => {
      expect(Spotify.savePlaylist).toHaveBeenCalled();
    });
  });

  it("shows error when search fails", async () => {
    Spotify.getAccessToken.mockResolvedValue("mock-token");
    Spotify.getCurrentUser.mockResolvedValue({
      display_name: "Test User",
      images: [],
    });
    Spotify.search.mockRejectedValue(new Error("Search failed"));

    render(<App />);
    await screen.findByText(/Test User/);

    // Enter search term and submit
    const input = screen.getByPlaceholderText(/Search for a track/i);
    fireEvent.change(input, { target: { value: "fail" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Wait for error message
    await screen.findByRole("alert");
    expect(screen.getByRole("alert").textContent).toMatch(/Search failed/i);
  });
});
