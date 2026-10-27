// Birds of Iceland: loads ../birds.json and wires up search, saving, the details dialog and the sign-up form.

const BOOKMARK_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';
const WARNING_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z"/></svg>';
const STORAGE_KEY = 'birds-of-iceland-saved';

let birds = [];
let saved = new Set(loadSaved());
let lastOpener = null;

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function storeSaved() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]));
  } catch {
    // Storage can be unavailable (private mode); saving still works for this visit.
  }
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const child of children) node.append(child);
  return node;
}

/* ---------- Search and results ---------- */

function renderResults() {
  const list = document.getElementById('results');
  list.replaceChildren(...birds.map(bird => {
    const openButton = el('button', { type: 'button', className: 'open-button', textContent: bird.name });
    openButton.addEventListener('click', () => openDialog(bird, openButton));

    const saveButton = el('button', { type: 'button', className: 'save-button', innerHTML: BOOKMARK_ICON });
    saveButton.setAttribute('aria-label', `Save ${bird.name}`);
    saveButton.setAttribute('aria-pressed', String(saved.has(bird.id)));
    saveButton.addEventListener('click', () => toggleSaved(bird, saveButton));

    const icelandic = el('p', { className: 'card-icelandic', lang: 'is', textContent: bird.icelandicName });
    const img = el('img', { src: `../${bird.image}`, alt: bird.alt, loading: 'lazy' });

    const card = el('li', { className: 'card' }, [
      img,
      el('div', { className: 'card-body' }, [
        el('div', {}, [el('h3', {}, [openButton]), icelandic]),
        saveButton
      ])
    ]);
    card.dataset.search = `${bird.name} ${bird.icelandicName}`.toLowerCase();
    return card;
  }));
}

function filterResults() {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  let count = 0;
  for (const card of document.querySelectorAll('#results .card')) {
    const match = card.dataset.search.includes(query);
    card.hidden = !match;
    if (match) count++;
  }
  document.getElementById('result-count').textContent =
    count === 0 ? 'No birds found' : `${count} ${count === 1 ? 'bird' : 'birds'} found`;
}

/* ---------- Saved birds ---------- */

function toggleSaved(bird, button) {
  const isSaved = saved.has(bird.id);
  if (isSaved) saved.delete(bird.id);
  else saved.add(bird.id);
  button.setAttribute('aria-pressed', String(!isSaved));
  storeSaved();
  renderSaved();
  document.getElementById('saved-status').textContent =
    isSaved ? `${bird.name} removed from saved birds` : `${bird.name} saved`;
}

function renderSaved() {
  const savedBirds = birds.filter(bird => saved.has(bird.id));
  document.getElementById('saved-empty').hidden = savedBirds.length > 0;
  document.getElementById('saved-list').replaceChildren(...savedBirds.map(bird =>
    el('li', {}, [`${bird.name} `, el('span', { lang: 'is', textContent: `(${bird.icelandicName})` })])
  ));
}

/* ---------- Details dialog ---------- */

const dialog = document.getElementById('bird-dialog');

function openDialog(bird, opener) {
  lastOpener = opener;
  document.getElementById('dialog-title').textContent = bird.name;
  const img = document.getElementById('dialog-image');
  img.src = `../${bird.image}`;
  img.alt = bird.alt;
  document.getElementById('dialog-icelandic').textContent = bird.icelandicName;
  document.getElementById('dialog-size').textContent = bird.size;
  document.getElementById('dialog-habitat').textContent = bird.habitat;
  document.getElementById('dialog-season').textContent = bird.season;
  document.getElementById('dialog-description').textContent = bird.description;
  dialog.showModal();
  document.getElementById('dialog-close').focus();
}

document.getElementById('dialog-close').addEventListener('click', () => dialog.close());

// Escape closes the dialog natively; either way, focus goes back to the result that opened it.
dialog.addEventListener('close', () => {
  if (lastOpener) lastOpener.focus();
  lastOpener = null;
});

// Clicking the backdrop closes the dialog.
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});

// Keep Tab and Shift+Tab inside the dialog.
dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

/* ---------- Footer credits ---------- */

function renderCredits() {
  document.getElementById('credits').replaceChildren(...birds.map(bird => {
    const link = el('a', { href: bird.photoSource }, [
      'Source',
      el('span', { className: 'visually-hidden', textContent: ` of the ${bird.name} photo` })
    ]);
    return el('li', {}, [
      el('strong', { textContent: bird.name }),
      `: photo by ${bird.photoCredit}, ${bird.photoLicense}. `,
      link
    ]);
  }));
}

/* ---------- Sign-up form ---------- */

const form = document.getElementById('signup-form');
let submitted = false;

function setError(fields, errorId, message) {
  const error = document.getElementById(errorId);
  error.innerHTML = message ? `${WARNING_ICON}<span>Error: ${message}</span>` : '';
  for (const field of fields) {
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
}

function validate() {
  const name = form.elements.name;
  const email = form.elements.email;
  const trips = [...form.querySelectorAll('input[name="trip"]')];
  const consent = form.elements.consent;

  const checks = [
    { fields: [name], errorId: 'name-error', ok: name.value.trim() !== '', message: 'Enter your name.' },
    { fields: [email], errorId: 'email-error', ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), message: 'Enter an email address like name@example.com.' },
    { fields: trips, errorId: 'trip-error', ok: trips.some(t => t.checked), message: 'Choose a trip.' },
    { fields: [consent], errorId: 'consent-error', ok: consent.checked, message: 'You must agree to be contacted to sign up.' }
  ];

  let firstInvalid = null;
  for (const check of checks) {
    setError(check.fields, check.errorId, check.ok ? '' : check.message);
    if (!check.ok && !firstInvalid) firstInvalid = check.fields[0];
  }
  return firstInvalid;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  submitted = true;
  const success = document.getElementById('signup-success');
  const firstInvalid = validate();
  if (firstInvalid) {
    success.textContent = '';
    firstInvalid.focus();
    return;
  }
  const name = form.elements.name.value.trim();
  const trip = form.querySelector('input[name="trip"]:checked').value;
  success.textContent = `Thanks, ${name}! You're signed up for the ${trip} trip.`;
  form.reset();
  submitted = false;
  success.focus();
});

// After the first submit, errors update as the user fixes them.
form.addEventListener('input', () => { if (submitted) validate(); });
form.addEventListener('change', () => { if (submitted) validate(); });

/* ---------- Start ---------- */

document.getElementById('search-input').addEventListener('input', filterResults);

fetch('../birds.json')
  .then(response => {
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  })
  .then(data => {
    birds = data;
    renderResults();
    filterResults();
    renderSaved();
    renderCredits();
  })
  .catch(() => {
    document.getElementById('result-count').textContent = 'Sorry, the birds could not be loaded. Please try again later.';
  });
