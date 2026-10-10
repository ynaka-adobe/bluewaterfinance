/**
 * columns-cta: a row of equal-width call-to-action tiles.
 * Each cell holds one link whose text is a small eyebrow line + a strong title line,
 * e.g. `Pre-Qualify for a<br>**Boat Loan**`.
 */
function decorateLink(link) {
  link.classList.add('columns-cta-link');
  link.classList.remove('button', 'primary', 'secondary');

  const eyebrow = document.createElement('span');
  eyebrow.className = 'columns-cta-eyebrow';
  const title = document.createElement('span');
  title.className = 'columns-cta-title';

  const strong = link.querySelector('strong, b');
  const nodes = [...link.childNodes];
  if (strong) {
    // Everything before the strong line becomes the eyebrow; the strong text becomes the title
    nodes.forEach((node) => {
      if (node === strong || node.contains?.(strong)) {
        title.append(...strong.childNodes);
      } else if (node.nodeName !== 'BR') {
        eyebrow.append(node);
      }
    });
  } else {
    // No bold line: split on the last <br> (eyebrow above, title below);
    // without a <br> the whole text is the title
    const lastBr = nodes.filter((n) => n.nodeName === 'BR').pop();
    const brIndex = lastBr ? nodes.indexOf(lastBr) : -1;
    nodes.forEach((node, idx) => {
      if (node.nodeName === 'BR') return;
      if (idx < brIndex) eyebrow.append(node);
      else title.append(node);
    });
  }

  link.replaceChildren();
  if (eyebrow.textContent.trim()) link.append(eyebrow);
  link.append(title);

  // readable accessible title ("Pre-Qualify for a Boat Loan", not "...aBoat Loan")
  link.title = [eyebrow.textContent, title.textContent]
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');
}

export default function decorate(block) {
  const rows = [...block.children];
  const cols = rows[0] ? rows[0].children.length : 0;
  block.classList.add(`columns-cta-${cols}-cols`);

  rows.forEach((row) => {
    row.classList.add('columns-cta-row');
    [...row.children].forEach((cell) => {
      cell.classList.add('columns-cta-item');
      // A strong/em wrapping the whole link (author bolded the link) — unwrap it
      cell.querySelectorAll('strong > a, em > a').forEach((a) => {
        const wrapper = a.parentElement;
        if (wrapper.childNodes.length === 1) wrapper.replaceWith(a);
      });
      const links = cell.querySelectorAll('a');
      links.forEach(decorateLink);
      // drop the button-container class decorateButtons adds (on the cell itself when the
      // link is its only child, or on a wrapping paragraph)
      cell.classList.remove('button-container');
      cell.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
    });
  });
}
