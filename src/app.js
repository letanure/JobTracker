// ============================================================================
// MAIN APPLICATION LOGIC
// ============================================================================

// Main application initialization
function initializeApp() {
	// Initialize i18n
	I18n.init();
	
	// Always set up UI structure first to prevent blinking
	updateStaticTexts();
	setupEventListeners();
	setupFilters();
	
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

// Edit job function - transforms row into inline edit mode
function editJob(job) {
	const row = document.querySelector(`tr[data-job-id="${job.id}"]`);
	if (!row || row.classList.contains("editing")) return;
	
	// Mark row as editing
	row.classList.add("editing");
	
	// Store original HTML to restore on cancel
	const originalHTML = row.innerHTML;
	
	// Get unique values for autocomplete
	const companies = [...new Set(jobsData.map(j => j.company).filter(Boolean))];
	const positions = [...new Set(jobsData.map(j => j.position).filter(Boolean))];
	const locations = [...new Set(jobsData.map(j => j.location).filter(Boolean))];
	
	// Build inline edit row
	row.innerHTML = `
		<td class="priority-cell">
			<select class="inline-edit priority-select" data-field="priority">
				<option value="high" ${job.priority === "high" ? "selected" : ""}>${I18n.t("priorities.high")}</option>
				<option value="medium" ${job.priority === "medium" ? "selected" : ""}>${I18n.t("priorities.medium")}</option>
				<option value="low" ${job.priority === "low" ? "selected" : ""}>${I18n.t("priorities.low")}</option>
			</select>
		</td>
		<td>
			<input type="text" class="inline-edit" data-field="company" value="${job.company || ""}" 
				list="company-list-${job.id}" placeholder="${I18n.t("table.placeholders.company")}">
			<datalist id="company-list-${job.id}">
				${companies.map(c => `<option value="${c}">`).join("")}
			</datalist>
		</td>
		<td>
			<input type="text" class="inline-edit" data-field="position" value="${job.position || ""}" 
				list="position-list-${job.id}" placeholder="${I18n.t("table.placeholders.position")}">
			<datalist id="position-list-${job.id}">
				${positions.map(p => `<option value="${p}">`).join("")}
			</datalist>
		</td>
		<td>
			<select class="inline-edit phase-select" data-field="currentPhase">
				${PHASES.map(phase => 
					`<option value="${phase}" ${job.currentPhase === phase ? "selected" : ""}>${getPhaseText(phase)}</option>`
				).join("")}
			</select>
		</td>
		<td>
			<input type="text" class="inline-edit" data-field="contactPerson" value="${job.contactPerson || ""}" 
				placeholder="${I18n.t("table.placeholders.contactPerson")}">
			<input type="email" class="inline-edit" data-field="contactEmail" value="${job.contactEmail || ""}" 
				placeholder="${I18n.t("table.placeholders.contactEmail")}" style="margin-top: 4px;">
		</td>
		<td>
			<input type="text" class="inline-edit" data-field="salaryRange" value="${job.salaryRange || ""}" 
				placeholder="${I18n.t("table.placeholders.salaryRange")}">
		</td>
		<td>
			<input type="text" class="inline-edit" data-field="location" value="${job.location || ""}" 
				list="location-list-${job.id}" placeholder="${I18n.t("table.placeholders.location")}">
			<datalist id="location-list-${job.id}">
				${locations.map(l => `<option value="${l}">`).join("")}
			</datalist>
		</td>
		<td class="notes" data-job-id="${job.id}">
			${NotesCount({
				notes: job.notes || [],
				onClick: null, // Will be attached after rendering
			}).outerHTML}
		</td>
		<td class="tasks" data-job-id="${job.id}">
			${TasksCount({
				tasks: job.tasks || [],
				onClick: null, // Will be attached after rendering
			}).outerHTML}
		</td>
		<td class="actions-cell">
			<button class="action-btn save-btn" onclick="saveInlineEdit(${job.id})">
				<span class="material-symbols-outlined">check</span>
			</button>
			<button class="action-btn cancel-btn" onclick="cancelInlineEdit(${job.id}, '${btoa(originalHTML)}')">
				<span class="material-symbols-outlined">close</span>
			</button>
		</td>
	`;
	
	// Focus first input
	const firstInput = row.querySelector('input[data-field="company"]');
	if (firstInput) firstInput.focus();
	
	// Attach click handlers for notes and tasks
	const notesCell = row.querySelector('.notes .notes-count');
	const tasksCell = row.querySelector('.tasks .tasks-count');
	
	if (notesCell) {
		notesCell.addEventListener('click', () => openNotesModal(job));
	}
	
	if (tasksCell) {
		tasksCell.addEventListener('click', () => openTasksModal(job));
	}
	
	// Handle Enter key to save, Escape to cancel
	row.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			saveInlineEdit(job.id);
		} else if (e.key === "Escape") {
			e.preventDefault();
			cancelInlineEdit(job.id, btoa(originalHTML));
		}
	});
}

// Save inline edit
function saveInlineEdit(jobId) {
	const row = document.querySelector(`tr[data-job-id="${jobId}"]`);
	if (!row) return;
	
	const job = jobsData.find(j => j.id === jobId);
	if (!job) return;
	
	// Collect all edited values
	row.querySelectorAll(".inline-edit").forEach(input => {
		const field = input.dataset.field;
		const value = input.value.trim();
		job[field] = value;
	});
	
	// Save and refresh
	saveToLocalStorage();
	refreshInterface();
}

// Cancel inline edit
function cancelInlineEdit(jobId, originalHTMLBase64) {
	const row = document.querySelector(`tr[data-job-id="${jobId}"]`);
	if (!row) return;
	
	// Find the job
	const job = jobsData.find(j => j.id === jobId);
	if (!job) return;
	
	// Check if this is an empty job (new job with no meaningful data)
	const isEmpty = !job.company.trim() && 
					!job.position.trim() && 
					!job.contactPerson.trim() && 
					!job.contactEmail.trim() && 
					!job.salaryRange.trim() && 
					!job.location.trim();
	
	if (isEmpty) {
		// Remove the empty job from data
		const index = jobsData.findIndex(j => j.id === jobId);
		if (index !== -1) {
			jobsData.splice(index, 1);
			originalData = [...jobsData];
			saveToLocalStorage();
			refreshInterface();
		}
	} else {
		// Restore original HTML for non-empty jobs
		row.innerHTML = atob(originalHTMLBase64);
		row.classList.remove("editing");
	}
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