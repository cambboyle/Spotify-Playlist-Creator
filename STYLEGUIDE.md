# App Style Guide

A living document for consistent, accessible, and beautiful UI development.

---

## Visual Philosophy: Monochrome Grayscale + Rotating Accent Color

Our UI is built on a foundation of grayscale shades, providing clarity, minimalism, and timelessness. All interactive or high-importance elements use a single, rotating accent color for vibrancy and focus. This approach keeps the interface fresh, avoids visual fatigue, and allows for dynamic adaptation to context or user preference.

---

## Color System

### Grayscale Palette

| Name      | Hex      | Usage                        |
|-----------|----------|------------------------------|
| Gray 100  | #F5F5F5  | App background, light surfaces|
| Gray 200  | #E0E0E0  | Containers, cards, modals     |
| Gray 400  | #BDBDBD  | Borders, muted UI             |
| Gray 700  | #616161  | Secondary text, icons         |
| Gray 900  | #222     | Main text, deep backgrounds   |

### Accent Palette (Rotating)

| Name         | Hex      | Mood/Usage                  |
|--------------|----------|-----------------------------|
| Teal         | #00bfae  | Calm, focus, default        |
| Coral        | #ff6f61  | Energetic, party            |
| Electric Blue| #2979ff  | Modern, tech, highlight     |
| Gold         | #ffd600  | Warm, celebratory           |
| Neon Green   | #39ff14  | Striking, fun               |

- **Accent color rotates** periodically (daily/weekly), by playlist theme/mood, or by user selection.
- Accent is applied to: primary buttons, active navigation, progress bars, ratings, toggles.

### Usage Ratio

- **60%** Grayscale backgrounds and surfaces
- **30%** Support greys for containers, cards, and secondary elements
- **10%** Accent color for key interactive elements

---

## Typography

- **Font family:** `Inter, Arial, sans-serif`
- **Headings:**
  - H1: 2.5rem, bold
  - H2: 2rem, bold
  - H3: 1.5rem, semi-bold
- **Body:** 1rem, regular
- **Button:** 1rem, bold
- **Text color:** Use `var(--gray-900)` for main text, `var(--gray-700)` for secondary/muted text.

---

## Spacing & Layout

- **Base unit:** 8px
- **Small gap:** 4px
- **Medium gap:** 16px
- **Large gap:** 32px
- **Layout:** Use flex/grid for desktop, stack vertically on mobile.

---

## Components

### Buttons

- **Primary:** Accent background (`var(--accent)`), white text, rounded corners, bold
- **Secondary:** Transparent/gray background, accent border, accent text
- **Disabled:** Muted gray background, muted text
- **States:**
  - Hover: Slightly darker accent
  - Focus: Visible outline (accent color)
  - Active: Subtle shadow

### Forms

- **Input:** Rounded corners, gray border, padding, accent focus outline
- **Error:** Accent (coral) border, error message below input
- **Label:** Clear, readable, associated with input via `for`/`id`

### Cards & Containers

- **Card:** Gray 200 background, subtle shadow, rounded corners, padding
- **Modal:** Centered, overlay background (Gray 400, 80% opacity), focus trap, accessible close button

### Lists

- **Playlist List:** Highlight selected item with accent background, bold text, visible focus
- **Track List:** Alternating row background (Gray 100/Gray 200) for readability

### Feedback

- **Loading Spinner:** Visible, uses accent color
- **Alerts/Errors:** Prominent, uses accent coral, clear messaging

---

## Accent Color Rotation Logic

- Accent color can be set by:
  - **Time-based rotation:** Changes daily/weekly from the palette
  - **Context-aware:** Matches playlist mood/theme (e.g., Chill = Teal, Party = Coral)
  - **User selection:** Optionally allow users to pick their accent in settings
- **Transitions:** Animate accent color changes with a fade or ripple effect for polish

---

## Accessibility

- **Focus states:** All interactive elements have a visible outline or shadow (accent color)
- **Color contrast:** All text and UI elements meet WCAG AA (4.5:1) minimum
- **ARIA:** Use roles and attributes for lists (`role="listbox"`), options (`role="option"`), modals, and alerts
- **Keyboard navigation:** All controls and lists are navigable via keyboard
- **Screen reader support:** Use descriptive labels, alt text, and ARIA attributes
- **Accent color contrast:** Always check contrast when accent rotates; ensure buttons and text remain readable

---

## Responsive Design

- **Breakpoints:**
  - Mobile: <600px
  - Tablet: 600–900px
  - Desktop: >900px
- **Touch targets:** Minimum 44x44px for buttons and controls

---

## Example Usage

```css
:root {
  --gray-100: #F5F5F5;
  --gray-200: #E0E0E0;
  --gray-400: #BDBDBD;
  --gray-700: #616161;
  --gray-900: #222;
  --accent: #00bfae; /* Rotates from palette */
}

/* Primary button */
.button-primary {
  background: var(--accent);
  color: var(--gray-100);
  border-radius: 6px;
  font-weight: bold;
  padding: 8px 16px;
  border: none;
  transition: background 0.2s;
}
.button-primary:hover,
.button-primary:focus {
  background: #009e96; /* Slightly darker teal for hover/focus */
  outline: 2px solid var(--accent);
}

/* Card */
.card {
  background: var(--gray-200);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(34,34,34,0.06);
  padding: 16px;
  margin-bottom: 16px;
}

/* Error message */
.error-message {
  color: #ff6f61; /* Accent coral */
  font-weight: bold;
  margin-top: 8px;
}
```

---

_Last updated: [29/10/25]_
