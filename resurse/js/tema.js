document.addEventListener('DOMContentLoaded', (event) => {
    const themeSelector = document.getElementById('select_tema');
    const savedTheme = localStorage.getItem('selectedTheme');

    if (savedTheme) {
        document.body.classList.add(`${savedTheme}-mode`);
        themeSelector.value = savedTheme;
    } else {
        document.body.classList.add('default-mode');
    }

    themeSelector.addEventListener('change', (event) => {
        const selectedTheme = event.target.value;

        document.body.className = '';
        document.body.classList.add(`${selectedTheme}-mode`);

        localStorage.setItem('selectedTheme', selectedTheme);
    });
});