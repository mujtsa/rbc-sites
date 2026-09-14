/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: table
 * Base block: table
 * Source: https://www.rbcroyalbank.com/bank-accounts/chequing-accounts/signature-no-limit-banking.html
 * Generated: 2026-09-12
 *
 * Source structure: div.table-wpr.features-table containing div.table-row rows,
 * each with two div.table-cell children (feature | value). No explicit header row
 * exists in the source, so a "Feature | Value" header row is synthesized because the
 * table block renders the first data row as <th scope="col"> column headers.
 * Row/cell structure follows the EDS "Table" convention: createBlock emits the block
 * name row, then each subsequent row is a data row with one cell per column (2 columns).
 */
export default function parse(element, { document }) {
  // Collect data rows. Prefer direct children; fall back to any descendant .table-row.
  let rows = Array.from(element.querySelectorAll(':scope > .table-row'));
  if (!rows.length) rows = Array.from(element.querySelectorAll('.table-row'));

  // Empty-block guard: nothing to build.
  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Header row (first row becomes <th scope="col"> in the table block).
  cells.push(['Feature', 'Value']);

  // Data rows: each row is a feature/value pair (two columns).
  rows.forEach((row) => {
    const rowCells = Array.from(row.querySelectorAll(':scope > .table-cell'));
    if (!rowCells.length) return;

    const featureCell = rowCells[0];
    const valueCell = rowCells[1];

    // Preserve inner semantic content (paragraphs, links, sup) by referencing child nodes.
    const featureContent = featureCell ? Array.from(featureCell.childNodes) : [];
    const valueContent = valueCell ? Array.from(valueCell.childNodes) : [];

    cells.push([
      featureContent.length ? featureContent : [''],
      valueContent.length ? valueContent : [''],
    ]);
  });

  // Guard: only the synthesized header was produced (no real data extracted).
  if (cells.length <= 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table', cells });
  element.replaceWith(block);
}
