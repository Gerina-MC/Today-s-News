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
    else {
        document.body.className = "light";
        localStorage.setItem('theme', "light");
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

    var content = $('#content').text();  // Get the content to translate
    var hcontent = $('#headline').text();
    var tlang = "en";
    
    // Set language on dropdown change and save to localStorage
    languageDropdown.addEventListener('change', function() {
        const language = this.value;
        localStorage.setItem('language', language);
        // Update URL with the selected language
        const url = new URL(window.location.href);
        url.searchParams.set('lang', language);
        window.history.replaceState({}, '', url);
        if (window.speechSynthesis.speaking && currentUtterance) {
            // If speech is already playing, cancel it
            window.speechSynthesis.cancel();
            currentUtterance = null;
        }
    });

    // Apply language from URL if present
    const urlLanguage = new URLSearchParams(window.location.search).get('lang');
    if (urlLanguage) {
        languageDropdown.value = urlLanguage;
        localStorage.setItem('language', urlLanguage);
    }

    textToSpeechButton.addEventListener('click', () => {
        const newsContent = $('#headline').text()+". "+document.querySelector('#news-topic .news-content').innerText;
        if (newsContent.trim()) {
            if (window.speechSynthesis.speaking && currentUtterance) {
                // If speech is already playing, cancel it
                window.speechSynthesis.cancel();
                currentUtterance = null;
            }
            else if (!currentUtterance) {
                // Create a new SpeechSynthesisUtterance instance if it doesn't exist
                currentUtterance = new SpeechSynthesisUtterance(newsContent);
                currentUtterance.lang = tlang; // Adjust the language if needed
                window.speechSynthesis.speak(currentUtterance);
                currentUtterance.onend = () => {
                    // Reset currentUtterance when speaking ends
                    currentUtterance = null;
                };
            } else {
                // Reset the text if currentUtterance exists
                currentUtterance.text = newsContent;
            }
            // Speak the utterance
            
        } else {
            console.error('No content to read');
        }
    });

    window.addEventListener('beforeunload', () => {
        window.speechSynthesis.cancel();
    });

    $('#translate').on('click', function () {
        if (window.speechSynthesis.speaking && currentUtterance) {
            // If speech is already playing, cancel it
            window.speechSynthesis.cancel();
            currentUtterance = null;
        }
        var curlang = $('#language-dropdown').val();
        tlang = curlang;
        if (curlang == "en"){
            $('#headline').text(hcontent);
            $('#content').text(content);
        }
        else{
            var languagePair = "en|"+curlang;  // Get the selected language pair

            // Send a GET request to MyMemory API
            $.ajax({
                url: 'https://api.mymemory.translated.net/get',
                type: 'GET',
                data: {
                    q: hcontent,
                    langpair: languagePair
                },
                success: function(response) {
                    // Update the content with the translated text
                    $('#headline').text(response.responseData.translatedText);
                },
                error: function() {
                    alert('Error while translating');
                }
            });
            $.ajax({
                url: 'https://api.mymemory.translated.net/get',
                type: 'GET',
                data: {
                    q: content,
                    langpair: languagePair
                },
                success: function(response) {
                    // Update the content with the translated text
                    $('#content').text(response.responseData.translatedText);
                },
                error: function() {
                    alert('Error while translating');
                }
            });
        }
    });
});
