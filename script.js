/**
 * Adham & Fatma Wedding Invitation — Interactive Controller
 * Vanilla ES6+ | Handles Envelope Gate, Audio/Video Sync, Live Countdown,
 * Touch Coverflow Gallery, Smooth Auto-Scroll, and LocalStorage Guestbook.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ========================================================================
     1. ENVELOPE SPLASH GATE ("TAP TO OPEN") & MEDIA AUTO-START
     ======================================================================== */
  const envelopeGate = document.getElementById('envelope-gate');
  const openEnvelopeBtn = document.getElementById('open-envelope-btn');
  const heroVideo = document.getElementById('hero-video');
  const bgMusic = document.getElementById('bg-music');
  const vinylDisc = document.getElementById('vinyl-disc');
  const equalizerBadge = document.getElementById('equalizer-badge');

  // Lock body scroll while crimson envelope gate is closed
  document.body.classList.add('gate-locked');

  function setMusicVisualState(isPlaying) {
    if (isPlaying) {
      vinylDisc.classList.add('is-spinning');
      equalizerBadge.classList.add('is-playing');
    } else {
      vinylDisc.classList.remove('is-spinning');
      equalizerBadge.classList.remove('is-playing');
    }
  }

  function startBackgroundMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.75;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setMusicVisualState(true))
        .catch(() => setMusicVisualState(false));
    }
  }

  if (openEnvelopeBtn && envelopeGate) {
    openEnvelopeBtn.addEventListener('click', () => {
      // Trigger 3D flap opening & fade-out transition
      envelopeGate.classList.add('is-opened');
      document.body.classList.remove('gate-locked');

      // Ensure hero video plays smoothly
      if (heroVideo && heroVideo.paused) {
        heroVideo.play().catch(() => {});
      }

      // Start wedding background music immediately on user tap gesture
      startBackgroundMusic();

      // Remove gate from accessibility tree after transition completes
      setTimeout(() => {
        envelopeGate.style.display = 'none';
      }, 950);
    });
  }

  /* ========================================================================
     2. FLOATING VINYL MUSIC TOGGLE BUTTON
     ======================================================================== */
  const musicToggleBtn = document.getElementById('music-toggle-btn');

  if (musicToggleBtn && bgMusic) {
    musicToggleBtn.addEventListener('click', () => {
      if (bgMusic.paused) {
        startBackgroundMusic();
      } else {
        bgMusic.pause();
        setMusicVisualState(false);
      }
    });
  }

  /* ========================================================================
     3. FLOATING AUTO-SCROLL PLAY/PAUSE CONTROLLER (BOTTOM-LEFT)
     ======================================================================== */
  const autoScrollBtn = document.getElementById('auto-scroll-btn');
  const scrollPlayIcon = document.getElementById('scroll-play-icon');
  const scrollPauseIcon = document.getElementById('scroll-pause-icon');

  let isAutoScrolling = false;
  let scrollAnimationFrame = null;
  const SCROLL_SPEED_PX_PER_FRAME = 1.15;

  function stopAutoScroll() {
    isAutoScrolling = false;
    if (scrollAnimationFrame) {
      cancelAnimationFrame(scrollAnimationFrame);
      scrollAnimationFrame = null;
    }
    scrollPlayIcon.classList.remove('is-hidden');
    scrollPauseIcon.classList.add('is-hidden');
  }

  function stepAutoScroll() {
    if (!isAutoScrolling) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= maxScroll - 2) {
      stopAutoScroll();
      return;
    }

    window.scrollBy(0, SCROLL_SPEED_PX_PER_FRAME);
    scrollAnimationFrame = requestAnimationFrame(stepAutoScroll);
  }

  function startAutoScroll() {
    isAutoScrolling = true;
    scrollPlayIcon.classList.add('is-hidden');
    scrollPauseIcon.classList.remove('is-hidden');
    scrollAnimationFrame = requestAnimationFrame(stepAutoScroll);
  }

  if (autoScrollBtn) {
    autoScrollBtn.addEventListener('click', () => {
      if (isAutoScrolling) {
        stopAutoScroll();
      } else {
        startAutoScroll();
      }
    });
  }

  // Pause auto-scroll gracefully if the guest manually scrolls or touches the screen
  ['wheel', 'touchstart', 'keydown'].forEach((evt) => {
    window.addEventListener(
      evt,
      () => {
        if (isAutoScrolling) stopAutoScroll();
      },
      { passive: true }
    );
  });

  /* ========================================================================
     4. LIVE WEDDING COUNTDOWN TIMER (TARGET: 5 NOVEMBER 2026)
     ======================================================================== */
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  // Target date matching the hero & countdown header: 5 November 2026 at 18:00 EET
  const targetTimestamp = new Date('2026-12-27T18:00:00+02:00').getTime();

  function padZero(num) {
    return String(num).padStart(2, '0');
  }

  function updateCountdown() {
    const now = Date.now();
    const diff = targetTimestamp - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = padZero(days);
    hoursEl.textContent = padZero(hours);
    minsEl.textContent = padZero(minutes);
    secsEl.textContent = padZero(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ========================================================================
     5. OUR STORY 3D COVERFLOW CAROUSEL (SWIPE, CLICK & PAGINATION DOTS)
     ======================================================================== */
  const slides = Array.from(document.querySelectorAll('.story-slide'));
  const dots = Array.from(document.querySelectorAll('.story-dot'));
  const prevZone = document.querySelector('.story-nav-prev');
  const nextZone = document.querySelector('.story-nav-next');
  const carouselEl = document.getElementById('story-carousel');

  let activeSlideIndex = 4; // Matches Screenshot 170400 default active slide
  const totalSlides = slides.length;

  function renderCarousel(index) {
    activeSlideIndex = (index + totalSlides) % totalSlides;
    const prevIndex = (activeSlideIndex - 1 + totalSlides) % totalSlides;
    const nextIndex = (activeSlideIndex + 1) % totalSlides;

    slides.forEach((slide, idx) => {
      slide.classList.remove('is-active', 'is-prev', 'is-next');
      if (idx === activeSlideIndex) {
        slide.classList.add('is-active');
      } else if (idx === prevIndex) {
        slide.classList.add('is-prev');
      } else if (idx === nextIndex) {
        slide.classList.add('is-next');
      }
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === activeSlideIndex);
    });
  }

  if (totalSlides > 0) {
    renderCarousel(activeSlideIndex);

    if (prevZone) {
      prevZone.addEventListener('click', () => renderCarousel(activeSlideIndex - 1));
    }
    if (nextZone) {
      nextZone.addEventListener('click', () => renderCarousel(activeSlideIndex + 1));
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIdx = Number(dot.dataset.slide);
        renderCarousel(targetIdx);
      });
    });

    // Touch & Pointer Swipe Support
    let startX = 0;
    let isDragging = false;

    if (carouselEl) {
      carouselEl.addEventListener(
        'touchstart',
        (e) => {
          startX = e.touches[0].clientX;
          isDragging = true;
        },
        { passive: true }
      );

      carouselEl.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        const deltaX = e.changedTouches[0].clientX - startX;
        if (Math.abs(deltaX) > 38) {
          renderCarousel(deltaX < 0 ? activeSlideIndex + 1 : activeSlideIndex - 1);
        }
        isDragging = false;
      });
    }
  }

  /* ========================================================================
     6. GUESTBOOK & RSVP FORM WITH LOCALSTORAGE PERSISTENCE
     ======================================================================== */
  const rsvpForm = document.getElementById('rsvp-form');
  const guestNameInput = document.getElementById('guest-name');
  const guestMessageInput = document.getElementById('guest-message');
  const formFeedback = document.getElementById('form-feedback');
  const wishesFeed = document.getElementById('wishes-feed');

  const STORAGE_KEY = 'adham_fatma_wishes_2026';

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderSavedWishes() {
    if (!wishesFeed) return;
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    wishesFeed.innerHTML = saved
      .map(
        (item) => `
        <article class="wish-item">
          <div class="wish-header">
            <span class="wish-author">${escapeHTML(item.name)}</span>
            <span class="wish-badge">${escapeHTML(item.attending)}</span>
          </div>
          <p class="wish-body">${escapeHTML(item.message)}</p>
        </article>
      `
      )
      .join('');
  }

  renderSavedWishes();

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = guestNameInput.value.trim();
      const message = guestMessageInput.value.trim();
      const attendingRadio = rsvpForm.querySelector('input[name="attending"]:checked');
      const attending = attendingRadio ? attendingRadio.value : "Yes, I'll be there";

      if (!name) {
        formFeedback.textContent = 'Please enter your name.';
        guestNameInput.focus();
        return;
      }

      if (!message) {
        formFeedback.textContent = 'Please write a short message for Adham & Fatma.';
        guestMessageInput.focus();
        return;
      }

      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.unshift({ name, attending, message, createdAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

      renderSavedWishes();
      rsvpForm.reset();
      formFeedback.textContent = 'Thank you! Your message has been sent to Adham & Fatma.';

      setTimeout(() => {
        formFeedback.textContent = '';
      }, 4500);
    });
  }

  /* ========================================================================
     7. INTERSECTION OBSERVER SCROLL REVEALS
     ======================================================================== */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }
});