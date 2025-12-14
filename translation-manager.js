// ✅ Translation Manager - Custom i18n System
class TranslationManager {
    constructor() {
        this.currentLanguage = this.getSavedLanguage();
        this.translations = {};
        this.supportedLanguages = ['en', 'es', 'fr', 'te', 'ta', 'ar', 'sw', 'hi', 'mr', 'gu'];
        this.languageNames = {
            'en': 'English',
            'es': 'Español',
            'fr': 'Français',
            'de': 'Deutsch',
            'it': 'Italiano',
            'pt': 'Português',
            'ja': '日本語',
            'zh-CN': '中文 (简体)',
            'zh-TW': '繁體中文',
            'ko': '한국어',
            'ar': 'العربية',
            'ru': 'Русский',
            'sw': 'Kiswahili',
            'so': 'Somali',
            'am': 'አማርኛ',
            'hi': 'हिंदी',
            'ta': 'தமிழ்',
            'te': 'తెలుగు',
            'ka': 'ಕನ್ನಡ',
            'ml': 'മലയാളം',
            'gu': 'ગુજરાતી',
            'mr': 'मराठी',
            'bn': 'বাংলা',
            'th': 'ไทย',
            'vi': 'Tiếng Việt',
            'id': 'Bahasa Indonesia'
        };
    }

    // ✅ Get saved language from localStorage
    getSavedLanguage() {
        const saved = localStorage.getItem('preferredLanguage');
        return saved || 'en';
    }

    // ✅ Save language preference
    saveLanguage(lang) {
        localStorage.setItem('preferredLanguage', lang);
        this.currentLanguage = lang;
        console.log('✅ Language saved:', lang);
    }

    // ✅ Load translation file
    async loadTranslations(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            lang = 'en';
        }

        try {
            // Add cache buster to prevent stale file loading
            const timestamp = new Date().getTime();
            
            // Try multiple possible paths with cache buster
            const paths = [
                `./translations/${lang}.json?v=${timestamp}`,
                `translations/${lang}.json?v=${timestamp}`,
                `/translations/${lang}.json?v=${timestamp}`,
                `${window.location.origin}/translations/${lang}.json?v=${timestamp}`
            ];

            let response = null;
            let lastError = null;

            for (const path of paths) {
                try {
                    response = await fetch(path);
                    if (response.ok) {
                        const data = await response.json();
                        this.translations = data;
                        this.currentLanguage = lang;
                        console.log(`✅ Loaded translations from: ${path}`, data);
                        return true;
                    }
                } catch (err) {
                    lastError = err;
                    console.warn(`⚠️ Failed to load from ${path}:`, err.message);
                    continue;
                }
            }

            // If file loading failed, use fallback with warning
            if (fallbackTranslations[lang]) {
                this.translations = fallbackTranslations[lang];
                this.currentLanguage = lang;
                console.warn(`⚠️ Using FALLBACK translations for: ${lang} (file failed to load)`);
                return true;
            }

            throw new Error(`Failed to load ${lang} translation. Last error: ${lastError?.message}`);
        } catch (error) {
            console.error('❌ Error loading translations:', error);
            // Fallback to English
            if (lang !== 'en' && fallbackTranslations['en']) {
                this.translations = fallbackTranslations['en'];
                this.currentLanguage = 'en';
                console.log('✅ Fallback to English');
                return true;
            }
            return false;
        }
    }

    // ✅ Get translated text
    get(key) {
        return this.translations[key] !== undefined ? this.translations[key] : key;
    }

    // ✅ Apply translations to all elements with data-i18n attribute
    applyTranslations() {
        let appliedCount = 0;
        
        // Apply to elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`Found ${elements.length} elements to translate`);
        
        elements.forEach((element) => {
            const key = element.getAttribute('data-i18n');
            const translated = this.get(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
                element.value = translated;
                element.title = key;
                if (element.tagName === 'BUTTON') {
                    element.innerText = translated;
                }
            } else if (element.tagName === 'OPTION') {
                element.innerText = translated;
            } else if (element.tagName === 'TITLE') {
                element.innerText = translated;
                document.title = translated;
            } else {
                element.innerText = translated;
            }
            appliedCount++;
            console.log(`✓ ${key} → ${translated}`);
        });

        // Also apply to links with data-i18n
        const links = document.querySelectorAll('a[data-i18n]');
        links.forEach((link) => {
            const key = link.getAttribute('data-i18n');
            link.innerText = this.get(key);
            appliedCount++;
        });

        console.log(`✅ Applied ${appliedCount} translations to page`);
    }

    // ✅ Initialize and apply translations
    async init() {
        const savedLang = this.getSavedLanguage();
        await this.loadTranslations(savedLang);
        this.applyTranslations();
    }

    // ✅ Change language and apply immediately
    async setLanguage(lang) {
        this.saveLanguage(lang);
        await this.loadTranslations(lang);
        this.applyTranslations();
        this.updateLanguageSelector();
        console.log(`✅ Language changed to: ${lang}`);
    }

    // ✅ Create and insert language selector
    createLanguageSelector() {
        // Remove old selector if exists
        const old = document.getElementById('language-selector-container');
        if (old) old.remove();

        // Create new selector
        const container = document.createElement('div');
        container.id = 'language-selector-container';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background-color: #007bff;
            padding: 8px 12px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        `;

        const label = document.createElement('label');
        label.style.cssText = 'color: white; margin: 0; cursor: pointer;';
        label.innerHTML = '🌐 ';

        const select = document.createElement('select');
        select.id = 'language-selector';
        select.style.cssText = `
            background-color: #0056b3;
            color: white;
            border: none;
            padding: 5px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 14px;
        `;

        // Add language options
        this.supportedLanguages.forEach((lang) => {
            const option = document.createElement('option');
            option.value = lang;
            option.innerHTML = this.languageNames[lang] || lang;
            if (lang === this.currentLanguage) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        // Add change event listener
        select.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });

        label.appendChild(select);
        container.appendChild(label);
        document.body.appendChild(container);
    }

    // ✅ Update language selector to show current language
    updateLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLanguage;
        }
    }
}

// ✅ Initialize translation manager on page load
const translator = new TranslationManager();

// Add inline translations as fallback if files don't load
const fallbackTranslations = {
    'en': {"app_title": "IIT Madras Zanzibar Water Management", "select_tank_sump": "Select the Tank/Sump", "main_sump": "Main Sump", "pampa_sump": "Pampa Sump", "mandakini_sump": "Mandakini Sump", "icsr_sump": "ICSR Sump", "himalaya_oht": "Himalaya OHT", "install_app": "Install App", "back": "Back", "water_level_monitoring": "IITMZ Water Management", "water_management": "", "language_label": "Language:", "language_select": "Select Language", "reservoir": "Reservoir", "overhead_tank": "Overhead Tank", "history": "History", "custom_range": "Custom Range", "from": "From:", "to": "To:", "fetch_data": "Fetch Data", "reservoir_history": "Reservoir Water Level History", "overhead_tank_history": "Overhead Tank Water Level History", "day_1": "1 Day", "day_2": "2 Days", "day_3": "3 Days", "day_4": "4 Days", "day_5": "5 Days", "day_6": "6 Days", "day_7": "7 Days", "waiting_for_updates": "Waiting for updates...", "waiting_for_history": "Waiting for history data...", "line_color": "Graph Line Color", "water_level_history": "Water Level History", "enable_alerts": "Enable Alerts", "repeat_alerts": "Repeat Alerts (every 5 min)", "min_threshold": "Min", "max_threshold": "Max"},
    'es': {"app_title": "Gestión del Agua IIT Madras Zanzíbar", "select_tank_sump": "Seleccionar Tanque/Sumidero", "main_sump": "Sumidero Principal", "pampa_sump": "Sumidero Pampa", "mandakini_sump": "Sumidero Mandakini", "icsr_sump": "Sumidero ICSR", "himalaya_oht": "Himalaya OHT", "install_app": "Instalar Aplicación", "back": "Atrás", "water_level_monitoring": "Gestión del Agua IITMZ", "water_management": "", "language_label": "Idioma:", "language_select": "Seleccionar Idioma", "reservoir": "Depósito", "overhead_tank": "Tanque Elevado", "history": "Historial", "custom_range": "Rango Personalizado", "from": "De:", "to": "Hasta:", "fetch_data": "Obtener Datos", "reservoir_history": "Historial del Nivel de Agua del Depósito", "overhead_tank_history": "Historial del Nivel de Agua del Tanque Elevado", "day_1": "1 Día", "day_2": "2 Días", "day_3": "3 Días", "day_4": "4 Días", "day_5": "5 Días", "day_6": "6 Días", "day_7": "7 Días", "waiting_for_updates": "Esperando actualizaciones...", "waiting_for_history": "Esperando datos del historial...", "line_color": "Color de Línea del Gráfico", "water_level_history": "Historial del Nivel de Agua", "enable_alerts": "Habilitar Alertas", "repeat_alerts": "Repetir Alertas (cada 5 min)", "min_threshold": "Mín", "max_threshold": "Máx"},
    'ta': {"app_title": "IIT Madras Zanzibar நீர் மேலாண்மை", "select_tank_sump": "தொட்டி/ஆழ்வாரை தேர்வு செய்யவும்", "main_sump": "முக்கிய தொட்டி", "pampa_sump": "பம்பா தொட்டி", "mandakini_sump": "மண்டாகிணி தொட்டி", "icsr_sump": "ICSR தொட்டி", "himalaya_oht": "இமாலய OHT", "install_app": "பயன்பாட்டை நிறுவுங்கள்", "back": "பின்", "water_level_monitoring": "IITMZ நீர் மேலாண்மை", "water_management": "", "language_label": "மொழி:", "language_select": "மொழியைத் தேர்வு செய்யவும்", "reservoir": "நீர்த்தேக்கம்", "overhead_tank": "மேல் தொட்டி", "history": "வரலாறு", "custom_range": "விருப்ப வரம்பு", "from": "முதல்:", "to": "வரை:", "fetch_data": "தரவு பெறுக", "reservoir_history": "நீர்த்தேக்க நீர் மட்ட வரலாறு", "overhead_tank_history": "மேல் தொட்டி நீர் மட்ட வரலாறு", "day_1": "1 நாள்", "day_2": "2 நாட்கள்", "day_3": "3 நாட்கள்", "day_4": "4 நாட்கள்", "day_5": "5 நாட்கள்", "day_6": "6 நாட்கள்", "day_7": "7 நாட்கள்", "waiting_for_updates": "புதுப்பிப்புகளுக்காக காத்திருக்கிறது...", "waiting_for_history": "வரலாற்று தரவுகளுக்காக காத்திருக்கிறது...", "line_color": "வரைபட வரி வண்ணம்", "water_level_history": "நீர் மட்ட வரலாறு", "enable_alerts": "எச்சரிக்கைகளை இயக்கு", "repeat_alerts": "எச்சரிக்கைகளை மீண்டும் செய் (ஒவ்வொரு 5 நிமிடத்திற்கும்)", "min_threshold": "குறைந்தபட்சம்", "max_threshold": "அதிகபட்சம்"},
    'te': {"app_title": "IIT Madras Zanzibar నీటి నిర్వహణ", "select_tank_sump": "ట్యాంక్/సంపు ఎంచుకోండి", "main_sump": "ప్రధాన సంపు", "pampa_sump": "పంపా సంపు", "mandakini_sump": "మండాకిని సంపు", "icsr_sump": "ICSR సంపు", "himalaya_oht": "హిమాలయ OHT", "install_app": "యాప్‌ను ఇన్‌స్టాల్ చేయండి", "back": "వెనుకకు", "water_level_monitoring": "IITMZ నీటి నిర్వహణ", "water_management": "", "language_label": "భాష:", "language_select": "భాషను ఎంచుకోండి", "reservoir": "జలాశయం", "overhead_tank": "ఓవర్‌హెడ్ ట్యాంక్", "history": "చరిత్ర", "custom_range": "కస్టమ్ పరిధి", "from": "నుండి:", "to": "వరకు:", "fetch_data": "డేటా పొందండి", "reservoir_history": "జలాశయ నీటి స్థాయి చరిత్ర", "overhead_tank_history": "ఓవర్‌హెడ్ ట్యాంక్ నీటి స్థాయి చరిత్ర", "day_1": "1 రోజు", "day_2": "2 రోజులు", "day_3": "3 రోజులు", "day_4": "4 రోజులు", "day_5": "5 రోజులు", "day_6": "6 రోజులు", "day_7": "7 రోజులు", "waiting_for_updates": "నవీకరణల కోసం ఎదురుచూస్తోంది...", "waiting_for_history": "చరిత్ర డేటా కోసం ఎదురుచూస్తోంది...", "line_color": "గ్రాఫ్ లైన్ రంగు", "water_level_history": "నీటి స్థాయి చరిత్ర", "enable_alerts": "అలర్ట్‌లను ప్రారంభించండి", "repeat_alerts": "అలర్ట్‌లను పునరావృత్తి చేయండి (ప్రతి 5 నిమిషాలకు)", "min_threshold": "కనిష్టం", "max_threshold": "గరిష్టం"},
    'ar': {"app_title": "إدارة مياه IIT مدراس زنجبار", "select_tank_sump": "اختر خزان/بئر", "main_sump": "البئر الرئيسي", "pampa_sump": "بئر بامبا", "mandakini_sump": "بئر ماندكيني", "icsr_sump": "بئر ICSR", "himalaya_oht": "خزان الهيمالاي العلوي", "install_app": "تثبيت التطبيق", "back": "رجوع", "water_level_monitoring": "إدارة مياه IITMZ", "water_management": "", "language_label": "اللغة:", "language_select": "اختر اللغة", "reservoir": "الخزان", "overhead_tank": "الخزان العلوي", "history": "السجل", "custom_range": "نطاق مخصص", "from": "من:", "to": "إلى:", "fetch_data": "جلب البيانات", "reservoir_history": "سجل مستوى مياه الخزان", "overhead_tank_history": "سجل مستوى مياه الخزان العلوي", "day_1": "1 يوم", "day_2": "2 أيام", "day_3": "3 أيام", "day_4": "4 أيام", "day_5": "5 أيام", "day_6": "6 أيام", "day_7": "7 أيام", "waiting_for_updates": "في انتظار التحديثات...", "waiting_for_history": "في انتظار بيانات السجل...", "line_color": "لون خط الرسم البياني", "water_level_history": "سجل مستوى المياه", "enable_alerts": "تفعيل التنبيهات", "repeat_alerts": "كرر التنبيهات (كل 5 دقائق)", "min_threshold": "الحد الأدنى", "max_threshold": "الحد الأقصى"},
    'sw': {"app_title": "Usimamizi wa Maji wa IIT Madras Zanzibar", "select_tank_sump": "Chagua Tanki/Tangi", "main_sump": "Tangi Kuu", "pampa_sump": "Tangi cha Pampa", "mandakini_sump": "Tangi cha Mandakini", "icsr_sump": "Tangi cha ICSR", "himalaya_oht": "Himalaya OHT", "install_app": "Sakinisha Programu", "back": "Rudi", "water_level_monitoring": "Usimamizi wa Maji wa IITMZ", "water_management": "", "language_label": "Lugha:", "language_select": "Chagua Lugha", "reservoir": "Hifadhi", "overhead_tank": "Tanki la Juu", "history": "Historia", "custom_range": "Anuwai ya Kawaida", "from": "Kutoka:", "to": "Hadi:", "fetch_data": "Chukua Data", "reservoir_history": "Historia ya Kiwango cha Maji ya Hifadhi", "overhead_tank_history": "Historia ya Kiwango cha Maji ya Tanki la Juu", "day_1": "Siku 1", "day_2": "Siku 2", "day_3": "Siku 3", "day_4": "Siku 4", "day_5": "Siku 5", "day_6": "Siku 6", "day_7": "Siku 7", "waiting_for_updates": "Inasubiri sasisho...", "waiting_for_history": "Inasubiri data ya historia...", "line_color": "Rangi ya Mstari wa Grafu", "water_level_history": "Historia ya Kiwango cha Maji", "enable_alerts": "Wezesha Onyo", "repeat_alerts": "Rudia Onyo (kila dakika 5)", "min_threshold": "Kiwango cha Chini", "max_threshold": "Kiwango cha Juu"},
    'fr': {"app_title": "Gestion de l'Eau IIT Madras Zanzibar", "select_tank_sump": "Sélectionner le Réservoir/Puisard", "main_sump": "Puisard Principal", "pampa_sump": "Puisard Pampa", "mandakini_sump": "Puisard Mandakini", "icsr_sump": "Puisard ICSR", "himalaya_oht": "Himalaya OHT", "install_app": "Installer l'Application", "back": "Retour", "water_level_monitoring": "Gestion de l'Eau IITMZ", "water_management": "", "language_label": "Langue:", "language_select": "Sélectionner la Langue", "reservoir": "Réservoir", "overhead_tank": "Réservoir Surélevé", "history": "Historique", "custom_range": "Plage Personnalisée", "from": "De:", "to": "À:", "fetch_data": "Récupérer les Données", "reservoir_history": "Historique du Niveau d'Eau du Réservoir", "overhead_tank_history": "Historique du Niveau d'Eau du Réservoir Surélevé", "day_1": "1 Jour", "day_2": "2 Jours", "day_3": "3 Jours", "day_4": "4 Jours", "day_5": "5 Jours", "day_6": "6 Jours", "day_7": "7 Jours", "waiting_for_updates": "En attente de mises à jour...", "waiting_for_history": "En attente de données d'historique...", "line_color": "Couleur de la Ligne du Graphique", "water_level_history": "Historique du Niveau d'Eau", "enable_alerts": "Activer les Alertes", "repeat_alerts": "Répéter les Alertes (toutes les 5 min)", "min_threshold": "Minimum", "max_threshold": "Maximum"},
    'hi': {"app_title": "IIT मद्रास जंजीबार जल प्रबंधन", "select_tank_sump": "टैंक/सम्प चुनें", "main_sump": "मुख्य सम्प", "pampa_sump": "पम्पा सम्प", "mandakini_sump": "मंडाकिनी सम्प", "icsr_sump": "ICSR सम्प", "himalaya_oht": "हिमालय OHT", "install_app": "ऐप इंस्टॉल करें", "back": "वापस", "water_level_monitoring": "IITMZ जल प्रबंधन", "water_management": "", "language_label": "भाषा:", "language_select": "भाषा चुनें", "reservoir": "जलाशय", "overhead_tank": "ओवरहेड टैंक", "history": "इतिहास", "custom_range": "कस्टम रेंज", "from": "से:", "to": "तक:", "fetch_data": "डेटा प्राप्त करें", "reservoir_history": "जलाशय जल स्तर का इतिहास", "overhead_tank_history": "ओवरहेड टैंक जल स्तर का इतिहास", "day_1": "1 दिन", "day_2": "2 दिन", "day_3": "3 दिन", "day_4": "4 दिन", "day_5": "5 दिन", "day_6": "6 दिन", "day_7": "7 दिन", "waiting_for_updates": "अपडेट की प्रतीक्षा...", "waiting_for_history": "इतिहास डेटा की प्रतीक्षा...", "line_color": "ग्राफ लाइन रंग", "water_level_history": "जल स्तर का इतिहास", "enable_alerts": "अलर्ट सक्षम करें", "repeat_alerts": "अलर्ट दोहराएं (हर 5 मिनट)", "min_threshold": "न्यूनतम", "max_threshold": "अधिकतम"},
    'mr': {"app_title": "IIT मद्रास जांजिबार जल व्यवस्थापन", "select_tank_sump": "टाकी/सम्प निवडा", "main_sump": "मुख्य सम्प", "pampa_sump": "पंपा सम्प", "mandakini_sump": "मंडाकिनी सम्प", "icsr_sump": "ICSR सम्प", "himalaya_oht": "हिमालय OHT", "install_app": "अॅप इंस्टॉल करा", "back": "परत", "water_level_monitoring": "IITMZ जल व्यवस्थापन", "water_management": "", "language_label": "भाषा:", "language_select": "भाषा निवडा", "reservoir": "जलाशय", "overhead_tank": "ओव्हरहेड टाकी", "history": "इतिहास", "custom_range": "कस्टम श्रेणी", "from": "पासून:", "to": "पर्यंत:", "fetch_data": "डेटा मिळवा", "reservoir_history": "जलाशय जल स्तर इतिहास", "overhead_tank_history": "ओव्हरहेड टाकी जल स्तर इतिहास", "day_1": "1 दिवस", "day_2": "2 दिवस", "day_3": "3 दिवस", "day_4": "4 दिवस", "day_5": "5 दिवस", "day_6": "6 दिवस", "day_7": "7 दिवस", "waiting_for_updates": "अपडेट्सची प्रतीक्षा...", "waiting_for_history": "इतिहास डेटाची प्रतीक्षा...", "line_color": "आलेख लाइन रंग", "water_level_history": "जल स्तर इतिहास", "enable_alerts": "अलर्ट सक्षम करा", "repeat_alerts": "अलर्ट पुन्हा करा (प्रत्येक 5 मिनिटात)", "min_threshold": "किमान", "max_threshold": "कमाल"},
    'gu': {"app_title": "IIT મદ્રાસ ઝાંઝીબાર જલ વ્યવસ્થાપન", "select_tank_sump": "ટાંકી/સમ્પ પસંદ કરો", "main_sump": "મુખ્ય સમ્પ", "pampa_sump": "પમ્પા સમ્પ", "mandakini_sump": "મંડાકિની સમ્પ", "icsr_sump": "ICSR સમ્પ", "himalaya_oht": "હિમાલય OHT", "install_app": "ઍપ ઇન્સ્ટોલ કરો", "back": "પાછળ", "water_level_monitoring": "IITMZ જલ વ્યવસ્થાપન", "water_management": "", "language_label": "ભાષા:", "language_select": "ભાષા પસંદ કરો", "reservoir": "જળાશય", "overhead_tank": "ઓવરહેડ ટાંકી", "history": "ઇતિહાસ", "custom_range": "કસ્ટમ શ્રેણી", "from": "થી:", "to": "સુધી:", "fetch_data": "ડેટા મેળવો", "reservoir_history": "જળાશય જલ સ્તર ઇતિહાસ", "overhead_tank_history": "ઓવરહેડ ટાંકી જલ સ્તર ઇતિહાસ", "day_1": "1 દિવસ", "day_2": "2 દિવસ", "day_3": "3 દિવસ", "day_4": "4 દિવસ", "day_5": "5 દિવસ", "day_6": "6 દિવસ", "day_7": "7 દિવસ", "waiting_for_updates": "અપડેટ્સની રાહ જોઈ રહ્યાં છીએ...", "waiting_for_history": "ઇતિહાસ ડેટાની રાહ જોઈ રહ્યાં છીએ...", "line_color": "ગ્રાફ લાઇન રંગ", "water_level_history": "જળ સ્તર ઇતિહાસ", "enable_alerts": "અલર્ટ સક્ષમ કરો", "repeat_alerts": "અલર્ટ પુનરાવર્તિત કરો (દર 5 મિનિટે)", "min_threshold": "લઘુતમ", "max_threshold": "મહત્તમ"}
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOMContentLoaded event fired');
    await translator.init();
    translator.createLanguageSelector();
});

// Fallback if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await translator.init();
        translator.createLanguageSelector();
    });
} else {
    // Document is already loaded
    setTimeout(async () => {
        await translator.init();
        translator.createLanguageSelector();
    }, 100);
}

// ✅ Apply translations again when page becomes visible
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        const savedLang = translator.getSavedLanguage();
        if (savedLang !== translator.currentLanguage) {
            await translator.setLanguage(savedLang);
        }
    }
});
