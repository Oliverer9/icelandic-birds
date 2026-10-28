# Results log

Notes collected while doing the assignment. The report is written from these.

## Test results: A vs B

| Test | A (no skill) | B before fixing | B after fixing |
|---|---|---|---|
| Keyboard main task | ✘ failed | ✓ | ✓ |
| Visible focus | ✓ | ✓ | ✓ |
| Focus return after dialog | ✓ | ✓ | ✓ |
| axe (no serious/critical) | ✓ | ✓ | ✓ |
| **Failures** | **1 of 4** | **0 of 4** | **0 of 4** |

### Project A
- Built in a fresh session from `prompt.md`, told not to open `spec.md` or `tests/`. Not edited by hand.
- **Failed:** keyboard main task. The search section and the search field were both named "Search", so the test could not tell which one to use and stopped before checking any keyboard behaviour.
- A darkened the style guide's red (`#B00000`) and greys on its own, and added a skip link, focus outlines, `aria-pressed` and `aria-invalid` without being asked.
- Note: the first A session read `spec.md` and the tests on its own before asking whether to follow them. That session was closed and A was rebuilt in a new session told to stay away from those files.

### Project B
- Built in a fresh session from the same `prompt.md`, with the accessibility skill, told not to open `a/` or the git history.
- The agent ran the tests once before building (all 4 failed because `b/` was empty), then built the page.
- **First run after building: 4 of 4 passed.** Nothing needed fixing.
- B named the search section "Search birds", as `spec.md` says, so the naming clash that broke A's test never happened.

### What the numbers mean
- 1 vs 0 failures looks like a clear win for B, but A's one failure was a naming clash, not a missing accessibility feature. Both pages are close on what the automated tests check.
- The real difference: B follows `spec.md` (heading names, focus order, error wording, colours) because the skill told it to. A had to guess.

## Agent browser test (step 7)

Agent: Claude in the Claude desktop app's built-in browser. It reads the page through the accessibility tree (the same names and roles a screen reader uses), then clicks, types and presses keys.

Task: *Search for Whimbrel, open it, close it, save it and sign up.*

### On B (`b/`)

| Step | What the agent saw / did | Result |
|---|---|---|
| Find the search | `textbox "Search"` | ✓ |
| Search | Typed "Whimbrel"; `status "1 bird found"` updated | ✓ |
| Open details | Found `button "Whimbrel"` and clicked it; dialog opened, focus on "Close" | ✓ |
| Close | Pressed Escape; dialog closed, focus back on the "Whimbrel" button | ✓ |
| Save | Found `button "Save Whimbrel"` by name and clicked it; `aria-pressed` became `true`, status said "Whimbrel saved" and the bird appeared under Saved birds | ✓ |
| Sign up (empty) | Submitted empty: four errors starting with "Error:" (exact wording from spec.md), focus moved to Name | ✓ |
| Sign up (filled in) | Success message "Thanks, Oliver! You're signed up for the Mývatn trip." got focus | ✓ |

The agent finished the whole task without screenshots, using only the names in the accessibility tree.

### On the copy with a `<div>` save button (`b-div/`)

`b-div/` is a copy of `b/` with **one line changed** in `app.js`: the save button is created as a `<div>` instead of a `<button>`. Everything else (the `aria-label`, `aria-pressed`, the click handler, the look) is the same.

| Step | What changed |
|---|---|
| Finding "Save Whimbrel" | The accessibility tree showed `generic "Save Whimbrel"` instead of `button "Save Whimbrel"`. Searching the page for "Save Whimbrel" found nothing. The agent could not tell it was something to click. |
| Keyboard | Tab skipped it completely: from the "Whimbrel" button, Tab went straight to the next bird. Space did nothing. |
| Mouse | The agent had to take a screenshot, see the bookmark icon and click its pixel position. That worked: the bird was saved. |
| Saved state | `aria-pressed` is not allowed on a `<div>`, so a screen reader is not told whether the bird is saved. |
| Looks | Exactly the same as B. You can't see the difference. |

**Tests on `b-div/`: 4 of 4 failed.** Every test stopped at the start, because it waits for 8 buttons named "Save …" and found 0.

**axe on `b-div/`:** 2 new violations, 8 elements each:
- `aria-allowed-attr` (critical): `aria-pressed` is not allowed on a `<div>`
- `aria-prohibited-attr` (serious): `aria-label` is not allowed on a `<div>` with no role

### What this shows
- One changed tag made the save button invisible to keyboard users, to screen readers and to the AI agent, while it looked exactly the same with a mouse.
- The agent and a screen reader depend on the same thing: native elements with names. When the button was real, the agent found it by its name in one step. As a `<div>`, it had to fall back to guessing from a screenshot.
- This is why the skill's first rule is "Use native elements. Never make a `<div>` clickable."

## Testing by hand (step 8)

_To be filled in._
