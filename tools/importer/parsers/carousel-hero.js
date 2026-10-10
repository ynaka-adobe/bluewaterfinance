/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel. Source: https://bluewaterfinance.com/
 * Generated: 2026-10-09
 *
 * Source structure (validated in source.html):
 *   div.cycle-slideshow
 *     a.cycle-slide.cycle-sentinel   (cycle2 duplicate - skipped)
 *     a.cycle-slide[href] > img.slide-image[alt]   (x3 real slides)
 *
 * Output: one row per slide; col1 = image, col2 = caption paragraph + "Learn More" link.
 * Caption: data-cycle-desc on slide/img (HTML stripped, text before btnClear) or img alt.
 */
function captionFromDesc(desc, document) {
  if (!desc) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = desc;
  // Drop the CTA wrapper / links embedded in the description
  tmp.querySelectorAll('.btnClear, a').forEach((n) => n.remove());
  return tmp.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  // Real slides: direct-child anchors that are not the cycle2 sentinel
  let slides = Array.from(element.querySelectorAll(':scope > a:not(.cycle-sentinel)'));
  if (!slides.length) {
    // Fallback: slides authored as bare images (no wrapping anchor)
    slides = Array.from(element.querySelectorAll(':scope > img.slide-image:not(.cycle-sentinel), :scope > img.slide-image'))
      .filter((v, i, a) => a.indexOf(v) === i);
  }

  const cells = [];
  slides.forEach((slide) => {
    const img = slide.tagName === 'IMG' ? slide : slide.querySelector('img');
    if (!img) return;

    const desc = slide.getAttribute('data-cycle-desc') || img.getAttribute('data-cycle-desc');
    const captionText = captionFromDesc(desc, document) || (img.getAttribute('alt') || '').trim();

    const href = slide.tagName === 'A' ? slide.getAttribute('href') : null;

    const textCell = [];
    if (captionText) {
      const p = document.createElement('p');
      p.textContent = captionText;
      textCell.push(p);
    }
    if (href) {
      const ctaP = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = 'Learn More';
      ctaP.append(a);
      textCell.push(ctaP);
    }

    cells.push([img, textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
