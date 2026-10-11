import { readBlockConfig, toClassName } from '../../scripts/aem.js';

/**
 * Loan Calculator block
 * Client-side boat loan calculator with two modes: monthly payment from a loan amount,
 * or affordable loan amount from a monthly payment. Nothing is submitted anywhere.
 *
 * Content model (key | value rows; every row optional, defaults below):
 *   | Loan Calculator |                                      |
 *   | Payment Tab     | Monthly Payment                      |
 *   | Payment Heading | Let's Calculate Your Monthly Payment |
 *   | Amount Tab      | Loan Amount                          |
 *   | Amount Heading  | Let's Calculate Your Loan Amount     |
 *   | Rate Label      | Interest Rate                        |
 *   | Term Label      | Length of loan (in months)           |
 *   | Terms           | 84, 120, 144, 180, 240               |
 *   | Results Heading | Results                              |
 *   | Disclaimer      | Please note: ...                     |
 */
const DEFAULTS = {
  'payment-tab': 'Monthly Payment',
  'payment-heading': "Let's Calculate Your Monthly Payment",
  'amount-tab': 'Loan Amount',
  'amount-heading': "Let's Calculate Your Loan Amount",
  'rate-label': 'Interest Rate',
  'term-label': 'Length of loan (in months)',
  terms: '84, 120, 144, 180, 240',
  'results-heading': 'Results',
};

const money = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let instance = 0;

function toNumber(value) {
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

/** Monthly payment for a principal at an annual % rate over n months. */
export function monthlyPayment(principal, annualRate, months) {
  const r = annualRate / 1200;
  if (!(principal > 0) || !(months > 0) || !(annualRate >= 0)) return NaN;
  if (r === 0) return principal / months;
  const pow = (1 + r) ** months;
  return (principal * pow * r) / (pow - 1);
}

/** Loan amount a monthly payment covers at an annual % rate over n months (whole dollars). */
export function loanAmount(payment, annualRate, months) {
  const r = annualRate / 1200;
  if (!(payment > 0) || !(months > 0) || !(annualRate >= 0)) return NaN;
  if (r === 0) return Math.round(payment * months);
  return Math.round((payment / r) * (1 - (1 + r) ** -months));
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

function radio(name, value, text, checked, id) {
  const input = el('input', {
    type: 'radio', name, value, id,
  });
  input.checked = checked;
  return [input, el('label', { for: id }, text)];
}

export default function decorate(block) {
  instance += 1;
  const uid = `loan-calculator-${instance}`;

  // keep the disclaimer's markup (it may contain links/emphasis)
  const disclaimerRow = [...block.children]
    .find((row) => toClassName(row.children[0]?.textContent || '') === 'disclaimer');
  const disclaimerCell = disclaimerRow?.children[1];
  const config = { ...DEFAULTS, ...readBlockConfig(block) };
  const text = (key) => String(config[key] || DEFAULTS[key]).trim().replace(/:$/, '');
  const terms = String(config.terms || DEFAULTS.terms).split(',')
    .map((t) => parseInt(t, 10)).filter((t) => t > 0);

  const modes = { payment: 'payment', amount: 'amount' };
  const holds = { payment: '', amount: '' };

  // mode switch (source: "Monthly Payment | Loan Amount" text tabs)
  const modeGroup = el('div', { class: 'loan-calculator-modes', role: 'radiogroup', 'aria-label': 'Calculate' });
  modeGroup.append(
    el('span', { class: 'loan-calculator-mode' }, ...radio(`${uid}-mode`, modes.payment, text('payment-tab'), true, `${uid}-mode-payment`)),
    el('span', { class: 'loan-calculator-mode' }, ...radio(`${uid}-mode`, modes.amount, text('amount-tab'), false, `${uid}-mode-amount`)),
  );

  const heading = el('h3', { id: `${uid}-heading` }, text('payment-heading'));
  const amountLabel = el('label', { for: `${uid}-amount` }, `${text('amount-tab')}:`);
  const amountInput = el('input', {
    type: 'text', id: `${uid}-amount`, inputmode: 'decimal', autocomplete: 'off',
  });
  const rateInput = el('input', {
    type: 'text', id: `${uid}-rate`, inputmode: 'decimal', autocomplete: 'off', maxlength: '5',
  });
  const termGroup = el('div', { class: 'loan-calculator-terms', role: 'radiogroup', 'aria-labelledby': `${uid}-term-label` });
  terms.forEach((t, i) => termGroup.append(...radio(`${uid}-term`, String(t), String(t), i === 0, `${uid}-term-${t}`)));

  const form = el(
    'form',
    { class: 'loan-calculator-panel loan-calculator-form', 'aria-labelledby': `${uid}-heading` },
    heading,
    el('div', { class: 'loan-calculator-field loan-calculator-currency' }, amountLabel, amountInput),
    el('div', { class: 'loan-calculator-field loan-calculator-percent' }, el('label', { for: `${uid}-rate` }, `${text('rate-label')}:`), rateInput),
    el('div', { class: 'loan-calculator-field' }, el('span', { class: 'loan-calculator-label', id: `${uid}-term-label` }, text('term-label')), termGroup),
  );

  const resultLabel = el('label', { for: `${uid}-result` }, `${text('payment-tab')}:`);
  const result = el('output', { id: `${uid}-result`, 'aria-live': 'polite' });
  const results = el(
    'div',
    { class: 'loan-calculator-panel loan-calculator-results' },
    el('h3', {}, text('results-heading')),
    resultLabel,
    result,
  );

  const mode = () => modeGroup.querySelector('input:checked').value;

  function calculate() {
    const value = toNumber(amountInput.value);
    const rate = toNumber(rateInput.value);
    const months = toNumber(form.querySelector(`input[name="${uid}-term"]:checked`)?.value);
    const isPayment = mode() === modes.payment;
    const n = isPayment ? monthlyPayment(value, rate, months) : loanAmount(value, rate, months);
    if (Number.isNaN(n)) {
      result.value = '';
      return;
    }
    const formatted = money.format(n);
    holds[isPayment ? modes.payment : modes.amount] = formatted;
    result.value = `$${formatted}`;
  }

  modeGroup.addEventListener('change', () => {
    const isPayment = mode() === modes.payment;
    heading.textContent = text(isPayment ? 'payment-heading' : 'amount-heading');
    amountLabel.textContent = `${text(isPayment ? 'amount-tab' : 'payment-tab')}:`;
    resultLabel.textContent = `${text(isPayment ? 'payment-tab' : 'amount-tab')}:`;
    // carry the previous result over as the new input, as the source does
    amountInput.value = isPayment ? holds.amount : holds.payment;
    calculate();
  });
  form.addEventListener('input', calculate);
  form.addEventListener('submit', (e) => e.preventDefault());
  // thousands separators once the visitor leaves the field
  amountInput.addEventListener('change', () => {
    const n = toNumber(amountInput.value);
    if (!Number.isNaN(n)) amountInput.value = n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  });

  const panels = el('div', { class: 'loan-calculator-panels' }, form, results);
  const children = [modeGroup, panels];
  if (disclaimerCell && disclaimerCell.textContent.trim()) {
    const note = el('div', { class: 'loan-calculator-disclaimer' });
    note.append(...disclaimerCell.childNodes);
    children.push(note);
  }
  block.replaceChildren(...children);
}
