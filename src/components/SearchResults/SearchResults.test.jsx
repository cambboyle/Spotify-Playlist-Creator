/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import SearchResults from "./SearchResults";

// Helper to generate fake track data
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

describe("SearchResults", () => {
  const baseProps = {
    searchTerm: "test-term",
    onSearch: vi.fn(),
    searchResults: { items: makeTracks(10), total: 10 },
    onAdd: vi.fn(),
    playlistTracks: [],
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders results along with pagination summary", () => {
    const props = { ...baseProps };
    render(<SearchResults {...props} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /^Results$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^Showing 1–10 of 10 results$/i),
    ).toBeInTheDocument();

    const trackCards = screen.getAllByRole("listitem");
    expect(trackCards[0]).toHaveTextContent("Track 1");
    expect(trackCards[trackCards.length - 1]).toHaveTextContent("Track 10");
  });

  it("shows 'No results' message when there are no items", () => {
    render(
      <SearchResults {...baseProps} searchResults={{ items: [], total: 0 }} />,
    );

    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });

  it("requests more results when the show count buttons are used", () => {
    const props = { ...baseProps, onSearch: vi.fn() };
    render(<SearchResults {...props} />);

    const show50Button = screen.getAllByRole("button", {
      name: /^Show 50$/i,
    })[0];
    fireEvent.click(show50Button);

    expect(props.onSearch).toHaveBeenCalledWith("test-term", 50, 0);
  });

  it("disables show buttons appropriately", () => {
    const { rerender } = render(<SearchResults {...baseProps} />);

    expect(screen.getByRole("button", { name: /Show 10/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Show 50/i })).not.toBeDisabled();

    rerender(<SearchResults {...baseProps} isLoading />);
    expect(screen.getByRole("button", { name: /Show 10/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Show 50/i })).toBeDisabled();
  });

  it("shows skeleton placeholders while loading", () => {
    render(
      <SearchResults
        {...baseProps}
        isLoading
        searchResults={{ items: [], total: 0 }}
      />,
    );

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    const statusRegions = screen.getAllByRole("status");
    expect(statusRegions.length).toBeGreaterThan(0);
    expect(statusRegions[0]).toBeInTheDocument();
  });

  it("handles pagination button clicks correctly", () => {
    const props = {
      ...baseProps,
      onSearch: vi.fn(),
      searchResults: { items: makeTracks(20), total: 20 },
    };
    render(<SearchResults {...props} />);

    const nextButton = screen
      .getAllByRole("button", { name: /^Next$/i })
      .find((btn) => !btn.disabled);
    expect(nextButton).toBeTruthy();
    if (!nextButton) {
      throw new Error("Next button not found");
    }
    fireEvent.click(nextButton);
    expect(props.onSearch).toHaveBeenCalledWith("test-term", 10, 10);
    expect(nextButton.disabled).toBe(true);

    const lastButtons = screen.getAllByRole("button", { name: /^Last$/i });
    expect(lastButtons.every((btn) => btn.disabled)).toBe(true);

    const firstButtons = screen.getAllByRole("button", { name: /^First$/i });
    expect(firstButtons.some((btn) => !btn.disabled)).toBe(true);

    const previousButtons = screen.getAllByRole("button", {
      name: /^Previous$/i,
    });
    expect(previousButtons.some((btn) => !btn.disabled)).toBe(true);
  });

  it("renders the track list when not loading", () => {
    render(<SearchResults {...baseProps} />);

    const trackCards = screen.getAllByRole("listitem");
    expect(trackCards.length).toBeGreaterThan(0);
    expect(trackCards[0]).toHaveTextContent("Track 1");
  });
});
