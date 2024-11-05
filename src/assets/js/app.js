// Add this script inline in your HTML <head> section before any content loads
const savedDarkMode = localStorage.getItem('darkMode');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply dark mode immediately
if (savedDarkMode === 'true' || (savedDarkMode === null && prefersDarkMode)) {
    document.documentElement.classList.add('dark');
}

// Rest of the code remains in the original file
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Set toggle state based on current mode
    darkModeToggle.checked = document.documentElement.classList.contains('dark');

    // Toggle dark mode
    darkModeToggle.addEventListener('change', () => {
        const isDarkMode = darkModeToggle.checked;
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode.toString());
    });
});

// Fullscreen image functionality
document.addEventListener('DOMContentLoaded', function () {
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

    // Find all images that should be enlargeable
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
        const showModal = function() {
            // Use the same src for the fullscreen image
            fullscreenImage.src = img.querySelector('img').src;
            fullscreenImage.alt = img.querySelector('img').alt; // Preserve alt text
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.setAttribute('aria-hidden', 'false');
            
            // Trap focus within modal
            modal.focus();
        };

        img.addEventListener('click', showModal);
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showModal();
            }
        });
    });

    // Close modal function
    const closeModal = function() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.setAttribute('aria-hidden', 'true');
    };

    // Close on click outside or Escape key
    modal.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
});

// Add this after your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        const toggleMenu = (show) => {
            mobileMenu.classList.toggle('translate-x-full', !show);
            mobileMenu.setAttribute('aria-hidden', !show);
            mobileMenuButton.setAttribute('aria-expanded', show);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = show ? 'hidden' : '';
        };

        mobileMenuButton.addEventListener('click', () => toggleMenu(true));
        mobileMenuClose.addEventListener('click', () => toggleMenu(false));

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.getAttribute('aria-hidden') === 'false') {
                toggleMenu(false);
            }
        });
    }
});