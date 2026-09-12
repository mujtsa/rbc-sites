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

  block.replaceChildren(list);
}
