/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: bluewaterfinance.com page Metadata for template "content-page"
 * (/loans/, /protection/, /insurance/). No-op for every other template (e.g. "home").
 *
 * - Builds the page Metadata block from <head> (WebImporter.Blocks.getMetadata) and adds
 *   "Breadcrumbs: true" (the source breadcrumb trail .tunNavContain is removed by
 *   bluewaterfinance-cleanup.js; breadcrumbs are generated from metadata instead).
 * - Image: og:image is present on all three pages (uploads/featureImage/*.jpg = hero image).
 *   If a page lacks og:image, falls back to the hero image <div id="pnlSubPageImage"><img id="Image2">.
 *
 * IMPORTANT: because this transformer appends the Metadata block itself, the content-page
 * import script must NOT also call WebImporter.rules.createMetadata (or must skip it when a
 * Metadata block already exists), otherwise the page gets two Metadata blocks.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };
const HERO_SRC_ATTR = 'data-excat-hero-src';

function isContentPage(payload) {
  return !!(payload && payload.template && payload.template.name === 'content-page');
}

function hasMetadataBlock(root) {
  return [...root.querySelectorAll('table')].some((t) => {
    const first = t.querySelector('th, td');
    return first && first.textContent.trim().toLowerCase() === 'metadata';
  });
}

export default function transform(hookName, element, payload) {
  if (!isContentPage(payload)) return;
  const doc = element.ownerDocument;

  if (hookName === TransformHook.beforeTransform) {
    // Capture the hero image now — the hero-caption parser replaces #pnlSubPageImage.
    const heroImg = element.querySelector('#pnlSubPageImage img');
    const heroSrc = heroImg && (heroImg.src || heroImg.getAttribute('src'));
    if (heroSrc) element.setAttribute(HERO_SRC_ATTR, heroSrc);
  }

  if (hookName === TransformHook.afterTransform) {
    const heroSrc = element.getAttribute(HERO_SRC_ATTR);
    element.removeAttribute(HERO_SRC_ATTR);
    // short crumb label captured by the cleanup transformer before the trail was removed
    const crumbTitle = element.getAttribute('data-excat-breadcrumb-title');
    element.removeAttribute('data-excat-breadcrumb-title');
    const crumbParents = element.getAttribute('data-excat-breadcrumb-parents');
    element.removeAttribute('data-excat-breadcrumb-parents');
    if (hasMetadataBlock(element)) return;

    const meta = WebImporter.Blocks.getMetadata(doc) || {};
    // source og:image points at /uploads/featureImage/… which 404s; the hero image is the real one
    if (heroSrc) {
      const img = doc.createElement('img');
      img.src = heroSrc;
      meta.Image = img;
    }
    meta.Breadcrumbs = 'true';
    if (crumbTitle) meta['Breadcrumb Title'] = crumbTitle;
    if (crumbParents) meta['Breadcrumb Parents'] = crumbParents;

    element.append(WebImporter.Blocks.getMetadataBlock(doc, meta));
  }
}
