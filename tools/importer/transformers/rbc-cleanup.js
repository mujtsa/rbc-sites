/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: RBC site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. All selectors verified against migration-work/cleaned.html
 * (representative page: https://www.rbcroyalbank.com/bank-accounts/index.html).
 *
 * Verified in cleaned.html:
 *   <header> ...                          global masthead / mega-nav (lines 3-986)
 *   <div class="side-menu" id="side-menu-id"> mobile side-menu overlay + search (line 987)
 *   <main>
 *     <div id="sticky-wrapper" ...>        sticky breadcrumb bar + page-title chrome (line 1383)
 *       <nav class="breadcrumb-wpr" id="breadcrumb-wpr"> breadcrumb (line 1385)
 *     <section id="banner-container"> ...  authorable content begins here (line 1413)
 *   <footer> ...                          global fat footer (line 6044)
 */

const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Overlay / off-canvas chrome that could interfere with block parsing.
    WebImporter.DOMUtils.remove(element, [
      '#side-menu-id', // mobile side-menu + search overlay
    ]);
  }

  if (hookName === H.after) {
    // Non-authorable global chrome and leftover non-content elements.
    WebImporter.DOMUtils.remove(element, [
      'header', // global masthead / mega-nav
      'footer', // global fat footer
      '#sticky-wrapper', // sticky breadcrumb bar + page-title chrome
      'nav.breadcrumb-wpr', // breadcrumb (belt-and-suspenders; inside #sticky-wrapper)
      '#breadcrumb-wpr',
      '#skip-nav', // skip-to-content link
      'script',
      'style',
      'noscript',
      'link',
    ]);
  }
}
