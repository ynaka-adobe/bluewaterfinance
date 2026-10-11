import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Blog block
 * Blog listing: one card per post with the linked title and byline/date across the top,
 * then the feature image beside the excerpt and a "continue reading" button.
 *
 * Content model (Cards convention, 2 columns, one row per post):
 *   | Cards Blog |                                                         |
 *   | image      | ## [Title](/blog/post), By: ..., 07/21/2025, excerpt,   |
 *   |            | [continue reading](/blog/post)                          |
 */
function isLinkOnly(el) {
  const a = el.querySelector('a');
  return a && el.textContent.trim() === a.textContent.trim();
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture') && !c.querySelector('h1, h2, h3, h4, h5, h6, p:not(:has(> picture))'));
    const bodyCell = cells.find((c) => c !== imageCell) || document.createElement('div');

    const header = document.createElement('div');
    header.className = 'cards-blog-header';
    const meta = document.createElement('p');
    meta.className = 'cards-blog-meta';
    const body = document.createElement('div');
    body.className = 'cards-blog-body';

    const heading = bodyCell.querySelector('h1, h2, h3, h4, h5, h6');
    const paragraphs = [...bodyCell.children].filter((el) => el !== heading);
    const cta = paragraphs.length && isLinkOnly(paragraphs[paragraphs.length - 1])
      ? paragraphs.pop() : null;
    const excerpt = paragraphs.length > 0 ? paragraphs.pop() : null;
    // whatever sits between the title and the excerpt is byline/date
    paragraphs.forEach((p) => {
      const span = document.createElement('span');
      span.append(...p.childNodes);
      meta.append(span);
    });

    if (heading) header.append(heading);
    if (meta.children.length) header.append(meta);
    li.append(header);

    if (imageCell) {
      imageCell.className = 'cards-blog-image';
      li.append(imageCell);
    }
    if (excerpt) body.append(excerpt);
    if (cta) {
      cta.classList.add('cards-blog-cta');
      body.append(cta);
    }
    li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }])));
  block.replaceChildren(ul);
}
