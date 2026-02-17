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
        darkMode.init(document.getElementById('dark-mode-toggle'));
        fullscreenImage.init();
        mobileMenu.init(
            document.getElementById('mobile-menu-button'),
            document.getElementById('mobile-menu-close'),
            document.getElementById('mobile-menu')
        );
        scrollToSection.init();
        initCopyEmail();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});
