(() => {
  const cursor = document.querySelector(".cursor-dot");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");
  const mobileSearchInput = document.querySelector(".mobile-search-input");

  const searchBtn = document.querySelector('.icon-btn[aria-label="Search"]');
  const searchOverlay = document.getElementById("searchOverlay");
  const searchBackdrop = document.getElementById("searchBackdrop");
  const searchClose = document.getElementById("searchClose");
  const searchInput = document.getElementById("searchInput");
  const searchMeta = document.getElementById("searchMeta");
  const searchPrev = document.getElementById("searchPrev");
  const searchNext = document.getElementById("searchNext");

  if (cursor) {
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    const ease = 0.10;

    const animateCursor = () => {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    const showCursor = () => cursor.classList.add("is-active");

    window.addEventListener("mousemove", (e) => {
      showCursor();
      targetX = e.clientX;
      targetY = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-active");
    });

    const hoverTargets = document.querySelectorAll("button, .btn, .icon-btn, a, .cursor-target, .mobile-nav-link");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const isGalleryBtn = el.classList.contains("gallery-button-next") || el.classList.contains("gallery-button-prev");
        if (!cursor.classList.contains("card-hover") && !isGalleryBtn) {
          cursor.classList.add("expand");
        }
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("expand");
      });
    });

    const fadeExpandTargets = document.querySelectorAll(".about-card, .service-card, .nav-link, .gallery__item, .gallery-button-next, .gallery-button-prev, .contact-card");
    fadeExpandTargets.forEach((target) => {
      target.addEventListener("mouseenter", () => {
        cursor.classList.remove("expand");
        cursor.classList.add("card-hover");
      });
      target.addEventListener("mouseleave", () => {
        cursor.classList.remove("card-hover");
      });
    });
  }

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

  if (hamburger && mobileMenu) {
    const toggleMenu = (forceState) => {
      const isOpen = forceState !== undefined ? forceState : !mobileMenu.classList.contains("is-open");
      
      hamburger.classList.toggle("is-open", isOpen);
      mobileMenu.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen);
      
      document.body.style.overflow = isOpen ? "hidden" : "";

      if (!isOpen && mobileSearchInput) {
        mobileSearchInput.value = "";
        clearHighlights();
      }
    };

    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    mobileLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          toggleMenu(false);
          setTimeout(() => {
            scrollToHash(href);
          }, 400); 
        }
      });
    });

    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) toggleMenu(false);
    });
  }

  const nav = document.querySelector(".nav-center");
  const navLinks = nav ? nav.querySelectorAll('.nav-link[href^="#"]') : [];
  const indicator = (nav && nav.querySelector("#navIndicator")) || (nav && nav.querySelector(".nav-indicator")) || null;
  const STORAGE_KEY = "helax_active_section";
  let isScrollingManual = false;
  let scrollTimeout;

  const getHeaderOffset = () => {
    const floatBar = document.querySelector(".nav-float");
    if (!floatBar) return 98;
    const rect = floatBar.getBoundingClientRect();
    return rect.height;
  };

  const getLinkByHash = (hash) => {
    if (!hash) return null;
    return Array.from(navLinks).find((a) => a.getAttribute("href") === hash) || null;
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
      indicator.style.opacity = "1";
    });
  };

  const setActiveLink = (linkEl, persist = true) => {
    if (!linkEl || linkEl.classList.contains("is-active")) {
      if (linkEl) moveIndicator(linkEl);
      return;
    }
    navLinks.forEach((a) => a.classList.remove("is-active"));
    linkEl.classList.add("is-active");
    moveIndicator(linkEl);
    if (persist) {
      const href = linkEl.getAttribute("href");
      if (href && href.startsWith("#")) localStorage.setItem(STORAGE_KEY, href);
    }
  };

  const scrollToHash = (hash) => {
    const id = (hash || "").replace("#", "");
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    isScrollingManual = true;
    clearTimeout(scrollTimeout);

    const headerHeight = getHeaderOffset();
    const y = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: y,
      behavior: "smooth"
    });

    scrollTimeout = setTimeout(() => {
      isScrollingManual = false;
    }, 1000);
  };

  const getCurrentSectionHash = () => {
    const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 60;
    if (isAtBottom && navLinks.length > 0) {
      return navLinks[navLinks.length - 1].getAttribute("href");
    }

    const ids = Array.from(navLinks).map((a) => (a.getAttribute("href") || "").replace("#", "")).filter(Boolean);
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return "#home";

    const probe = window.scrollY + getHeaderOffset() + 120;
    let current = sections[0];
    for (const sec of sections) {
      if (sec.offsetTop <= probe) current = sec;
    }
    return `#${current.id}`;
  };

  if (nav && navLinks.length) {
    navLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        e.preventDefault();
        
        setActiveLink(a, true);
        scrollToHash(href);
        
        if (history.pushState) {
          history.pushState(null, "", href);
        }

        if (searchOverlay?.classList.contains("is-open")) closeSearch();
      });
    });

    const applyFromScroll = () => {
      if (isScrollingManual) return;
      const hash = getCurrentSectionHash();
      const link = getLinkByHash(hash);
      if (link) setActiveLink(link, true);
    };

    window.addEventListener("scroll", applyFromScroll, { passive: true });
    
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const active = nav.querySelector(".nav-link.is-active") || navLinks[0];
        moveIndicator(active);
      }, 100);
    });

    window.addEventListener("popstate", () => {
      const hashLink = getLinkByHash(window.location.hash);
      if (hashLink) {
        setActiveLink(hashLink, true);
        scrollToHash(window.location.hash);
      } else {
        applyFromScroll();
      }
    });

    window.addEventListener("load", () => {
      const hashLink = getLinkByHash(window.location.hash);
      const savedHash = localStorage.getItem(STORAGE_KEY);
      const savedLink = getLinkByHash(savedHash);
      const byScroll = getLinkByHash(getCurrentSectionHash());
      const homeLink = getLinkByHash("#home") || navLinks[0];
      const pick = hashLink || byScroll || savedLink || homeLink;
      if (pick) {
        setActiveLink(pick, true);
      }
    });
  }

  let hits = [];
  let activeIndex = -1;

  const lockScroll = (locked) => {
    document.body.style.overflow = locked ? "hidden" : "";
  };

  const openSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.style.visibility = "visible";
    searchOverlay.style.pointerEvents = "auto";
    requestAnimationFrame(() => {
      searchOverlay.classList.add("is-open");
      searchOverlay.setAttribute("aria-hidden", "false");
    });
    lockScroll(true);
    setTimeout(() => searchInput && searchInput.focus(), 0);
  };

  const closeSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.classList.remove("is-open");
    searchOverlay.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      searchOverlay.style.visibility = "hidden";
      searchOverlay.style.pointerEvents = "none";
      if (!mobileMenu.classList.contains("is-open")) lockScroll(false);
      clearHighlights();
      if (searchInput) searchInput.value = "";
      if (searchMeta) searchMeta.textContent = "";
      hits = [];
      activeIndex = -1;
    }, 380);
  };

  const clearHighlights = () => {
    document.querySelectorAll("mark.search-hit").forEach((m) => {
      const text = document.createTextNode(m.textContent);
      m.replaceWith(text);
    });
    document.body.normalize();
  };

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightAll = (query) => {
    clearHighlights();
    hits = [];
    activeIndex = -1;
    if (!query) {
      if (searchMeta) searchMeta.textContent = "";
      return;
    }
    const needle = new RegExp(escapeRegExp(query), "gi");
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest("script, style, noscript, #searchOverlay, #mobileMenu, button, a, input, textarea")) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (!needle.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        needle.lastIndex = 0;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const text = node.nodeValue;
      const frag = document.createDocumentFragment();
      let last = 0;
      text.replace(needle, (match, offset) => {
        const before = text.slice(last, offset);
        if (before) frag.appendChild(document.createTextNode(before));
        const mark = document.createElement("mark");
        mark.className = "search-hit";
        mark.textContent = match;
        frag.appendChild(mark);
        hits.push(mark);
        last = offset + match.length;
        return match;
      });
      const after = text.slice(last);
      if (after) frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
    });
    
    if (searchMeta) searchMeta.textContent = hits.length ? `${hits.length} result(s)` : "No results";
    if (hits.length) {
      activeIndex = 0;
      setActiveHit(activeIndex, true);
    }
  };

  const setActiveHit = (idx, scrollIntoView = false) => {
    hits.forEach((h) => h.classList.remove("is-active"));
    const el = hits[idx];
    if (!el) return;
    el.classList.add("is-active");
    if (searchMeta) {
      searchMeta.textContent = `${idx + 1} / ${hits.length} result(s)`;
    }
    if (scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
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

  if (searchBtn) searchBtn.addEventListener("click", openSearch);
  if (searchClose) searchClose.addEventListener("click", closeSearch);
  if (searchBackdrop) searchBackdrop.addEventListener("click", closeSearch);
  
  if (searchInput) {
    searchInput.addEventListener("input", (e) => highlightAll(e.target.value.trim()));
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSearch();
      if (e.key === "Enter") nextHit();
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("focus", () => {
      openSearch();
      if (mobileSearchInput.value) {
        searchInput.value = mobileSearchInput.value;
        highlightAll(searchInput.value);
      }
    });
  }

  if (searchNext) searchNext.addEventListener("click", nextHit);
  if (searchPrev) searchPrev.addEventListener("click", prevHit);
  
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchOverlay?.classList.contains("is-open")) closeSearch();
  });
})();