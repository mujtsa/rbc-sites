import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Collapses every open top-level mega-menu section.
 * @param {Element} sections The nav-sections container
 * @param {Element} [except] Optional section to leave untouched
 */
function closeAllSections(sections, except) {
  if (!sections) return;
  sections.querySelectorAll(':scope .nav-drop[aria-expanded="true"]').forEach((section) => {
    if (section !== except) {
      section.setAttribute('aria-expanded', 'false');
      const toggle = section.querySelector(':scope > .nav-drop-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function closeOnEscape(e) {
  if (e.code !== 'Escape') return;
  const nav = document.getElementById('nav');
  const navSections = nav.querySelector('.nav-sections');
  const expanded = navSections && navSections.querySelector('.nav-drop[aria-expanded="true"]');
  if (expanded && isDesktop.matches) {
    closeAllSections(navSections);
    expanded.querySelector(':scope > a, :scope > button').focus();
  } else if (!isDesktop.matches) {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, navSections, false);
    const hb = nav.querySelector('.nav-hamburger button');
    if (hb) hb.focus();
  }
}

/**
 * Toggles the whole mobile nav drawer.
 * @param {Element} nav The nav element
 * @param {Element} navSections The main mega-nav container
 * @param {boolean|null} forceExpanded Force a state instead of toggling
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  closeAllSections(navSections);
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * Wires hover + click behavior on a top-level section that has a nested panel.
 * On desktop the panel opens on hover; on mobile the chevron toggles it.
 * @param {Element} section a top-level <li> containing a nested <ul>
 * @param {Element} container the parent nav region (for closing siblings)
 */
function decorateDropSection(section, container) {
  const trigger = section.querySelector(':scope > a, :scope > button');
  if (!trigger) return;

  // chevron toggle button (mobile expand/collapse without following the link)
  const chevron = document.createElement('button');
  chevron.type = 'button';
  chevron.className = 'nav-drop-toggle';
  chevron.setAttribute('aria-label', `Toggle ${trigger.textContent.trim()} submenu`);
  chevron.setAttribute('aria-expanded', 'false');
  chevron.setAttribute('tabindex', '-1');
  section.insertBefore(chevron, section.querySelector(':scope > ul'));

  // keep the section state and the chevron's aria-expanded in sync
  const setExpanded = (expanded) => {
    section.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    chevron.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  };

  chevron.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = section.getAttribute('aria-expanded') === 'true';
    closeAllSections(container, open ? null : section);
    setExpanded(!open);
  });

  // desktop hover open/close
  section.addEventListener('mouseenter', () => {
    if (isDesktop.matches) {
      closeAllSections(container, section);
      setExpanded(true);
    }
  });
  section.addEventListener('mouseleave', () => {
    if (isDesktop.matches) setExpanded(false);
  });

  // keyboard: Space toggles the panel on desktop (Enter still follows the link)
  trigger.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && isDesktop.matches && section.querySelector(':scope > ul')) {
      e.preventDefault();
      const open = section.getAttribute('aria-expanded') === 'true';
      closeAllSections(container, open ? null : section);
      setExpanded(!open);
    }
  });
}

/**
 * Builds the header search control in the tools row.
 * Form controls live here (not in the plain fragment).
 * @param {Element} navTools The tools row container
 */
function buildSearch(navTools) {
  if (!navTools) return;
  const search = document.createElement('div');
  search.className = 'nav-search';
  search.innerHTML = `
    <button type="button" class="nav-search-toggle" aria-label="Open search dialog" aria-expanded="false">
      <span class="nav-search-icon"></span>
      <span class="nav-search-label">Search RBC...</span>
    </button>
    <form class="nav-search-form" role="search" action="/search" hidden>
      <input type="search" name="q" aria-label="Search RBC" placeholder="Search RBC..." autocomplete="off">
      <button type="submit" aria-label="Submit search">Find</button>
    </form>`;
  const toggle = search.querySelector('.nav-search-toggle');
  const form = search.querySelector('.nav-search-form');
  const input = search.querySelector('input');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    form.hidden = open;
    if (!open) input.focus();
  });
  navTools.prepend(search);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // metadata-independent dual-fetch: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  let fragment;
  if (resp.ok) {
    const html = await resp.text();
    fragment = document.createElement('div');
    fragment.innerHTML = html;
  } else {
    // fallback to fragment loader (handles decorated .plain.html blocks)
    fragment = await loadFragment('/nav');
  }

  // The nav fragment lives at /content/nav.plain.html and references its assets
  // with paths relative to that location (e.g. images/rbc-logo-shield.svg). Left
  // as-is those resolve against the *current* page URL and 404 on nested pages
  // (the RBC logo shows a broken placeholder). Rebase any relative asset path to
  // the fragment's own directory so it resolves from every page.
  const navBase = resp.url && resp.url.includes('/content/') ? '/content/' : '/';
  fragment.querySelectorAll('img[src], source[srcset]').forEach((el) => {
    ['src', 'srcset'].forEach((attr) => {
      const val = el.getAttribute(attr);
      if (val && !/^(https?:|\/|data:)/.test(val)) el.setAttribute(attr, `${navBase}${val}`);
    });
  });

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Normalize markup: the DA/EDS content bus wraps a standalone link on its own
  // line in a <p> (`<li><p><a>…</a></p><ul>…`), while the local preview keeps the
  // link as a direct <li> child. The nav CSS and dropdown JS both expect
  // `li > a`, so unwrap any <p> in a nav <li> that wraps a single link — making
  // both environments render identically.
  nav.querySelectorAll('li > p').forEach((p) => {
    const links = p.querySelectorAll('a');
    if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
      p.replaceWith(links[0]);
    }
  });

  // four source sections: brand, audience bar, tools, main mega nav
  const classes = ['brand', 'audience', 'tools', 'sections'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand link accessibility label
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) brandLink.setAttribute('aria-label', 'RBC Royal Bank home');
  }

  // audience bar: mark items with a submenu (Institutional) as drops
  const navAudience = nav.querySelector('.nav-audience');
  if (navAudience) {
    navAudience.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector(':scope > ul')) {
        li.classList.add('nav-drop');
        li.setAttribute('aria-expanded', 'false');
        decorateDropSection(li, navAudience);
      }
    });
  }

  // tools row: language switch + sign in + search
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector(':scope > ul')) {
        li.classList.add('nav-drop', 'nav-locale');
        li.setAttribute('aria-expanded', 'false');
        decorateDropSection(li, navTools);
      }
      const link = li.querySelector(':scope > a');
      if (link && /sign in/i.test(link.textContent)) link.classList.add('nav-signin');
    });
    buildSearch(navTools);
  }

  // main mega nav
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector(':scope > ul')) {
        li.classList.add('nav-drop');
        li.setAttribute('aria-expanded', 'false');
        decorateDropSection(li, navSections);
      }
    });
  }

  // mobile top-bar Sign In — mirrors the source, which shows Sign In beside the
  // hamburger on mobile. Reuses the href from the tools-row Sign In (content-first).
  const signinSource = nav.querySelector('.nav-signin');
  if (signinSource) {
    const mobileSignin = document.createElement('a');
    mobileSignin.className = 'nav-mobile-signin';
    mobileSignin.href = signinSource.getAttribute('href');
    mobileSignin.textContent = signinSource.textContent.trim();
    nav.append(mobileSignin);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // sync state to viewport and handle resize without page reload
  const applyViewport = () => {
    if (isDesktop.matches) {
      nav.setAttribute('aria-expanded', 'false');
      document.body.style.overflowY = '';
      const button = nav.querySelector('.nav-hamburger button');
      if (button) button.setAttribute('aria-label', 'Open navigation');
    }
    closeAllSections(navSections);
  };
  isDesktop.addEventListener('change', applyViewport);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
