/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs. Base: tabs.
 * Source: div.acc-type-container — a sticky account-type switcher. Each .type-btn
 * is a tab: an icon plus a labelled anchor link (e.g. "I'm New to RBC" -> #new-to-rbc)
 * that jumps to the matching account section.
 * Model: 2 columns — | tab label | tab content | — one row per tab. The panel
 * content lives in separate page sections, so the content cell carries the tab's
 * anchor link (the jump target) alongside its icon.
 */
export default function parse(element, { document }) {
  const cells = [];

  const buttons = Array.from(element.querySelectorAll(':scope > .type-btn, .type-btn'));

  buttons.forEach((btn) => {
    const anchor = btn.querySelector('a[href]');
    const icon = btn.querySelector('img, picture');

    // Tab label: the anchor text (fallback to button text).
    const labelP = document.createElement('p');
    labelP.textContent = (anchor ? anchor.textContent : btn.textContent).trim();

    // Content cell: keep the tab's icon and the jump link to its account section.
    const contentCell = [];
    if (icon) contentCell.push(icon);
    if (anchor) contentCell.push(anchor);

    if (!labelP.textContent && !contentCell.length) return;
    cells.push([labelP, contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
