/* eslint-disable */
/* global WebImporter */
/**
 * Parser for disclosure. Base: disclosure (RBC-specific legal footnotes).
 * Source: #disclaimer .section-inner — legal disclaimers laid out as
 * .table-wpr > .table-row, each row having a marker cell ("2)", "†", ...) and
 * a disclosure-text cell. Markers are targeted by in-page superscript links.
 * Model: 2 columns — | marker | disclosure text | — one row per disclosure.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Collect every disclosure row across the (possibly multiple) audience tables.
  const rows = Array.from(element.querySelectorAll('.table-row'));

  rows.forEach((row) => {
    const rowCells = Array.from(row.querySelectorAll(':scope > .table-cell'));
    if (!rowCells.length) return;

    let markerCell;
    let bodyCell;
    if (rowCells.length >= 2) {
      [markerCell, bodyCell] = rowCells;
    } else {
      // Single-cell row (e.g. spacer) — treat as body only.
      markerCell = null;
      bodyCell = rowCells[0];
    }

    // Marker: reduce to the reference token (strip the offscreen "legal disclaimer" label
    // and any trailing punctuation like ")" ).
    let marker = '';
    if (markerCell) {
      const off = markerCell.querySelector('.offscreen');
      if (off) off.remove();
      marker = markerCell.textContent.replace(/[)\s]+$/g, '').trim();
    }

    // Skip empty spacer rows (no marker and no real body text).
    const bodyText = bodyCell ? bodyCell.textContent.trim() : '';
    if (!marker && !bodyText) return;

    const markerP = document.createElement('p');
    markerP.textContent = marker;

    cells.push([markerP, bodyCell || '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'disclosure', cells });
  element.replaceWith(block);
}
