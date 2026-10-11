/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-blog. Base: cards. Source: https://bluewaterfinance.com/blog/
 * Generated: 2026-10-11
 *
 * Source structure (one per post, repeated id):
 *   #pnlContent > div#divBlogItem
 *     a.blog-title[href=/blog/<slug>/]   "Post title"
 *     div.blog-author                     "By: Blue Water Finance"
 *     div.blog-date                       "07/21/2025"
 *     div > div#divBlogImage > img        (feature image, floated left)
 *           div#divBlogExcerpt "excerpt..." > div > a.blog-btn "continue reading"
 *
 * Output follows the Cards convention (2 columns; one row per card):
 *   | cards-blog |                                                                  |
 *   | image      | title (heading, linked) + description (author, date, excerpt) + CTA |
 */
function cleanText(node) {
  return (node ? node.textContent : '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll(':scope > [id="divBlogItem"]')];
  const finalItems = items.length ? items : [...element.querySelectorAll('[id="divBlogItem"]')];

  const cells = [];
  finalItems.forEach((item) => {
    const titleLink = item.querySelector('a.blog-title');
    const href = titleLink ? titleLink.getAttribute('href') : '';

    // cell 1: image (mandatory in the convention)
    const img = item.querySelector('[id="divBlogImage"] img');

    // cell 2: title heading, description, call-to-action
    const text = [];
    if (titleLink) {
      const h2 = document.createElement('h2');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = cleanText(titleLink);
      h2.append(a);
      text.push(h2);
    }
    const author = cleanText(item.querySelector('.blog-author'));
    const date = cleanText(item.querySelector('.blog-date'));
    if (author) text.push(para(document, author));
    if (date) text.push(para(document, date));

    const excerptEl = item.querySelector('[id="divBlogExcerpt"]');
    const btn = excerptEl && excerptEl.querySelector('a.blog-btn');
    if (excerptEl) {
      const clone = excerptEl.cloneNode(true);
      clone.querySelectorAll('a.blog-btn').forEach((a) => a.remove());
      const excerpt = cleanText(clone);
      if (excerpt) text.push(para(document, excerpt));
    }
    if (btn) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = btn.getAttribute('href') || href;
      a.textContent = cleanText(btn);
      p.append(a);
      text.push(p);
    }

    if (!img && !text.length) return;
    cells.push([img || '', text]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-blog', cells });
  element.replaceChildren(block);
}
