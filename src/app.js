// ============================================================================
// MAIN APPLICATION LOGIC
// ============================================================================

// Main application initialization
function initializeApp() {
	// Initialize i18n
	I18n.init();
	
	// Load data from localStorage
	const savedJobs = loadFromLocalStorage();
	
	if (savedJobs && savedJobs.length > 0) {
		jobsData = savedJobs;
		originalData = [...jobsData];
		refreshInterface();
		updateStaticTexts();
	} else {
		// Show welcome message for new users
		const showDemo = confirm(I18n.t("messages.welcome"));
		if (showDemo) {
			jobsData = getDemoData();
			originalData = [...jobsData];
			saveToLocalStorage();
		}
		refreshInterface();
		updateStaticTexts();
	}
	
	setupEventListeners();
	setupFilters();
}

// Setup event listeners
function setupEventListeners() {
	// ESC key to close modals
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			closeModal();
		}
	});
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

// Update statistics
function updateStats(filteredJobs = null) {
	const jobs = filteredJobs || jobsData;
	let total = jobs.length;
	let active = 0;
	let interviews = 0;
	let offers = 0;
	let rejections = 0;

	for (const job of jobs) {
		const phase = job.currentPhase;
		if (phase !== "rejected" && phase !== "withdrawn") active++;
		if (phase === "interview" || phase === "final_round") interviews++;
		if (phase === "offer") offers++;
		if (phase === "rejected") rejections++;
	}

	$("#totalApps").text(total.toString());
	$("#activeApps").text(active.toString());
	$("#interviews").text(interviews.toString());
	$("#offers").text(offers.toString());
	$("#rejections").text(rejections.toString());
}

// Refresh the interface
function refreshInterface() {
	updateStats();
	renderJobTable();
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

// Edit job function
function editJob(job) {
	// For now, just log - full implementation would open edit modal
	console.log("Edit job:", job);
}

// Delete job function  
function deleteJob(job) {
	const confirmed = confirm(
		I18n.t("messages.confirmDelete", {
			position: job.position,
			company: job.company
		})
	);
	
	if (confirmed) {
		const index = jobsData.findIndex(j => j.id === job.id);
		if (index !== -1) {
			jobsData.splice(index, 1);
			originalData = [...jobsData];
			saveToLocalStorage();
			refreshInterface();
		}
	}
}

// Global functions for HTML onclick handlers
function addRow() {
	// Create new job with unique ID
	const newJob = {
		id: Date.now(),
		priority: "medium",
		company: "",
		position: "",
		appliedDate: new Date().toISOString(),
		currentPhase: "wishlist",
		contactPerson: "",
		contactEmail: "",
		salaryRange: "",
		location: "",
		notes: [],
		tasks: []
	};
	
	jobsData.push(newJob);
	originalData = [...jobsData];
	saveToLocalStorage();
	refreshInterface();
	
	// Auto-edit the new row
	setTimeout(() => editJob(newJob), 100);
}

function toggleDropdown(dropdownId) {
	const dropdown = document.getElementById(dropdownId);
	if (!dropdown) return;
	
	// Close all other dropdowns
	document.querySelectorAll('.filter-dropdown').forEach(d => {
		if (d.id !== dropdownId) {
			d.style.display = 'none';
		}
	});
	
	// Toggle this dropdown
	dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function switchTab(tabName) {
	document.querySelectorAll('.tab-button').forEach(btn => {
		btn.classList.remove('active');
	});
	document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
	
	document.querySelectorAll('.tab-content').forEach(content => {
		content.classList.remove('active');
	});
	document.getElementById(`${tabName}Tab`).classList.add('active');
	
	if (tabName === 'kanban') {
		populateKanbanBoard();
	}
}

// Kanban board population (placeholder)
function populateKanbanBoard() {
	// This would populate the kanban board
	console.log("Populating kanban board");
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeApp);
} else {
	initializeApp();
}