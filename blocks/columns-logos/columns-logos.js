import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * columns-logos: a centered row of partner logos, one logo (optionally linked) per cell.
 */
export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    row.classList.add('columns-logos-row');
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img')) {
        cell.remove();
        return;
      }
      cell.classList.add('columns-logos-item');
      // Several logos authored in one cell: give each its own item so they space evenly
      const pictures = [...cell.querySelectorAll('picture')];
      if (pictures.length > 1 && !cell.textContent.trim()) {
        pictures.slice(1).reverse().forEach((pic) => {
          const item = document.createElement('div');
          item.className = 'columns-logos-item';
          item.append(pic.closest('a') || pic);
          cell.after(item);
        });
        cell.querySelectorAll('p').forEach((p) => {
          if (!p.children.length && !p.textContent.trim()) p.remove();
        });
      }
      cell.querySelectorAll('a').forEach((a) => {
        a.classList.remove('button', 'primary', 'secondary');
        a.closest('.button-container')?.classList.remove('button-container');
      });
    });
  });

  const cols = rows[0] ? rows[0].querySelectorAll(':scope > .columns-logos-item').length : 0;
  block.classList.add(`columns-logos-${cols}-cols`);

  block.querySelectorAll('picture > img').forEach((img) => {
    const isSvg = /\.svg(\?|$)/i.test(img.src);
    if (!isSvg) {
      img.closest('picture').replaceWith(
        createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]),
      );
    }
  });
}
