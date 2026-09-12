/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero. Base: hero.
 * Source: #banner-container div.banner-* — a background image plus a content
 * area (offer pill, headings, primary CTA, timer note, offer-details link).
 * Model: 1 column, up to 3 rows — block name / background image / content.
 */
export default function parse(element, { document }) {
  // Background image: the banner's lead image (the desktop banner background).
  const bgImage = element.querySelector(':scope > img, .banner > img, [id*="desktop"] > img, img');

  // Content container: the marketing copy block.
  const contentRoot = element.querySelector('.cash-cta-info, .section-inner, .cash-cta') || element;

  const pill = contentRoot.querySelector('.cash-cta-pill, [class*="pill"]');
  const headings = Array.from(contentRoot.querySelectorAll('h1, h2, h3'));
  const ctas = Array.from(contentRoot.querySelectorAll('a.btn, a.primary, a[class*="btn"], a.promo-cta, .standalone-link'));
  const timerNote = contentRoot.querySelector('.timer__date');

  const contentCell = [];
  if (pill) contentCell.push(pill);
  headings.forEach((h) => contentCell.push(h));
  ctas.forEach((a) => {
    // Avoid re-adding CTAs that are nested inside an already-captured heading.
    if (!headings.some((h) => h.contains(a))) contentCell.push(a);
  });
  if (timerNote) contentCell.push(timerNote);

  if (!bgImage && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([bgImage || '']);
  cells.push([contentCell.length ? contentCell : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
