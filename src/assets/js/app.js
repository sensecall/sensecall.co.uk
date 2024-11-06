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
            console.log('Dark mode is now:', isDarkMode ? 'on' : 'off');
        });
    }
};

const fullscreenImage = {
    init() {
        this.createModal();
        this.setupImageListeners();
    },

    createModal() {
        // Create modal element programmatically
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 hidden items-center justify-center z-50';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');
        modal.id = 'fullscreen-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'max-w-4xl mx-auto p-4';

        const fullscreenImage = document.createElement('img');
        fullscreenImage.id = 'fullscreen-image';
        fullscreenImage.className = 'max-w-full max-h-[90vh] object-contain';
        fullscreenImage.setAttribute('width', '800');
        fullscreenImage.setAttribute('height', '450');

        modalContent.appendChild(fullscreenImage);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        this.modal = modal;
        this.fullscreenImage = fullscreenImage;
    },

    closeModal() {
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
        this.modal.setAttribute('aria-hidden', 'true');
    },

    setupImageListeners() {
        const enlargeableImages = document.querySelectorAll('[data-enlargeable="true"]');
        
        enlargeableImages.forEach(img => {
            // Remove the no-JS fallback link if it exists
            const fallbackLink = img.querySelector('a');
            if (fallbackLink) {
                fallbackLink.replaceWith(fallbackLink.firstElementChild);
            }

            // Add proper ARIA attributes and role
            img.setAttribute('role', 'button');
            img.setAttribute('aria-haspopup', 'dialog');
            img.setAttribute('tabindex', '0');

            // Handle both click and keyboard events
            const showModal = () => {
                this.fullscreenImage.src = img.querySelector('img').src;
                this.fullscreenImage.alt = img.querySelector('img').alt;
                this.modal.classList.remove('hidden');
                this.modal.classList.add('flex');
                this.modal.setAttribute('aria-hidden', 'false');
                
                this.modal.focus();
            };

            img.addEventListener('click', showModal);
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showModal();
                }
            });
        });

        this.modal.addEventListener('click', () => this.closeModal());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }
};

const mobileMenu = {
    init(button, closeButton, menu) {
        if (!button || !menu || !closeButton) return;

        this.button = button;
        this.menu = menu;
        this.closeButton = closeButton;
        this.setupListeners();
    },

    toggleMenu(show) {
        this.menu.classList.toggle('translate-x-full', !show);
        this.menu.setAttribute('aria-hidden', !show);
        this.button.setAttribute('aria-expanded', show);
        document.body.style.overflow = show ? 'hidden' : '';
    },

    setupListeners() {
        this.button.addEventListener('click', () => this.toggleMenu(true));
        this.closeButton.addEventListener('click', () => this.toggleMenu(false));
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menu.getAttribute('aria-hidden') === 'false') {
                this.toggleMenu(false);
            }
        });
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
            button.setAttribute('aria-hidden', (!isVisible).toString());
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