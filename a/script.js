const STORAGE_KEY = 'birds-of-iceland-saved';

let birds = [];
let saved = loadSaved();
let lastOpener = null;

const els = {
  search: document.getElementById('search-input'),
  count: document.getElementById('result-count'),
  results: document.getElementById('results'),
  savedList: document.getElementById('saved-list'),
  savedEmpty: document.getElementById('saved-empty'),
  credits: document.getElementById('credits'),
  dialog: document.getElementById('bird-dialog'),
  dialogTitle: document.getElementById('dialog-title'),
  dialogImage: document.getElementById('dialog-image'),
  dialogIcelandic: document.getElementById('dialog-icelandic'),
  dialogSize: document.getElementById('dialog-size'),
  dialogHabitat: document.getElementById('dialog-habitat'),
  dialogSeason: document.getElementById('dialog-season'),
  dialogDescription: document.getElementById('dialog-description'),
  dialogClose: document.getElementById('dialog-close'),
  form: document.getElementById('signup-form'),
  success: document.getElementById('signup-success'),
};

function loadSaved() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

function storeSaved() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]));
  } catch {
    // Saving still works for this visit without storage.
  }
}

function imagePath(bird) {
  return '../' + bird.image;
}

// Lowercase and strip accents so "kria" matches "Kría".
function normalise(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function bookmarkIcon() {
  return '<svg aria-hidden="true" focusable="false"><use href="#icon-bookmark"></use></svg>';
}

function renderResults() {
  const query = normalise(els.search.value.trim());
  const matches = birds.filter((bird) =>
    normalise(bird.name).includes(query) || normalise(bird.icelandicName).includes(query)
  );

  els.count.textContent = matches.length === 1 ? '1 bird found' : `${matches.length} birds found`;
  els.results.replaceChildren(...matches.map(createCard));
}

function createCard(bird) {
  const li = document.createElement('li');
  li.innerHTML = `
    <article class="card">
      <img src="${imagePath(bird)}" alt="${escapeHtml(bird.alt)}" loading="lazy" width="400" height="300">
      <div class="card-body">
        <div>
          <h3><button type="button" class="card-title-button">${escapeHtml(bird.name)}</button></h3>
          <p class="icelandic">Icelandic: <span lang="is">${escapeHtml(bird.icelandicName)}</span></p>
        </div>
        <button type="button" class="icon-btn save-btn" data-id="${bird.id}" aria-label="Save ${escapeHtml(bird.name)}" aria-pressed="${saved.has(bird.id)}">${bookmarkIcon()}</button>
      </div>
    </article>`;

  const titleButton = li.querySelector('.card-title-button');
  const saveButton = li.querySelector('.save-btn');

  titleButton.addEventListener('click', () => openDialog(bird, titleButton));
  // Clicking anywhere else on the card also opens the details.
  li.querySelector('.card').addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    openDialog(bird, titleButton);
  });
  saveButton.addEventListener('click', () => toggleSaved(bird.id));

  return li;
}

function toggleSaved(id) {
  if (saved.has(id)) {
    saved.delete(id);
  } else {
    saved.add(id);
  }
  storeSaved();
  updateSaveButtons();
  renderSaved();
}

function updateSaveButtons() {
  els.results.querySelectorAll('.save-btn').forEach((button) => {
    button.setAttribute('aria-pressed', String(saved.has(button.dataset.id)));
  });
}

function renderSaved() {
  const savedBirds = birds.filter((bird) => saved.has(bird.id));
  els.savedEmpty.hidden = savedBirds.length > 0;
  els.savedList.replaceChildren(...savedBirds.map((bird) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span><span class="saved-name">${escapeHtml(bird.name)}</span> (<span lang="is">${escapeHtml(bird.icelandicName)}</span>)</span>
      <button type="button" class="btn btn-small">Remove<span class="visually-hidden"> ${escapeHtml(bird.name)}</span></button>`;
    li.querySelector('button').addEventListener('click', () => {
      toggleSaved(bird.id);
      // Keep focus in the section after the item disappears.
      const next = els.savedList.querySelector('button');
      (next || document.getElementById('saved-heading')).focus();
    });
    return li;
  }));
}

function renderCredits() {
  els.credits.replaceChildren(...birds.map((bird) => {
    const li = document.createElement('li');
    li.innerHTML = `${escapeHtml(bird.name)}: photo by ${escapeHtml(bird.photoCredit)}, ${escapeHtml(bird.photoLicense)}. <a href="${escapeHtml(bird.photoSource)}">Source<span class="visually-hidden"> for the ${escapeHtml(bird.name)} photo</span></a>`;
    return li;
  }));
}

function openDialog(bird, opener) {
  lastOpener = opener;
  els.dialogTitle.textContent = bird.name;
  els.dialogImage.src = imagePath(bird);
  els.dialogImage.alt = bird.alt;
  els.dialogIcelandic.textContent = bird.icelandicName;
  els.dialogSize.textContent = bird.size;
  els.dialogHabitat.textContent = bird.habitat;
  els.dialogSeason.textContent = bird.season;
  els.dialogDescription.textContent = bird.description;
  els.dialog.showModal();
  els.dialogClose.focus();
}

els.dialogClose.addEventListener('click', () => els.dialog.close());
// Close when clicking the backdrop.
els.dialog.addEventListener('click', (event) => {
  if (event.target === els.dialog) els.dialog.close();
});
// Escape closes a modal <dialog> natively; return focus either way.
els.dialog.addEventListener('close', () => {
  if (lastOpener && document.contains(lastOpener)) lastOpener.focus();
});

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Sign-up form */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let submitted = false;

function validate() {
  const form = els.form;
  const errors = {};
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const trip = form.querySelector('input[name="trip"]:checked');

  if (!name) errors.name = 'Enter your name.';
  if (!email) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address, for example name@example.com.';
  if (!trip) errors.trip = 'Choose a trip.';
  if (!form.elements.consent.checked) errors.consent = 'Tick the box to agree to be contacted about the trip.';

  return errors;
}

function showErrors(errors) {
  ['name', 'email', 'trip', 'consent'].forEach((field) => {
    const message = errors[field];
    const errorEl = document.getElementById(`${field}-error`);
    errorEl.textContent = message || '';
    errorEl.hidden = !message;

    const inputs = field === 'trip'
      ? els.form.querySelectorAll('input[name="trip"]')
      : [els.form.elements[field]];
    inputs.forEach((input) => {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    });
  });
}

function firstInvalidInput(errors) {
  if (errors.name) return els.form.elements.name;
  if (errors.email) return els.form.elements.email;
  if (errors.trip) return els.form.querySelector('input[name="trip"]');
  if (errors.consent) return els.form.elements.consent;
  return null;
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  submitted = true;
  const errors = validate();
  showErrors(errors);

  const first = firstInvalidInput(errors);
  if (first) {
    els.success.hidden = true;
    first.focus();
    return;
  }

  const name = els.form.elements.name.value.trim();
  const trip = els.form.querySelector('input[name="trip"]:checked').value;
  els.success.textContent = `Thank you, ${name}! You are signed up for the trip to ${trip}. We will email you with the details.`;
  els.success.hidden = false;
  els.success.focus();
  els.form.reset();
  submitted = false;
  showErrors({});
});

// After the first submit, update errors as the visitor fixes them.
['input', 'change'].forEach((type) => {
  els.form.addEventListener(type, () => {
    if (submitted) showErrors(validate());
  });
});

/* Start */

els.search.addEventListener('input', renderResults);

fetch('../birds.json')
  .then((response) => {
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  })
  .then((data) => {
    birds = data;
    renderResults();
    renderSaved();
    renderCredits();
  })
  .catch(() => {
    els.count.textContent = 'Sorry, the birds could not be loaded. Please try again later.';
  });
