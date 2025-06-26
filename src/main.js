// ============================================================================
// MAIN ENTRY POINT FOR VITE
// ============================================================================

// Core libraries (order matters!)
import "./lib/dom.js";
import "./lib/storage.js";
import "./lib/i18n.js";

// Utilities and constants
import "./utils/constants.js";
import "./utils/helpers.js";
import "./utils/data.js";
import "./utils/event-manager.js";
import "./utils/form-validation.js";

// Components
import "./components/modal-base.js";
import "./components/notes.js";
import "./components/tasks.js";
import "./components/contacts.js";
import "./components/form-fields.js";
import "./components/table.js";

// Main application
import "./app.js";

// Import CSS
import "./styles.css";

// Make globals available (since files were originally concatenated)
// These variables need to be global for the app to work
window.BUILD_NUMBER = __BUILD_NUMBER__;
window.BUILD_TIME = __BUILD_TIME__;

// Expose DOM utilities globally
window.$ = $;
window.h = h;

// Expose other globals that need to be available across modules
// Note: Variables are defined in their respective modules but need global access

// Update the DOM with build info
console.log("DOMContentLoaded 90");
document.addEventListener("DOMContentLoaded", () => {
	// Update title
	document.title = document.title.replace("{BUILD_NUMBER}", __BUILD_NUMBER__);

	// Update header build info
	const buildInfo = document.querySelector(".build-info");
	if (buildInfo) {
		buildInfo.textContent = `Build ${__BUILD_NUMBER__}`;
	}

	const buildTimestamp = document.querySelector(".build-timestamp");
	if (buildTimestamp) {
		buildTimestamp.textContent = `Built: ${__BUILD_TIME__}`;
	}
});
