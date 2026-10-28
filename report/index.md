---
title: Report
---

# Report: Birds of Iceland

**Main task:** Search for Whimbrel, open it, save it and sign up.

I built the same one-page website about Icelandic birds twice with an AI agent (Claude Code), using the same prompt ([prompt.md](../prompt.md)). **Project A** was built from the prompt alone. **Project B** was built with an accessibility skill that also told the agent to follow my [accessibility spec](../spec.md). I then compared them with automated tests, an AI agent in a browser, and testing by hand.

- [Project A](../a/) · [Project B](../b/) · [B with a div save button](../b-div/)
- Detailed notes: [results log](results.md) · [testing-by-hand checklist](manual-testing.md)

---

## 1. Test results for A and B

The tests are in [tests/accessibility.spec.js](https://github.com/Oliverer9/icelandic-birds/blob/main/tests/accessibility.spec.js). I wrote the first four and committed them before anything was built, so they started out failing. The fifth test was added after testing by hand (see section 3).

| Test | A | B before fixing | B after fixing |
|---|---|---|---|
| Keyboard: main task with only Tab, Shift+Tab, Enter, Space and Escape | ✘ | ✓ | ✓ |
| Focus: every element reached with Tab has a visible focus indicator | ✓ | ✓ | ✓ |
| Focus: returns to the result after the dialog closes | ✓ | ✓ | ✓ |
| axe: no serious or critical violations (page, open dialog, form errors) | ✓ | ✓ | ✓ |
| Zoom: at 400% the page behind the dialog doesn't scroll *(added later)* | ✘ | ✘ | ✓ |
| **Failures** | **2 of 5** | **1 of 5** | **0 of 5** |

With the original four tests, **A failed 1 and B failed 0**. B passed all four on its first run after it was built, so nothing needed fixing until I added the fifth test.

**Why A failed the keyboard test.** A gave its search section the name "Search", the same as the search field. The test looks for "the element labelled Search", found two, and stopped before it checked any keyboard behaviour. B called its section "Search birds", as my spec says, so the clash never happened. A's failure is real in one way: a screen-reader user hears two things called "Search". But it's mostly about naming, not a missing accessibility feature. The test could also have been written to look only for the search field.

**What the numbers don't show.** 1 vs 0 failures looks like a big win for B, but the two pages were close. A, without the skill, still added a skip link, focus outlines, `aria-pressed` on the save buttons and `aria-invalid` on form fields, and it darkened my style guide's red on its own to pass contrast. The difference is that B followed my spec exactly (headings, error messages, colours), while A had to guess.

## 2. The agent test, before and after the div change

I had an AI agent (Claude, in the Claude desktop app's built-in browser) do the main task. It reads the page through the accessibility tree, which holds the same names and roles a screen reader uses.

**On B, everything worked.** The agent found `textbox "Search"`, typed "Whimbrel", saw `status "1 bird found"`, opened `button "Whimbrel"`, closed the dialog with Escape (focus went back to the button), clicked `button "Save Whimbrel"` (it became pressed and "Whimbrel saved" was announced), and filled in the form. It did all of it from the names alone, without screenshots.

**Then I changed one line:** in a copy ([b-div](../b-div/)), the save button is a `<div>` instead of a `<button>`. It looks exactly the same.

| | B (`<button>`) | B-div (`<div>`) |
|---|---|---|
| What the agent saw | `button "Save Whimbrel"` | `generic "Save Whimbrel"`; searching the page for it found nothing |
| How the agent saved the bird | Clicked it by name | Had to take a screenshot and click the icon's pixel position |
| Keyboard | Tab reaches it, Space saves | Tab skips it completely, so a keyboard user can't save |
| Screen reader | "Save Whimbrel, toggle button, pressed" | Not a button, and its saved state isn't announced |
| Tests | 4 of 4 passed | 4 of 4 failed |
| axe | No problems | 2 new problems on all 8 buttons: `aria-allowed-attr` (critical), `aria-prohibited-attr` (serious) |

One changed tag made the button invisible to keyboard users, screen readers and the AI agent, while it looked exactly the same with a mouse. **The agent and a screen reader need the same thing: real elements with names.**

## 3. What testing by hand found that the tests missed

I tested Project B without AI in Firefox: keyboard only, then the NVDA screen reader, then 200% and 400% zoom. Full checklist: [manual-testing.md](manual-testing.md).

- **Keyboard:** all 12 steps of the main task worked. Focus was always visible and moved in a sensible order.
- **Screen reader (NVDA):** all 11 checks worked and matched my spec. Headings, landmarks and alt text were read correctly, "1 bird found" and "Whimbrel saved" were announced, the save button said "toggle button, pressed", and the form errors and success message were read out.
- **200% zoom:** everything worked, with no sideways scrolling and nothing cut off.
- **400% zoom: problem found.** At 400% you have to scroll a lot inside the bird dialog, which is normal. But when I reached the end of the dialog and kept scrolling, the page behind the dialog scrolled instead. I could not scroll back up until the page behind was scrolled back down to its original position.

None of the four tests zoom in or scroll inside the dialog, so they couldn't catch this.

**New test:** *zoom: at 400% the page behind the dialog does not scroll while the dialog is open.* It makes the window 320 × 256 px (what 1280 × 1024 looks like at 400% zoom), opens a dialog, scrolls a lot inside it, and checks that the page behind didn't move. Before the fix it failed on B: the page behind moved from 521 px to 4,582 px.

**Fix in B** (two lines of CSS): `overscroll-behavior: contain` on the dialog, so scrolling stops at its end, and `html:has(.bird-dialog[open]) { overflow: hidden; }`, which locks the page while the dialog is open. B now passes all 5 tests. **A has the same problem**, but I left A unchanged.

**Other things I noticed (not page problems):**
- After the last element on the page, Tab goes to Firefox's address bar and then back to the skip link. That's normal browser behaviour.
- At first NVDA only said "Birds of Iceland, Mozilla Firefox" and couldn't read the page, because Firefox had been opened before NVDA was installed. It worked after restarting Firefox. A setup problem can look like a broken page.

## 4. The skill

The skill is in [.claude/skills/accessibility/SKILL.md](https://github.com/Oliverer9/icelandic-birds/blob/main/.claude/skills/accessibility/SKILL.md). It's about one page, and has rules for:

- native elements, never a clickable `<div>`
- a name for every control, including `aria-label` on icon-only buttons and `aria-pressed` on toggles
- visible focus
- dialog focus: move in, close with Escape or Close, go back to the opener
- form errors as text next to the field, connected with `aria-describedby`, plus `aria-invalid` and focus on the first error
- alt text, with `alt=""` for decorative images
- targets of at least 24 × 24 px
- structure: one h1, landmarks, a skip link, contrast, `rem` sizes and reduced motion

It ends with: *"When you are done, run the tests and fix what fails."*

**The rule that made a real difference: "Read spec.md before you start and follow it exactly."** A already knew most of the general rules, like a skip link, focus outlines and `aria-pressed`. What it couldn't know were *my* decisions. Because of this one rule, B:
- named the search section "Search birds", which avoided the naming clash that made A fail
- used my exact error messages ("Error: Enter your name.") and moved focus to the first error
- used the colours from my spec, which fixed the style-guide colours that failed contrast

The skill turned the spec from a document into instructions the agent actually followed.

## 5. What the AI got wrong

- **Both A and B missed the 400% zoom problem.** Neither the AI with the skill nor the one without it thought about the page scrolling behind the dialog. Only testing by hand found it.
- **A gave two elements the same name ("Search")**, which is confusing for screen-reader users and broke a test.
- **The first A session read things it wasn't meant to.** Without being asked, the agent opened my `spec.md` and the tests while looking around the project, and then asked whether to follow them. I closed that session and rebuilt A in a new one told to stay away from those files. An agent uses whatever is in the project, so a fair comparison has to tell it what to leave alone.
- **The AI that helped me write the tests made a mistake.** The keyboard test looked for "the element labelled Search", which also matched A's section heading. The test stopped early on A instead of testing the keyboard. Tests need testing too.
- **My style guide failed contrast** in five places: light grey text, red errors, green, light grey borders, and white on tan. I found that when writing the spec, not the AI. A fixed some of it on its own; B used my spec's colours.

## What I learned

- The automated tests were useful, but they only checked what I thought of in advance. All the tests passed on B, and B still had a problem that a person found in five minutes of zooming.
- A modern AI already knows a lot about accessibility. The skill's value was less about teaching it rules and more about making it follow *my* decisions.
- Using real elements like `<button>` matters for more than screen readers. It's also how AI agents understand a page.
