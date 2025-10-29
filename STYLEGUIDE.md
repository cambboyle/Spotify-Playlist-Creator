# App Style Guide

A living document for consistent, accessible, and beautiful UI development.

---

## Color Palette

| Name         | Hex      | Usage                        |
|--------------|----------|------------------------------|
| Primary      | #1DB954  | Buttons, highlights          |
| Secondary    | #007a4d  | Selected, accents            |
| Background   | #f7f7f7  | App background               |
| Surface      | #ffffff  | Cards, modals                |
| Error        | #d32f2f  | Error messages               |
| Success      | #388e3c  | Success states               |
| Text         | #222222  | Main text                    |
| Muted Text   | #666666  | Secondary text               |

---

## Typography

- **Font family:** `Inter, Arial, sans-serif`
- **Headings:**
  - H1: 2.5rem, bold
  - H2: 2rem, bold
  - H3: 1.5rem, semi-bold
- **Body:** 1rem, regular
- **Button:** 1rem, bold

---

## Spacing

- **Base unit:** 8px
- **Small gap:** 4px
- **Medium gap:** 16px
- **Large gap:** 32px

---

## Components

### Buttons

- **Primary:** Green background (`#1DB954`), white text, rounded corners, bold
- **Secondary:** White background, green border, green text
- **Disabled:** Muted background, muted text
- **States:** Hover (darker green), Focus (visible outline), Active (slight shadow)

### Forms

- **Input:** Rounded corners, border, padding, focus outline
- **Error:** Red border, error message below input
- **Label:** Clear, readable, associated with input via `for`/`id`

### Cards & Containers

- **Card:** White background, subtle shadow, rounded corners, padding
- **Modal:** Centered, overlay background, focus trap, accessible close button

### Lists

- **Playlist List:** Highlight selected item with secondary color, bold text, visible focus
- **Track List:** Alternating row background for readability

### Feedback

- **Loading Spinner:** Accessible, visible, uses primary/secondary colors
- **Alerts/Errors:** Prominent, uses error color, clear messaging

---

## Accessibility

- **Focus states:** All interactive elements have a visible outline or shadow
- **Color contrast:** All text and UI elements meet WCAG AA (4.5:1) minimum
- **ARIA:** Use roles and attributes for lists (`role="listbox"`), options (`role="option"`), modals, and alerts
- **Keyboard navigation:** All controls and lists are navigable via keyboard
- **Screen reader support:** Use descriptive labels, alt text, and ARIA attributes

---

## Responsive Design

- **Breakpoints:**
  - Mobile: <600px
  - Tablet: 600–900px
  - Desktop: >900px
- **Layout:** Stack components vertically on mobile, use grid/flex for desktop
- **Touch targets:** Minimum 44x44px for buttons and controls

---

## Example Usage

```css
/* Primary button */
.button-primary {
  background: #1DB954;
  color: #fff;
  border-radius: 6px;
  font-weight: bold;
  padding: 8px 16px;
  border: none;
  transition: background 0.2s;
}
.button-primary:hover,
.button-primary:focus {
  background: #007a4d;
  outline: 2px solid #007a4d;
}

/* Card */
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 16px;
  margin-bottom: 16px;
}

/* Error message */
.error-message {
  color: #d32f2f;
  font-weight: bold;
  margin-top: 8px;
}
```

---

## How to Use This Guide

- Reference this guide when building new components or pages.
- Update the guide as your app evolves and new patterns emerge.
- Use consistent naming and structure for CSS classes and variables.
- Prioritize accessibility and responsiveness in all UI work.

---

_Last updated: [29/10/25]_
