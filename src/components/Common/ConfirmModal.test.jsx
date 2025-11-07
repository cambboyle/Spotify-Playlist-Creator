/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ConfirmModal from "./ConfirmModal";

const defaultProps = {
  isOpen: true,
  title: "Discard changes?",
  message: "You have unsaved work. Continue?",
  confirmLabel: "Continue",
  cancelLabel: "Cancel",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe("ConfirmModal", () => {
  afterEach(cleanup);

  const setup = (override = {}) =>
    render(<ConfirmModal {...defaultProps} {...override} />);

  it("does not render when closed", () => {
    setup({ isOpen: false });
    expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
    expect(screen.queryByText(defaultProps.message)).not.toBeInTheDocument();
  });

  it("renders title, message, and buttons when open", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: defaultProps.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: defaultProps.confirmLabel }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: defaultProps.cancelLabel }),
    ).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    setup({ onCancel });
    fireEvent.click(
      screen.getByRole("button", { name: defaultProps.cancelLabel }),
    );
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    setup({ onConfirm });
    fireEvent.click(
      screen.getByRole("button", { name: defaultProps.confirmLabel }),
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("supports custom labels", () => {
    setup({ confirmLabel: "Yes", cancelLabel: "No" });
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });
});
