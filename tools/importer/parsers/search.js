/* eslint-disable */
/* global WebImporter */
/**
 * Parser for search. Base: search (RBC lightweight search).
 * Source: form#intellResponse_form — an "ask a question" search form with a text
 * input and a Search button (the live input/button are built by the block itself).
 * Model: the authored content provides the placeholder text and, optionally, an
 * action URL as a link in the first cell. We emit a single cell with the
 * placeholder prompt (and an action link when the form declares one).
 */
export default function parse(element, { document }) {
  // Placeholder / prompt text: prefer an input placeholder, then a label, then a default.
  const input = element.querySelector('input[placeholder]');
  const label = element.querySelector('label');
  const placeholder = (input && input.getAttribute('placeholder'))
    || (label && label.textContent.trim())
    || 'Ask a question';

  const contentCell = [];
  const p = document.createElement('p');
  p.textContent = placeholder;
  contentCell.push(p);

  // Optional action URL: use the form's action if it is a real destination.
  const action = element.getAttribute('action');
  if (action && action.trim() && !/^javascript:/i.test(action)) {
    const link = document.createElement('a');
    link.href = action.trim();
    link.textContent = 'Search';
    contentCell.push(link);
  }

  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'search', cells });
  element.replaceWith(block);
}
