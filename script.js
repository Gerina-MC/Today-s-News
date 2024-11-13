//making changes
document.addEventListener("DOMContentLoaded", function() {
    const themeSwitcher = document.getElementById('theme-switcher');
    const languageDropdown = document.getElementById('language-dropdown');
    const textToSpeechButton = document.getElementById('text-to-speech');

    let fontSize = 16;  // Default font size in pixels

    // Function to update the font size
    function updateFontSize() {
        document.body.style.fontSize = fontSize + 'px';
    }

    // Zoom In Button
    document.getElementById('zoom-in').addEventListener('click', function () {
        fontSize += 2;
        updateFontSize();
    });

    // Zoom Out Button
    document.getElementById('zoom-out').addEventListener('click', function () {
        if (fontSize > 10) {  // Minimum font size limit
            fontSize -= 2;
            updateFontSize();
        }
    });

    // Reset Zoom Button
    document.getElementById('reset-zoom').addEventListener('click', function () {
        fontSize = 16;  // Reset to default font size
        updateFontSize();
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === '+') { // Ctrl + Plus
            e.preventDefault();
            fontSize += 2;
            updateFontSize();
        }
        if (e.ctrlKey && e.key === '-') { // Ctrl + Minus
            e.preventDefault();
            if (fontSize > 10) {
                fontSize -= 2;
                updateFontSize();
            }
        }
        if (e.ctrlKey && e.key === '0') { // Ctrl + 0
            e.preventDefault();
            fontSize = 16;
            updateFontSize();
        }
    });

    let currentUtterance = null;
    const volumeSlider = document.getElementById('volume-slider');
    window.onscroll = function () {
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            scrollTopBtn.style.display = "block";
        } else {
            scrollTopBtn.style.display = "none";
        }
    };

    // Scroll to the top when button clicked
    document.getElementById('scrollTopBtn').onclick = function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    //textToSpeechButton.addEventListener('click', () => 
    function TTS() {
        const newsContent = $('#headline').text()+". "+document.querySelector('#news-topic .news-content').innerText;
        if (newsContent.trim()) {
            if (window.speechSynthesis.speaking && currentUtterance) {
                // If speech is already playing, cancel it
                window.speechSynthesis.cancel();
                volumeSlider.disabled = false;
                currentUtterance = null;
            }
            else if (!currentUtterance) {
                // Create a new SpeechSynthesisUtterance instance if it doesn't exist
                currentUtterance = new SpeechSynthesisUtterance(newsContent);
                currentUtterance.volume = volumeSlider.value;
                currentUtterance.lang = tlang; // Adjust the language if needed
                window.speechSynthesis.speak(currentUtterance);
                volumeSlider.disabled = true;
                currentUtterance.onend = () => {
                    // Reset currentUtterance when speaking ends
                    currentUtterance = null;
                    volumeSlider.disabled = false;
                };
            } else {
                // Reset the text if currentUtterance exists
                currentUtterance.text = newsContent;
            }
            // Speak the utterance
            
        } else {
            console.error('No content to read');
        }
    };

    textToSpeechButton.addEventListener('click', () => {
        TTS();
    });

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === '2') { // Ctrl + 2
            TTS();
        }
    });

    window.addEventListener('beforeunload', () => {
        window.speechSynthesis.cancel();
        volumeSlider.disabled = false;
    });

    function TTT() {
        if (window.speechSynthesis.speaking && currentUtterance) {
            // If speech is already playing, cancel it
            window.speechSynthesis.cancel();
            volumeSlider.disabled = false;
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
    };

    $('#translate').on('click', function () {
        TTT();
    });

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === '1') { // Ctrl + 1
            TTT();
        }
    });
});
