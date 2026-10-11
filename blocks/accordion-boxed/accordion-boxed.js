/**
 * Accordion Boxed block
 * Boxed expand/collapse panels: each row is a panel title + panel body
 * (typically a bulleted list of document links).
 *
 * Content model (N rows x 2 columns):
 *   | Accordion Boxed |                       |
 *   | Panel title     | Body (list of links)  |
 */
const OPTION_CLASSES = [];

export default function decorate(block) {
  // collected once so future options can branch here (none defined yet)
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) {
      row.remove();
      return;
    }

    const body = document.createElement('div');
    body.className = 'accordion-boxed-item-body';

    let label = cells[0];
    if (cells.length === 1 && label.children.length > 1) {
      // single-cell row: first element is the title, the rest is the body
      const [first, ...rest] = [...label.children];
      label = first;
      body.append(...rest);
    } else {
      // tolerate authors adding extra cells: all remaining cells form the body
      cells.slice(1).forEach((cell) => body.append(...cell.childNodes));
    }

    if (!label.textContent.trim() && !body.textContent.trim()) {
      row.remove();
      return;
    }

    const summary = document.createElement('summary');
    summary.className = 'accordion-boxed-item-label';
    // label may be bare text, a single <p> (unwrapped so it stays inline with
    // the icon) or a single heading (kept for document outline semantics)
    const single = label.children.length === 1
      && label.textContent.trim() === label.firstElementChild.textContent.trim()
      ? label.firstElementChild : null;
    if (single && /^H[1-6]$/.test(single.tagName)) summary.append(single);
    else if (/^H[1-6]$/.test(label.tagName)) summary.append(label);
    else summary.append(...(single && single.tagName === 'P' ? single : label).childNodes);

    body.querySelectorAll('a[href]').forEach((a) => {
      if (/\.pdf($|[?#])/i.test(a.getAttribute('href'))) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
    });

    const details = document.createElement('details');
    details.className = 'accordion-boxed-item';
    details.append(summary);
    if (body.childNodes.length) details.append(body);
    row.replaceWith(details);
  });
}
