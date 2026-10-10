/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-logos. Base: columns. Source: https://bluewaterfinance.com/
 * Generated: 2026-10-09
 *
 * Source structure (validated in source.html):
 *   div.theLogos
 *     div.containLogo > img   (x3)
 *
 * Output: one row, one logo image per cell (image wrapped in its link if one exists).
 */
export default function parse(element, { document }) {
  let wrappers = Array.from(element.querySelectorAll(':scope > .containLogo'));
  if (!wrappers.length) wrappers = Array.from(element.querySelectorAll('img')).map((img) => img.closest('a') || img);

  const row = [];
  wrappers.forEach((w) => {
    const img = w.tagName === 'IMG' ? w : w.querySelector('img');
    if (!img) return;
    const link = w.tagName === 'A' ? w : (w.querySelector('a[href]') || img.closest('a[href]'));
    if (link && element.contains(link)) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.append(img);
      row.push(a);
    } else {
      row.push(img);
    }
  });

  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-logos', cells });
  element.replaceWith(block);
}
