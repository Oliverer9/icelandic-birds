# Accessibility spec: Birds of Iceland

These are the accessibility decisions for the page. The AI agent can't make them on its own, so they are written down here. The tests in `tests/` check against this spec.

## 1. Heading outline

There is exactly one `h1`, and no heading levels are skipped.

```
h1  Birds of Iceland
    h2  Search birds
        h3  (one per result: the bird's English name, e.g. "Whimbrel")
    h2  Saved birds
    h2  Sign up for a bird-watching trip
    h2  Photo credits                 (in the footer)

Dialog (separate from the page outline):
    h2  (the bird's English name, e.g. "Whimbrel")
```

## 2. Landmarks

| Landmark | Element | Contents |
|---|---|---|
| Banner | `<header>` | Skip link, site name, navigation |
| Navigation | `<nav aria-label="Main">` | Links to `#search`, `#saved`, `#signup` |
| Main | `<main id="main" tabindex="-1">` | The three sections |
| Content info | `<footer>` | Photo credits |

- The **skip link** "Skip to main content" is the first thing in the page. It is hidden until it gets focus, then it becomes visible. It moves focus to `<main>`.
- Each section is a `<section>` with an `id` and `aria-labelledby` pointing to its `h2`.

## 3. Focus order for the main task

Main task: *Search for Whimbrel, open it, close it, save it and sign up.*

Uses only Tab, Shift+Tab, Enter, Space and Escape.

| Step | Key | What happens | Where focus is |
|---|---|---|---|
| 1 | Tab | Skip link appears | "Skip to main content" |
| 2 | Enter | Jumps past the header | `<main>` |
| 3 | Tab | | Search field (label "Search") |
| 4 | type "whim" | List filters; "1 bird found" is announced (`role="status"`) | Search field |
| 5 | Tab | | "Whimbrel" button (inside the result's `h3`) |
| 6 | Enter | Details dialog opens (native `<dialog>` with `showModal()`), named by its `h2` | "Close" button inside the dialog |
| 7 | Tab | Focus stays trapped inside the dialog | Next control in the dialog, then back to "Close" |
| 8 | Escape | Dialog closes | Back on the "Whimbrel" button |
| 9 | Tab | | "Save Whimbrel" button |
| 10 | Space | Bird is saved: `aria-pressed="true"`, icon is filled, "Whimbrel saved" is announced | "Save Whimbrel" button |
| 11 | Tab | | Name field |
| 12 | Tab ×3 | | Email → first Trip radio button → consent checkbox |
| 13 | Tab, Enter | Form is submitted empty or with mistakes: errors appear | Focus moves to the first field with an error |
| 14 | Fix fields, Enter | Form is valid: success message appears | Success message (`tabindex="-1"`, `role="status"`) |

Radio buttons: the arrow keys move between options and Tab leaves the group, which is how native radio buttons work.

## 4. Controls and their names

| Control | Element | Accessible name |
|---|---|---|
| Skip link | `<a href="#main">` | "Skip to main content" |
| Search | `<input type="search">` with `<label>` | "Search" |
| Open details | `<button>` inside the result's `h3` | The bird's English name, e.g. "Whimbrel" |
| Save | `<button aria-pressed>` with an icon only | "Save" + bird name, e.g. "Save Whimbrel" (the name doesn't change; `aria-pressed` tells whether it is saved) |
| Close dialog | `<button>` | "Close" |
| Trip choice | `<fieldset>` with `<legend>Trip</legend>` and three `<input type="radio">` | "Mývatn", "Látrabjarg", "Westman Islands" |
| Consent | `<input type="checkbox">` with `<label>` | "I agree to be contacted about the trip" |
| Submit | `<button type="submit">` | "Sign up" |

- Only native elements: `<button>`, `<a>`, `<input>`, `<dialog>`. No clickable `<div>`s.
- **Every button and link is at least 44 × 44 px** (WCAG's minimum is 24 × 24; we go bigger because the style guide's buttons are already that size).

## 5. Form errors

- No errors are shown before the first submit.
- Each error is text right below its field, linked with `aria-describedby`, and the field gets `aria-invalid="true"`.
- Errors start with the word "Error:" and use a warning icon, so they don't rely on colour alone.
- Error messages:
  - Name: "Error: Enter your name."
  - Email: "Error: Enter an email address like name@example.com."
  - Trip: "Error: Choose a trip."
  - Consent: "Error: You must agree to be contacted to sign up."
- After a failed submit, focus moves to the first field with an error.
- Success message: "Thanks, *name*! You're signed up for the *trip* trip." It has `role="status"` and gets focus.

## 6. Alt text

| Image | Alt | Why |
|---|---|---|
| Bird photo in a result | The `alt` from `birds.json` | Informative: describes what is in that photo |
| Bird photo in the dialog | The same `alt` from `birds.json` | Same photo, same description |
| Bookmark icon in the save button | `aria-hidden="true"` (the button has its own name) | Decorative: the name is on the button |
| Warning icon in errors | `aria-hidden="true"` | Decorative: the error text says "Error:" |
| Any other decorative graphics | `alt=""` | Decorative: nothing a user needs |

## 7. Colours and contrast

Page background is white `#FFFFFF`. WCAG AA needs **4.5:1 for text** and **3:1 for icons, borders and focus rings**.

| Use | Foreground | Background | Ratio | Pass? |
|---|---|---|---|---|
| Headings, links | Navy `#00165D` | White | 16.50:1 | ✅ |
| Body text | Dark grey `#333333` | White | 12.63:1 | ✅ |
| Secondary text (credits, Icelandic name) | Grey `#6E6E6E` | White | 5.10:1 | ✅ |
| Button text | White | Navy `#00165D` | 16.50:1 | ✅ |
| Button text (pressed/hover) | White | Indigo `#272C8D` | 11.47:1 | ✅ |
| Error text | Dark red `#B30000` | White | 7.20:1 | ✅ |
| Success message | Navy `#00165D` | Light yellow `#FFDB94` | 12.42:1 | ✅ |
| Text on tan | Navy `#00165D` | Tan `#B49C7B` | 6.27:1 | ✅ |
| Field and pill borders | Grey `#8C8C8C` | White | 3.36:1 | ✅ (3:1) |
| Icons | Navy `#00165D` | White | 16.50:1 | ✅ (3:1) |
| Focus ring (3 px, 2 px offset) | Blue `#001EFF` | White | 7.99:1 | ✅ (3:1) |

### Style guide colours I changed

| Style guide | Problem | Ratio | Instead |
|---|---|---|---|
| Light grey body text `#8C8C8C` | Too faint for text | 3.36:1 | `#6E6E6E` (5.10:1). `#8C8C8C` is kept for borders only |
| Red `#FF0000` for errors | Too faint for text | 4.00:1 | `#B30000` (7.20:1) |
| Green `#3CFF00` | Unreadable as text | 1.36:1 | Not used for text. For success, navy on light yellow |
| Light grey `#E4E4E4` borders | Invisible border | 1.27:1 | `#8C8C8C` borders (3.36:1) |
| White text on tan `#B49C7B` | Too faint | 2.63:1 | Navy text on tan (6.27:1) |

## 8. Focus visibility

- Every focusable element shows a **3 px solid `#001EFF` outline with a 2 px offset** when focused with the keyboard (`:focus-visible`).
- `outline: none` is never used without a replacement.
- Focus is never hidden behind other content.

## 9. Zoom and motion

- At 200% browser zoom everything still works, with no horizontal scrolling and no text cut off.
- Text sizes are in `rem`: h1 2rem, h2 1.5rem, h3 1.25rem, body 1.25rem, small text 1rem (from the style guide: 32/24/20/20/16).
- Animations are turned off when the user has `prefers-reduced-motion: reduce`.
