document.addEventListener('DOMContentLoaded', () => {
  // === Language selector ===
  const languageSelect = document.getElementById('language');
  const translations = window.translations || {};
  const languageKey = 'siteLanguage';
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');

  function readSavedLanguage() {
    try {
      return localStorage.getItem(languageKey);
    } catch (error) {
      if (error.name !== 'SecurityError') throw error;
      return null;
    }
  }

  function saveLanguage(language) {
    try {
      localStorage.setItem(languageKey, language);
    } catch (error) {
      if (error.name !== 'SecurityError') throw error;
    }
  }

  const savedLanguage = readSavedLanguage();
  const initialLanguage = translations[requestedLanguage]
    ? requestedLanguage
    : translations[savedLanguage] ? savedLanguage : 'en';

  function withLanguage(urlValue, language) {
    const url = new URL(urlValue, window.location.href);
    const isLocalPage = url.protocol === 'file:' || url.origin === window.location.origin;
    if (isLocalPage && url.pathname.endsWith('.html')) {
      url.searchParams.set('lang', language);
    }
    return url.href;
  }

  function updateLanguageLinks(language) {
    document.querySelectorAll('a[href]').forEach((link) => {
      if (!link.hasAttribute('data-language-href')) {
        link.dataset.languageHref = link.href;
      }
      link.href = withLanguage(link.dataset.languageHref, language);
    });
  }

  function applyTranslation(language) {
    const dictionary = translations[language];
    if (!dictionary) return;

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      if (element.dataset.defaultText === undefined) {
        element.dataset.defaultText = element.innerHTML;
      }
      const key = element.getAttribute('data-i18n');
      element.innerHTML = dictionary[key] ?? element.dataset.defaultText;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      if (element.dataset.defaultPlaceholder === undefined) {
        element.dataset.defaultPlaceholder = element.getAttribute('placeholder') || '';
      }
      const key = element.getAttribute('data-i18n-placeholder');
      element.setAttribute('placeholder', dictionary[key] ?? element.dataset.defaultPlaceholder);
    });

    document.documentElement.lang = language;
    updateLanguageLinks(language);
  }

  if (languageSelect) {
    languageSelect.value = initialLanguage;
    languageSelect.addEventListener('change', () => {
      const language = languageSelect.value;
      if (!translations[language]) return;
      saveLanguage(language);
      applyTranslation(language);
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('lang', language);
      window.history.replaceState(null, '', currentUrl);
    });
  }
  if (!new URLSearchParams(window.location.search).has('lang')) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', initialLanguage);
    window.history.replaceState(null, '', currentUrl);
  }
  saveLanguage(initialLanguage);
  applyTranslation(initialLanguage);

  // === Mobile Nav Toggle ===
  const hamburger = document.querySelector('.hamburger');
  const closeMenu = document.querySelector('.close-menu');
  const navLinks = document.getElementById('navLinks');

  function setMobileNavOpen(isOpen) {
    navLinks?.classList.toggle('active', isOpen);
    hamburger?.setAttribute('aria-expanded', String(isOpen));
    hamburger?.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  }

  function toggleMobileNav() {
    setMobileNavOpen(!navLinks?.classList.contains('active'));
  }

  window.toggleMobileNav = toggleMobileNav;

  hamburger?.addEventListener('click', () => {
    toggleMobileNav();
  });
  closeMenu?.addEventListener('click', () => setMobileNavOpen(false));
  navLinks?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMobileNavOpen(false));
  });

  document.addEventListener('click', (event) => {
    const isClickInsideNav = navLinks?.contains(event.target);
    const isClickOnHamburger = hamburger?.contains(event.target);
    if (!isClickInsideNav && !isClickOnHamburger) {
      setMobileNavOpen(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMobileNavOpen(false);
  });

  // === Site Search ===
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    const siteRoot = new URL(document.body.classList.contains('home-page') ? './' : '../', document.baseURI);
    const searchResults = document.createElement('ul');
    searchResults.className = 'search-results';
    searchResults.setAttribute('role', 'listbox');
    searchResults.hidden = true;
    searchInput.insertAdjacentElement('afterend', searchResults);
    searchInput.type = 'search';
    searchInput.setAttribute('aria-autocomplete', 'list');
    searchInput.setAttribute('aria-controls', 'siteSearchResults');
    searchInput.setAttribute('aria-label', 'Search this website');
    searchResults.id = 'siteSearchResults';
    if (!searchInput.hasAttribute('data-i18n-placeholder')) {
      searchInput.dataset.i18nPlaceholder = 'search_placeholder';
    }
    searchInput.placeholder = translations[initialLanguage]?.search_placeholder || 'Search services and information';

    const pages = [
      { title: 'Home', href: 'index.html', terms: 'dental clinic care treatments smile appointment modern dentistry' },
      { title: 'About Us', href: 'pages/aboutus.html', terms: 'about clinic approach patient care facilities technology' },
      { title: 'Patient Reviews', href: 'pages/testimonials.html', terms: 'reviews testimonials patient experiences' },
      { title: 'Treatments', href: 'pages/treatments.html', terms: 'services treatments dental implants prosthetics cosmetics whitening general dentistry orthodontics oral surgery' },
      { title: 'Pricing', href: 'pages/pricing.html', terms: 'pricing prices costs fees estimates' },
      { title: 'Our Team', href: 'pages/team.html', terms: 'team dentist dental hygienist specialists staff' },
      { title: 'Contact', href: 'pages/contacts.html', terms: 'contact location address phone email appointment message form' },
      { title: 'Patient Information', href: 'pages/patients.html', terms: 'patients first visit preparation faq questions information' },
      { title: 'Dental Implants', href: 'services/implants.html', terms: 'implants missing teeth replacement implant' },
      { title: 'Dental Prosthetics', href: 'services/prosthetics.html', terms: 'prosthetics crowns bridges dentures restoration' },
      { title: 'Cosmetic Dentistry', href: 'services/cosmetics.html', terms: 'cosmetic whitening veneers smile aesthetics' },
      { title: 'General Dentistry', href: 'services/general.html', terms: 'general dentistry cleanings fillings cavities root canal preventive' },
      { title: 'Orthodontics', href: 'services/orthodontics.html', terms: 'orthodontics braces alignment teeth' },
      { title: 'Oral Surgery', href: 'services/oral-surgeries.html', terms: 'oral surgery extraction wisdom teeth surgical' }
    ];

    function removeHighlights() {
      document.querySelectorAll('mark.search-highlight').forEach((mark) => {
        const parent = mark.parentNode;
        mark.replaceWith(document.createTextNode(mark.textContent));
        parent?.normalize();
      });
    }

    function highlightSearchTerm(term) {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const expression = new RegExp(escapedTerm, 'gi');
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const parent = node.parentElement;
          return node.nodeValue.trim() && parent && !parent.closest('script, style, mark, input, textarea, select, button')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      });
      const textNodes = [];
      while (walker.nextNode()) {
        if (expression.test(walker.currentNode.nodeValue)) {
          textNodes.push(walker.currentNode);
          expression.lastIndex = 0;
        }
      }
      textNodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        node.nodeValue.replace(expression, (match, offset) => {
          fragment.append(document.createTextNode(node.nodeValue.slice(lastIndex, offset)));
          const mark = document.createElement('mark');
          mark.className = 'search-highlight';
          mark.textContent = match;
          fragment.append(mark);
          lastIndex = offset + match.length;
          return match;
        });
        fragment.append(document.createTextNode(node.nodeValue.slice(lastIndex)));
        node.replaceWith(fragment);
      });
      document.querySelector('mark.search-highlight')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function updateSearchResults() {
      const term = searchInput.value.trim().toLocaleLowerCase();
      searchResults.replaceChildren();
      if (!term) {
        searchResults.hidden = true;
        return;
      }

      const currentPageText = document.body.innerText.toLocaleLowerCase();
      const results = pages.filter((page) =>
        `${page.title} ${page.terms}`.toLocaleLowerCase().includes(term)
        || (new URL(page.href, siteRoot).pathname === window.location.pathname && currentPageText.includes(term))
      ).slice(0, 6);

      if (!results.length) {
        const noResults = document.createElement('li');
        noResults.className = 'search-no-results';
        noResults.textContent = translations[document.documentElement.lang]?.search_no_results || 'No matching pages found.';
        searchResults.append(noResults);
      } else {
        results.forEach((result) => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = withLanguage(new URL(result.href, siteRoot), document.documentElement.lang || initialLanguage);
          link.textContent = result.title;
          link.setAttribute('role', 'option');
          link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = new URL(link.href);
            target.searchParams.set('q', searchInput.value.trim());
            window.location.href = target.href;
          });
          item.append(link);
          searchResults.append(item);
        });
      }
      searchResults.hidden = false;
    }

    searchInput.addEventListener('input', () => {
      removeHighlights();
      updateSearchResults();
    });
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchInput.value = '';
        searchResults.hidden = true;
      }
      if (event.key === 'Enter' && !searchResults.hidden) {
        event.preventDefault();
        searchResults.querySelector('a')?.click();
      }
    });
    document.addEventListener('click', (event) => {
      if (!searchInput.parentElement.contains(event.target) && !searchResults.contains(event.target)) {
        searchResults.hidden = true;
      }
    });

    const query = new URLSearchParams(window.location.search).get('q');
    if (query) {
      searchInput.value = query;
      highlightSearchTerm(query);
      updateSearchResults();
    }
  }

  const demoForm = document.querySelector('[data-demo-form]');
  demoForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const notice = demoForm.querySelector('[role="status"]');
    if (!notice) return;
    notice.textContent = translations[document.documentElement.lang]?.demo_form_notice
      || 'This is a demo form. Connect your own form service before collecting messages.';
    notice.hidden = false;
  });

  // === Scroll to Top Button ===
  const scrollBtn = document.getElementById('scrollToTopBtn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) scrollBtn?.classList.add('show');
    else scrollBtn?.classList.remove('show');
  });
  scrollBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // === Reviews Carousel ===
  const reviewTrack = document.querySelector('.reviews-track');
  const reviewCards = document.querySelectorAll('.review-card');
  const reviewPrev = document.querySelector('.reviews-arrow.left');
  const reviewNext = document.querySelector('.reviews-arrow.right');

  let reviewIndex = 0;
  const reviewGap = 20;

  function getVisibleReviewCards() {
    const width = window.innerWidth;
    const visible = width > 900 ? 3 : width > 640 ? 2 : 1;
    return Math.min(visible, reviewCards.length);
  }

  function getReviewCardWidth() {
    return reviewCards[0].getBoundingClientRect().width + reviewGap;
  }

  function updateReviewCarousel() {
    if (!reviewTrack || reviewCards.length === 0) return;
    const maxIndex = Math.max(0, reviewCards.length - getVisibleReviewCards());
    reviewIndex = Math.min(reviewIndex, maxIndex);
    const cardWidth = getReviewCardWidth();
    reviewTrack.style.transform = `translateX(-${reviewIndex * cardWidth}px)`;
  }

  function nextReviewSlide() {
    const maxIndex = Math.max(0, reviewCards.length - getVisibleReviewCards());
    if (!maxIndex) return;
    reviewIndex++;
    if (reviewIndex > maxIndex) reviewIndex = 0;
    updateReviewCarousel();
  }

  function prevReviewSlide() {
    const maxIndex = Math.max(0, reviewCards.length - getVisibleReviewCards());
    if (!maxIndex) return;
    reviewIndex--;
    if (reviewIndex < 0) reviewIndex = maxIndex;
    updateReviewCarousel();
  }

  reviewNext?.addEventListener('click', nextReviewSlide);
  reviewPrev?.addEventListener('click', prevReviewSlide);

  if (reviewCards.length > 0) {
    updateReviewCarousel();

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let reviewTimer = window.setInterval(nextReviewSlide, 5000);
      const pauseReviews = () => window.clearInterval(reviewTimer);
      const resumeReviews = () => {
        window.clearInterval(reviewTimer);
        reviewTimer = window.setInterval(nextReviewSlide, 5000);
      };
      reviewTrack?.parentElement?.addEventListener('mouseenter', pauseReviews);
      reviewTrack?.parentElement?.addEventListener('mouseleave', resumeReviews);
      reviewTrack?.parentElement?.addEventListener('focusin', pauseReviews);
      reviewTrack?.parentElement?.addEventListener('focusout', resumeReviews);
    }
  }

  window.addEventListener('resize', () => {
    reviewIndex = 0;
    updateReviewCarousel();
  });

  // === Team Carousel ===
  const teamTrack = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const teamMembers = document.querySelectorAll('.team-member');

  if (teamTrack && prevBtn && nextBtn && teamMembers.length > 0) {
    let position = 0;

    function getTeamCardWidth() {
      return teamMembers[0].offsetWidth + 20;
    }

    function getVisibleTeamCards() {
      const wrapperWidth = document.querySelector('.carousel-track-wrapper').offsetWidth;
      return Math.floor(wrapperWidth / getTeamCardWidth());
    }

    function getMaxTeamPosition() {
      const totalCards = teamMembers.length;
      const visible = getVisibleTeamCards();
      const hiddenCards = totalCards - visible;
      return hiddenCards > 0 ? hiddenCards * getTeamCardWidth() : 0;
    }

    function updateTeamCarousel() {
      teamTrack.style.transform = `translateX(-${position}px)`;
    }

    nextBtn.addEventListener('click', () => {
      const maxPosition = getMaxTeamPosition();
      const cardWidth = getTeamCardWidth();
      position = (position + cardWidth > maxPosition) ? 0 : position + cardWidth;
      updateTeamCarousel();
    });

    prevBtn.addEventListener('click', () => {
      const maxPosition = getMaxTeamPosition();
      const cardWidth = getTeamCardWidth();
      position = (position - cardWidth < 0) ? maxPosition : position - cardWidth;
      updateTeamCarousel();
    });

    window.addEventListener('resize', () => {
      position = 0;
      updateTeamCarousel();
    });
  }
});

// === WhatsApp Floating Button ===
(function () {
  const btn = document.getElementById("whatsapp-button");
  if (!btn) return;

  const phone = btn.dataset.phone;
  const message = encodeURIComponent(btn.dataset.message);

  function buildUrl() {
    return `https://wa.me/${phone}?text=${message}`;
  }

  btn.href = buildUrl();

  btn.addEventListener("click", function () {
    btn.href = buildUrl();
  });
})();
