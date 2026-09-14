/*
 * Search Block (RBC)
 * A lightweight search input. The authored content provides the placeholder
 * text and (optionally) an action URL as a link in the first cell; the input
 * and button are built here (form controls never live in the plain fragment).
 */

export default function decorate(block) {
  const firstCell = block.querySelector(':scope > div > div');
  const link = block.querySelector('a');
  const action = link ? link.getAttribute('href') : '/search';
  const placeholder = (firstCell ? firstCell.textContent.trim() : '') || 'Search…';

  const form = document.createElement('form');
  form.className = 'search-form';
  form.setAttribute('role', 'search');
  form.action = action;
  form.innerHTML = `
    <label class="search-label" for="search-input">${placeholder}</label>
    <div class="search-field">
      <span class="search-icon" aria-hidden="true"></span>
      <input id="search-input" type="search" name="q" placeholder="${placeholder}" autocomplete="off">
      <button type="submit" aria-label="Search">Search</button>
    </div>`;

  block.replaceChildren(form);
}
