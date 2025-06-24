// ============================================================================
// MINI DATA PERSISTENCE LIBRARY
// ============================================================================

const DataStore = {
	// Storage key for job tracker data
	STORAGE_KEY: "jobTrackerData",

	// Save data to storage
	save: (data) => {
		try {
			localStorage.setItem(DataStore.STORAGE_KEY, JSON.stringify(data));
			return true;
		} catch (error) {
			console.error("Error saving data:", error);
			return false;
		}
	},

	// Load data from storage
	load: () => {
		try {
			const savedData = localStorage.getItem(DataStore.STORAGE_KEY);
			return savedData ? JSON.parse(savedData) : null;
		} catch (error) {
			console.error("Error loading data:", error);
			return null;
		}
	},

	// Check if data exists in storage
	exists: () => {
		return localStorage.getItem(DataStore.STORAGE_KEY) !== null;
	},

	// Clear all data from storage
	clear: () => {
		try {
			localStorage.removeItem(DataStore.STORAGE_KEY);
			return true;
		} catch (error) {
			console.error("Error clearing data:", error);
			return false;
		}
	}};
