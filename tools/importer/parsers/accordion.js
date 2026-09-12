/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base: accordion.
 * Source: RBC bank-accounts FAQ (#dvl-wpr ... div.accordion).
 * Model: 2 columns — | label | body | — one row per accordion item.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each FAQ item is an .accordion-panel: a toggle button (label) + collapse body.
  const panels = element.querySelectorAll(':scope > .accordion-panel, .accordion-panel');
  panels.forEach((panel) => {
    const labelEl = panel.querySelector('.collapse-toggle, button, [class*="toggle"]');
    const bodyEl = panel.querySelector('.collapse-inner')
      || panel.querySelector('.collapse-content')
      || panel;

    if (!labelEl && !bodyEl) return;

    // Label: use plain text so no <button> markup leaks into the table.
    const labelP = document.createElement('p');
    labelP.textContent = labelEl ? labelEl.textContent.trim() : '';

    cells.push([labelP, bodyEl]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
