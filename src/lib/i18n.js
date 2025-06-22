// ============================================================================
// MINI I18N LIBRARY
// ============================================================================

const I18n = {
	// Current language
	currentLanguage: "en",

	// Language detection from browser
	detectLanguage: () => {
		const browserLang = navigator.language || navigator.userLanguage;
		const langCode = browserLang.split("-")[0];
		return I18n.translations[langCode] ? langCode : "en";
	},

	// Get language from URL parameter
	getLanguageFromURL: () => {
		const urlParams = new URLSearchParams(window.location.search);
		const langParam = urlParams.get("lang");
		return langParam && I18n.translations[langParam] ? langParam : null;
	},

	// Set language in URL parameter
	setLanguageInURL: (lang) => {
		const url = new URL(window.location);
		if (lang && lang !== "en") {
			url.searchParams.set("lang", lang);
		} else {
			url.searchParams.delete("lang");
		}
		window.history.replaceState({}, "", url);
	},

	// Set current language
	setLanguage: (lang) => {
		if (I18n.translations[lang]) {
			I18n.currentLanguage = lang;
			I18n.setLanguageInURL(lang);
			DataStore.save({ ...DataStore.load(), language: lang });
			return true;
		}
		return false;
	},

	// Get translated text
	t: (key, params = {}) => {
		const keys = key.split(".");
		let translation = I18n.translations[I18n.currentLanguage];

		for (const k of keys) {
			translation = translation?.[k];
		}

		if (!translation) {
			console.warn(
				`Translation missing for key: ${key} in language: ${I18n.currentLanguage}`,
			);
			return key;
		}

		// Replace parameters in translation
		return translation.replace(/\{(\w+)\}/g, (match, param) => {
			return params[param] !== undefined ? params[param] : match;
		});
	},

	// Get available languages
	getLanguages: () => Object.keys(I18n.translations),

	// Initialize language from storage or browser
	init: () => {
		// Priority: URL parameter > saved language > browser language > default (en)
		const urlLang = I18n.getLanguageFromURL();
		const savedData = DataStore.load();
		const savedLanguage = savedData?.language;

		I18n.currentLanguage = urlLang || savedLanguage || I18n.detectLanguage();

		// Update URL to reflect current language
		I18n.setLanguageInURL(I18n.currentLanguage);
	},
};

// Translation constants
I18n.translations = {
	en: EN_TRANSLATIONS,
	pt: PT_TRANSLATIONS
};
