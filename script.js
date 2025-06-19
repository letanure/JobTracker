// ============================================================================
// MINI DOM UTILITY LIBRARY (jQuery-style)
// ============================================================================

const $ = {
	// Get element by ID
	id: (id) => document.getElementById(id),
	
	// Query selector (single element)
	qs: (selector) => document.querySelector(selector),
	
	// Query selector all (multiple elements)
	qsa: (selector) => document.querySelectorAll(selector),
	
	// Create element with optional class and text
	create: (tag, className, textContent) => {
		const element = document.createElement(tag);
		if (className) element.className = className;
		if (textContent) element.textContent = textContent;
		return element;
	},
	
	// Add event listener
	on: (element, event, handler) => element.addEventListener(event, handler),
	
	// Set innerHTML
	html: (element, html) => element.innerHTML = html,
	
	// Set textContent
	text: (element, text) => element.textContent = text,
	
	// Show/hide element
	show: (element) => element.style.display = 'block',
	hide: (element) => element.style.display = 'none',
	
	// Toggle display
	toggle: (element) => {
		const isVisible = element.style.display === 'block';
		element.style.display = isVisible ? 'none' : 'block';
	}
};

// ============================================================================
// MINI DATA PERSISTENCE LIBRARY
// ============================================================================

const DataStore = {
	// Storage key for job tracker data
	STORAGE_KEY: 'jobTrackerData',
	
	// Save data to storage
	save: (data) => {
		try {
			localStorage.setItem(DataStore.STORAGE_KEY, JSON.stringify(data));
			return true;
		} catch (error) {
			console.error('Error saving data:', error);
			return false;
		}
	},
	
	// Load data from storage
	load: () => {
		try {
			const savedData = localStorage.getItem(DataStore.STORAGE_KEY);
			return savedData ? JSON.parse(savedData) : null;
		} catch (error) {
			console.error('Error loading data:', error);
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
			console.error('Error clearing data:', error);
			return false;
		}
	},
	
	// Get storage size (in characters)
	getSize: () => {
		const data = localStorage.getItem(DataStore.STORAGE_KEY);
		return data ? data.length : 0;
	},
	
	// Export data as JSON string (for backup/export features)
	export: () => {
		const data = DataStore.load();
		return data ? JSON.stringify(data, null, 2) : null;
	},
	
	// Import data from JSON string (for restore/import features)
	import: (jsonString) => {
		try {
			const data = JSON.parse(jsonString);
			return DataStore.save(data);
		} catch (error) {
			console.error('Error importing data:', error);
			return false;
		}
	}
};

// ============================================================================
// CONSTANTS AND DATA
// ============================================================================

const STATUSES = [
	"Applied",
	"Phone Screening", 
	"Interview",
	"Final Round",
	"Offer",
	"Rejected",
	"Withdrawn"
];

const PRIORITIES = [
	"High",
	"Medium", 
	"Low"
];

const PHASES = [
	"Application Review",
	"Initial Screening",
	"HR Phone Screen",
	"Recruiter Call",
	"Technical Phone Screen",
	"Coding Challenge",
	"Take-home Assignment",
	"Technical Interview",
	"System Design Interview",
	"Behavioral Interview",
	"Team Interview",
	"Hiring Manager Interview",
	"Panel Interview",
	"Final Round",
	"Reference Check",
	"Background Check",
	"Offer Discussion",
	"Salary Negotiation"
];

// Demo data for first-time users
const DEMO_DATA = [
	{
		id: 1,
		priority: "High",
		company: "TechCorp Inc",
		position: "Senior Software Engineer",
		appliedDate: "2025-06-15",
		status: "Interview",
		currentPhase: "Technical Interview",
		nextTask: "Prepare system design",
		dueDate: "2025-06-22",
		contactPerson: "Sarah Chen",
		contactEmail: "sarah@techcorp.com",
		salaryRange: "$120k - $150k",
		location: "San Francisco, CA",
		notes: "Great culture fit. Need to research their microservices architecture."
	},
	{
		id: 2,
		priority: "Medium",
		company: "StartupXYZ",
		position: "Full Stack Developer",
		appliedDate: "2025-06-12",
		status: "Phone Screening",
		currentPhase: "HR Phone Screen",
		nextTask: "Wait for callback",
		dueDate: "2025-06-20",
		contactPerson: "Mike Rodriguez",
		contactEmail: "hiring@startupxyz.com",
		salaryRange: "$90k - $110k + equity",
		location: "Remote",
		notes: "Early stage startup. High growth potential but risky."
	}
];

let jobsData = [];
let originalData = [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getStatusClass(status) {
	return status.toLowerCase().replace(/\s+/g, '_');
}

function getUniqueValues(array, property) {
	return [...new Set(array.map(item => item[property]))];
}

function createElement(tag, className, textContent) {
	return $.create(tag, className, textContent);
}

function createOption(value, text, selected = false) {
	const option = createElement('option');
	option.value = value;
	option.textContent = text;
	if (selected) option.selected = true;
	return option;
}

function refreshInterface() {
	populateTable(jobsData);
	generateHeaderFilters();
	generateDataLists();
	updateStats();
}

// ============================================================================
// SELECT COMPONENT CREATORS
// ============================================================================

function createStatusSelect(selectedValue = '', includeEmpty = true, className = 'filter-select', onChange = null) {
	const select = createElement('select', className);
	
	if (includeEmpty) {
		select.appendChild(createOption('', 'All Statuses'));
	}
	
	for (const status of STATUSES) {
		select.appendChild(createOption(status, status, status === selectedValue));
	}
	
	if (onChange) {
		select.onchange = onChange;
	}
	
	return select;
}

function createPrioritySelect(selectedValue = '', includeEmpty = true, className = 'filter-select', onChange = null) {
	const select = createElement('select', className);
	
	if (includeEmpty) {
		select.appendChild(createOption('', 'All Priorities'));
	}
	
	for (const priority of PRIORITIES) {
		const text = includeEmpty ? `${priority} Priority` : priority;
		select.appendChild(createOption(priority, text, priority === selectedValue));
	}
	
	if (onChange) {
		select.onchange = onChange;
	}
	
	return select;
}

function createPhaseSelect(selectedValue = '', includeEmpty = true, className = 'filter-select', onChange = null) {
	const select = createElement('select', className);
	
	if (includeEmpty) {
		select.appendChild(createOption('', 'All Phases'));
	}
	
	for (const phase of PHASES) {
		select.appendChild(createOption(phase, phase, phase === selectedValue));
	}
	
	if (onChange) {
		select.onchange = onChange;
	}
	
	return select;
}

// ============================================================================
// DATA PERSISTENCE
// ============================================================================

function saveToLocalStorage() {
	DataStore.save(jobsData);
}

function loadJobsData() {
	try {
		const savedData = DataStore.load();
		let shouldShowDemo = false;
		
		if (savedData) {
			jobsData = savedData;
			if (jobsData.length === 0) {
				shouldShowDemo = true;
			}
		} else {
			shouldShowDemo = true;
			jobsData = [];
		}
		
		if (shouldShowDemo) {
			const userWantsDemoData = confirm(
				"Welcome to Job Search Tracker!\n\n" +
				"Would you like to see 2 example job applications to understand how the tracker works?\n\n" +
				"Click OK to add examples, or Cancel to start with an empty tracker."
			);
			
			if (userWantsDemoData) {
				jobsData = [...DEMO_DATA];
				saveToLocalStorage();
			}
		}
		
		refreshInterface();
		initializeData();
	} catch (error) {
		console.error("Error loading jobs data:", error);
		const userWantsDemoData = confirm(
			"There was an error loading your data.\n\n" +
			"Would you like to start with 2 example job applications?"
		);
		
		jobsData = userWantsDemoData ? [...DEMO_DATA] : [];
		saveToLocalStorage();
		refreshInterface();
		initializeData();
	}
}

// ============================================================================
// DATALIST GENERATORS
// ============================================================================

function createOrUpdateDatalist(id, values) {
	let datalist = $.id(id);
	if (!datalist) {
		datalist = createElement('datalist');
		datalist.id = id;
		document.body.appendChild(datalist);
	}
	
	$.html(datalist, '');
	for (const value of values) {
		datalist.appendChild(createOption(value));
	}
}

function generateDataLists() {
	const existingCompanies = getUniqueValues(jobsData, 'company');
	const existingPositions = getUniqueValues(jobsData, 'position');
	const existingLocations = getUniqueValues(jobsData, 'location');
	
	createOrUpdateDatalist('companiesDatalist', existingCompanies);
	createOrUpdateDatalist('positionsDatalist', existingPositions);
	createOrUpdateDatalist('locationsDatalist', existingLocations);
}

// ============================================================================
// DROPDOWN FILTER GENERATORS
// ============================================================================

function createDropdownOption(text, clickHandler) {
	const option = createElement('div', 'dropdown-option', text);
	option.onclick = clickHandler;
	return option;
}

function generateDropdown(dropdownId, values, filterFunction, allLabel) {
	const dropdown = $.id(dropdownId);
	$.html(dropdown, '');
	
	// Add "All" option
	dropdown.appendChild(createDropdownOption(allLabel, () => {
		filterFunction('');
		closeDropdown(dropdownId);
	}));
	
	// Add value options
	for (const value of values) {
		dropdown.appendChild(createDropdownOption(value, () => {
			filterFunction(value);
			closeDropdown(dropdownId);
		}));
	}
}

function generateHeaderFilters() {
	const existingPriorities = getUniqueValues(jobsData, 'priority');
	const existingStatuses = getUniqueValues(jobsData, 'status');
	const existingPhases = getUniqueValues(jobsData, 'currentPhase');
	
	generateDropdown('priorityDropdown', existingPriorities, filterByPriority, 'All Priorities');
	generateDropdown('statusDropdown', existingStatuses, filterByStatus, 'All Statuses');
	generateDropdown('phaseDropdown', existingPhases, filterByPhase, 'All Phases');
}

// ============================================================================
// DROPDOWN UI CONTROLS
// ============================================================================

function toggleDropdown(dropdownId) {
	const dropdown = $.id(dropdownId);
	const isVisible = dropdown.style.display === 'block';
	
	// Close all dropdowns first
	for (const d of $.qsa('.filter-dropdown')) {
		$.hide(d);
	}
	
	// Toggle the clicked dropdown
	dropdown.style.display = isVisible ? 'none' : 'block';
}

function closeDropdown(dropdownId) {
	$.hide($.id(dropdownId));
}

// ============================================================================
// TABLE MANAGEMENT
// ============================================================================

function populateTable(jobs) {
	const tbody = $.id("jobTableBody");
	$.html(tbody, "");

	for (const job of jobs) {
		const row = tbody.insertRow();
		row.innerHTML = `
            <td class="priority-cell"><span class="priority priority-${job.priority.toLowerCase()}"></span>${job.priority}</td>
            <td class="company-name">${job.company}</td>
            <td>${job.position}</td>
            <td class="date">${job.appliedDate}</td>
            <td><span class="status status-${getStatusClass(job.status)}">${job.status}</span></td>
            <td>${job.currentPhase}</td>
            <td><span class="next-task">${job.nextTask}</span></td>
            <td class="date">${job.dueDate}</td>
            <td class="contact">${job.contactPerson}<br>${job.contactEmail}</td>
            <td class="salary">${job.salaryRange}</td>
            <td>${job.location}</td>
            <td class="notes">${job.notes}</td>
            <td class="actions-cell">
                <button onclick="editRow(this)" class="action-btn edit-btn">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button onclick="deleteJob(${job.id})" class="action-btn delete-btn">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </td>
        `;
        
        // Add double-click event listener to the row
        $.on(row, 'dblclick', function(event) {
            // Don't trigger edit if clicking on action buttons
            if (event.target.closest('.actions-cell')) {
                return;
            }
            
            // Find the edit button and trigger edit
            const editButton = this.querySelector('.edit-btn');
            if (editButton) {
                editRow(editButton);
            }
        });
	}
}

function initializeData() {
	const rows = $.qsa("#jobTableBody tr");
	originalData = Array.from(rows).map((row) => row.innerHTML);
	updateStats();
}

// ============================================================================
// ROW OPERATIONS
// ============================================================================

function addRow() {
	const tbody = $.id("jobTableBody");
	const newRow = tbody.insertRow(0);
	
	// Create and configure cells
	const cells = {
		priority: newRow.insertCell(),
		company: newRow.insertCell(),
		position: newRow.insertCell(),
		appliedDate: newRow.insertCell(),
		status: newRow.insertCell(),
		currentPhase: newRow.insertCell(),
		nextTask: newRow.insertCell(),
		dueDate: newRow.insertCell(),
		contact: newRow.insertCell(),
		salary: newRow.insertCell(),
		location: newRow.insertCell(),
		notes: newRow.insertCell(),
		actions: newRow.insertCell()
	};
	
	// Add CSS classes
	cells.priority.className = 'priority-cell';
	cells.company.className = 'company-name';
	cells.appliedDate.className = 'date';
	cells.dueDate.className = 'date';
	cells.contact.className = 'contact';
	cells.salary.className = 'salary';
	cells.notes.className = 'notes';
	
	// Add form controls
	cells.priority.appendChild(createPrioritySelect('Medium', false, 'editable'));
	cells.status.appendChild(createStatusSelect('Applied', false, 'editable'));
	cells.currentPhase.appendChild(createPhaseSelect('Application Review', false, 'editable'));
	
	// Add input fields
	const inputFields = [
		{ cell: cells.company, placeholder: "Company Name", list: "companiesDatalist" },
		{ cell: cells.position, placeholder: "Position Title", list: "positionsDatalist" },
		{ cell: cells.appliedDate, type: "date", value: new Date().toISOString().split("T")[0] },
		{ cell: cells.nextTask, placeholder: "Next Task" },
		{ cell: cells.dueDate, type: "date" },
		{ cell: cells.contact, placeholder: "Name & Email" },
		{ cell: cells.salary, placeholder: "Salary Range" },
		{ cell: cells.location, placeholder: "Location", list: "locationsDatalist" },
		{ cell: cells.notes, placeholder: "Notes" }
	];
	
	for (const field of inputFields) {
		const input = createElement('input', 'editable');
		input.placeholder = field.placeholder || '';
		if (field.type) input.type = field.type;
		if (field.value) input.value = field.value;
		if (field.list) input.setAttribute('list', field.list);
		field.cell.appendChild(input);
	}
	
	// Add save button
	cells.actions.innerHTML = '<button onclick="saveRow(this)" class="action-btn edit-btn"><span class="material-symbols-outlined">save</span></button>';
	
	updateStats();
}

function getJobIdFromRow(row) {
	const deleteButton = row.querySelector('[onclick*="deleteJob"]');
	return deleteButton ? parseInt(deleteButton.getAttribute('onclick').match(/\d+/)[0]) : null;
}

function editRow(button) {
	const row = button.closest("tr");
	const cells = row.cells;
	const jobId = getJobIdFromRow(row);
	const job = jobsData.find(j => j.id === jobId);
	
	if (!job) return;
	
	// Store original content for cancel functionality
	row.dataset.originalContent = row.innerHTML;
	
	// Convert row to editable form
	cells[0].innerHTML = `<div class="priority-cell">${createPrioritySelect(job.priority, false, 'editable').outerHTML}</div>`;
	cells[1].innerHTML = `<input class="editable" value="${job.company}" list="companiesDatalist">`;
	cells[2].innerHTML = `<input class="editable" value="${job.position}" list="positionsDatalist">`;
	cells[3].innerHTML = `<input class="editable" type="date" value="${job.appliedDate}">`;
	cells[4].innerHTML = `${createStatusSelect(job.status, false, 'editable').outerHTML}`;
	cells[5].innerHTML = `${createPhaseSelect(job.currentPhase, false, 'editable').outerHTML}`;
	cells[6].innerHTML = `<input class="editable" value="${job.nextTask}">`;
	cells[7].innerHTML = `<input class="editable" type="date" value="${job.dueDate}">`;
	cells[8].innerHTML = `<textarea class="editable contact-textarea" placeholder="Name&#10;Email">${job.contactPerson}&#10;${job.contactEmail}</textarea>`;
	cells[9].innerHTML = `<input class="editable" value="${job.salaryRange}">`;
	cells[10].innerHTML = `<input class="editable" value="${job.location}" list="locationsDatalist">`;
	cells[11].innerHTML = `<textarea class="editable notes-textarea">${job.notes}</textarea>`;
	cells[12].innerHTML = `
		<div class="actions-cell">
			<button onclick="saveEditedRow(this, ${jobId})" class="action-btn edit-btn">
				<span class="material-symbols-outlined">save</span>
			</button>
			<button onclick="cancelEdit(this)" class="action-btn cancel-btn">
				<span class="material-symbols-outlined">close</span>
			</button>
		</div>
	`;
}

function extractFormData(cells) {
	const contactText = cells[8].querySelector('textarea').value;
	const contactLines = contactText.split('\n');
	
	return {
		priority: cells[0].querySelector('select').value,
		company: cells[1].querySelector('input').value,
		position: cells[2].querySelector('input').value,
		appliedDate: cells[3].querySelector('input').value,
		status: cells[4].querySelector('select').value,
		currentPhase: cells[5].querySelector('select').value,
		nextTask: cells[6].querySelector('input').value,
		dueDate: cells[7].querySelector('input').value,
		contactPerson: contactLines[0] || '',
		contactEmail: contactLines[1] || '',
		salaryRange: cells[9].querySelector('input').value,
		location: cells[10].querySelector('input').value,
		notes: cells[11].querySelector('textarea').value
	};
}

function saveRow(button) {
	const row = button.closest("tr");
	const cells = row.cells;
	const formData = extractFormData(cells);
	
	const newJob = {
		id: Date.now(),
		...formData
	};
	
	jobsData.unshift(newJob);
	saveToLocalStorage();
	refreshInterface();
}

function saveEditedRow(button, jobId) {
	const row = button.closest("tr");
	const cells = row.cells;
	const jobIndex = jobsData.findIndex(job => job.id === jobId);
	
	if (jobIndex === -1) return;
	
	const formData = extractFormData(cells);
	jobsData[jobIndex] = { ...jobsData[jobIndex], ...formData };
	
	saveToLocalStorage();
	refreshInterface();
}

function cancelEdit(button) {
	const row = button.closest("tr");
	
	if (row.dataset.originalContent) {
		row.innerHTML = row.dataset.originalContent;
		delete row.dataset.originalContent;
	}
}

function deleteJob(jobId) {
	const jobToDelete = jobsData.find(job => job.id === jobId);
	if (!jobToDelete) return;
	
	const confirmed = confirm(`Are you sure you want to delete the application for ${jobToDelete.position} at ${jobToDelete.company}?`);
	
	if (confirmed) {
		jobsData = jobsData.filter(job => job.id !== jobId);
		saveToLocalStorage();
		refreshInterface();
	}
}

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================

function filterByStatus(status) {
	const filteredJobs = status ? jobsData.filter(job => job.status === status) : jobsData;
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

function filterByPriority(priority) {
	const filteredJobs = priority ? jobsData.filter(job => job.priority === priority) : jobsData;
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

function filterByPhase(phase) {
	const filteredJobs = phase ? jobsData.filter(job => job.currentPhase === phase) : jobsData;
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

// ============================================================================
// STATISTICS
// ============================================================================

function updateStats(filteredJobs = null) {
	const jobs = filteredJobs || jobsData;
	let total = jobs.length;
	let active = 0;
	let interviews = 0;
	let offers = 0;
	let rejections = 0;
	
	for (const job of jobs) {
		const status = job.status;
		if (status !== "Rejected" && status !== "Withdrawn") active++;
		if (status.includes("Interview") || status === "Final Round") interviews++;
		if (status === "Offer") offers++;
		if (status === "Rejected") rejections++;
	}
	
	$.text($.id("totalApps"), total);
	$.text($.id("activeApps"), active);
	$.text($.id("interviews"), interviews);
	$.text($.id("offers"), offers);
	$.text($.id("rejections"), rejections);
}

// ============================================================================
// EVENT LISTENERS AND INITIALIZATION
// ============================================================================

// Close dropdowns when clicking outside
$.on(document, 'click', function(event) {
	if (!event.target.closest('.header-with-filter')) {
		for (const dropdown of $.qsa('.filter-dropdown')) {
			$.hide(dropdown);
		}
	}
});

// Initialize on page load
$.on(document, "DOMContentLoaded", loadJobsData);