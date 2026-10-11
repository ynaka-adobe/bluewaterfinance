/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: bluewaterfinance.com site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 *
 * NOTE: div.feature-banner.cycle2absolute (hero slideshow) is page content
 * (carousel-hero) and must NOT be removed. Hidden H1 in the intro row is kept.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // OneTrust cookie banner + preference center (<div id="onetrust-consent-sdk">),
    // empty tracking <iframe> after </form>.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      'iframe',
    ]);

    // ASP.NET hidden form inputs (<div class="aspNetHidden"> with __VIEWSTATE,
    // __VIEWSTATEGENERATOR, __SCROLLPOSITIONX/Y, __EVENTTARGET, __EVENTARGUMENT).
    // form#mainForm itself wraps the whole page, so keep it and its other contents.
    WebImporter.DOMUtils.remove(element, [
      'form#mainForm .aspNetHidden',
      'input#__VIEWSTATE',
      'input#__VIEWSTATEGENERATOR',
      'input#__SCROLLPOSITIONX',
      'input#__SCROLLPOSITIONY',
      'input#__EVENTTARGET',
      'input#__EVENTARGUMENT',
    ]);

    // cycle2 duplicate sentinel slide: <a href="/loans/" class="cycle-slide cycle-sentinel">.
    // Scoped to the anchor only — every slide <img> also carries .cycle-sentinel,
    // so a bare .cycle-sentinel selector would wipe out all real slide images.
    WebImporter.DOMUtils.remove(element, ['.cycle-slideshow > a.cycle-sentinel']);

    // --- content-page (/loans/, /protection/, /insurance/) ---
    // Breadcrumb trail: <div class="tunNavContain small-12"><span id="tunnel_navigation_tunnelNav">
    // (Home » Product Protection). Breadcrumbs are generated from page metadata instead.
    // The visual rule under it is a CSS border; there is no <hr> element in the markup.
    // Keep the current page's crumb label (e.g. "Product Protection") for the metadata
    // transformer, which writes it as "Breadcrumb Title".
    const crumbs = element.querySelectorAll('.tunNavContain a');
    const crumbLabel = crumbs.length > 1 ? crumbs[crumbs.length - 1].textContent.trim() : '';
    if (crumbLabel) element.setAttribute('data-excat-breadcrumb-title', crumbLabel);
    WebImporter.DOMUtils.remove(element, ['.tunNavContain']);

    // Accordion "close" duplicate toggles (/protection/): <a id="closeEngButton">, <a id="closeAccButton">
    // repeat the title of the preceding open toggle (#openEngButton / #openAccButton), so the
    // accordion parser would see two titles per panel. Only remove when an open twin exists.
    element.querySelectorAll('a[id^="close"][id$="Button"]').forEach((a) => {
      const openId = a.id.replace(/^close/, 'open');
      if (element.querySelector(`#${openId}`)) a.remove();
    });

    // ASP.NET postback links: <a id="lnkBtnInsurance" href="javascript:__doPostBack('ctl00$lnkBtnInsurance','')">.
    // On /insurance/ it wraps the "Get a Free Quote On boat Insurance" sidebar tile -> real URL.
    // On /loans/ and /protection/ it is empty -> drop it. Any other postback link is unwrapped.
    const POSTBACK_TARGETS = { lnkBtnInsurance: 'https://www.boaterschoiceinsurance.com/quote/' };
    element.querySelectorAll('a[href^="javascript:__doPostBack"]').forEach((a) => {
      const hasContent = a.textContent.trim() !== '' || a.querySelector('img');
      if (!hasContent) {
        a.remove();
      } else if (POSTBACK_TARGETS[a.id]) {
        a.setAttribute('href', POSTBACK_TARGETS[a.id]);
      } else {
        a.replaceWith(...a.childNodes);
      }
    });

    // Stray spacer <br> between .wysiwyg modules inside #pnlContent.
    WebImporter.DOMUtils.remove(element, ['#pnlContent > br']);

    // Inline emphasis: <span class="boldBlue">Call 866-350-2583 today.</span> (bold navy)
    // -> <strong> with the same children so the emphasis survives import.
    const doc = element.ownerDocument;
    element.querySelectorAll('span.boldBlue').forEach((span) => {
      const strong = doc.createElement('strong');
      while (span.firstChild) strong.appendChild(span.firstChild);
      span.replaceWith(strong);
    });

    // Strip trailing <br> / &nbsp; / whitespace runs at the end of .wysiwyg paragraphs
    // (e.g. "...today.</span><br><br><br>&nbsp;</p>"); spacing is handled in CSS.
    // Content pages put text directly in <div class="wysiwyg"> ("...We've got you covered.<br>&nbsp;"),
    // so the .wysiwyg container itself is trimmed too.
    element.querySelectorAll('.wysiwyg p, .wysiwyg').forEach((p) => {
      let last = p.lastChild;
      while (last) {
        const isBr = last.nodeType === 1 && last.tagName === 'BR';
        const isBlankText = last.nodeType === 3 && last.textContent.replace(/[\s ]/g, '') === '';
        if (!isBr && !isBlankText) break;
        const prev = last.previousSibling;
        last.remove();
        last = prev;
      }
      // Trim trailing &nbsp;/whitespace from the final text node, if any.
      if (last && last.nodeType === 3) {
        last.textContent = last.textContent.replace(/[\s ]+$/, '');
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome: header (#topContain: fraud alert, utility links, logo, nav),
    // footer (div.footerOuter), back-to-top button (#toTheTop).
    // cycle2 prev/next controls (#f-prev, #f-next) and caption overlay (.feature-slides-overlay).
    WebImporter.DOMUtils.remove(element, [
      '#topContain',
      '.footerOuter',
      '#toTheTop',
      '#f-prev',
      '#f-next',
      '.feature-slides-overlay',
      'noscript',
      'script',
      'link',
      'style',
    ]);

    // Documents (PDF sell sheets etc.) and the loan application forms (/prequalify/Application/,
    // /apply/Application/, /apply/co-applicant/ — server-side apps collecting SSN/financial data)
    // are not migrated: keep them pointing at the source site.
    let origin = 'https://bluewaterfinance.com';
    try {
      origin = new URL(payload?.params?.originalURL || payload?.url).origin;
    } catch (e) {
      // no page URL available (e.g. validation harness): keep the source-site default
    }
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (/^\/[^/].*\.(pdf|docx?|xlsx?)(\?|#|$)/i.test(href)
        || /^\/(prequalify\/application|apply\/application|apply\/co-applicant)\/?(\?|#|$)/i.test(href)) {
        a.setAttribute('href', `${origin}${href}`);
      }
    });
  }
}
