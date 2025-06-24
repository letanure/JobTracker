// ============================================================================
// DATA PERSISTENCE
// ============================================================================

// Save to localStorage
const saveToLocalStorage = () => {
	DataStore.save({
		jobs: originalData || jobsData,
		language: I18n.currentLanguage});
};

// Load from localStorage
const loadFromLocalStorage = () => {
	const savedData = DataStore.load();

	if (savedData) {
		// Set language first
		if (savedData.language) {
			I18n.setLanguage(savedData.language);
		}

		// Load jobs data directly without migration
		if (savedData.jobs && Array.isArray(savedData.jobs)) {
			return savedData.jobs;
		}
	}

	return null;
};
