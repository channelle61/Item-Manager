
'use strict';

const API_URL = 'http://localhost:3000/api/items';

const elements = {
  form: document.getElementById('itemForm'),
  formPanel: document.getElementById('formPanel'),
  formTitle: document.getElementById('formTitle'),
  formHint: document.getElementById('formHint'),
  nameInput: document.getElementById('nameInput'),
  priceInput: document.getElementById('priceInput'),
  submitBtn: document.getElementById('submitBtn'),
  cancelEditBtn: document.getElementById('cancelEditBtn'),
  itemsContainer: document.getElementById('itemsContainer'),
  itemCount: document.getElementById('itemCount'),
  refreshBtn: document.getElementById('refreshBtn'),
  alertBanner: document.getElementById('alertBanner'),
  alertTitle: document.getElementById('alertTitle'),
  alertMessage: document.getElementById('alertMessage'),
  alertCode: document.getElementById('alertCode'),
  alertClose: document.getElementById('alertClose'),
  apiStatus: document.getElementById('apiStatus'),
  apiStatusText: document.getElementById('apiStatusText')
};

const icons = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>'
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

let items = [];
let editingId = null;
let alertTimer = null;


   //Utilities
  

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function pluralizeItem(count) {
  return `${count} item${count === 1 ? '' : 's'}`;
}

function showAlert(message, { type = 'error', title, code } = {}) {
  const defaultTitles = {
    error: 'Request failed',
    success: 'Success',
    info: 'Heads up'
  };

  window.clearTimeout(alertTimer);

  elements.alertBanner.className = `alert alert--${type}`;
  elements.alertTitle.textContent = title || defaultTitles[type] || 'Notice';
  elements.alertMessage.textContent = message;

  if (code) {
    elements.alertCode.textContent = String(code);
    elements.alertCode.hidden = false;
  } else {
    elements.alertCode.hidden = true;
  }

  elements.alertBanner.hidden = false;

  if (type === 'success' || type === 'info') {
    alertTimer = window.setTimeout(hideAlert, 5000);
  }
}

function hideAlert() {
  window.clearTimeout(alertTimer);
  elements.alertBanner.hidden = true;
}

function setApiStatus(state, text) {
  elements.apiStatus.className = `api-status api-status--${state}`;
  elements.apiStatusText.textContent = text;
}

function describeError(error) {
  if (error.status) return error.message;
  return `${error.message} Make sure the Express server is running on port 3000.`;
}

async function parseApiError(response) {
  let message = `Request failed with status ${response.status} ${response.statusText}`.trim();

  try {
    const body = await response.json();
    if (body && body.error) message = body.error;
    else if (body && body.message) message = body.message;
  } catch (parseError) {
    // The server returned a non-JSON error; keep the status-based message.
  }

  const error = new Error(message);
  error.status = response.status;
  return error;
}

/**
 * Small fetch wrapper: throws a normalized Error for HTTP and network failures.
 */
async function apiRequest(url, options = {}) {
  const config = { ...options };
  if (options.body) {
    config.headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error('Unable to reach the API. Check your network and that the server is running.');
  }

  if (!response.ok) throw await parseApiError(response);

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}


   //Rendering
   

function renderState(type, title, detail) {
  const icon = {
    loading: '<span class="spinner" aria-hidden="true"></span>',
    empty: '<span class="state__icon" aria-hidden="true">&#128203;</span>',
    error: '<span class="state__icon" aria-hidden="true">&#9888;</span>'
  }[type];

  elements.itemsContainer.innerHTML = `
    <div class="state state--${type}">
      ${icon || ''}
      <p><strong>${escapeHtml(title)}</strong></p>
      <p>${escapeHtml(detail)}</p>
    </div>
  `;
}

function renderItems() {
  elements.itemCount.textContent = pluralizeItem(items.length);

  if (items.length === 0) {
    renderState('empty', 'No items yet', 'Use the form to add your first item.');
    return;
  }

  elements.itemsContainer.innerHTML = items.map((item) => {
    const safeId = escapeHtml(item.id);
    const safeName = escapeHtml(item.name);
    const price = currencyFormatter.format(Number(item.price) || 0);

    return `
      <article class="item-card" data-id="${safeId}">
        <div class="item-card__top">
          <h3 class="item-card__name">${safeName}</h3>
          <span class="item-card__id">#${safeId}</span>
        </div>
        <p class="item-card__price">${price}</p>
        <div class="item-card__actions">
          <button type="button" class="btn btn--warning" data-action="edit" aria-label="Edit ${safeName}">
            ${icons.edit}<span>Edit</span>
          </button>
          <button type="button" class="btn btn--danger" data-action="delete" aria-label="Delete ${safeName}">
            ${icons.trash}<span>Delete</span>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function resetForm() {
  elements.form.reset();
  editingId = null;
  elements.formPanel.classList.remove('form-panel--editing');
  elements.formTitle.textContent = 'Add an item';
  elements.formHint.textContent = 'Fill in the details to create a new item.';
  elements.submitBtn.textContent = 'Add item';
  elements.cancelEditBtn.hidden = true;
}

function startEditing(item) {
  editingId = item.id;
  elements.formPanel.classList.add('form-panel--editing');
  elements.formTitle.textContent = 'Edit item';
  elements.formHint.textContent = `Editing "${item.name}" — save your changes below.`;
  elements.nameInput.value = item.name;
  elements.priceInput.value = item.price;
  elements.submitBtn.textContent = 'Save changes';
  elements.cancelEditBtn.hidden = false;

  elements.formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  elements.nameInput.focus({ preventScroll: true });
}


   //API actions
   

async function loadItems() {
  try {
    const payload = await apiRequest(API_URL);
    items = Array.isArray(payload && payload.data) ? payload.data : [];
    renderItems();
    setApiStatus('online', `API connected · ${pluralizeItem(items.length)}`);
  } catch (error) {
    if (items.length === 0) {
      renderState('error', 'Could not load items', 'Check the API connection, then press Refresh.');
    }
    setApiStatus('offline', 'API offline');
    showAlert(describeError(error), { type: 'error', code: error.status });
  }
}

async function saveItem(event) {
  event.preventDefault();

  const name = elements.nameInput.value.trim();
  const price = Number(elements.priceInput.value);

  if (!name) {
    showAlert('Please enter an item name.', { type: 'error' });
    elements.nameInput.focus();
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    showAlert('Price must be a number greater than 0.', { type: 'error' });
    elements.priceInput.focus();
    return;
  }

  const payload = {
    name,
    price: Math.round(price * 100) / 100
  };
  const isEditing = editingId !== null;

  elements.submitBtn.disabled = true;
  elements.submitBtn.textContent = isEditing ? 'Saving…' : 'Adding…';

  try {
    const result = isEditing
      ? await apiRequest(`${API_URL}/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      : await apiRequest(API_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

    const savedItem = (result && result.data) || { ...payload, id: editingId };

    if (isEditing) {
      items = items.map((item) => (item.id === savedItem.id ? savedItem : item));
      showAlert(`"${savedItem.name}" was updated.`, { type: 'success' });
    } else {
      items.push(savedItem);
      showAlert(`"${savedItem.name}" was added.`, { type: 'success' });
    }

    renderItems();
    setApiStatus('online', `API connected · ${pluralizeItem(items.length)}`);
    resetForm();
  } catch (error) {
    showAlert(describeError(error), { type: 'error', code: error.status });
  } finally {
    elements.submitBtn.disabled = false;
    elements.submitBtn.textContent = editingId !== null ? 'Save changes' : 'Add item';
  }
}

async function removeItem(id, name) {
  try {
    await apiRequest(`${API_URL}/${id}`, { method: 'DELETE' });

    items = items.filter((item) => item.id !== id);
    if (editingId === id) resetForm();

    renderItems();
    setApiStatus('online', `API connected · ${pluralizeItem(items.length)}`);
    showAlert(`"${name}" was deleted.`, { type: 'success' });
  } catch (error) {
    showAlert(describeError(error), { type: 'error', code: error.status });
  }
}


  // Event handlers
async function handleItemActions(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const card = button.closest('.item-card');
  if (!card) return;

  const id = Number(card.dataset.id);
  const item = items.find((current) => current.id === id);
  if (!item) return;

  if (button.dataset.action === 'edit') {
    startEditing(item);
    return;
  }

  if (button.dataset.action === 'delete') {
    const confirmed = window.confirm(`Delete "${item.name}"? This cannot be undone.`);
    if (confirmed) await removeItem(id, item.name);
  }
}

async function handleRefresh() {
  elements.refreshBtn.classList.add('refresh-spin');
  await loadItems();
  window.setTimeout(() => elements.refreshBtn.classList.remove('refresh-spin'), 600);
}


   //Wire up and initial load
   

elements.form.addEventListener('submit', saveItem);
elements.itemsContainer.addEventListener('click', handleItemActions);
elements.refreshBtn.addEventListener('click', handleRefresh);
elements.alertClose.addEventListener('click', hideAlert);
elements.cancelEditBtn.addEventListener('click', () => {
  resetForm();
  showAlert('Edit cancelled. No changes were saved.', { type: 'info' });
});

renderState('loading', 'Loading items…', 'Fetching the latest inventory from the API.');
loadItems();
