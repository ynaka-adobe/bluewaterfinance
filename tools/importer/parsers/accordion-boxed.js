/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-boxed. Base: accordion. Source: https://bluewaterfinance.com/protection/
 * Generated: 2026-10-11
 *
 * Source structure (validated in source.html):
 *   div.wysiwyg
 *     div > h2.wysiwyg-title            (section heading -> default content BEFORE the block)
 *     br
 *     a#openEngButton > div.accordionPP "&nbsp;Panel title"   (open toggle)
 *     a#closeEngButton > div.accordionPP                       (close twin; removed by cleanup)
 *     div.panelPP > p(empty), ul > li > a[href$=.pdf]  (x N)
 *     ... repeated per panel
 *
 * Output (N rows x 2 columns, as blocks/accordion-boxed expects):
 *   | accordion-boxed |                    |
 *   | Panel title     | ul of PDF links    |
 *
 * Iterates div.panelPP (stable block wrappers), not the toggle anchors, and pairs
 * each panel with the nearest preceding open toggle, so html2md inline merging of
 * adjacent anchors and the presence/absence of close twins cannot change the count.
 */
function cleanText(node) {
  return (node ? node.textContent : '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function findTitle(panel, element) {
  let sib = panel.previousElementSibling;
  let fallback = null;
  while (sib && !sib.classList.contains('panelPP')) {
    const toggle = sib.matches('.accordionPP') ? sib : sib.querySelector('.accordionPP');
    if (toggle) {
      const anchor = toggle.closest('a');
      const id = (anchor && element.contains(anchor) ? anchor.id : '') || toggle.id || '';
      // Prefer the "open" toggle; the "close" twin repeats the same title.
      if (/^open/i.test(id)) return cleanText(toggle);
      if (!/close/i.test(id) || !fallback) fallback = fallback || cleanText(toggle);
    }
    sib = sib.previousElementSibling;
  }
  return fallback || '';
}

export default function parse(element, { document }) {
  // Section heading (default content, placed before the block)
  const srcHeading = element.querySelector('h2.wysiwyg-title, :scope > div > h2, h2');
  let heading = null;
  if (srcHeading && !srcHeading.closest('.panelPP')) {
    const text = cleanText(srcHeading);
    if (text) {
      heading = document.createElement('h2');
      heading.textContent = text;
    }
  }

  const panels = Array.from(element.querySelectorAll(':scope > .panelPP'));
  const finalPanels = panels.length ? panels : Array.from(element.querySelectorAll('.panelPP'));

  const cells = [];
  finalPanels.forEach((panel) => {
    const title = findTitle(panel, element);
    const body = [];
    panel.querySelectorAll(':scope > ul, :scope > ol').forEach((list) => body.push(list));
    if (!body.length) {
      // Fallback: collect any links in the panel into a fresh list
      const links = Array.from(panel.querySelectorAll('a[href]'));
      if (links.length) {
        const ul = document.createElement('ul');
        links.forEach((a) => {
          const li = document.createElement('li');
          li.append(a);
          ul.append(li);
        });
        body.push(ul);
      } else {
        Array.from(panel.children).forEach((c) => { if (cleanText(c)) body.push(c); });
      }
    }
    if (!title && !body.length) return;
    cells.push([title, body.length ? body : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-boxed', cells });
  if (heading) element.before(heading);
  element.replaceWith(block);
}
