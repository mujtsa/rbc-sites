/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel. Base: carousel.
 * Source: div.vantage-carousel — each .vantage-carousel-item is one slide.
 * Model: 2 columns — | image | content (heading + copy) | — one row per slide.
 */
export default function parse(element, { document }) {
  const cells = [];

  const slides = Array.from(element.querySelectorAll(':scope > .vantage-carousel-item'));

  slides.forEach((slide) => {
    // Slide visual: prefer a real image; fall back to the slide's <video>.
    const media = slide.querySelector('img, picture') || slide.querySelector('video');

    // Slide content: headings and paragraphs (icons/brand imgs stay out of the text cell).
    const contentEls = Array.from(slide.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));

    if (!media && !contentEls.length) return;
    cells.push([media || '', contentEls.length ? contentEls : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
