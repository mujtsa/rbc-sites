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
    // Preserve the product H1 before the sticky product bar (which contains it)
    // is removed below. The visible product title on RBC product pages lives in
    // h1#page-title.nav-location inside the sticky wrapper; promote a clean copy
    // to the top of the document so the migrated page keeps exactly one product H1.
    const productTitle = element.querySelector('h1#page-title, h1.nav-location');
    if (productTitle && !element.querySelector('main h1, body > h1')) {
      const h1 = document.createElement('h1');
      h1.textContent = productTitle.textContent.trim();
      const firstSection = element.querySelector('#overview, main, section');
      if (firstSection) firstSection.prepend(h1);
      else element.prepend(h1);
    }

    // Drop RBC responsive DUPLICATES: pages ship a desktop-only and a mobile-only
    // copy of the same content group (e.g. "Plus Other Features"), which otherwise
    // both import — one into a block, one as leftover default content. Keep the
    // desktop copy (block selectors target it); remove the mobile-only twins.
    WebImporter.DOMUtils.remove(element, [
      '.block-wpr.mobile-only', // feature groups' mobile duplicate
      'div.icon-copy-group-wrapper.mobile-only',
    ]);

    // Overlay / off-canvas chrome that could interfere with block parsing.
    WebImporter.DOMUtils.remove(element, [
      '#side-menu-id', // mobile side-menu + search overlay
      // Value-Program rebate/ATM-usage calculator modal — an interactive JS tool
      // overlay excluded from static import scope. On the chequing pages its full
      // multi-step DOM (hidden) otherwise dumps into content as run-on text.
      '.value-program-modal',
      '.popup_wrapper',
      '.popup_background',
      '#modal-sig', '#modal-sig_wrapper', '#modal-sig_background',
      '#modal-vip', '#modal-vip_wrapper', '#modal-vip_background',
      '#modal-d2d', '#modal-d2d_wrapper', '#modal-d2d_background',
      '#modal-adv', '#modal-adv_wrapper', '#modal-adv_background',
    ]);
  }

  if (hookName === H.after) {
    // Non-authorable global chrome and leftover non-content elements.
    WebImporter.DOMUtils.remove(element, [
      'header', // global masthead / mega-nav
      'footer', // global fat footer
      '#sticky-wrapper', // sticky breadcrumb bar + page-title chrome (by id, hub)
      '.sticky-wrapper', // product-sticky-wrapper (class-based; desktop + mobile copies)
      '.product-sticky-wrapper',
      'aside.sticky-nav__custom', // product sticky "Open Account / MENU" anchor bar
      '.sticky-nav__custom',
      '.product-sticky', // "nav-bar product-sticky breadcrumb-true"
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
