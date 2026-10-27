// Accessibility tests for Birds of Iceland. They check the page against spec.md.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Press Tab (or Shift+Tab) until `target` has focus. Fails if it takes more than `max` presses.
async function tabTo(page, target, { max = 40, back = false } = {}) {
  await expect(target, 'element to tab to should exist').toBeAttached();
  for (let i = 0; i < max; i++) {
    if (await target.evaluate(el => el === document.activeElement)) return;
    await page.keyboard.press(back ? 'Shift+Tab' : 'Tab');
  }
  await expect(target, `could not reach with ${back ? 'Shift+Tab' : 'Tab'} in ${max} presses`).toBeFocused();
}

// Wait until the page has loaded all 8 birds from birds.json.
test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('button', { name: /^Save / })).toHaveCount(8);
});

test('keyboard: main task works with only Tab, Shift+Tab, Enter, Space and Escape', async ({ page }) => {
  // Skip link is the first Tab stop and jumps past the header.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /skip to/i })).toBeFocused();
  await page.keyboard.press('Enter');

  // Search for Whimbrel. The new result count is in a live region, so it gets announced.
  const search = page.getByLabel('Search', { exact: true });
  await tabTo(page, search, { max: 3 });
  await page.keyboard.type('Whimbrel');
  const liveRegion = page.locator('[role="status"], [aria-live="polite"], [aria-live="assertive"], output');
  await expect(liveRegion.filter({ hasText: /\b1 bird/i })).toHaveCount(1);

  // Open the details with Enter. Focus moves into the dialog.
  const openButton = page.getByRole('button', { name: 'Whimbrel', exact: true });
  await tabTo(page, openButton);
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Whimbrel' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el => el.contains(document.activeElement)), 'focus should be inside the dialog').toBe(true);

  // Close it with Escape. Focus goes back to the button that opened it.
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();

  // Save the bird with Space. The button says it is pressed.
  const saveButton = page.getByRole('button', { name: 'Save Whimbrel' });
  await tabTo(page, saveButton);
  await page.keyboard.press('Space');
  await expect(saveButton).toHaveAttribute('aria-pressed', 'true');

  // Shift+Tab goes back to the open button, Tab returns to Save.
  await page.keyboard.press('Shift+Tab');
  await expect(openButton).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(saveButton).toBeFocused();

  // Submit the empty form: errors appear and focus moves to the first wrong field.
  const name = page.getByRole('textbox', { name: /^name/i });
  const submit = page.getByRole('button', { name: /sign up/i });
  await tabTo(page, submit);
  await page.keyboard.press('Enter');
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');

  // Fill in the form with the keyboard and submit it.
  await page.keyboard.type('Oliver');
  await tabTo(page, page.getByRole('textbox', { name: /^email/i }), { max: 3 });
  await page.keyboard.type('oliver@example.com');
  await tabTo(page, page.getByRole('radio', { name: 'Mývatn' }), { max: 3 });
  await page.keyboard.press('Space');
  await tabTo(page, page.getByRole('checkbox', { name: /agree/i }), { max: 3 });
  await page.keyboard.press('Space');
  await tabTo(page, submit, { max: 3 });
  await page.keyboard.press('Enter');
  await expect(page.getByText(/thank|signed up|success/i).first()).toBeVisible();
});

test('focus: every element reached with Tab has a visible focus indicator', async ({ page }) => {
  const checked = new Set();
  const invisible = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const el = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const hasOutline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && s.outlineColor !== 'rgba(0, 0, 0, 0)';
      const hasShadow = s.boxShadow !== 'none';
      const label = (el.getAttribute('aria-label') || el.textContent || el.name || el.id || '').trim().slice(0, 40);
      return { id: `${el.tagName.toLowerCase()} "${label}"`, visible: hasOutline || hasShadow };
    });
    if (!el || checked.has(el.id)) continue;
    checked.add(el.id);
    if (!el.visible) invisible.push(el.id);
  }
  expect(checked.size, 'should find more than 5 focusable elements').toBeGreaterThan(5);
  expect(invisible, 'these elements have no visible focus').toEqual([]);
});

test('focus: returns to the result after the dialog closes (Close button and Escape)', async ({ page }) => {
  const openButton = page.getByRole('button', { name: 'Atlantic puffin', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Atlantic puffin' });

  // Close with the Close button.
  await openButton.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole('button', { name: 'Close', exact: true });
  await tabTo(page, close, { max: 5 });
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();

  // Close with Escape.
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();
});

test('axe: no serious or critical violations (page, open dialog, form errors)', async ({ page }) => {
  const seriousViolations = async () => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    return results.violations
      .filter(v => v.impact === 'serious' || v.impact === 'critical')
      .map(v => `${v.id} (${v.impact}): ${v.help} [${v.nodes.length}x]`);
  };

  expect(await seriousViolations(), 'page as loaded').toEqual([]);

  await page.getByRole('button', { name: 'Atlantic puffin', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await seriousViolations(), 'with the dialog open').toEqual([]);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /sign up/i }).click();
  expect(await seriousViolations(), 'with form errors showing').toEqual([]);
});
