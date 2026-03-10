// Dark mode initialization - keeps this outside as it needs to run immediately
const savedDarkMode = localStorage.getItem('darkMode');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedDarkMode === 'true' || (savedDarkMode === null && prefersDarkMode)) {
    document.documentElement.classList.add('dark');
}

// Utility functions
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Feature modules
const darkMode = {
    init(darkModeToggle) {
        if (!darkModeToggle) return;
        
        darkModeToggle.checked = document.documentElement.classList.contains('dark');
        darkModeToggle.addEventListener('change', () => {
            const isDarkMode = darkModeToggle.checked;
            document.documentElement.classList.toggle('dark', isDarkMode);
            localStorage.setItem('darkMode', isDarkMode.toString());
        });
    }
};

const fontSwitcher = {
    storageKey: 'devFontFamilyV2',

    fonts: {
        'rubik': {
            cssFamily: "'Rubik', sans-serif",
            query: 'family=Rubik:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700'
        },
        'public-sans': {
            cssFamily: "'Public Sans', sans-serif",
            query: 'family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700'
        },
        'manrope': {
            cssFamily: "'Manrope', sans-serif",
            query: 'family=Manrope:wght@400;500;600;700'
        },
        'dm-sans': {
            cssFamily: "'DM Sans', sans-serif",
            query: 'family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700'
        },
        'ibm-plex-sans': {
            cssFamily: "'IBM Plex Sans', sans-serif",
            query: 'family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700'
        },
        'plus-jakarta-sans': {
            cssFamily: "'Plus Jakarta Sans', sans-serif",
            query: 'family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700'
        },
        'atkinson-hyperlegible': {
            cssFamily: "'Atkinson Hyperlegible', sans-serif",
            query: 'family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700'
        },
        'noto-sans': {
            cssFamily: "'Noto Sans', sans-serif",
            query: 'family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700'
        },
        'lato': {
            cssFamily: "'Lato', sans-serif",
            query: 'family=Lato:ital,wght@0,400;0,700;1,400;1,700'
        }
    },

    init() {
        this.select = document.getElementById('font-switcher');
        if (!this.select) return;

        const savedFont = localStorage.getItem(this.storageKey);
        const defaultFont = this.select.value || 'atkinson-hyperlegible';
        const initialFont = savedFont && this.fonts[savedFont] ? savedFont : defaultFont;

        this.select.value = initialFont;
        this.applyFont(initialFont, false);

        this.select.addEventListener('change', () => {
            this.applyFont(this.select.value, true);
        });
    },

    applyFont(fontKey, persist = true) {
        const font = this.fonts[fontKey] || this.fonts['atkinson-hyperlegible'];
        if (!font) return;

        this.loadFont(fontKey, font.query);
        document.documentElement.style.setProperty('--font-family-base', font.cssFamily);

        if (persist) {
            localStorage.setItem(this.storageKey, fontKey);
        }
    },

    loadFont(fontKey, query) {
        const linkId = `dev-font-${fontKey}`;
        if (document.getElementById(linkId)) return;

        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
        document.head.appendChild(link);
    }
};

const fullscreenImage = {
  focusableSelector: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',

  init() {
    this.activeTrigger = null;
    this.previousBodyOverflow = '';
    this.createModal();
    this.setupImageListeners();
    this.setupModalListeners();
  },

  isOpen() {
    return this.modal.classList.contains('is-open');
  },

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'image-viewer-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'fullscreen-modal-title');
    modal.id = 'fullscreen-modal';
    modal.tabIndex = -1;

    const modalContent = document.createElement('div');
    modalContent.className = 'image-viewer-content';

    const modalTitle = document.createElement('h2');
    modalTitle.id = 'fullscreen-modal-title';
    modalTitle.className = 'image-viewer-visually-hidden';
    modalTitle.textContent = 'Expanded image';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'image-viewer-close';
    closeButton.setAttribute('aria-label', 'Close image viewer');
    closeButton.innerHTML = '<span aria-hidden="true" class="image-viewer-close-icon">&times;</span>';
    closeButton.style.top = 'calc(env(safe-area-inset-top, 0px) + 0.75rem)';
    closeButton.style.right = 'calc(env(safe-area-inset-right, 0px) + 0.75rem)';

    const fullscreenImage = document.createElement('img');
    fullscreenImage.id = 'fullscreen-image';
    fullscreenImage.className = 'image-viewer-image';
    fullscreenImage.setAttribute('width', '800');
    fullscreenImage.setAttribute('height', '450');

    modalContent.appendChild(modalTitle);
    modalContent.appendChild(closeButton);
    modalContent.appendChild(fullscreenImage);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    this.modal = modal;
    this.closeButton = closeButton;
    this.fullscreenImage = fullscreenImage;
  },

  openModal(image, trigger) {
    if (!image) return;

    this.fullscreenImage.src = image.currentSrc || image.src;
    this.fullscreenImage.alt = image.alt;
    this.activeTrigger = trigger || null;

    if (this.activeTrigger) {
      this.activeTrigger.setAttribute('aria-expanded', 'true');
    }

    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    this.closeButton.focus();
  },

  closeModal() {
    if (!this.isOpen()) return;

    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    this.fullscreenImage.removeAttribute('src');
    this.fullscreenImage.alt = '';
    document.body.style.overflow = this.previousBodyOverflow || '';

    if (this.activeTrigger) {
      this.activeTrigger.setAttribute('aria-expanded', 'false');
      this.activeTrigger.focus();
      this.activeTrigger = null;
    }
  },

  trapFocus(event) {
    if (event.key !== 'Tab' || !this.isOpen()) return;

    const focusableElements = Array.from(
      this.modal.querySelectorAll(this.focusableSelector)
    ).filter((element) => !element.hasAttribute('disabled'));

    if (focusableElements.length === 0) {
      event.preventDefault();
      this.closeButton.focus();
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    const isShiftTab = event.shiftKey;
    const isOnFirst = document.activeElement === firstFocusable;
    const isOnLast = document.activeElement === lastFocusable;

    if (isShiftTab && isOnFirst) {
      event.preventDefault();
      lastFocusable.focus();
    }

    if (!isShiftTab && isOnLast) {
      event.preventDefault();
      firstFocusable.focus();
    }
  },

  setupImageListeners() {
    const enlargeableImages = document.querySelectorAll('[data-enlargeable="true"]');

    enlargeableImages.forEach((container) => {
      const fallbackLink = container.querySelector('a.no-js-fallback');
      const image = container.querySelector('img');

      if (fallbackLink && fallbackLink.firstElementChild) {
        fallbackLink.replaceWith(fallbackLink.firstElementChild);
      }

      if (!image) return;

      const imageDescription = image.alt ? `: ${image.alt}` : '';
      container.setAttribute('role', 'button');
      container.setAttribute('aria-haspopup', 'dialog');
      container.setAttribute('aria-controls', 'fullscreen-modal');
      container.setAttribute('aria-expanded', 'false');
      container.setAttribute('aria-label', `Enlarge image${imageDescription}`);
      container.setAttribute('tabindex', '0');
      container.classList.add('image-viewer-trigger');

      const showModal = () => this.openModal(image, container);

      container.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        showModal();
      });

      container.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showModal();
        }
      });
    });
  },

  setupModalListeners() {
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.closeModal();
      }
    });

    this.closeButton.addEventListener('click', () => this.closeModal());

    document.addEventListener('keydown', (event) => {
      if (!this.isOpen()) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeModal();
      }

      this.trapFocus(event);
    });
  }
};

const mobileMenu = {
    init(button, closeButton, menu) {
        if (!button || !menu || !closeButton) return;

        this.button = button;
        this.menu = menu;
        this.closeButton = closeButton;
        this.mobileMediaQuery = window.matchMedia('(max-width: 767px)');
        this.setupListeners();
        this.syncForViewport();
    },

    isMobileViewport() {
        return this.mobileMediaQuery.matches;
    },

    openMenu() {
        if (!this.isMobileViewport()) return;
        this.menu.classList.remove('translate-x-full');
        this.menu.removeAttribute('inert');
        this.button.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        this.closeButton.focus();
    },

    closeMenu(restoreFocus = false) {
        if (!this.isMobileViewport()) return;
        this.menu.classList.add('translate-x-full');
        this.menu.setAttribute('inert', '');
        this.button.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (restoreFocus) {
            this.button.focus();
        }
    },

    syncForViewport() {
        if (this.isMobileViewport()) {
            this.closeMenu();
            return;
        }

        this.menu.classList.remove('translate-x-full');
        this.menu.removeAttribute('inert');
        this.button.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    },

    setupListeners() {
        this.button.addEventListener('click', () => this.openMenu());
        this.closeButton.addEventListener('click', () => this.closeMenu(true));

        this.menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => this.closeMenu());
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileViewport() && !this.menu.hasAttribute('inert')) {
                this.closeMenu(true);
            }
        });

        const onViewportChange = () => this.syncForViewport();
        if (typeof this.mobileMediaQuery.addEventListener === 'function') {
            this.mobileMediaQuery.addEventListener('change', onViewportChange);
        } else if (typeof this.mobileMediaQuery.addListener === 'function') {
            this.mobileMediaQuery.addListener(onViewportChange);
        }
    }
};

const scrollToSection = {
    init() {
        // Handle CTA button
        const ctaButton = document.querySelector('a[href="#services"]');
        if (ctaButton) {
            this.addScrollListener(ctaButton, 'services');
        }

        // Handle back to top button
        const backToTopButton = document.getElementById('back-to-top');
        if (backToTopButton) {
            this.setupBackToTop(backToTopButton);
        }
    },

    addScrollListener(element, targetId) {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    },

    setupBackToTop(button) {
        // Handle visibility
        const toggleVisibility = () => {
            const isVisible = window.scrollY > 300;
            button.classList.toggle('opacity-0', !isVisible);
            button.classList.toggle('translate-y-10', !isVisible);
            button.classList.toggle('opacity-100', isVisible);
            button.classList.toggle('translate-y-0', isVisible);
            button.setAttribute('data-visible', isVisible.toString());
            button.tabIndex = isVisible ? 0 : -1;
            button.style.pointerEvents = isVisible ? 'auto' : 'none';
        };

        // Add scroll listener with throttle
        window.addEventListener('scroll', throttle(() => toggleVisibility(), 100));
        
        // Add click listener
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Set initial state
        toggleVisibility();
    }
};

const projectCards = {
    init() {
        this.track = document.getElementById('things-done-cards');
        this.viewport = document.getElementById('things-done-viewport');
        this.progress = document.getElementById('things-done-progress');
        this.status = document.getElementById('things-done-status');
        this.controls = document.getElementById('things-done-controls');
        this.prevButton = document.getElementById('things-done-prev');
        this.nextButton = document.getElementById('things-done-next');

        if (!this.track || !this.viewport || !this.controls || !this.prevButton || !this.nextButton) return;

        this.cards = Array.from(this.track.querySelectorAll('.things-done-card'));
        if (this.cards.length === 0) return;

        this.loopClone = null;
        this.currentIndex = 0;
        this.visibleCards = 1;
        this.maxIndex = 0;

        this.prevButton.addEventListener('click', () => this.moveBy(-1));
        this.nextButton.addEventListener('click', () => this.moveBy(1));

        this.track.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                this.moveBy(1);
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                this.moveBy(-1);
            }
        });

        window.addEventListener('resize', throttle(() => this.refreshLayout(), 100));

        this.refreshLayout();
    },

    getVisibleCards() {
        return window.matchMedia('(min-width: 1024px)').matches ? 2 : 1;
    },

    getStepWidth() {
        const firstCard = this.cards[0];
        if (firstCard) {
            const trackStyles = window.getComputedStyle(this.track);
            const parsedGap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0');
            const gap = Number.isFinite(parsedGap) ? parsedGap : 0;
            return Math.round(firstCard.getBoundingClientRect().width + gap);
        }

        return 0;
    },

    applyPosition() {
        const offset = this.getStepWidth() * this.currentIndex;
        this.track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    },

    syncLoopClone() {
        if (this.loopClone) {
            this.loopClone.remove();
            this.loopClone = null;
        }

        if (this.visibleCards < 2 || this.cards.length < 2) return;

        const firstCard = this.cards[0];
        this.loopClone = firstCard.cloneNode(true);
        this.loopClone.classList.add('things-done-card--clone');
        this.loopClone.removeAttribute('aria-labelledby');

        const clonedHeading = this.loopClone.querySelector('h3[id]');
        if (clonedHeading) {
            const clonedHeadingText = clonedHeading.textContent ? clonedHeading.textContent.trim() : '';
            this.loopClone.setAttribute('aria-label', clonedHeadingText || 'Project example');
            clonedHeading.removeAttribute('id');
        }

        this.loopClone.setAttribute('aria-hidden', 'true');
        this.loopClone.setAttribute('inert', '');

        this.loopClone.querySelectorAll('a').forEach((link) => {
            link.dataset.originalTabindex = link.getAttribute('tabindex') || '';
            link.setAttribute('tabindex', '-1');
        });

        this.track.appendChild(this.loopClone);
    },

    setCardVisibility(card, isVisible, isSecondaryVisible) {
        card.setAttribute('aria-hidden', (!isVisible).toString());
        card.classList.toggle('is-secondary-visible', isSecondaryVisible);

        if (isVisible) {
            card.removeAttribute('inert');
        } else {
            card.setAttribute('inert', '');
        }

        card.querySelectorAll('a').forEach((link) => {
            if (isVisible) {
                if (link.dataset.originalTabindex !== undefined) {
                    if (link.dataset.originalTabindex === '') {
                        link.removeAttribute('tabindex');
                    } else {
                        link.setAttribute('tabindex', link.dataset.originalTabindex);
                    }
                    delete link.dataset.originalTabindex;
                } else {
                    link.removeAttribute('tabindex');
                }
            } else {
                if (link.dataset.originalTabindex === undefined) {
                    link.dataset.originalTabindex = link.getAttribute('tabindex') || '';
                }
                link.setAttribute('tabindex', '-1');
            }
        });
    },

    moveBy(delta) {
        if (this.maxIndex <= 0) return;

        let nextIndex = this.currentIndex + delta;
        if (nextIndex > this.maxIndex) nextIndex = 0;
        if (nextIndex < 0) nextIndex = this.maxIndex;
        if (nextIndex === this.currentIndex) return;

        this.currentIndex = nextIndex;
        this.applyPosition();
        this.updateProgress();
        this.updateVisibleCards();
        this.updateStatus();
    },

    renderProgress() {
        if (!this.progress) return;

        this.progress.innerHTML = '';
        const totalIndicators = this.cards.length;
        this.progress.hidden = totalIndicators <= 1;

        for (let index = 0; index < totalIndicators; index += 1) {
            const pill = document.createElement('li');
            pill.className = 'things-done-progress-pill';
            this.progress.appendChild(pill);
        }
    },

    updateProgress() {
        if (!this.progress) return;

        const pills = this.progress.querySelectorAll('.things-done-progress-pill');
        const totalPills = pills.length;
        if (totalPills === 0) return;

        const primaryIndex = this.currentIndex % totalPills;
        const secondaryIndex = (this.currentIndex + 1) % totalPills;

        pills.forEach((pill, index) => {
            pill.classList.remove('is-active-primary', 'is-active-secondary');
            pill.style.opacity = '';

            if (index === primaryIndex) {
                pill.classList.add('is-active-primary');
                pill.setAttribute('aria-current', 'true');
            } else {
                pill.removeAttribute('aria-current');
            }
        });

        if (this.visibleCards >= 2 && totalPills > 1) {
            pills[secondaryIndex].classList.add('is-active-secondary');
        }
    },

    updateVisibleCards() {
        const totalCards = this.cards.length;
        if (totalCards === 0) return;

        const showsCloneAsSecondary = this.visibleCards >= 2
            && Boolean(this.loopClone)
            && this.currentIndex === this.maxIndex;

        const visibleIndices = new Set([this.currentIndex]);
        if (this.visibleCards >= 2 && !showsCloneAsSecondary) {
            visibleIndices.add((this.currentIndex + 1) % totalCards);
        }

        const secondaryVisibleIndex = this.visibleCards >= 2 && !showsCloneAsSecondary
            ? (this.currentIndex + 1) % totalCards
            : -1;

        this.cards.forEach((card, index) => {
            const isVisible = visibleIndices.has(index);
            const isSecondaryVisible = index === secondaryVisibleIndex;
            this.setCardVisibility(card, isVisible, isSecondaryVisible);
        });

        if (this.loopClone) {
            this.setCardVisibility(this.loopClone, showsCloneAsSecondary, showsCloneAsSecondary);
        }
    },

    updateStatus() {
        if (!this.status) return;

        const totalCards = this.cards.length;
        if (totalCards === 0) return;

        const firstVisible = this.currentIndex + 1;
        const secondVisible = ((this.currentIndex + 1) % totalCards) + 1;

        if (this.visibleCards >= 2 && totalCards > 1) {
            this.status.textContent = `Showing projects ${firstVisible} and ${secondVisible} of ${totalCards}.`;
            return;
        }

        this.status.textContent = `Showing project ${firstVisible} of ${totalCards}.`;
    },

    refreshLayout() {
        this.visibleCards = this.getVisibleCards();
        this.maxIndex = Math.max(this.cards.length - 1, 0);
        this.currentIndex = Math.min(this.currentIndex, this.maxIndex);

        this.syncLoopClone();
        this.renderProgress();
        this.applyPosition();
        this.updateControls();
        this.updateProgress();
        this.updateVisibleCards();
        this.updateStatus();
    },

    updateControls() {
        const hasMultipleSteps = this.cards.length > 1;

        if (!hasMultipleSteps) {
            this.controls.classList.add('hidden');
            this.controls.classList.remove('flex');
            return;
        }

        this.controls.classList.remove('hidden');
        this.controls.classList.add('flex');
    }
};

const lucideIcons = {
    init() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }
};

const copyEmail = () => {
    navigator.clipboard.writeText('dan@sensecall.co.uk').then(() => {
        const btn = document.getElementById('copyEmailBtn');
        const btnText = document.getElementById('copyBtnText');
        btnText.textContent = 'Copied!';
        btn.setAttribute('aria-label', 'Email address copied to clipboard');
        setTimeout(() => {
            btnText.textContent = 'Copy';
            btn.setAttribute('aria-label', 'Copy email address to clipboard');
        }, 1000);
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
};

// Only initialize copyEmail button if it exists
const initCopyEmail = () => {
    const copyBtn = document.getElementById('copyEmailBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyEmail);
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        lucideIcons.init();
        fontSwitcher.init();
        darkMode.init(document.getElementById('dark-mode-toggle'));
        fullscreenImage.init();
        mobileMenu.init(
            document.getElementById('mobile-menu-button'),
            document.getElementById('mobile-menu-close'),
            document.getElementById('mobile-menu')
        );
        scrollToSection.init();
        projectCards.init();
        initCopyEmail();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});
