# Testing by hand (step 8)

Testing Project B without AI. Tick each box when it works. When something doesn't work or feels wrong, write it under **Notes**. Those notes go into the report.

**Before you start**
- Start the server (Live Server, or `node tests/server.js`) and open Project B in **Chrome or Edge**.
- Have `spec.md` open next to the browser, so you can compare.
- Time needed: about 30 minutes.

---

## Part 1: Keyboard only (about 10 min)

**Put the mouse away.** Use only: **Tab** (forward), **Shift+Tab** (back), **Enter**, **Space**, **Escape** and the **arrow keys**.

Reload the page (F5), then:

- [x] **1.** Press **Tab** once. A "Skip to main content" link appears at the top.
- [x] **2.** Press **Enter**. Then **Tab** goes to the search field, not to the menu.
- [x] **3.** Reload, and Tab through the menu links (Search, Saved birds, Sign up). Pressing **Enter** on one jumps to that section.
- [x] **4.** Go to the search field and type `whimbrel`. Only the Whimbrel is left, and the count says "1 bird found".
- [x] **5.** **Tab** to the "Whimbrel" name and press **Enter**. The details dialog opens.
- [x] **6.** Press **Tab** a few times inside the dialog. Where does focus go? It should stay inside the dialog and not go behind it.
- [x] **7.** Press **Escape**. The dialog closes, and focus is back on "Whimbrel".
- [x] **8.** Open it again, Tab to **Close** and press **Enter**. Focus goes back to "Whimbrel" again.
- [x] **9.** **Tab** to the bookmark button and press **Space**. It visibly changes, and Whimbrel shows up under "Saved birds".
- [x] **10.** **Tab** to the **Sign up** button *without filling anything in* and press **Enter**. Errors appear, and focus jumps to Name.
- [x] **11.** Fill in Name and Email. On **Trip**, use the **arrow keys** to choose a trip. Press **Space** on the checkbox.
- [x] **12.** Press **Enter** on Sign up. A thank-you message appears.

**Check the whole time:**
- [x] I could **always see where focus was**, without hunting for it.
- [x] Focus never **disappeared**, and never jumped somewhere strange.
- [x] The order made sense: top to bottom, left to right.

**Notes:**

-After the last element on the page, Tab goes to Firefox’s address bar, then back to the skip link. This is normal browser behaviour, not a page problem.

---

## Part 2: Screen reader (about 15 min)

Use **NVDA** (free, recommended) or **Narrator** (built into Windows).

| | NVDA | Narrator |
|---|---|---|
| Get it | [nvaccess.org/download](https://www.nvaccess.org/download/) | Already installed |
| Turn on | **Ctrl + Alt + N** | **Ctrl + Win + Enter** |
| Turn off | **Insert + Q** | **Ctrl + Win + Enter** |
| Stop talking | **Ctrl** | **Ctrl** |
| Next heading | **H** | **H** |
| Next landmark | **D** | **D** |
| Next image | **G** | (use Tab/arrows) |
| Read next line | **↓** | **Caps Lock + →** |

**Tip (NVDA):** open **NVDA menu → Tools → Speech Viewer**. It shows everything NVDA says as text, so you can copy the exact words into your report.

**Tip:** close your eyes or look away for some of it. You're testing what someone hears, not what they see.

Reload the page, then:

- [x] **1. Headings.** Press **H** repeatedly. Write down what you hear and compare it with the heading outline in `spec.md` §1.
  - Heard:
- [x] **2. Landmarks.** Press **D** repeatedly. You should hear banner/header, navigation "Main", main and footer/content info.
- [x] **3. Images.** Press **G** (NVDA) through the 8 photos. Without looking: does each description let you picture the bird?
- [x] **4. Search.** Tab to search. It says "Search" and that it's a search/edit field. Type `whimbrel`. **Does it announce "1 bird found" by itself?**
- [x] **5. Open button.** Tab to it. It says "Whimbrel, button".
- [x] **6. Dialog.** Press Enter. It says it's a **dialog** called "Whimbrel" and that you're on "Close".
- [x] **7. Escape.** Focus is back on "Whimbrel, button".
- [x] **8. Save button.** Tab to it. It says "Save Whimbrel, **toggle button, not pressed**". Press Space: it says "**pressed**", and/or "Whimbrel saved".
- [x] **9. Form fields.** Each field says its label (Name, Email). The radio buttons say "**Trip**" and how many options there are. The checkbox says its text.
- [x] **10. Errors.** Submit empty. **Do you hear the errors?** When you're on Name, does it read "Error: Enter your name"?
- [x] **11. Success.** Fill it in and submit. **Do you hear the thank-you message?**

**Check the whole time:**
- [x] Nothing was read **twice** or read in a confusing way.
- [x] Nothing was **silent** when it should have said something.
- [x] What I heard matches `spec.md` (headings §1, names §4, errors §5, alt text §6).

**Notes (what was heard vs. what was expected):**

- Tested with NVDA in Firefox. All 11 checks worked as expected, and what NVDA said matched spec.md.
- At first NVDA only said "Birds of Iceland, Mozilla Firefox" and couldn't read the page. Firefox had been opened before NVDA was installed; it worked after restarting Firefox.

---

## Part 3: 200% zoom (about 5 min)

Press **Ctrl and +** until the browser says **200%**. (**Ctrl + 0** goes back to 100%.)

- [x] There is **no sideways scrolling**: the page fits the window's width.
- [x] No text is **cut off** or **on top of** other text.
- [x] The **menu** still fits and works.
- [x] The bird cards are readable, and the bookmark buttons are still easy to hit.
- [x] The **dialog** fits on screen, and **Close** can be reached (scroll inside it if needed).
- [x] The **form** and the error messages are readable and not squashed.
- [x] Do the whole main task once with the keyboard at 200%. Focus is still visible.
- [x] *(Extra)* Try **400%**. Does it still work? That's like a small phone.

**Notes:**

- Everything worked fine at 200%. The only problem was at 400%. When reading about a bird at 400%, you have to scroll a lot in the dialog, which is normal. The problem was that when I reached the end of the dialog and kept scrolling, the page behind the dialog scrolled instead. I could not scroll back up until the page behind was scrolled back down to its original position.

---

## Part 4: What the tests missed

For each problem you found, fill in a row. "Would a test catch it?": look at `tests/accessibility.spec.js` and decide if any of the 4 tests checks this.

| # | What I found | Where (keyboard / screen reader / zoom) | Would our tests catch it? | How bad? (small / medium / blocks the task) |
|---|---|---|---|---|
| 1 | At 400% zoom, scrolling past the end of the bird dialog scrolls the page behind it. Scrolling back up then moves the hidden page first, so the dialog seems stuck until the page behind is back where it was. | Zoom | No. None of the 4 tests zoom in or scroll the dialog. | Medium: confusing, but the task can still be finished |
| 2 | After the last element, Tab goes to Firefox's address bar, then back to the skip link. | Keyboard | Not a problem: normal browser behaviour | None |
| 3 | NVDA only said "Birds of Iceland, Mozilla Firefox" until Firefox was restarted. | Screen reader | Not a page problem: a setup issue when testing | None |

**Pick one problem to turn into a new automated test.** The assignment requires at least one. Bring it to Claude and we'll write the test together.

**If you found nothing wrong:** that's also a result. Pick one thing you checked by hand that **no test checks yet** (for example "the result count is announced", "the page fits at 200% zoom with no sideways scroll", or "focus stays inside the dialog") and turn that into the new test.
