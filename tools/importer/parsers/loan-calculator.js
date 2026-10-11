/* eslint-disable */
/* global WebImporter */
/**
 * Parser for loan-calculator. Source: https://bluewaterfinance.com/loans/LoanCalculator/
 * Generated: 2026-10-11
 *
 * Source structure:
 *   div.wysiwyg
 *     h2 "Loan Calculator"                       (section heading -> default content BEFORE the block)
 *     table#rblType  radio labels                (Monthly Payment | Loan Amount mode tabs)
 *     #form-container  h3#lblFormHead, label#lblInterest, label#lblYears, #rblMonths radios (84..240)
 *     #results-container  h3 "Results"
 *     <script>                                   (jQuery calculator; "Loan Amount" heading text only lives here)
 *   div.wysiwyg > span.footnote                  (disclaimer -> moved into the block)
 *
 * Output (key | value config rows, read by blocks/loan-calculator):
 *   | loan-calculator |                                     |
 *   | Payment Tab     | Monthly Payment                     |
 *   | Payment Heading | Let's Calculate Your Monthly Payment |
 *   | Amount Tab      | Loan Amount                         |
 *   | Amount Heading  | Let's Calculate Your Loan Amount    |
 *   | Rate Label      | Interest Rate                       |
 *   | Term Label      | Length of loan (in months)          |
 *   | Terms           | 84, 120, 144, 180, 240              |
 *   | Results Heading | Results                             |
 *   | Disclaimer      | Please note: ...                    |
 */
function cleanText(node) {
  return (node ? node.textContent : '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/:$/, '').trim();
}

export default function parse(element, { document }) {
  const srcHeading = element.querySelector('h2');
  let heading = null;
  if (srcHeading && cleanText(srcHeading)) {
    heading = document.createElement('h2');
    heading.textContent = cleanText(srcHeading);
  }

  const tabs = [...element.querySelectorAll('#rblType label')].map(cleanText);
  const terms = [...element.querySelectorAll('#rblMonths input[type="radio"]')]
    .map((input) => input.value).filter(Boolean);

  // disclaimer lives in the following .wysiwyg; move it into the block
  const footnote = element.parentElement && element.parentElement.querySelector('.footnote');
  const disclaimer = cleanText(footnote);
  if (footnote) {
    const holder = footnote.closest('.wysiwyg');
    if (holder && holder !== element && cleanText(holder) === disclaimer) holder.remove();
    else footnote.remove();
  }

  const rows = [
    ['Payment Tab', tabs[0] || 'Monthly Payment'],
    ['Payment Heading', cleanText(element.querySelector('#lblFormHead')) || "Let's Calculate Your Monthly Payment"],
    ['Amount Tab', tabs[1] || 'Loan Amount'],
    // only present in the source's inline script
    ['Amount Heading', "Let's Calculate Your Loan Amount"],
    ['Rate Label', cleanText(element.querySelector('#lblInterest')) || 'Interest Rate'],
    ['Term Label', cleanText(element.querySelector('#lblYears')) || 'Length of loan (in months)'],
    ['Terms', (terms.length ? terms : ['84', '120', '144', '180', '240']).join(', ')],
    ['Results Heading', cleanText(element.querySelector('#results-container h3')) || 'Results'],
  ];
  if (disclaimer) rows.push(['Disclaimer', disclaimer]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'loan-calculator', cells: rows });
  if (heading) element.before(heading);
  element.replaceWith(block);
}
