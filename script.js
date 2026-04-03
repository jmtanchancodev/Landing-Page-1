(() => {
  /* ═══════════════════════════════════════════════════════════
     HELAX — Premium Enhancement Script
     Layered on top of original functionality, zero breaking changes
     ═══════════════════════════════════════════════════════════ */

  /* ── 1. PAGE LOADER ─────────────────────────────────────────── */
  const loader = document.getElementById('pageLoader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('is-done');
        // Trigger hero reveal sequence after loader exits
        setTimeout(triggerHeroReveal, 300);
      }, 1200);
    });
  } else {
    setTimeout(triggerHeroReveal, 100);
  }

  /* ── 2. HERO REVEAL SEQUENCE ─────────────────────────────────── */
  function triggerHeroReveal() {
    const items = document.querySelectorAll('.hero .reveal-item');
    items.forEach((el, i) => {
      const delay = parseInt(el.dataset.delay || i) * 130;
      setTimeout(() => {
        el.classList.add('is-revealed');
      }, delay);
    });

    // Start stat counters after hero reveals
    setTimeout(startCounters, 600);
  }

  /* ── 3. STAT COUNTERS ────────────────────────────────────────── */
  function startCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const start = performance.now();
      const easeOut = t => 1 - Math.pow(1 - t, 3);

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        el.textContent = Math.round(easeOut(progress) * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ── 4. DUAL-LAYER CUSTOM CURSOR ─────────────────────────────── */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursorDot && cursorRing) {
    let dotX = window.innerWidth / 2, dotY = window.innerHeight / 2;
    let ringX = dotX, ringY = dotY;
    let targetX = dotX, targetY = dotY;
    const dotEase = 0.18;
    const ringEase = 0.09;

    const animateCursor = () => {
      // Dot snaps closer
      dotX += (targetX - dotX) * dotEase;
      dotY += (targetY - dotY) * dotEase;
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;

      // Ring lags more
      ringX += (targetX - ringX) * ringEase;
      ringY += (targetY - ringY) * ringEase;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;

      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    const show = () => {
      cursorDot.classList.add('is-active');
      cursorRing.classList.add('is-active');
    };

    window.addEventListener('mousemove', e => {
      show();
      targetX = e.clientX;
      targetY = e.clientY;

      // Color shift on dark sections
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        const section = el.closest('.about, .services, .contact');
        cursorRing.classList.toggle('dark-section', !!section);
      }
    });

    window.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('is-active');
      cursorRing.classList.remove('is-active');
    });

    // Hover targets → expand dot
    const hoverTargets = document.querySelectorAll('button, .btn, .icon-btn, a, .cursor-target, .mobile-nav-link');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        const isGalleryBtn = el.classList.contains('gallery-button-next') || el.classList.contains('gallery-button-prev');
        if (!cursorDot.classList.contains('card-hover') && !isGalleryBtn) {
          cursorDot.classList.add('expand');
          cursorRing.classList.add('expand');
        }
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('expand');
        cursorRing.classList.remove('expand');
      });
    });

    // Card hover targets → large ghost ring
    const fadeExpandTargets = document.querySelectorAll('.about-card, .service-card, .nav-link, .gallery__item, .gallery-button-next, .gallery-button-prev, .contact-card');
    fadeExpandTargets.forEach(target => {
      target.addEventListener('mouseenter', () => {
        cursorDot.classList.remove('expand');
        cursorRing.classList.remove('expand');
        cursorDot.classList.add('card-hover');
        cursorRing.classList.add('card-hover');
      });
      target.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('card-hover');
        cursorRing.classList.remove('card-hover');
      });
    });
  }

  /* ── 5. SCROLL-AWARE HEADER SHRINK ───────────────────────────── */
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── 6. SCROLL REVEAL (IntersectionObserver) ─────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealObserver.observe(el);
  });

  /* ── 7. HERO PHONE PARALLAX ──────────────────────────────────── */
  const heroRight = document.getElementById('heroRight');
  const heroPhone = document.getElementById('heroPhone');
  if (heroRight && heroPhone) {
    heroRight.addEventListener('mousemove', e => {
      const rect = heroRight.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      heroPhone.style.transform = `rotate(-14deg) rotateY(${dx * 8}deg) rotateX(${-dy * 5}deg) translateZ(10px)`;
    });
    heroRight.addEventListener('mouseleave', () => {
      heroPhone.style.transform = 'rotate(-14deg)';
    });
  }

  /* ── 8. ABOUT CARD MAGNETIC PULL ─────────────────────────────── */
  document.querySelectorAll('.about-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width * 6;
      const dy = (e.clientY - cy) / rect.height * 6;
      card.style.transform = `translateY(-6px) translate(${dx}px, ${dy}px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── 9. CONTACT CARD 3D TILT ─────────────────────────────────── */
  document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width * 10;
      const dy = (e.clientY - cy) / rect.height * 10;
      card.style.transform = `translateY(-12px) rotateY(${dx}deg) rotateX(${-dy}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── 10. SCROLL TO TOP BUTTON ─────────────────────────────────── */
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     ORIGINAL FUNCTIONALITY — preserved exactly
     ═══════════════════════════════════════════════════════════ */

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileSearchInput = document.querySelector('.mobile-search-input');

  const searchBtn = document.querySelector('.icon-btn[aria-label="Search"]');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchBackdrop = document.getElementById('searchBackdrop');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const searchMeta = document.getElementById('searchMeta');
  const searchPrev = document.getElementById('searchPrev');
  const searchNext = document.getElementById('searchNext');

  /* ── Swiper Gallery ─────────────────────────────────────────── */
  const gallerySwiper = new Swiper('.gallery__slider', {
    slidesPerView: 1,
    spaceBetween: 30,
    centeredSlides: false,
    loop: true,
    speed: 800,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: '.gallery-button-next',
      prevEl: '.gallery-button-prev',
    },
    breakpoints: {
      768: { slidesPerView: 2, spaceBetween: 30 },
      1200: { slidesPerView: 3, spaceBetween: 30 }
    }
  });

  /* ── Mobile Menu ─────────────────────────────────────────────── */
  if (hamburger && mobileMenu) {
    const toggleMenu = (forceState) => {
      const isOpen = forceState !== undefined ? forceState : !mobileMenu.classList.contains('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      mobileMenu.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (!isOpen && mobileSearchInput) {
        mobileSearchInput.value = '';
        clearHighlights();
      }
    };

    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      toggleMenu();
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          toggleMenu(false);
          setTimeout(() => scrollToHash(href), 400);
        }
      });
    });

    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu) toggleMenu(false);
    });
  }

  /* ── Nav Indicator ───────────────────────────────────────────── */
  const nav = document.querySelector('.nav-center');
  const navLinks = nav ? nav.querySelectorAll('.nav-link[href^="#"]') : [];
  const indicator = (nav && nav.querySelector('#navIndicator')) || (nav && nav.querySelector('.nav-indicator')) || null;
  const STORAGE_KEY = 'helax_active_section';
  let isScrollingManual = false;
  let scrollTimeout;

  const getHeaderOffset = () => {
    const floatBar = document.querySelector('.nav-float');
    if (!floatBar) return 98;
    return floatBar.getBoundingClientRect().height;
  };

  const getLinkByHash = (hash) => {
    if (!hash) return null;
    return Array.from(navLinks).find(a => a.getAttribute('href') === hash) || null;
  };

  const moveIndicator = (linkEl) => {
    if (!nav || !indicator || !linkEl) return;
    requestAnimationFrame(() => {
      const navRect = nav.getBoundingClientRect();
      const linkRect = linkEl.getBoundingClientRect();
      const x = (linkRect.left - navRect.left) + nav.scrollLeft;
      const w = linkRect.width;
      indicator.style.width = `${w}px`;
      indicator.style.transform = `translateX(${x}px)`;
      indicator.style.opacity = '1';
    });
  };

  const setActiveLink = (linkEl, persist = true) => {
    if (!linkEl || linkEl.classList.contains('is-active')) {
      if (linkEl) moveIndicator(linkEl);
      return;
    }
    navLinks.forEach(a => a.classList.remove('is-active'));
    linkEl.classList.add('is-active');
    moveIndicator(linkEl);
    if (persist) {
      const href = linkEl.getAttribute('href');
      if (href && href.startsWith('#')) localStorage.setItem(STORAGE_KEY, href);
    }
  };

  const scrollToHash = (hash) => {
    const id = (hash || '').replace('#', '');
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    isScrollingManual = true;
    clearTimeout(scrollTimeout);
    const headerHeight = getHeaderOffset();
    const y = target.offsetTop - headerHeight;
    window.scrollTo({ top: y, behavior: 'smooth' });
    scrollTimeout = setTimeout(() => { isScrollingManual = false; }, 1000);
  };

  const getCurrentSectionHash = () => {
    const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 60;
    if (isAtBottom && navLinks.length > 0) return navLinks[navLinks.length - 1].getAttribute('href');
    const ids = Array.from(navLinks).map(a => (a.getAttribute('href') || '').replace('#', '')).filter(Boolean);
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return '#home';
    const probe = window.scrollY + getHeaderOffset() + 120;
    let current = sections[0];
    for (const sec of sections) {
      if (sec.offsetTop <= probe) current = sec;
    }
    return `#${current.id}`;
  };

  if (nav && navLinks.length) {
    navLinks.forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();
        setActiveLink(a, true);
        scrollToHash(href);
        if (history.pushState) history.pushState(null, '', href);
        if (searchOverlay?.classList.contains('is-open')) closeSearch();
      });
    });

    const applyFromScroll = () => {
      if (isScrollingManual) return;
      const hash = getCurrentSectionHash();
      const link = getLinkByHash(hash);
      if (link) setActiveLink(link, true);
    };

    window.addEventListener('scroll', applyFromScroll, { passive: true });

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const active = nav.querySelector('.nav-link.is-active') || navLinks[0];
        moveIndicator(active);
      }, 100);
    });

    window.addEventListener('popstate', () => {
      const hashLink = getLinkByHash(window.location.hash);
      if (hashLink) {
        setActiveLink(hashLink, true);
        scrollToHash(window.location.hash);
      } else {
        applyFromScroll();
      }
    });

    window.addEventListener('load', () => {
      const hashLink = getLinkByHash(window.location.hash);
      const savedHash = localStorage.getItem(STORAGE_KEY);
      const savedLink = getLinkByHash(savedHash);
      const byScroll = getLinkByHash(getCurrentSectionHash());
      const homeLink = getLinkByHash('#home') || navLinks[0];
      const pick = hashLink || byScroll || savedLink || homeLink;
      if (pick) setActiveLink(pick, true);
    });
  }

  /* ── Search ──────────────────────────────────────────────────── */
  let hits = [];
  let activeIndex = -1;

  const lockScroll = (locked) => { document.body.style.overflow = locked ? 'hidden' : ''; };

  const openSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.style.visibility = 'visible';
    searchOverlay.style.pointerEvents = 'auto';
    requestAnimationFrame(() => {
      searchOverlay.classList.add('is-open');
      searchOverlay.setAttribute('aria-hidden', 'false');
    });
    lockScroll(true);
    setTimeout(() => searchInput && searchInput.focus(), 0);
  };

  const closeSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('is-open');
    searchOverlay.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      searchOverlay.style.visibility = 'hidden';
      searchOverlay.style.pointerEvents = 'none';
      if (!mobileMenu.classList.contains('is-open')) lockScroll(false);
      clearHighlights();
      if (searchInput) searchInput.value = '';
      if (searchMeta) searchMeta.textContent = '';
      hits = [];
      activeIndex = -1;
    }, 380);
  };

  const clearHighlights = () => {
    document.querySelectorAll('mark.search-hit').forEach(m => {
      m.replaceWith(document.createTextNode(m.textContent));
    });
    document.body.normalize();
  };

  const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlightAll = (query) => {
    clearHighlights();
    hits = [];
    activeIndex = -1;
    if (!query) {
      if (searchMeta) searchMeta.textContent = '';
      return;
    }
    const needle = new RegExp(escapeRegExp(query), 'gi');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest('script, style, noscript, #searchOverlay, #mobileMenu, .page-loader, button, a, input, textarea')) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (!needle.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        needle.lastIndex = 0;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      const text = node.nodeValue;
      const frag = document.createDocumentFragment();
      let last = 0;
      text.replace(needle, (match, offset) => {
        if (text.slice(last, offset)) frag.appendChild(document.createTextNode(text.slice(last, offset)));
        const mark = document.createElement('mark');
        mark.className = 'search-hit';
        mark.textContent = match;
        frag.appendChild(mark);
        hits.push(mark);
        last = offset + match.length;
        return match;
      });
      if (text.slice(last)) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
    if (searchMeta) searchMeta.textContent = hits.length ? `${hits.length} result(s)` : 'No results';
    if (hits.length) { activeIndex = 0; setActiveHit(activeIndex, true); }
  };

  const setActiveHit = (idx, scrollIntoView = false) => {
    hits.forEach(h => h.classList.remove('is-active'));
    const el = hits[idx];
    if (!el) return;
    el.classList.add('is-active');
    if (searchMeta) searchMeta.textContent = `${idx + 1} / ${hits.length} result(s)`;
    if (scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const nextHit = () => {
    if (!hits.length) return;
    activeIndex = (activeIndex + 1) % hits.length;
    setActiveHit(activeIndex, true);
  };

  const prevHit = () => {
    if (!hits.length) return;
    activeIndex = (activeIndex - 1 + hits.length) % hits.length;
    setActiveHit(activeIndex, true);
  };

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);

  if (searchInput) {
    searchInput.addEventListener('input', e => highlightAll(e.target.value.trim()));
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSearch();
      if (e.key === 'Enter') nextHit();
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('focus', () => {
      openSearch();
      if (mobileSearchInput.value) {
        searchInput.value = mobileSearchInput.value;
        highlightAll(searchInput.value);
      }
    });
  }

  if (searchNext) searchNext.addEventListener('click', nextHit);
  if (searchPrev) searchPrev.addEventListener('click', prevHit);

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && searchOverlay?.classList.contains('is-open')) closeSearch();
  });
})();