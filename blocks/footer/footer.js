/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // metadata-independent dual-fetch: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');

  block.textContent = '';
  const footer = document.createElement('div');
  if (resp.ok) {
    const html = await resp.text();
    footer.innerHTML = html;
  }

  // The footer fragment lives at /content/footer.plain.html and references its
  // assets (social icons, CDIC logo, back-to-top) with paths relative to that
  // location. Left as-is those resolve against the current page URL and 404 on
  // nested pages. Rebase any relative asset path to the fragment's own directory
  // so it resolves from every page.
  const footerBase = resp.url && resp.url.includes('/content/') ? '/content/' : '/';
  footer.querySelectorAll('img[src], source[srcset]').forEach((el) => {
    ['src', 'srcset'].forEach((attr) => {
      const val = el.getAttribute(attr);
      if (val && !/^(https?:|\/|data:)/.test(val)) el.setAttribute(attr, `${footerBase}${val}`);
    });
  });

  // two source sections: link columns (blue band) + legal/social (grey band)
  const sections = footer.querySelectorAll(':scope > div');
  if (sections[0]) sections[0].classList.add('footer-columns');
  if (sections[1]) sections[1].classList.add('footer-legal');

  const legal = sections[1];
  if (legal) {
    const lists = legal.querySelectorAll(':scope > ul');
    if (lists[0]) lists[0].classList.add('footer-legal-links');
    if (lists[1]) lists[1].classList.add('footer-social');

    // Advertising & Cookies is a consent trigger, not a navigation link
    const cookieLink = legal.querySelector('a[href="#advertising-cookies"]');
    if (cookieLink) {
      cookieLink.addEventListener('click', (e) => {
        e.preventDefault();
        const consent = document.querySelector('#onetrust-banner-sdk, .ot-sdk-container');
        if (window.OneTrust && typeof window.OneTrust.ToggleInfoDisplay === 'function') {
          window.OneTrust.ToggleInfoDisplay();
        } else if (consent) {
          consent.scrollIntoView();
        }
      });
    }

    // Back to Top smooth-scrolls to the top of the page
    const backToTop = legal.querySelector('a[href="#skip-nav"]');
    if (backToTop) {
      backToTop.classList.add('footer-back-to-top');
      backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  block.append(footer);
}
