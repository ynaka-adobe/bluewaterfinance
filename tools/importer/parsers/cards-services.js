/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-services. Base: cards. Source: https://bluewaterfinance.com/
 * Generated: 2026-10-09
 *
 * Source structure (validated in source.html):
 *   div.bannerContainer > div.bannerContent > div.row
 *     div.bannerpadright (x3)
 *       div.bannerinnercontainer
 *         img.bannerimage
 *         a[href] > div.banneroverlay > div.bannertext
 *           span.bannertitle   (title)
 *           div.bannerinner    (teaser)
 *
 * Output: one row per card; col1 = image, col2 = linked title paragraph + teaser paragraph.
 * Iterates the block-level div.bannerinnercontainer wrappers (not the anchors).
 */
const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  let cards = Array.from(element.querySelectorAll('.bannerinnercontainer'));
  if (!cards.length) cards = Array.from(element.querySelectorAll('.bannerpadright'));

  const cells = [];
  cards.forEach((card) => {
    const img = card.querySelector('img.bannerimage, img');
    const titleEl = card.querySelector('.bannertitle');
    const teaserEl = card.querySelector('.bannerinner');
    const link = card.querySelector('a[href]') || card.closest('a[href]');

    const titleText = clean(titleEl && titleEl.textContent);
    const teaserText = clean(teaserEl && teaserEl.textContent);
    if (!img && !titleText && !teaserText) return;

    const body = [];
    if (titleText) {
      const p = document.createElement('p');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = titleText;
        p.append(a);
      } else {
        p.textContent = titleText;
      }
      body.push(p);
    }
    if (teaserText) {
      const p = document.createElement('p');
      p.textContent = teaserText;
      body.push(p);
    }

    cells.push([img || '', body.length ? body : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-services', cells });
  element.replaceWith(block);
}
