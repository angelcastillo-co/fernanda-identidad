/**
 * FERNANDA — Identidad Visual 2026
 * main.js — Lógica de interacción
 *
 * Módulos:
 *  1. Carousel          — Carrusel de aplicaciones con teclado y touch
 *  2. ScrollReveal      — Animación de entrada al hacer scroll
 *  3. SmoothScroll      — Scroll suave para anclas internas
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. CAROUSEL
   ─ Navegación por botones, dots y teclado
   ─ Soporte para touch/swipe en móvil
   ─ Auto-play pausable al hover
═══════════════════════════════════════════════════════════════ */
(function initCarousel() {
  const track      = document.getElementById('carouselTrack');
  const dotsWrap   = document.getElementById('carouselDots');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');

  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  const slides         = Array.from(track.querySelectorAll('.carousel__slide'));
  const totalSlides    = slides.length;
  let currentIndex     = 0;
  let autoPlayInterval = null;
  let touchStartX      = 0;
  let slidesPerView    = getSlidesPerView();

  /** Calcula cuántas slides mostrar según el ancho de pantalla */
  function getSlidesPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  /** Número de posiciones navegables */
  function maxIndex() {
    return Math.max(0, totalSlides - slidesPerView);
  }

  /** Mueve el track al índice dado */
  function goTo(index) {
    currentIndex = Math.min(Math.max(index, 0), maxIndex());
    
    const slide = slides[0];
    const slideWidth = slide.getBoundingClientRect().width;

    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

    // Actualiza dots
    dotsWrap.querySelectorAll('.carousel__dot').forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    // Actualiza slides: aria-hidden para los no visibles
    slides.forEach((slide, i) => {
      const visible = i >= currentIndex && i < currentIndex + slidesPerView;
      slide.setAttribute('aria-hidden', String(!visible));
      slide.inert = !visible;
    });

    // Deshabilita botones en los extremos
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex();
  }

  /** Crea los dots de navegación */
  function buildDots() {
    dotsWrap.innerHTML = '';
    const totalDots = maxIndex() + 1;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className  = 'carousel__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
      dot.addEventListener('click', () => {
        goTo(i);
        resetAutoPlay();
      });
      dotsWrap.appendChild(dot);
    }
  }

  /** Auto-play: avanza una posición cada 4 s */
  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      const next = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
      goTo(next);
    }, 7000);
  }

  function stopAutoPlay()  { clearInterval(autoPlayInterval); }
  function resetAutoPlay() { stopAutoPlay(); startAutoPlay(); }

  // Botones prev / next
  prevBtn.addEventListener('click', () => { goTo(currentIndex - 1); resetAutoPlay(); });
  nextBtn.addEventListener('click', () => { goTo(currentIndex + 1); resetAutoPlay(); });

  // Teclado (flechas) cuando el carrusel tiene foco
  track.parentElement.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { goTo(currentIndex - 1); resetAutoPlay(); }
    if (e.key === 'ArrowRight') { goTo(currentIndex + 1); resetAutoPlay(); }
  });

  // Touch / swipe
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      delta > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
      resetAutoPlay();
    }
  });

  // Pausa al hover
  track.parentElement.addEventListener('mouseenter', stopAutoPlay);
  track.parentElement.addEventListener('mouseleave', startAutoPlay);

  // Recalcula al redimensionar
  window.addEventListener('resize', () => {
    const newCount = getSlidesPerView();
    if (newCount !== slidesPerView) {
      slidesPerView = newCount;
      buildDots();
      goTo(0);
    }
  });


  // Init
  buildDots();
  goTo(0);
  startAutoPlay();
})();


/* ═══════════════════════════════════════════════════════════════
   2. SCROLL REVEAL
   ─ IntersectionObserver: añade .is-visible cuando el elemento
     entra en el viewport
   ─ Usa el atributo [data-reveal] en el HTML
═══════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  // Agrega data-reveal a los elementos candidatos automáticamente
  const candidates = [
    '.concepto__block',
    '.version-card',
    '.isotipo-card',
    '.color-swatch',
    '.tipo-card',
    '.foto-card',
    '.error-card',
    '.recurso-card',
    '.paleta-foto__swatch',
    '.file-type-card',
    '.logo-showcase__display',
    '.specs-card',
    '.proteccion',
    '.uso-color',
    '.folder-tree',
    '.guia-rapida',
    '.archivos__tipos',
  ];

  candidates.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      // Delay escalonado dentro del mismo grupo visual (máx 3)
      const delay = Math.min(i % 4, 3);
      if (delay > 0) el.setAttribute('data-reveal-delay', String(delay));
    });
  });

  if (!('IntersectionObserver' in window)) {
    // Fallback: muestra todo si no hay soporte
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Observa solo una vez
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════════════
   3. SCROLL SUAVE PARA ANCLAS
   ─ Maneja clicks en <a href="#..."> con scroll animado
   ─ Añade offset para compensar posibles navbars fijas
═══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);

      if (!target) return;

      e.preventDefault();

      const offset   = 0; // Ajustar si hay navbar fija (ej: 72)
      const top      = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });

      // Foco accesible en el destino
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    });
  });
})();
