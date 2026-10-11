// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 1200px)');

// section roles, in the order they appear in nav.plain.html
const SECTION_ROLES = ['alert', 'brand', 'tools', 'sections', 'mobile'];

/**
 * Fetches the nav fragment (metadata-independent dual fetch): the site root (DA/EDS)
 * and /content (local preview), trying the one for the current host first so
 * production pages don't log a 404 for the other.
 * @returns {Promise<HTMLElement|null>}
 */
async function fetchNav() {
  const paths = ['/nav.plain.html', '/content/nav.plain.html'];
  if (window.location.hostname === 'localhost') paths.reverse();
  let resp = await fetch(paths[0]);
  if (!resp.ok) resp = await fetch(paths[1]);
  if (!resp.ok) return null;
  const html = await resp.text();
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  // resolve relative image paths against the fragment's location
  const base = new URL(resp.url);
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  return wrapper;
}

/**
 * True for svg images, including optimized media URLs (media_….svg?…).
 * @param {HTMLImageElement} img
 * @returns {boolean}
 */
function isSvg(img) {
  const url = new URL(img.src, window.location.href);
  return url.pathname.endsWith('.svg') || url.searchParams.get('format') === 'svg';
}

/**
 * Replaces svg icon images with masked spans so they follow the link color
 * (needed for hover color changes).
 * @param {Element} root
 */
function decorateIcons(root) {
  root.querySelectorAll('a img').forEach((img) => {
    if (!isSvg(img)) return;
    const icon = document.createElement('span');
    icon.className = 'nav-icon';
    icon.style.setProperty('--icon-url', `url("${img.src}")`);
    icon.style.setProperty('--icon-ratio', `${img.getAttribute('width') || 1} / ${img.getAttribute('height') || 1}`);
    const label = img.getAttribute('alt');
    const link = img.closest('a');
    if (label && !link.textContent.trim()) {
      // icon-only link: keep the label as screen-reader text
      const text = document.createElement('span');
      text.className = 'visually-hidden';
      text.textContent = label;
      link.append(text);
      link.classList.add('nav-icon-only');
    }
    icon.setAttribute('aria-hidden', 'true');
    img.replaceWith(icon);
  });
}

/**
 * Opens or closes the mobile menu.
 * @param {Element} nav
 * @param {boolean|null} forceExpanded
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? forceExpanded : nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  if (button) {
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    button.setAttribute('aria-label', expanded ? 'close navigation menu' : 'open navigation menu');
  }
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;

  block.textContent = '';
  const sections = {};
  [...fragment.children].forEach((section, i) => {
    const role = SECTION_ROLES[i] || `extra-${i}`;
    section.className = `nav-${role}`;
    sections[role] = section;
  });

  // alert bar sits above the main bar
  if (sections.alert) {
    sections.alert.classList.add('header-alert');
    block.append(sections.alert);
  }

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  if (sections.brand) {
    const brandLink = sections.brand.querySelector('a');
    if (brandLink) {
      brandLink.classList.remove('button');
      brandLink.closest('.button-container')?.classList.remove('button-container');
    }
    nav.append(sections.brand);
  }

  // tools (utility links + social icons) stack above the main sections on desktop;
  // the mobile-only list is shown in the hamburger panel instead
  const navRight = document.createElement('div');
  navRight.className = 'nav-right';
  navRight.id = 'nav-menu';
  ['tools', 'sections', 'mobile'].forEach((role) => {
    if (sections[role]) navRight.append(sections[role]);
  });
  nav.append(navRight);
  decorateIcons(nav);

  // hamburger toggle (mobile)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav-menu" aria-expanded="false" aria-label="open navigation menu">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  // toggle precedes the menu it controls in the focus order
  navRight.before(hamburger);

  nav.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });

  toggleMenu(nav, false);
  // reset mobile menu state when crossing breakpoints
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
