/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Playlist from "./Playlist";

const makeTracks = (count) =>
  Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    return {
      id: `track-${n}`,
      name: `Track ${n}`,
      artist: `Artist ${n}`,
      album: `Album ${n}`,
      albumImages: [],
      uri: `spotify:track:${n}`,
    };
  });

describe("Playlist component", () => {
  const defaultProps = {
    playlistName: "My Playlist",
    playlistTracks: makeTracks(5),
    onNameChange: vi.fn(),
    onRemove: vi.fn(),
    onSave: vi.fn(),
    onReorder: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders playlist name input and tracks", () => {
    render(<Playlist {...defaultProps} />);

    const input = screen.getByDisplayValue("My Playlist");
    expect(input).toBeInTheDocument();
    // Check that each track name is rendered in the DOM
    defaultProps.playlistTracks.forEach((track) => {
      expect(screen.getByText(track.name)).toBeInTheDocument();
    });
  });

  it("calls onNameChange when playlist name changes", () => {
    render(<Playlist {...defaultProps} />);
    const input = screen.getByDisplayValue("My Playlist");
    fireEvent.change(input, { target: { value: "Renamed Playlist" } });
    expect(defaultProps.onNameChange).toHaveBeenCalledWith("Renamed Playlist");
  });

  it("calls onRemove when remove button is clicked", () => {
    render(<Playlist {...defaultProps} />);
    const removeButton = screen.getByRole("button", {
      name: /Remove Track 1 from playlist/i,
    });
    fireEvent.click(removeButton);
    expect(defaultProps.onRemove).toHaveBeenCalledWith(
      defaultProps.playlistTracks[0],
    );
  });

  it("disables save button when there are no tracks and enables otherwise", () => {
    const { rerender } = render(
      <Playlist {...defaultProps} playlistTracks={[]} />,
    );

    const saveButtonDisabled = screen.getByRole("button", {
      name: /Save to Spotify/i,
    });
    expect(saveButtonDisabled).toBeDisabled();

    rerender(<Playlist {...defaultProps} playlistTracks={makeTracks(1)} />);
    const saveButtonEnabled = screen.getByRole("button", {
      name: /Save to Spotify/i,
    });
    expect(saveButtonEnabled).toBeEnabled();

    fireEvent.click(saveButtonEnabled);
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it("shows skeleton loaders when isLoading is true", () => {
    render(
      <Playlist {...defaultProps} isLoading playlistTracks={makeTracks(3)} />,
    );

    // When loading, skeleton rows are rendered instead of actual track rows
    const skeletons = screen.getAllByRole("listitem", { hidden: true });
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText("Track 1")).not.toBeInTheDocument();
  });

  it("supports pagination and updates display counts", () => {
    render(<Playlist {...defaultProps} playlistTracks={makeTracks(20)} />);

    // Change page size to 10
    const select = screen.getByLabelText(/Per page/i);
    fireEvent.change(select, { target: { value: "10" } });

    expect(screen.getByText(/Showing 1–10 of 20 tracks/i)).toBeInTheDocument();

    // Go to next page
    const nextButton = screen.getByRole("button", { name: /^Next$/i });
    fireEvent.click(nextButton);

    expect(screen.getByText(/Showing 11–20 of 20 tracks/i)).toBeInTheDocument();
  });

  it("supports keyboard-based reordering and calls onReorder", () => {
    render(<Playlist {...defaultProps} />);

    const trackRows = screen.getAllByRole("listitem");
    const secondRow = trackRows[1];

    // Move second row upwards
    fireEvent.keyDown(secondRow, { key: "ArrowUp" });

    expect(defaultProps.onReorder).toHaveBeenCalledTimes(1);
    const reordered = defaultProps.onReorder.mock.calls[0][0];
    expect(reordered[0].id).toBe("track-2");
  });
});
