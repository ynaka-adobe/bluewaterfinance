/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-caption. Base: hero. Source: https://bluewaterfinance.com/protection/
 * Generated: 2026-10-11
 *
 * Source structure (validated in source.html):
 *   div#pnlSubPageImage.subPageImage
 *     img#Image2
 *     div.subPageTitle > h1 > span#lblPageTitle
 *
 * Output (1 row x 1 column, as blocks/hero-caption expects):
 *   | hero-caption |
 *   | picture + H1 |
 */
export default function parse(element, { document }) {
  const img = element.querySelector(':scope > img, img');
  const srcHeading = element.querySelector('.subPageTitle h1, h1, .subPageTitle h2, h2');

  const content = [];
  if (img) content.push(img);

  if (srcHeading) {
    const text = srcHeading.textContent.replace(/\s+/g, ' ').trim();
    if (text) {
      const h1 = document.createElement('h1');
      h1.textContent = text;
      content.push(h1);
    }
  } else {
    const titleWrap = element.querySelector('.subPageTitle');
    const text = titleWrap ? titleWrap.textContent.replace(/\s+/g, ' ').trim() : '';
    if (text) {
      const h1 = document.createElement('h1');
      h1.textContent = text;
      content.push(h1);
    }
  }

  if (!content.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-caption', cells });
  element.replaceWith(block);
}
