import { createOptimizedPicture, fetchPlaceholders } from '../../scripts/aem.js';

const AUTOPLAY_INTERVAL = 4000;

let carouselHeroId = 0;

function showSlide(block, index) {
  const slides = [...block.querySelectorAll('.carousel-hero-slide')];
  if (!slides.length) return;
  const next = ((index % slides.length) + slides.length) % slides.length;
  block.dataset.activeSlide = next;
  slides.forEach((slide, idx) => {
    const active = idx === next;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a, button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
}

function step(block, delta) {
  showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + delta);
}

function startAutoplay(block) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pauseButtons = [...block.querySelectorAll('.carousel-hero-pause')];
  const slidesContainer = block.querySelector('.carousel-hero-slides-container');
  if (reduced) {
    pauseButtons.forEach((btn) => btn.remove());
    return;
  }
  let timer;
  let userPaused = false;
  const start = () => {
    clearInterval(timer);
    if (userPaused) return;
    timer = setInterval(() => step(block, 1), AUTOPLAY_INTERVAL);
  };
  const stop = () => clearInterval(timer);
  const setPaused = (paused) => {
    userPaused = paused;
    pauseButtons.forEach((btn) => btn.setAttribute('aria-pressed', paused));
    block.classList.toggle('is-paused', paused);
    // announce slide changes only while the user is in control
    slidesContainer?.setAttribute('aria-live', paused ? 'polite' : 'off');
    if (paused) stop();
  };
  block.addEventListener('click', (e) => {
    if (!e.target.closest('.carousel-hero-pause')) return;
    setPaused(!userPaused);
  });
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);
  setPaused(false);
  start();
}

function createSlide(row, idx, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hero-slide';
  slide.id = `carousel-hero-${id}-slide-${idx}`;
  slide.dataset.slideIndex = idx;

  const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture, img'));
  // image cell = first cell containing a picture; everything else is content
  let imageCell = cells.find((c) => c.querySelector('picture'));
  const contentCells = cells.filter((c) => c !== imageCell);

  // Author put image and caption in one cell: split the picture out into its own cell
  if (imageCell && imageCell.textContent.trim()) {
    const picture = imageCell.querySelector('picture');
    const holder = picture.parentElement;
    const textCell = imageCell;
    imageCell = document.createElement('div');
    imageCell.append(picture);
    const emptyHolder = !holder.textContent.trim() && !holder.children.length;
    if (holder !== textCell && emptyHolder) holder.remove();
    contentCells.unshift(textCell);
  }

  if (imageCell) {
    imageCell.className = 'carousel-hero-slide-image';
    if (idx === 0) {
      // keep the authored (server-rendered) picture so the LCP image request
      // is discoverable in the initial document instead of re-created by JS
      const img = imageCell.querySelector('img');
      if (img) {
        img.loading = 'eager';
        img.setAttribute('fetchpriority', 'high');
      }
    } else {
      imageCell.querySelectorAll('picture > img').forEach((img) => {
        const picture = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]);
        // initially hidden slides should not compete with the LCP image
        picture.querySelector('img')?.setAttribute('fetchpriority', 'low');
        img.closest('picture').replaceWith(picture);
      });
    }
    slide.append(imageCell);
  }

  if (contentCells.length) {
    const content = document.createElement('div');
    content.className = 'carousel-hero-slide-content';
    contentCells.forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
    // Separate the CTA link(s) from the caption so they can sit side by side
    const ctas = [...content.querySelectorAll('a')];
    if (ctas.length) {
      const actions = document.createElement('div');
      actions.className = 'carousel-hero-slide-actions';
      ctas.forEach((a) => {
        // the CTA may be wrapped in strong/em (button emphasis) inside its own paragraph
        const p = a.closest('p');
        const onlyLink = p && p.textContent.trim() === a.textContent.trim();
        if (!a.classList.contains('button')) a.classList.add('button');
        actions.append(a);
        if (onlyLink) p.remove();
      });
      const caption = document.createElement('div');
      caption.className = 'carousel-hero-slide-caption';
      while (content.firstChild) caption.append(content.firstChild);
      if (caption.textContent.trim()) {
        content.append(caption);
        // identical "Learn More" links point to different pages: disambiguate
        // them for assistive tech with the slide caption
        ctas.forEach((a) => {
          const hint = document.createElement('span');
          hint.className = 'visually-hidden';
          hint.textContent = `: ${caption.textContent.trim()}`;
          a.append(hint);
        });
      }
      content.append(actions);
    } else {
      content.classList.add('carousel-hero-slide-caption');
    }
    slide.append(content);
  }

  return slide;
}

export default async function decorate(block) {
  carouselHeroId += 1;
  const id = carouselHeroId;
  const placeholders = await fetchPlaceholders();
  const rows = [...block.children];

  block.id = `carousel-hero-${id}`;
  block.setAttribute('role', 'region');
  const { carousel: roleLabel } = placeholders;
  block.setAttribute('aria-roledescription', roleLabel || 'Carousel');

  const container = document.createElement('div');
  container.className = 'carousel-hero-slides-container';
  const list = document.createElement('ul');
  list.className = 'carousel-hero-slides';
  rows.forEach((row, idx) => {
    list.append(createSlide(row, idx, id));
    row.remove();
  });
  container.append(list);

  if (rows.length > 1) {
    // Source places prev/next inside the caption bar, in flow before the caption.
    // Each slide gets its own controls so they lay out with the caption at every
    // breakpoint; hidden (inactive) slides keep theirs out of the tab order.
    list.querySelectorAll('.carousel-hero-slide').forEach((slide) => {
      let content = slide.querySelector('.carousel-hero-slide-content');
      if (!content) {
        content = document.createElement('div');
        content.className = 'carousel-hero-slide-content';
        slide.append(content);
      }
      const nav = document.createElement('div');
      nav.className = 'carousel-hero-navigation';
      nav.innerHTML = `
        <button type="button" class="carousel-hero-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}" aria-controls="carousel-hero-${id}"></button>
        <button type="button" class="carousel-hero-next" aria-label="${placeholders.nextSlide || 'Next Slide'}" aria-controls="carousel-hero-${id}"></button>
        <button type="button" class="carousel-hero-pause" aria-label="${placeholders.pauseSlideshow || 'Pause slideshow'}" aria-pressed="false" aria-controls="carousel-hero-${id}"></button>
      `;
      content.prepend(nav);
    });
    block.addEventListener('click', (e) => {
      const btn = e.target.closest('.carousel-hero-prev, .carousel-hero-next, .carousel-hero-pause');
      if (!btn) return;
      // pause/play is handled in startAutoplay
      if (btn.classList.contains('carousel-hero-pause')) return;
      const cls = btn.classList.contains('carousel-hero-prev') ? 'carousel-hero-prev' : 'carousel-hero-next';
      const hadFocus = document.activeElement === btn;
      step(block, cls === 'carousel-hero-prev' ? -1 : 1);
      // keep keyboard focus on the equivalent control of the newly active slide
      if (hadFocus) block.querySelector(`.carousel-hero-slide.is-active .${cls}`)?.focus();
    });
    block.classList.add('carousel-hero-multi');
  }

  block.replaceChildren(container);
  showSlide(block, 0);
  if (rows.length > 1) startAutoplay(block);
}
