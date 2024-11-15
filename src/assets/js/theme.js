document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('theme-form');
    const input = document.getElementById('theme-input');
    
    if (form && input) {
        // Update input value to match current theme
        input.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Toggle theme
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            document.documentElement.classList.toggle('dark');
            input.value = newTheme;
            
            // Save preference
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(new FormData(form))
            }).catch(console.error);
        });
    }
});