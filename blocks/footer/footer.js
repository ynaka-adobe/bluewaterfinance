// back-to-top appears once the page has scrolled this far (source behaviour)
const BACK_TO_TOP_OFFSET = 400;

/**
 * Fetches the footer fragment (metadata-independent dual fetch):
 * /content first (local preview), then the site root (DA/EDS production).
 * @returns {Promise<HTMLElement|null>}
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
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
 * Replaces svg icon images inside links with masked spans that follow the
 * link color; the image alt becomes screen-reader text.
 * @param {Element} root
 */
function decorateIcons(root) {
  root.querySelectorAll('a img').forEach((img) => {
    if (!isSvg(img)) return;
    const icon = document.createElement('span');
    icon.className = 'footer-icon';
    icon.style.setProperty('--icon-url', `url("${img.src}")`);
    icon.style.setProperty('--icon-ratio', `${img.getAttribute('width') || 1} / ${img.getAttribute('height') || 1}`);
    icon.setAttribute('aria-hidden', 'true');
    const label = img.getAttribute('alt');
    if (label) {
      const text = document.createElement('span');
      text.className = 'visually-hidden';
      text.textContent = label;
      img.after(text);
    }
    img.closest('a').classList.add('footer-icon-link');
    img.replaceWith(icon);
  });
}

/**
 * A section holding nothing but one image-only link is the back-to-top
 * control. Matched by structure, not href: authoring and publishing rewrite
 * the "#" link (to "" or "/").
 * @param {Element} section
 * @returns {boolean}
 */
function isBackToTop(section) {
  const links = section.querySelectorAll('a');
  return links.length === 1 && !section.textContent.trim() && !!links[0].querySelector('img');
}

/**
 * Turns the back-to-top section into a fixed button shown after scrolling.
 * @param {Element} section
 * @returns {Element}
 */
function buildBackToTop(section) {
  const link = section.querySelector('a');
  link.className = 'footer-back-to-top';
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  });
  const update = () => link.classList.toggle('is-visible', window.scrollY > BACK_TO_TOP_OFFSET);
  window.addEventListener('scroll', update, { passive: true });
  update();
  return link;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  if (!fragment) return;

  block.textContent = '';
  const inner = document.createElement('div');
  inner.className = 'footer-inner';

  let backToTop = null;
  [...fragment.children].forEach((section) => {
    if (isBackToTop(section)) {
      backToTop = section;
      return;
    }
    section.className = 'footer-column';
    inner.append(section);
  });

  decorateIcons(inner);
  block.append(inner);

  if (backToTop) {
    decorateIcons(backToTop);
    block.append(buildBackToTop(backToTop));
  }
}
