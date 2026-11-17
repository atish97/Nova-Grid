document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Hero Staggered Entrance & Battery Widget Animation
  const heroItems = document.querySelectorAll('.hero-animate');
  heroItems.forEach((el) => {
    const delay = prefersReducedMotion ? 0 : Number(el.dataset.delay || 0);
    setTimeout(() => {
      el.classList.add('is-visible');
    }, delay);
  });

  const batteryCounter = document.getElementById('battery-counter');
  const batteryFill = document.getElementById('battery-fill');
  const targetCharge = 64;
  const targetBarPercent = 67.15; // 137 / 204 from Figma spec

  if (batteryCounter && batteryFill) {
    if (prefersReducedMotion) {
      batteryCounter.textContent = String(targetCharge);
      batteryFill.style.width = `${targetBarPercent}%`;
    } else {
      setTimeout(() => {
        batteryFill.style.width = `${targetBarPercent}%`;
        const duration = 1200;
        const startTime = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          batteryCounter.textContent = String(Math.round(eased * targetCharge));
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      }, 220);
    }
  }

  // 2. Sticky Header Scroll State
  const header = document.querySelector('.site-header');
  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 36);
  };
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  // 3. Scroll-Triggered Fade-In Reveals (with stagger)
  const revealElements = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const staggerIndex = Number(el.dataset.stagger || 0);
          el.style.transitionDelay = `${staggerIndex * 90}ms`;
          el.classList.add('is-visible');
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -48px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // 4. FAQ Accordion Interactions
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isCurrentlyOpen = item.classList.contains('is-open');

      // Close other items for a clean, focused accordion experience
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('is-open')) {
          other.classList.remove('is-open');
          const otherTrigger = other.querySelector('.faq-trigger');
          const otherPanel = other.querySelector('.faq-panel');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.setAttribute('aria-hidden', 'true');
        }
      });

      const nextState = !isCurrentlyOpen;
      item.classList.toggle('is-open', nextState);
      trigger.setAttribute('aria-expanded', String(nextState));
      panel.setAttribute('aria-hidden', String(!nextState));
    });
  });

  // 5. Mobile Navigation Drawer
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');

  const closeMobileMenu = () => {
    if (!menuToggle || !mobileDrawer) return;
    menuToggle.classList.remove('is-open');
    mobileDrawer.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
  };

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const willOpen = !mobileDrawer.classList.contains('is-open');
      menuToggle.classList.toggle('is-open', willOpen);
      mobileDrawer.classList.toggle('is-open', willOpen);
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      mobileDrawer.setAttribute('aria-hidden', String(!willOpen));
    });

    mobileDrawer.querySelectorAll('a, button').forEach((node) => {
      node.addEventListener('click', closeMobileMenu);
    });
  }

  // 6. Get Started Modal
  const modal = document.getElementById('get-started-modal');
  const openModalButtons = document.querySelectorAll('.open-modal-btn');
  const closeModalButton = modal?.querySelector('.modal-close');
  const leadForm = document.getElementById('lead-form');
  const modalSuccess = document.getElementById('modal-success');

  const openModal = () => {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openModalButtons.forEach((btn) => btn.addEventListener('click', openModal));
  closeModalButton?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
      closeModal();
    }
  });

  leadForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    leadForm.hidden = true;
    if (modalSuccess) modalSuccess.hidden = false;
  });

  // 7. Hero Country Flags Simultaneous Smooth Cross-Fade Rotation
  const flagSlots = Array.from(document.querySelectorAll('#flag-stack .avatar-slot'));
  if (flagSlots.length === 4 && !prefersReducedMotion) {
    const svgFlag = (svgBody) =>
      `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${svgBody}</svg>`
      )}`;

    const flagSets = [
      [
        'assets/images/avatar-1-67a176.png',
        'assets/images/avatar-2-118c44.png',
        'assets/images/avatar-3.png',
        'assets/images/avatar-4.png',
      ],
      [
        // Germany
        svgFlag('<rect width="64" height="22" y="0" fill="#111"/><rect width="64" height="22" y="21" fill="#DD0000"/><rect width="64" height="22" y="42" fill="#FFCE00"/>'),
        // Japan
        svgFlag('<rect width="64" height="64" fill="#FFFFFF"/><circle cx="32" cy="32" r="16" fill="#BC002D"/>'),
        // Norway
        svgFlag('<rect width="64" height="64" fill="#BA0C2F"/><rect x="18" width="12" height="64" fill="#FFF"/><rect y="26" width="64" height="12" fill="#FFF"/><rect x="21" width="6" height="64" fill="#00205B"/><rect y="29" width="64" height="6" fill="#00205B"/>'),
        // Sweden
        svgFlag('<rect width="64" height="64" fill="#006AA7"/><rect x="18" width="10" height="64" fill="#FECC02"/><rect y="27" width="64" height="10" fill="#FECC02"/>'),
      ],
      [
        // France
        svgFlag('<rect width="22" height="64" x="0" fill="#0055A4"/><rect width="22" height="64" x="21" fill="#FFFFFF"/><rect width="22" height="64" x="42" fill="#EF4135"/>'),
        // Switzerland
        svgFlag('<rect width="64" height="64" fill="#D52B1E"/><rect x="26" y="14" width="12" height="36" fill="#FFF"/><rect x="14" y="26" width="36" height="12" fill="#FFF"/>'),
        // Canada
        svgFlag('<rect width="16" height="64" x="0" fill="#D80621"/><rect width="32" height="64" x="16" fill="#FFFFFF"/><rect width="16" height="64" x="48" fill="#D80621"/><path d="M32 15l3 9 7-3-3 8 6 4-2 3 3 2-8 2 1 8h-3v-7l-4 1-4-1v7h-3l1-8-8-2 3-2-2-3 6-4-3-8 7 3z" fill="#D80621"/>'),
        // Netherlands
        svgFlag('<rect width="64" height="22" y="0" fill="#AE1C28"/><rect width="64" height="22" y="21" fill="#FFFFFF"/><rect width="64" height="22" y="42" fill="#21468B"/>'),
      ],
    ];

    let setIndex = 0;

    setInterval(() => {
      setIndex = (setIndex + 1) % flagSets.length;
      const nextSet = flagSets[setIndex];

      flagSlots.forEach((slot, i) => {
        const currentImg = slot.querySelector('.avatar-item.is-current');
        const nextImg = slot.querySelector('.avatar-item.is-next');
        if (!currentImg || !nextImg) return;

        nextImg.src = nextSet[i];
        slot.classList.add('is-transitioning');

        setTimeout(() => {
          currentImg.src = nextSet[i];
          slot.classList.remove('is-transitioning');
        }, 620);
      });
    }, 3000);
  }
});

