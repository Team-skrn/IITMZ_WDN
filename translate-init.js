// ✅ Get saved language IMMEDIATELY before anything else
const savedLanguage = localStorage.getItem('preferredLanguage');
console.log('🔍 Saved language found:', savedLanguage);

// ✅ Initialize Google Translate with all major international languages
function googleTranslateElementInit() {
    console.log('📍 googleTranslateElementInit called');
    new google.translate.TranslateElement(
        {pageLanguage: 'en', includedLanguages: 'en,es,fr,de,it,pt,ja,zh-CN,zh-TW,ko,ar,ru,sw,so,am,hi,ta,te,ka,ml,gu,mr,bn,th,vi,id', layout: google.translate.TranslateElement.InlineLayout.SIMPLE},
        'google_translate_element'
    );
    
    // Apply language IMMEDIATELY and aggressively
    if (savedLanguage && savedLanguage !== 'en') {
        console.log('⚡ Applying saved language immediately:', savedLanguage);
        applyLanguageAggressively(savedLanguage);
    }
}

// ✅ AGGRESSIVE language application - applies multiple times in quick succession
function applyLanguageAggressively(languageCode) {
    console.log('💪 Starting aggressive language application for:', languageCode);
    
    // First attempt - immediate
    trySetLanguage(languageCode, 0);
    
    // Second attempt - 100ms
    setTimeout(() => trySetLanguage(languageCode, 1), 100);
    
    // Third attempt - 300ms
    setTimeout(() => trySetLanguage(languageCode, 2), 300);
    
    // Fourth attempt - 500ms
    setTimeout(() => trySetLanguage(languageCode, 3), 500);
    
    // Fifth attempt - 800ms
    setTimeout(() => trySetLanguage(languageCode, 4), 800);
    
    // Continuous monitoring every 1 second for 10 seconds
    let monitorCount = 0;
    const monitorInterval = setInterval(() => {
        if (monitorCount < 10) {
            trySetLanguage(languageCode, 5 + monitorCount);
            monitorCount++;
        } else {
            clearInterval(monitorInterval);
            console.log('✅ Language monitoring complete');
        }
    }, 1000);
}

// ✅ Try to set language and verify
function trySetLanguage(languageCode, attemptNumber) {
    const selectElement = document.querySelector('.goog-te-combo');
    
    if (selectElement) {
        const currentValue = selectElement.value;
        
        if (currentValue !== languageCode) {
            console.log(`📝 Attempt ${attemptNumber}: Setting language to ${languageCode} (current: ${currentValue})`);
            
            selectElement.value = languageCode;
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            selectElement.dispatchEvent(new Event('input', { bubbles: true }));
            selectElement.dispatchEvent(new Event('click', { bubbles: true }));
            
            // Trigger through the parent element as well
            const parent = selectElement.parentElement;
            if (parent) {
                parent.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            // Verify after small delay
            setTimeout(() => {
                const newValue = document.querySelector('.goog-te-combo')?.value;
                if (newValue === languageCode) {
                    console.log(`✅ Language successfully set to ${languageCode}`);
                } else {
                    console.log(`❌ Language not set. Expected: ${languageCode}, Got: ${newValue}`);
                }
            }, 50);
        } else {
            console.log(`✅ Language already correct: ${languageCode}`);
        }
    } else {
        console.log(`⏳ Select element not found yet (attempt ${attemptNumber})`);
    }
}

// ✅ Setup listener for manual language changes
function setupLanguageChangeListener() {
    console.log('🔗 Setting up language change listener');
    
    const setupListener = () => {
        const selectElement = document.querySelector('.goog-te-combo');
        
        if (selectElement) {
            // Remove any existing listeners by cloning
            const newSelect = selectElement.cloneNode(true);
            selectElement.parentNode.replaceChild(newSelect, selectElement);
            
            // Add new listeners to the cloned element
            const freshSelect = document.querySelector('.goog-te-combo');
            
            freshSelect.addEventListener('change', (e) => {
                const selectedLanguage = freshSelect.value;
                console.log('🌐 Language changed to:', selectedLanguage);
                localStorage.setItem('preferredLanguage', selectedLanguage);
                console.log('💾 Language saved to localStorage:', selectedLanguage);
            });
            
            freshSelect.addEventListener('input', (e) => {
                const selectedLanguage = freshSelect.value;
                console.log('🌐 Language input detected:', selectedLanguage);
                localStorage.setItem('preferredLanguage', selectedLanguage);
            });
            
            console.log('✅ Change listener setup complete');
        } else {
            setTimeout(setupListener, 500);
        }
    };
    
    setupListener();
}

// ✅ Call setup after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, setting up listeners');
    setTimeout(setupLanguageChangeListener, 200);
});

// ✅ Ensure language persists when page becomes visible
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        const currentSaved = localStorage.getItem('preferredLanguage');
        console.log('👁️ Page became visible, checking language. Saved:', currentSaved);
        
        if (currentSaved && currentSaved !== 'en') {
            setTimeout(() => {
                applyLanguageAggressively(currentSaved);
            }, 200);
        }
    }
});

// ✅ Final backup on window load
window.addEventListener('load', () => {
    console.log('🪟 Window loaded, final language check');
    const finalSavedLanguage = localStorage.getItem('preferredLanguage');
    
    if (finalSavedLanguage && finalSavedLanguage !== 'en') {
        setTimeout(() => {
            applyLanguageAggressively(finalSavedLanguage);
        }, 500);
    }
});
