/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta. Base: columns. Source: https://bluewaterfinance.com/
 * Generated: 2026-10-09
 *
 * Source structure (validated in source.html):
 *   div.row
 *     div.columns (x3)
 *       a[href] > div.homeButton "Small line <br> <span.homeButtonLoan>Strong line</span>"
 *
 * Output: one row, one cell per tile; each cell = link whose content is
 *   small line <br> <strong>strong line</strong>
 * Iterates the div.columns wrappers (not the anchors) so html2md inline merging
 * of adjacent anchors can never collapse tiles.
 */
export default function parse(element, { document }) {
  let tiles = Array.from(element.querySelectorAll(':scope > div.columns'));
  if (!tiles.length) tiles = Array.from(element.querySelectorAll('.homeButton')).map((b) => b.parentElement);

  const row = [];
  tiles.forEach((tile) => {
    const button = tile.querySelector('.homeButton') || tile;
    const srcLink = tile.tagName === 'A' ? tile : (tile.querySelector('a[href]') || button.closest('a[href]'));
    const strongEl = button.querySelector('.homeButtonLoan, strong, b');

    // Small line = button text excluding the strong span
    let smallText = '';
    button.childNodes.forEach((n) => {
      if (n === strongEl) return;
      if (n.nodeType === 3) smallText += n.textContent;
      else if (n.nodeType === 1 && n.tagName !== 'BR') smallText += n.textContent;
    });
    smallText = smallText.replace(/\s+/g, ' ').trim();
    const strongText = strongEl ? strongEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!smallText && !strongText) return;

    const a = document.createElement('a');
    if (srcLink) a.href = srcLink.getAttribute('href');
    if (smallText) a.append(document.createTextNode(smallText));
    if (smallText && strongText) a.append(document.createElement('br'));
    if (strongText) {
      const strong = document.createElement('strong');
      strong.textContent = strongText;
      a.append(strong);
    }
    const p = document.createElement('p');
    p.append(a);
    row.push(p);
  });

  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
