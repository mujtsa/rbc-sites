/* eslint-disable */
/* global WebImporter */
/**
 * Parser for widget. Base: widget (RBC widget loader).
 * Source: #banner-container div.banner-help-me-choose — an interactive
 * "Help Me Choose" account-selector tool (multi-step JS widget).
 * The widget block loads its implementation from an authored link that points
 * to a widget asset under /widgets/. We emit that loader link; the interactive
 * behaviour lives in the widget's own html/css/js, not in the imported content.
 * Model: 1 column — a single cell containing the widget loader link.
 */
export default function parse(element, { document }) {
  // Derive the widget name from the banner class (banner-help-me-choose -> help-me-choose).
  const classes = Array.from(element.classList);
  const bannerClass = classes.find((c) => c.startsWith('banner-')) || 'banner-widget';
  const widgetName = bannerClass.replace(/^banner-/, '') || 'widget';

  const link = document.createElement('a');
  link.href = `/widgets/${widgetName}.html`;
  link.textContent = widgetName;

  const cells = [[link]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'widget', cells });
  element.replaceWith(block);
}
