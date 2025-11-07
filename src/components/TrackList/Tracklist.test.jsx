/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Tracklist from "./Tracklist";

// Mock Track to isolate Tracklist tests
vi.mock("../Track/Track", () => ({
  __esModule: true,
  default: ({ track, isAdded, isRemoval, onAdd, onRemove }) => (
    <div data-testid="mock-track">
      <span>{track.name}</span>
      <button
        onClick={() => (isRemoval ? onRemove(track) : onAdd(track))}
        aria-label={isRemoval ? "Remove" : "Add"}
      >
        {isRemoval ? "-" : "+"}
      </button>
      {isAdded && <span data-testid="added-indicator">Added</span>}
    </div>
  ),
}));

const makeTracks = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `track-${i + 1}`,
    name: `Track ${i + 1}`,
    artist: `Artist ${i + 1}`,
    album: `Album ${i + 1}`,
    albumImages: [],
  }));

describe("Tracklist component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders a list of tracks", () => {
    const tracks = makeTracks(3);
    render(<Tracklist tracks={tracks} />);
    const items = screen.getAllByTestId("mock-track");
    expect(items).toHaveLength(3);
    tracks.forEach((track) => {
      expect(screen.getByText(track.name)).toBeInTheDocument();
    });
  });

  it("calls onAdd when add button is clicked", () => {
    const tracks = makeTracks(2);
    const onAdd = vi.fn();
    render(<Tracklist tracks={tracks} onAdd={onAdd} />);
    const addButtons = screen.getAllByRole("button", { name: "Add" });
    fireEvent.click(addButtons[0]);
    expect(onAdd).toHaveBeenCalledWith(tracks[0]);
  });

  it("calls onRemove when remove button is clicked", () => {
    const tracks = makeTracks(2);
    const onRemove = vi.fn();
    render(<Tracklist tracks={tracks} isRemoval onRemove={onRemove} />);
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    fireEvent.click(removeButtons[1]);
    expect(onRemove).toHaveBeenCalledWith(tracks[1]);
  });

  it("shows 'Added' indicator for tracks present in playlistTracks", () => {
    const tracks = makeTracks(2);
    const playlistTracks = [tracks[1]];
    render(
      <Tracklist tracks={tracks} playlistTracks={playlistTracks} />
    );
    // Only the second track should show the added indicator
    const addedIndicators = screen.getAllByTestId("added-indicator");
    expect(addedIndicators).toHaveLength(1);
    expect(screen.getByText("Track 2").parentElement).toContainElement(
      addedIndicators[0]
    );
  });

  it("renders nothing if tracks prop is empty or missing", () => {
    const { container } = render(<Tracklist tracks={[]} />);
    expect(container.querySelectorAll("[data-testid='mock-track']")).toHaveLength(0);

    cleanup();
    const { container: container2 } = render(<Tracklist />);
    expect(container2.querySelectorAll("[data-testid='mock-track']")).toHaveLength(0);
  });
});
