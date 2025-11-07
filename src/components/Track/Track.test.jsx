/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Track from "./Track";

const mockTrack = {
  id: "track-1",
  name: "Test Track",
  artist: "Test Artist",
  album: "Test Album",
  albumImages: [{ url: "https://placehold.co/300" }],
};

describe("Track component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders track info and album art", () => {
    render(<Track track={mockTrack} />);
    expect(screen.getByText("Test Track")).toBeInTheDocument();
    expect(screen.getByText(/Test Artist/)).toBeInTheDocument();
    expect(screen.getByText(/Test Album/)).toBeInTheDocument();
    const img = screen.getByAltText("Test Track album art");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://placehold.co/300");
  });

  it("renders add button and calls onAdd when clicked", async () => {
    const onAdd = vi.fn();
    render(<Track track={mockTrack} onAdd={onAdd} />);
    const addButton = screen.getByRole("button", { name: /Add to playlist/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent("+");
    fireEvent.click(addButton);
    // onAdd is async, but should be called
    expect(onAdd).toHaveBeenCalledWith(mockTrack);
  });

  it("renders remove button and calls onRemove when clicked", () => {
    const onRemove = vi.fn();
    render(<Track track={mockTrack} isRemoval onRemove={onRemove} />);
    const removeButton = screen.getByRole("button");
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toHaveTextContent("-");
    fireEvent.click(removeButton);
    expect(onRemove).toHaveBeenCalledWith(mockTrack);
  });

  it("shows pending spinner and aria-label when add is in progress", async () => {
    // Simulate slow onAdd
    const onAdd = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    render(<Track track={mockTrack} onAdd={onAdd} />);
    const addButton = screen.getByRole("button", { name: /Add to playlist/i });
    fireEvent.click(addButton);
    // Button should show spinner and aria-label "Adding to playlist"
    expect(
      screen.getByRole("button", { name: /Adding to playlist/i }),
    ).toBeInTheDocument();
    // The spinner is rendered as an SVG inside the button
    const button = screen.getByRole("button", { name: /Adding to playlist/i });
    const spinner = button.querySelector("svg");
    expect(spinner).toBeInTheDocument();
  });

  it("shows checkmark and aria-pressed when added", () => {
    render(<Track track={mockTrack} isAdded />);
    const addedButton = screen.getByRole("button", {
      name: /Added to playlist/i,
    });
    expect(addedButton).toBeInTheDocument();
    expect(addedButton).toHaveTextContent("✔");
    expect(addedButton).toHaveAttribute("aria-pressed", "true");
  });

  it("renders with default track if no track prop is provided", () => {
    render(<Track />);
    expect(screen.getByText(/Placeholder Track/)).toBeInTheDocument();
    expect(screen.getByText(/Placeholder Artist/)).toBeInTheDocument();
    expect(screen.getByText(/Placeholder Album/)).toBeInTheDocument();
    expect(
      screen.getByAltText(/Placeholder Track album art/),
    ).toBeInTheDocument();
  });

  it("has correct aria-labels for add, pending, and added states", async () => {
    // Not added
    render(<Track track={mockTrack} />);
    let button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Add to playlist");

    // Pending
    cleanup();
    const onAdd = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    render(<Track track={mockTrack} onAdd={onAdd} />);
    button = screen.getByRole("button");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-label", "Adding to playlist");

    // Added
    cleanup();
    render(<Track track={mockTrack} isAdded />);
    button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Added to playlist");
  });
});
