/*
 * Disclosure Block (RBC-specific)
 * Renders a legal disclosures / footnotes list. Each row is one disclosure:
 *   | marker | disclosure text |
 * where `marker` is the reference token (e.g. 1, †, *) that superscripts in the
 * page content link to. Each disclosure gets an id (disclosure-<marker>) so that
 * in-page superscript links (href="#legal-1", "#legal-dagger", etc.) can target it,
 * and a "back to content" affordance is provided for accessibility.
 *
 * Content-first: all markers and copy come from the authored table; this block
 * only structures and wires them.
 */

const MARKER_SLUGS = {
  '†': 'dagger',
  '‡': 'double-dagger',
  '*': 'asterisk',
  '§': 'section',
};

function slugForMarker(marker) {
  const trimmed = marker.trim();
  if (MARKER_SLUGS[trimmed]) return MARKER_SLUGS[trimmed];
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'note';
}

export default function decorate(block) {
  const list = document.createElement('ol');
  list.className = 'disclosure-list';
  list.id = 'legal-disclaimers';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const marker = cells[0] ? cells[0].textContent.trim() : '';
    const bodyCell = cells[1] || cells[0];

    const item = document.createElement('li');
    item.className = 'disclosure-item';
    if (marker) {
      const slug = slugForMarker(marker);
      item.id = `legal-${slug}`;
      const badge = document.createElement('span');
      badge.className = 'disclosure-marker';
      badge.textContent = marker;
      item.append(badge);
    }

    const body = document.createElement('div');
    body.className = 'disclosure-body';
    if (bodyCell) body.append(...bodyCell.childNodes);
    item.append(body);
    list.append(item);
  });

  // RBC hides the detailed legal text behind a View/Hide Legal Disclaimers
  // control (collapsed by default). Reproduce that toggle while keeping the
  // list in the DOM so in-page superscript links (#legal-N) still resolve.
  const panel = document.createElement('div');
  panel.className = 'disclosure-panel';
  panel.id = 'disclaimers';
  panel.hidden = true;
  panel.append(list);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'disclosure-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'disclaimers');
  const setLabel = (open) => { toggle.textContent = open ? 'Hide Legal Disclaimers' : 'View Legal Disclaimers'; };
  setLabel(false);

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    setLabel(open);
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));

  // If the page is (or becomes) targeting a specific disclaimer via the hash
  // (e.g. a superscript "#legal-2" link), open the panel and scroll to it.
  const openIfTargeted = () => {
    const { hash } = window.location;
    if (!hash) return;
    const target = block.querySelector(hash) || (hash === '#disclaimers' ? panel : null);
    if (target) {
      setOpen(true);
      requestAnimationFrame(() => target.scrollIntoView({ block: 'center' }));
    }
  };
  window.addEventListener('hashchange', openIfTargeted);

  block.replaceChildren(toggle, panel);
  openIfTargeted();
}
