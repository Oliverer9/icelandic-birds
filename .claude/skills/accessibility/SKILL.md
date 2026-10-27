---
name: accessibility
description: Accessibility rules for web pages. Use whenever you build or change UI.
---

# Accessibility

Everyone must be able to use the page: with a keyboard only, with a screen reader, and zoomed in to 200%.

## Follow spec.md

`spec.md` in the project root holds the accessibility decisions for this project: heading outline, landmarks, focus order, control names, form errors, alt text and colours. Read it before you start and follow it exactly. If spec.md and these rules disagree, spec.md wins.

## Rules

**Use native elements.**
- Use `<button>` for actions, `<a href>` for links, `<input>`/`<select>`/`<textarea>` for form fields, `<dialog>` for dialogs.
- Never make a `<div>` or `<span>` clickable. Don't add ARIA roles to fix what a native element already does.

**Every control has a name.**
- Every form field has a `<label>` connected with `for`/`id`. Placeholder text is not a label.
- Icon-only buttons get an `aria-label` that says what they do; the icon itself gets `aria-hidden="true"`.
- Groups of radio buttons or checkboxes go in a `<fieldset>` with a `<legend>`.
- Toggle buttons use `aria-pressed` and keep the same name.

**Focus is always visible.**
- Every focusable element has a clear `:focus-visible` style with at least 3:1 contrast against the background.
- Never use `outline: none` without a replacement.
- The order of focus follows the order on screen.

**Dialogs handle focus.**
- Open dialogs with `<dialog>` and `showModal()`, and name them with `aria-labelledby` pointing to their heading.
- When a dialog opens, focus moves inside it. Escape and a Close button both close it.
- When it closes, focus goes back to the element that opened it.

**Form errors are shown and announced.**
- Don't show errors before the user tries to submit.
- Show each error as text next to its field, connect it with `aria-describedby`, and set `aria-invalid="true"` on the field.
- Don't rely on colour alone; the text must say it is an error.
- After a failed submit, move focus to the first field with an error.
- Put success messages and other changing status text (like result counts) in an element with `role="status"`.

**Images have the right alt text.**
- Informative images: `alt` describes what is in the image. Use the alt text from the data when there is one.
- Decorative images and icons: `alt=""` (or `aria-hidden="true"` for inline SVG).

**Targets are big enough.**
- Every button, link and form control is at least 24 × 24 CSS px (aim for 44 × 44).

**Structure and readability.**
- One `h1`, and no skipped heading levels.
- Use `<header>`, `<nav>`, `<main>` and `<footer>`, and start the page with a skip link to `<main>`.
- Text has at least 4.5:1 contrast, icons and borders at least 3:1.
- Use `rem` for font sizes so the page works at 200% zoom without horizontal scrolling.
- Respect `prefers-reduced-motion`.

When you are done, run the tests and fix what fails.
