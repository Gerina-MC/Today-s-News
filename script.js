document.addEventListener("DOMContentLoaded", function() {
    const themeSwitcher = document.getElementById('theme-switcher');
    const languageDropdown = document.getElementById('language-dropdown');
    const textToSpeechButton = document.getElementById('text-to-speech');

    let currentUtterance = null;

    // Load saved theme from localStorage if it exists
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    }

    // Load saved language from localStorage if it exists
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        languageDropdown.value = savedLanguage;
    }

    // Set theme on button click and save to localStorage
    themeSwitcher.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            document.body.className = theme;
            localStorage.setItem('theme', theme);
        });
    });

    // Set language on dropdown change and save to localStorage
    languageDropdown.addEventListener('change', function() {
        const language = this.value;
        localStorage.setItem('language', language);
        // Update URL with the selected language
        const url = new URL(window.location.href);
        url.searchParams.set('lang', language);
        window.history.replaceState({}, '', url);
    });

    // Apply language from URL if present
    const urlLanguage = new URLSearchParams(window.location.search).get('lang');
    if (urlLanguage) {
        languageDropdown.value = urlLanguage;
        localStorage.setItem('language', urlLanguage);
    }

    textToSpeechButton.addEventListener('click', () => {
        const newsContent = document.querySelector('#news-topic .news-content').innerText;
        if (newsContent.trim()) {
            if (window.speechSynthesis.speaking && currentUtterance) {
                // If speech is already playing, cancel it
                window.speechSynthesis.cancel();
                currentUtterance = null;
            }
            else if (!currentUtterance) {
                // Create a new SpeechSynthesisUtterance instance if it doesn't exist
                currentUtterance = new SpeechSynthesisUtterance(newsContent);
                currentUtterance.lang = 'en'; // Adjust the language if needed
                currentUtterance.onend = () => {
                    // Reset currentUtterance when speaking ends
                    currentUtterance = null;
                };
            } else {
                // Reset the text if currentUtterance exists
                currentUtterance.text = newsContent;
            }
            // Speak the utterance
            window.speechSynthesis.speak(currentUtterance);
        } else {
            console.error('No content to read');
        }
    });

    window.addEventListener('beforeunload', () => {
        window.speechSynthesis.cancel();
    });
});
