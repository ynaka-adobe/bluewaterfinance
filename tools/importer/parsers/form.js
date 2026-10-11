/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form (base block, no variants). Source: https://bluewaterfinance.com/contact/
 * Generated: 2026-10-11
 *
 * Source structure:
 *   table.surveyTable (ASP.NET survey; server-validated)
 *     tr > "Contact Us"                                   (title -> h2 default content before the block)
 *     tr > "Please complete this form and we will..."    (intro -> p default content before the block)
 *     tr > label + input ... (Name, Email, Company, Address, City, State, Zip, phones, Comments)
 *     tr > "Spam Check: n + n =" + input                 (server-side arithmetic check; not migrated)
 *     input[type=submit]
 *
 * The field definition itself is not in the page: it lives in the form JSON
 * (content/contact-form.json, produced by the form migration step from this source form).
 * Output (2-row block referencing the JSON by relative link):
 *   | Form |
 *   | [contact-form.json](contact-form.json) |
 */
const FORM_JSON = {
  '/contact/': 'contact-form.json',
};

function cleanText(node) {
  return (node ? node.textContent : '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  let path = '/contact/';
  try {
    path = new URL(document.querySelector('link[rel="canonical"]')?.href || document.location.href).pathname.toLowerCase();
  } catch (e) {
    // validation harness without a page URL: keep the default
  }
  const jsonName = FORM_JSON[path] || FORM_JSON['/contact/'];

  // title + intro rows are the leading text-only rows of the survey table
  const rows = [...element.querySelectorAll('tr')];
  const textRows = [];
  for (const tr of rows) {
    if (tr.querySelector('input, textarea, select')) break;
    const text = cleanText(tr);
    if (text) textRows.push(text);
  }

  const before = [];
  if (textRows[0]) {
    const h2 = document.createElement('h2');
    h2.textContent = textRows[0];
    before.push(h2);
  }
  textRows.slice(1).forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    before.push(p);
  });

  const link = document.createElement('a');
  link.href = jsonName;
  link.textContent = jsonName;
  const block = WebImporter.Blocks.createBlock(document, { name: 'Form', cells: [[link]] });
  element.before(...before);
  element.replaceWith(block);
}
