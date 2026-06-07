/* ═══════════════════════════════════════════════════
   Aayush Magar — Portfolio JavaScript
   Handles: Navigation, Filtering, Validation, Animations
   ═══════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ─── DOM Cache ──────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const header      = $('#site-header');
  const hamburger   = $('#hamburger-btn');
  const navMenu     = $('#nav-menu');
  const navLinks    = $$('.nav-link');
  const filterTabs  = $$('.filter-tab');
  const projectCards= $$('.project-card');
  const contactForm = $('#contact-form');
  const toast       = $('#form-toast');
  const footerYear  = $('#footer-year');

  // Create mobile overlay
  const overlay = document.createElement('div');
  overlay.classList.add('mobile-overlay');
  document.body.appendChild(overlay);


  // ═══════════════════════════════════════════════════
  // 1. MOBILE NAVIGATION
  // ═══════════════════════════════════════════════════

  function toggleMobileMenu(forceClose = false) {
    const isOpen = hamburger.classList.contains('active');

    if (forceClose || isOpen) {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
    } else {
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      navMenu.classList.add('open');
      overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
  }

  hamburger.addEventListener('click', () => toggleMobileMenu());
  overlay.addEventListener('click', () => toggleMobileMenu(true));

  // Close mobile menu on nav link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(true));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMobileMenu(true);
  });


  // ═══════════════════════════════════════════════════
  // 2. STICKY HEADER
  // ═══════════════════════════════════════════════════

  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;

    // Frosted glass when scrolled
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // initial state


  // ═══════════════════════════════════════════════════
  // 3. ACTIVE NAV LINK ON SCROLL
  // ═══════════════════════════════════════════════════

  const sections = $$('section[id]');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });


  // ═══════════════════════════════════════════════════
  // 4. PROJECT FILTERING
  // ═══════════════════════════════════════════════════

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;

      // Animate cards
      projectCards.forEach((card, i) => {
        const category = card.dataset.category;
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          // Trigger reflow
          card.offsetHeight;
          card.style.animation = `fadeCardIn 0.45s ${i * 0.08}s var(--ease-out-expo) both`;
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  // ═══════════════════════════════════════════════════
  // 5. STAT COUNTER ANIMATION
  // ═══════════════════════════════════════════════════

  const statNumbers = $$('.stat-number[data-target]');
  let statsCounted = false;

  function animateCounters() {
    if (statsCounted) return;

    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    });

    statsCounted = true;
  }

  // Trigger counters when hero stats come into view
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const heroStats = $('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);


  // ═══════════════════════════════════════════════════
  // 6. SCROLL REVEAL ANIMATIONS
  // ═══════════════════════════════════════════════════

  // Add .reveal class to animatable elements
  const revealSelectors = [
    '.section-title',
    '.section-subtitle',
    '.about-text',
    '.about-terminal',
    '.filter-tabs',
    '.project-card',
    '.skills-column',
    '.contact-form',
  ];

  revealSelectors.forEach(sel => {
    $$(sel).forEach(el => el.classList.add('reveal'));
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  $$('.reveal').forEach(el => revealObserver.observe(el));


  // ═══════════════════════════════════════════════════
  // 7. CONTACT FORM VALIDATION
  // ═══════════════════════════════════════════════════

  const validators = {
    name: (value) => {
      if (!value.trim()) return 'Name is required.';
      if (value.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: (value) => {
      if (!value.trim()) return 'Email is required.';
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!pattern.test(value.trim())) return 'Please enter a valid email address.';
      return '';
    },
    role: (value) => {
      if (!value) return 'Please select your role.';
      return '';
    },
    message: (value) => {
      if (!value.trim()) return 'Message is required.';
      if (value.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    },
  };

  function showError(fieldName, message) {
    const input = $(`#contact-${fieldName}`);
    const errorEl = $(`#error-${fieldName}`);

    if (message) {
      input.classList.add('error');
      errorEl.textContent = message;
    } else {
      input.classList.remove('error');
      errorEl.textContent = '';
    }
  }

  function validateField(fieldName) {
    const input = $(`#contact-${fieldName}`);
    const value = input.value;
    const error = validators[fieldName](value);
    showError(fieldName, error);
    return !error;
  }

  // Real-time validation on blur
  ['name', 'email', 'role', 'message'].forEach(field => {
    const input = $(`#contact-${field}`);
    input.addEventListener('blur', () => validateField(field));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(field);
      }
    });
  });

  // Form submit
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = ['name', 'email', 'role', 'message'];
    let isValid = true;

    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    if (!isValid) {
      // Focus first error field
      const firstError = contactForm.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Show success toast
    showToast();

    // Reset form
    contactForm.reset();

    // Clear any lingering error states
    fields.forEach(field => showError(field, ''));
  });

  function showToast() {
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 4000);
  }


  // ═══════════════════════════════════════════════════
  // 8. FOOTER YEAR
  // ═══════════════════════════════════════════════════

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }


  // ═══════════════════════════════════════════════════
  // 9. SMOOTH SCROLL FOR ANCHOR LINKS
  // ═══════════════════════════════════════════════════

  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = $(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  // ═══════════════════════════════════════════════════
  // 10. BACK TO TOP BUTTON
  // ═══════════════════════════════════════════════════

  const backToTop = $('#back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
