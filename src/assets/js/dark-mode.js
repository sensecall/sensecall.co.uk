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