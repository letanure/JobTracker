// ============================================================================
// LANGUAGE SWITCHER COMPONENT
// ============================================================================

const LanguageSwitcher = {
	// Create the language switcher HTML
	create: () => {
		// Get current language info
		const currentLang = CONFIG.languages.find(lang => lang.code === I18n.currentLanguage) || CONFIG.languages[0];
		
		// Create button using simple DOM creation instead of h() function
		const button = document.createElement("button");
		button.className = "language-button";
		button.id = "languageButton";
		
		// Create flag span
		const flagSpan = document.createElement("span");
		flagSpan.className = "language-flag";
		flagSpan.id = "currentLanguageFlag";
		flagSpan.textContent = currentLang.flag;
		
		// Create name span  
		const nameSpan = document.createElement("span");
		nameSpan.className = "language-name";
		nameSpan.id = "currentLanguageName";
		nameSpan.textContent = currentLang.name;
		
		// Create arrow span
		const arrowSpan = document.createElement("span");
		arrowSpan.className = "language-arrow material-symbols-outlined";
		arrowSpan.textContent = "expand_more";
		
		// Append to button
		button.appendChild(flagSpan);
		button.appendChild(nameSpan);
		button.appendChild(arrowSpan);

		// Create dropdown
		const dropdown = document.createElement("div");
		dropdown.className = "language-dropdown";
		dropdown.id = "languageDropdown";
		dropdown.style.display = "none";

		// Create dropdown options
		CONFIG.languages.forEach(lang => {
			const option = document.createElement("div");
			option.className = "language-option";
			
			const optionFlag = document.createElement("span");
			optionFlag.className = "language-flag";
			optionFlag.textContent = lang.flag;
			
			const optionName = document.createElement("span");
			optionName.className = "language-name";
			optionName.textContent = lang.name;
			
			option.appendChild(optionFlag);
			option.appendChild(optionName);
			
			// Add click event listener
			option.addEventListener('click', () => LanguageSwitcher.selectLanguage(lang.code));
			
			dropdown.appendChild(option);
		});

		// Create selector container
		const selector = document.createElement("div");
		selector.className = "language-selector";
		selector.appendChild(button);
		selector.appendChild(dropdown);

		// Create main container
		const container = document.createElement("div");
		container.className = "language-switcher";
		container.appendChild(selector);

		// Add click event listener to button
		button.addEventListener('click', () => LanguageSwitcher.toggle());

		return container;
	},

	// Toggle the dropdown visibility
	toggle: () => {
		const dropdown = document.getElementById("languageDropdown");
		if (!dropdown) return;
		
		const isVisible = dropdown.style.display !== "none";
		dropdown.style.display = isVisible ? "none" : "block";
		
		// Close dropdown when clicking outside
		if (!isVisible) {
			document.addEventListener("click", LanguageSwitcher.handleClickOutside);
		}
	},

	// Handle clicks outside the dropdown to close it
	handleClickOutside: (event) => {
		const languageSwitcher = document.querySelector(".language-switcher");
		if (languageSwitcher && !languageSwitcher.contains(event.target)) {
			const dropdown = document.getElementById("languageDropdown");
			if (dropdown) {
				dropdown.style.display = "none";
			}
			document.removeEventListener("click", LanguageSwitcher.handleClickOutside);
		}
	},

	// Select a language
	selectLanguage: (langCode) => {
		if (I18n.setLanguage(langCode)) {
			LanguageSwitcher.updateUI();
			LanguageSwitcher.toggle(); // Close dropdown
			
			// Re-render the app with new language
			if (typeof updateUILanguage === 'function') {
				updateUILanguage();
			}
		}
	},

	// Update the switcher UI to reflect current language
	updateUI: () => {
		const currentLang = CONFIG.languages.find(lang => lang.code === I18n.currentLanguage);
		if (currentLang) {
			const flagElement = document.getElementById("currentLanguageFlag");
			const nameElement = document.getElementById("currentLanguageName");
			
			if (flagElement) flagElement.textContent = currentLang.flag;
			if (nameElement) nameElement.textContent = currentLang.name;
		}
	},

	// Initialize the language switcher
	init: () => {
		LanguageSwitcher.updateUI();
	}
};