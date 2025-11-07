/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import PlaylistListItem from "./PlaylistListItem";

describe("PlaylistListItem component", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    id: "playlist-1",
    name: "My Playlist",
    trackCount: 5,
    onSelect: vi.fn(),
    selected: false,
    ariaSelected: false,
    tabIndex: 0,
  };

  it("renders playlist name and track count", () => {
    render(<PlaylistListItem {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /My Playlist \(5\) Tracks/i }),
    ).toBeInTheDocument();
  });

  it("calls onSelect with id when clicked", () => {
    const onSelect = vi.fn();
    render(<PlaylistListItem {...defaultProps} onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith("playlist-1");
  });

  it("applies selected styles and aria attributes when selected", () => {
    render(<PlaylistListItem {...defaultProps} selected ariaSelected />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("button-primary");
    expect(btn).toHaveAttribute("aria-selected", "true");
    // The li should also have aria-selected
    const li = btn.closest("li");
    expect(li).toHaveAttribute("aria-selected", "true");
    expect(li).toHaveClass("PlaylistListItem--selected");
  });

  it("applies secondary styles and aria attributes when not selected", () => {
    render(
      <PlaylistListItem
        {...defaultProps}
        selected={false}
        ariaSelected={false}
      />,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("button-secondary");
    expect(btn).toHaveAttribute("aria-selected", "false");
    const li = btn.closest("li");
    expect(li).toHaveAttribute("aria-selected", "false");
    expect(li).not.toHaveClass("PlaylistListItem--selected");
  });

  it("renders with tabIndex and is keyboard accessible", () => {
    render(<PlaylistListItem {...defaultProps} tabIndex={0} />);
    const btn = screen.getByRole("button");
    expect(btn.tabIndex).toBe(0);
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it("renders correct text when trackCount is 0 or not provided", () => {
    render(<PlaylistListItem {...defaultProps} trackCount={0} />);
    expect(
      screen.getByRole("button", { name: /My Playlist \(0\) Tracks/i }),
    ).toBeInTheDocument();

    cleanup();
    render(<PlaylistListItem {...defaultProps} trackCount={undefined} />);
    expect(
      screen.getByRole("button", { name: /My Playlist \(0\) Tracks/i }),
    ).toBeInTheDocument();
  });

  it("does not throw if onSelect is not provided", () => {
    render(<PlaylistListItem {...defaultProps} onSelect={undefined} />);
    const btn = screen.getByRole("button");
    expect(() => fireEvent.click(btn)).not.toThrow();
  });
});
