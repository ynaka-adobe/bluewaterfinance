import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-services: photo tiles with an overlaid title bar; the teaser text expands
 * over the photo on hover/focus. The whole tile is clickable via the title link.
 * Authoring: one row per card -> [image] [title (linked), teaser paragraph]
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-services-card';

    [...row.children].forEach((cell) => {
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'cards-services-card-image';
      } else if (cell.textContent.trim() || cell.querySelector('a')) {
        cell.className = 'cards-services-card-body';
      } else {
        cell.remove();
        return;
      }
      li.append(cell);
    });

    // Image authored inside the text cell: lift it into its own image cell
    const stray = li.querySelector('.cards-services-card-body picture');
    if (stray && !li.querySelector('.cards-services-card-image')) {
      const holder = stray.parentElement;
      const imageCell = document.createElement('div');
      imageCell.className = 'cards-services-card-image';
      imageCell.append(stray);
      if (holder.tagName === 'P' && !holder.textContent.trim() && !holder.children.length) holder.remove();
      li.prepend(imageCell);
    }

    const body = li.querySelector('.cards-services-card-body');
    if (body) {
      const link = body.querySelector('a[href]');
      // Title = first heading, else the paragraph holding the first link, else the first block
      const title = body.querySelector('h1, h2, h3, h4, h5, h6')
        || link?.closest('p')
        || body.firstElementChild;
      if (title) title.classList.add('cards-services-card-title');
      [...body.children]
        .filter((el) => el !== title)
        .forEach((el) => el.classList.add('cards-services-card-teaser'));
      if (link) {
        link.classList.add('cards-services-card-link');
        link.classList.remove('button', 'primary', 'secondary');
        body.querySelectorAll('.button-container').forEach((el) => el.classList.remove('button-container'));
        body.classList.remove('button-container');
        li.classList.add('cards-services-card-linked');
      }
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
  ));

  block.replaceChildren(ul);
}
