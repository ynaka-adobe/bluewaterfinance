import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero Caption block
 * Full-width static photo with the page heading in a translucent caption bar
 * anchored to the bottom of the image.
 *
 * Content model (1 row x 1 column, tolerant of a split image/text row):
 *   | Hero Caption                |
 *   | picture + H1 (+ optional text) |
 */
const OPTION_CLASSES = [];

export default function decorate(block) {
  // collected once so future options can branch here (none defined yet)
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const picture = block.querySelector('picture');

  // gather every non-image content node from all cells, in order
  const textNodes = [];
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    [...cell.children].forEach((el) => {
      if (el.querySelector('picture') || el.tagName === 'PICTURE') {
        // keep any text that shares a paragraph with the picture
        const leftover = el.textContent.trim();
        if (leftover && el.tagName !== 'PICTURE') {
          const clone = el.cloneNode(true);
          clone.querySelectorAll('picture').forEach((p) => p.remove());
          textNodes.push(clone);
        }
        return;
      }
      if (el.textContent.trim()) textNodes.push(el);
    });
  });

  const media = document.createElement('div');
  media.className = 'hero-caption-media';
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt, true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]);
      const optimizedImg = optimized.querySelector('img');
      optimizedImg.loading = 'eager';
      optimizedImg.setAttribute('fetchpriority', 'high');
      media.append(optimized);
    } else {
      media.append(picture);
    }
  }

  const caption = document.createElement('div');
  caption.className = 'hero-caption-caption';
  const inner = document.createElement('div');
  inner.className = 'hero-caption-caption-inner';
  inner.append(...textNodes);
  caption.append(inner);

  block.replaceChildren(media);
  if (textNodes.length) block.append(caption);
  else block.classList.add('hero-caption-no-text');
}
