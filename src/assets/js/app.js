// Fallback dark mode initialization (primary early init runs inline in head.njk)
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
// Theme and typeface preferences. Saved choices are applied early by the inline script
// in head.njk; this module keeps "device" mode in sync and drives the /settings/ page.
const sitePreferences = {
    themeKey: 'darkMode',
    fontKey: 'fontFamily',

    init() {
        this.fonts = window.siteFonts || { default: 'atkinson-hyperlegible', options: [] };
        this.darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.darkQuery.addEventListener('change', () => {
            if (this.getTheme() === 'device') this.applyTheme('device');
        });

        this.form = document.getElementById('site-settings');
        if (!this.form) return;

        this.status = document.getElementById('site-settings-status');
        this.form.hidden = false;
        this.setFormValue('theme', this.getTheme());
        this.setFormValue('font', this.getFont());

        this.form.addEventListener('change', (event) => {
            if (event.target.name === 'theme') {
                this.saveTheme(event.target.value);
                this.announce(`Theme set to ${event.target.labels[0].dataset.label}.`);
            }
            if (event.target.name === 'font') {
                this.saveFont(event.target.value);
                this.announce(`Typeface set to ${event.target.labels[0].dataset.label}.`);
            }
        });

        this.form.addEventListener('reset', (event) => {
            event.preventDefault();
            this.saveTheme('device');
            this.saveFont(this.fonts.default);
            this.setFormValue('theme', 'device');
            this.setFormValue('font', this.fonts.default);
            this.announce('Settings reset to the defaults.');
        });
    },

    storage(action, key, value) {
        try {
            if (action === 'get') return localStorage.getItem(key);
            if (action === 'set') localStorage.setItem(key, value);
            if (action === 'remove') localStorage.removeItem(key);
        } catch (error) {
            // Storage can be blocked; preferences then last for this page view only.
        }
        return null;
    },

    getTheme() {
        const saved = this.storage('get', this.themeKey);
        if (saved === 'true') return 'dark';
        if (saved === 'false') return 'light';
        return 'device';
    },

    saveTheme(theme) {
        if (theme === 'device') {
            this.storage('remove', this.themeKey);
        } else {
            this.storage('set', this.themeKey, (theme === 'dark').toString());
        }
        this.applyTheme(theme);
    },

    applyTheme(theme) {
        const isDark = theme === 'dark' || (theme === 'device' && this.darkQuery.matches);
        document.documentElement.classList.toggle('dark', isDark);
    },

    getFont() {
        const saved = this.storage('get', this.fontKey);
        return this.findFont(saved) ? saved : this.fonts.default;
    },

    findFont(key) {
        return this.fonts.options.find((font) => font.key === key);
    },

    saveFont(key) {
        const font = this.findFont(key) || this.findFont(this.fonts.default);
        if (!font) return;

        const root = document.documentElement;
        root.style.removeProperty('--font-family-base');
        root.style.removeProperty('--font-family-heading');
        this.fonts.options.forEach((option) => {
            if (option.className) root.classList.remove(option.className);
        });

        if (font.key === this.fonts.default) {
            this.storage('remove', this.fontKey);
            return;
        }

        this.storage('set', this.fontKey, font.key);
        this.loadFont(font);
        root.style.setProperty('--font-family-base', font.cssFamily);
        if (font.headingFamily) root.style.setProperty('--font-family-heading', font.headingFamily);
        if (font.className) root.classList.add(font.className);
    },

    loadFont(font) {
        if (!font.query || document.getElementById(`font-${font.key}`)) return;

        const link = document.createElement('link');
        link.id = `font-${font.key}`;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?${font.query}&display=swap`;
        document.head.appendChild(link);
    },

    setFormValue(name, value) {
        const input = this.form.querySelector(`input[name="${name}"][value="${value}"]`);
        if (input) input.checked = true;
    },

    announce(message) {
        if (this.status) this.status.textContent = message;
    }
};

const fullscreenImage = {
  focusableSelector: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',

  init() {
    if (!document.querySelector('[data-enlargeable="true"]')) return;

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
        window.addEventListener('scroll', throttle(() => toggleVisibility(), 100), { passive: true });
        
        // Add click listener
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

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

    applyPosition(stepWidth = this.getStepWidth()) {
        const offset = stepWidth * this.currentIndex;
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
        const stepWidth = this.getStepWidth();

        this.syncLoopClone();
        this.renderProgress();
        this.applyPosition(stepWidth);
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
        sitePreferences.init();
        fullscreenImage.init();
        mobileMenu.init(
            document.getElementById('mobile-menu-button'),
            document.getElementById('mobile-menu-close'),
            document.getElementById('mobile-menu')
        );
        scrollToSection.init();
        const initialiseProjectCards = () => projectCards.init();
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(initialiseProjectCards, { timeout: 2000 });
        } else {
            window.setTimeout(initialiseProjectCards, 0);
        }
        initCopyEmail();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});
