// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Format date for display
const formatDate = (dateString) => {
	const date = new Date(dateString);

	// Use CONFIG.dateFormat to determine format
	switch (CONFIG.dateFormat) {
		case "DD/MM/YY":
			return date.toLocaleDateString("en-GB", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			});
		case "MM/DD/YY":
			return date.toLocaleDateString("en-US", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			});
		case "YYYY-MM-DD":
			return date.toISOString().split("T")[0];
		case "DD/MM/YY HH:MM":
			return (
				date.toLocaleDateString("en-GB", {
					year: "2-digit",
					month: "2-digit",
					day: "2-digit",
				}) +
				" " +
				date.toLocaleTimeString("en-GB", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				})
			);
		default:
			// Default to DD/MM/YY format
			return date.toLocaleDateString("en-GB", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			});
	}
};

function getPhaseClass(phase) {
	return phase.toLowerCase().replace(/\s+/g, "_");
}

function getUniqueValues(array, property) {
	return [...new Set(array.map((item) => item[property]))];
}

function createElement(tag, className, textContent) {
	return $.create(tag, className, textContent);
}

function createOption(value, text, selected = false) {
	const option = createElement("option");
	option.value = value;
	option.textContent = text;
	if (selected) option.selected = true;
	return option;
}

// Helper function for task status text
const getTaskStatusText = (statusKey) => {
	const statusMap = {
		'todo': I18n.t('modals.tasks.statusTodo'),
		'in-progress': I18n.t('modals.tasks.statusInProgress'), 
		'done': I18n.t('modals.tasks.statusDone')
	};
	return statusMap[statusKey] || statusKey;
};

function updateStaticTexts() {
	// Update header
	$("#appTitle").text(I18n.t("app.title"));

	// Update button
	$("#addAppBtn").text(I18n.t("buttons.addApplication"));

	// Update table headers
	$("#priorityHeader").text(I18n.t("table.headers.priority"));
	$("#companyHeader").text(I18n.t("table.headers.company"));
	$("#positionHeader").text(I18n.t("table.headers.position"));
	$("#currentPhaseHeader").text(I18n.t("table.headers.currentPhase"));
	$("#contactPersonHeader").text(I18n.t("table.headers.contactPerson"));
	$("#salaryRangeHeader").text(I18n.t("table.headers.salaryRange"));
	$("#locationHeader").text(I18n.t("table.headers.location"));
	$("#sourceUrlHeader").text(I18n.t("table.headers.sourceUrl"));
	$("#notesHeader").text(I18n.t("table.headers.notes"));
	$("#tasksHeader").text(I18n.t("table.headers.tasks"));
	$("#actionsHeader").text(I18n.t("table.headers.actions"));

	// Update stats labels
	$("#totalAppsLabel").text(I18n.t("stats.totalApplications"));
	$("#activeAppsLabel").text(I18n.t("stats.active"));
	$("#interviewsLabel").text(I18n.t("stats.interviews"));
	$("#offersLabel").text(I18n.t("stats.offers"));
	$("#rejectionsLabel").text(I18n.t("stats.rejections"));

	// Update footer text
	$("#footerMadeWith").text(I18n.t("footer.madeWith"));
	$("#footerBy").text(I18n.t("footer.by"));
}

// Initialize language switcher
function initializeLanguageSwitcher() {
	console.log("Initializing language switcher...");
	const container = $("#languageSwitcher");
	console.log("Container found:", !!container);
	
	if (container) {
		console.log("Creating language switcher...");
		const switcher = LanguageSwitcher.create();
		console.log("Switcher created:", !!switcher);
		
		container.get().innerHTML = "";
		container.get().appendChild(switcher);
		LanguageSwitcher.init();
		
		console.log("Language switcher initialized");
	} else {
		console.error("Language switcher container not found!");
	}
}

// Global function to update UI language - called when language changes
function updateUILanguage() {
	// Update all static texts
	updateStaticTexts();
	
	// Update language switcher
	if (typeof LanguageSwitcher !== 'undefined') {
		LanguageSwitcher.updateUI();
	}
	
	// Update filter dropdowns with new language
	if (typeof setupFilters === 'function') {
		setupFilters();
	}
	
	// Re-render the table to update all dynamic content
	if (typeof refreshInterface === 'function') {
		refreshInterface();
	}
}