// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

// Main application initialization
function initializeApp() {
	// Initialize i18n
	I18n.init();
	
	// Always set up UI structure first to prevent blinking
	updateStaticTexts();
	updateMetaTags(); // Update meta tags for current language
	setupEventListeners();
	setupFilters();
	
	// Initialize components after a short delay to ensure DOM is ready
	setTimeout(() => {
		initializeTabNavigation();
		initializeLanguageSwitcher();
	}, 100);
	
	// Load data from localStorage
	const savedJobs = loadFromLocalStorage();
	
	if (savedJobs && savedJobs.length > 0) {
		jobsData = savedJobs;
		originalData = [...jobsData];
		refreshInterface();
	} else {
		// Show empty interface first
		refreshInterface();
		
		// Show welcome message for new users
		const showDemo = confirm(I18n.t("messages.welcome"));
		if (showDemo) {
			jobsData = getDemoData();
			originalData = [...jobsData];
			saveToLocalStorage();
			refreshInterface();
		}
	}
}

// Setup filter dropdowns
function setupFilters() {
	// Priority filter
	const priorityDropdown = $("#priorityDropdown");
	if (priorityDropdown) {
		populatePriorityFilter();
	}
	
	// Phase filter
	const phaseDropdown = $("#phaseDropdown");
	if (phaseDropdown) {
		populatePhaseFilter();
	}
}

// Populate priority filter
function populatePriorityFilter() {
	const dropdown = $("#priorityDropdown").get();
	if (!dropdown) return;
	
	dropdown.innerHTML = "";
	
	// Add "All Priorities" option
	const allOption = h("div", {
		className: "dropdown-option",
		onclick: () => {
			filterByPriority(null);
			toggleDropdown('priorityDropdown');
		}
	}, I18n.t("table.filters.allPriorities"));
	dropdown.appendChild(allOption);
	
	// Add priority options
	for (const priority of PRIORITIES) {
		const option = h("div", {
			className: "dropdown-option",
			onclick: () => {
				filterByPriority(priority);
				toggleDropdown('priorityDropdown');
			}
		}, getPriorityText(priority));
		dropdown.appendChild(option);
	}
}

// Populate phase filter
function populatePhaseFilter() {
	const dropdown = $("#phaseDropdown").get();
	if (!dropdown) return;
	
	dropdown.innerHTML = "";
	
	// Add "All Phases" option
	const allOption = h("div", {
		className: "dropdown-option",
		onclick: () => {
			filterByPhase(null);
			toggleDropdown('phaseDropdown');
		}
	}, I18n.t("table.filters.allPhases"));
	dropdown.appendChild(allOption);
	
	// Add phase options
	for (const phase of PHASES) {
		const option = h("div", {
			className: "dropdown-option",
			onclick: () => {
				filterByPhase(phase);
				toggleDropdown('phaseDropdown');
			}
		}, getPhaseText(phase));
		dropdown.appendChild(option);
	}
}

// Filter functions
function filterByPriority(priority) {
	if (priority === null) {
		jobsData = [...originalData];
	} else {
		jobsData = originalData.filter(job => job.priority === priority);
	}
	refreshInterface();
}

function filterByPhase(phase) {
	if (phase === null) {
		jobsData = [...originalData];
	} else {
		jobsData = originalData.filter(job => job.currentPhase === phase);
	}
	refreshInterface();
}

// Refresh the interface
function refreshInterface() {
	updateStats();
	renderJobTable();
	
	// Also refresh kanban board if it exists and applications tab is active
	if (typeof KanbanBoard !== 'undefined' && 
		TabNavigation && TabNavigation.activeTab === 'applications') {
		KanbanBoard.refresh();
	}
	
	// Also refresh tasks board if it exists and tasks tab is active
	if (typeof TasksBoard !== 'undefined' && 
		TabNavigation && TabNavigation.activeTab === 'tasks') {
		TasksBoard.refresh();
	}
}

// Render job table
function renderJobTable() {
	const tableBody = $("#jobTableBody");
	if (!tableBody) {
		console.warn("Table body not found - cannot render jobs");
		return;
	}
	
	const tbody = tableBody.get();
	tbody.innerHTML = "";
	
	console.log("Rendering jobs:", jobsData.length);
	
	for (const job of jobsData) {
		try {
			const row = JobRow({
				job,
				onEdit: editJob,
				onDelete: deleteJob
			});
			tbody.appendChild(row);
		} catch (error) {
			console.error("Error rendering job row:", error, job);
		}
	}
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeApp);
} else {
	initializeApp();
}