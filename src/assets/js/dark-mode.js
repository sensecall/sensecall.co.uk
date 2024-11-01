// Check for saved dark mode preference
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Check for saved preference in local storage
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode === 'true') {
        document.documentElement.classList.add('dark');
        darkModeToggle.checked = true;
    } else if (savedDarkMode === 'false') {
        document.documentElement.classList.remove('dark');
        darkModeToggle.checked = false;
    } else {
        // If no saved preference, use system preference and save it
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDarkMode);
        darkModeToggle.checked = prefersDarkMode;
        localStorage.setItem('darkMode', prefersDarkMode.toString());
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('change', () => {
        const isDarkMode = darkModeToggle.checked;
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode.toString());
    });
});