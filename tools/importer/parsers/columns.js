/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns. Base: columns.
 * Sources: div.grid-wpr.eh-wpr (grid-one-third + grid-two-thirds) and
 *          section.newcomers-content .section-inner (.left-col + .right-col).
 * Model: one row whose cells are the columns. Column count = number of
 * top-level column groups in the source.
 */
export default function parse(element, { document }) {
  // Identify the natural column groups.
  let columns = Array.from(element.querySelectorAll(
    ':scope > .grid-one-third, :scope > .grid-two-thirds, :scope > .grid-half, :scope > .left-col, :scope > .right-col',
  ));

  // Fallback: direct child divs are the columns.
  if (!columns.length) {
    columns = Array.from(element.querySelectorAll(':scope > div'));
  }

  // Keep only columns that carry real content.
  columns = columns.filter((c) => c.textContent.trim().length || c.querySelector('img, picture, video'));

  if (!columns.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single row; each column group is one cell.
  const cells = [columns];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
