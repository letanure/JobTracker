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

let jobsData = [];
let originalData = [];

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

function createStatusSelect(selectedValue = '', includeEmpty = true, className = 'filter-select', onChange = null) {
	const select = document.createElement('select');
	select.className = className;
	
	if (includeEmpty) {
		const emptyOption = document.createElement('option');
		emptyOption.value = '';
		emptyOption.textContent = 'All Statuses';
		select.appendChild(emptyOption);
	}
	
	STATUSES.forEach(status => {
		const option = document.createElement('option');
		option.value = status;
		option.textContent = status;
		if (status === selectedValue) {
			option.selected = true;
		}
		select.appendChild(option);
	});
	
	if (onChange) {
		select.onchange = onChange;
	}
	
	return select;
}

function createPrioritySelect(selectedValue = '', includeEmpty = true, className = 'filter-select', onChange = null) {
	const select = document.createElement('select');
	select.className = className;
	
	if (includeEmpty) {
		const emptyOption = document.createElement('option');
		emptyOption.value = '';
		emptyOption.textContent = 'All Priorities';
		select.appendChild(emptyOption);
	}
	
	PRIORITIES.forEach(priority => {
		const option = document.createElement('option');
		option.value = priority;
		option.textContent = includeEmpty ? `${priority} Priority` : priority;
		if (priority === selectedValue) {
			option.selected = true;
		}
		select.appendChild(option);
	});
	
	if (onChange) {
		select.onchange = onChange;
	}
	
	return select;
}

function createPhaseSelect(selectedValue = '', includeEmpty = true, className = 'filter-select', onChange = null) {
	const select = document.createElement('select');
	select.className = className;
	
	if (includeEmpty) {
		const emptyOption = document.createElement('option');
		emptyOption.value = '';
		emptyOption.textContent = 'All Phases';
		select.appendChild(emptyOption);
	}
	
	PHASES.forEach(phase => {
		const option = document.createElement('option');
		option.value = phase;
		option.textContent = phase;
		if (phase === selectedValue) {
			option.selected = true;
		}
		select.appendChild(option);
	});
	
	if (onChange) {
		select.onchange = onChange;
	}
	
	return select;
}

function generateDataLists() {
	// Get unique values from existing jobs
	const existingCompanies = [...new Set(jobsData.map(job => job.company))];
	const existingPositions = [...new Set(jobsData.map(job => job.position))];
	const existingLocations = [...new Set(jobsData.map(job => job.location))];
	
	// Generate company datalist
	let companyDatalist = document.getElementById('companiesDatalist');
	if (!companyDatalist) {
		companyDatalist = document.createElement('datalist');
		companyDatalist.id = 'companiesDatalist';
		document.body.appendChild(companyDatalist);
	}
	companyDatalist.innerHTML = '';
	existingCompanies.forEach(company => {
		const option = document.createElement('option');
		option.value = company;
		companyDatalist.appendChild(option);
	});
	
	// Generate position datalist
	let positionDatalist = document.getElementById('positionsDatalist');
	if (!positionDatalist) {
		positionDatalist = document.createElement('datalist');
		positionDatalist.id = 'positionsDatalist';
		document.body.appendChild(positionDatalist);
	}
	positionDatalist.innerHTML = '';
	existingPositions.forEach(position => {
		const option = document.createElement('option');
		option.value = position;
		positionDatalist.appendChild(option);
	});
	
	// Generate location datalist
	let locationDatalist = document.getElementById('locationsDatalist');
	if (!locationDatalist) {
		locationDatalist = document.createElement('datalist');
		locationDatalist.id = 'locationsDatalist';
		document.body.appendChild(locationDatalist);
	}
	locationDatalist.innerHTML = '';
	existingLocations.forEach(location => {
		const option = document.createElement('option');
		option.value = location;
		locationDatalist.appendChild(option);
	});
}

function generateHeaderFilters() {
	generatePriorityDropdown();
	generateStatusDropdown();
	generatePhaseDropdown();
}

function generatePriorityDropdown() {
	const dropdown = document.getElementById('priorityDropdown');
	dropdown.innerHTML = '';
	
	// Get unique priorities from current data
	const existingPriorities = [...new Set(jobsData.map(job => job.priority))];
	
	// Add "All" option
	const allOption = document.createElement('div');
	allOption.className = 'dropdown-option';
	allOption.textContent = 'All Priorities';
	allOption.onclick = () => {
		filterByPriority('');
		closeDropdown('priorityDropdown');
	};
	dropdown.appendChild(allOption);
	
	// Add only existing priority options
	existingPriorities.forEach(priority => {
		const option = document.createElement('div');
		option.className = 'dropdown-option';
		option.textContent = priority;
		option.onclick = () => {
			filterByPriority(priority);
			closeDropdown('priorityDropdown');
		};
		dropdown.appendChild(option);
	});
}

function generateStatusDropdown() {
	const dropdown = document.getElementById('statusDropdown');
	dropdown.innerHTML = '';
	
	// Get unique statuses from current data
	const existingStatuses = [...new Set(jobsData.map(job => job.status))];
	
	// Add "All" option
	const allOption = document.createElement('div');
	allOption.className = 'dropdown-option';
	allOption.textContent = 'All Statuses';
	allOption.onclick = () => {
		filterByStatus('');
		closeDropdown('statusDropdown');
	};
	dropdown.appendChild(allOption);
	
	// Add only existing status options
	existingStatuses.forEach(status => {
		const option = document.createElement('div');
		option.className = 'dropdown-option';
		option.textContent = status;
		option.onclick = () => {
			filterByStatus(status);
			closeDropdown('statusDropdown');
		};
		dropdown.appendChild(option);
	});
}

function generatePhaseDropdown() {
	const dropdown = document.getElementById('phaseDropdown');
	dropdown.innerHTML = '';
	
	// Get unique phases from current data
	const existingPhases = [...new Set(jobsData.map(job => job.currentPhase))];
	
	// Add "All" option
	const allOption = document.createElement('div');
	allOption.className = 'dropdown-option';
	allOption.textContent = 'All Phases';
	allOption.onclick = () => {
		filterByPhase('');
		closeDropdown('phaseDropdown');
	};
	dropdown.appendChild(allOption);
	
	// Add only existing phase options
	existingPhases.forEach(phase => {
		const option = document.createElement('div');
		option.className = 'dropdown-option';
		option.textContent = phase;
		option.onclick = () => {
			filterByPhase(phase);
			closeDropdown('phaseDropdown');
		};
		dropdown.appendChild(option);
	});
}

function toggleDropdown(dropdownId) {
	const dropdown = document.getElementById(dropdownId);
	const isVisible = dropdown.style.display === 'block';
	
	// Close all dropdowns first
	document.querySelectorAll('.filter-dropdown').forEach(d => {
		d.style.display = 'none';
	});
	
	// Toggle the clicked dropdown
	dropdown.style.display = isVisible ? 'none' : 'block';
}

function closeDropdown(dropdownId) {
	document.getElementById(dropdownId).style.display = 'none';
}

function saveToLocalStorage() {
	localStorage.setItem('jobTrackerData', JSON.stringify(jobsData));
}

function loadJobsData() {
	try {
		const savedData = localStorage.getItem('jobTrackerData');
		
		if (savedData) {
			jobsData = JSON.parse(savedData);
		} else {
			// First time user - load demo data
			jobsData = [...DEMO_DATA];
			saveToLocalStorage();
		}
		
		populateTable(jobsData);
		generateHeaderFilters();
		generateDataLists();
		initializeData();
	} catch (error) {
		console.error("Error loading jobs data:", error);
		// Fallback to demo data if localStorage is corrupted
		jobsData = [...DEMO_DATA];
		saveToLocalStorage();
		populateTable(jobsData);
		generateHeaderFilters();
		generateDataLists();
		initializeData();
	}
}

function populateTable(jobs) {
	const tbody = document.getElementById("jobTableBody");
	tbody.innerHTML = "";

	jobs.forEach((job) => {
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
	});
}

function getStatusClass(status) {
	return status.toLowerCase().replace(/\s+/g, '_');
}

function initializeData() {
	const rows = document.querySelectorAll("#jobTableBody tr");
	originalData = Array.from(rows).map((row) => row.innerHTML);
	updateStats();
}

function addRow() {
	const tbody = document.getElementById("jobTableBody");
	const newRow = tbody.insertRow(0);
	
	// Create cells
	const priorityCell = newRow.insertCell();
	const companyCell = newRow.insertCell();
	const positionCell = newRow.insertCell();
	const appliedDateCell = newRow.insertCell();
	const statusCell = newRow.insertCell();
	const currentPhaseCell = newRow.insertCell();
	const nextTaskCell = newRow.insertCell();
	const dueDateCell = newRow.insertCell();
	const contactCell = newRow.insertCell();
	const salaryCell = newRow.insertCell();
	const locationCell = newRow.insertCell();
	const notesCell = newRow.insertCell();
	const actionsCell = newRow.insertCell();
	
	// Add classes
	priorityCell.className = 'priority-cell';
	companyCell.className = 'company-name';
	appliedDateCell.className = 'date';
	dueDateCell.className = 'date';
	contactCell.className = 'contact';
	salaryCell.className = 'salary';
	notesCell.className = 'notes';
	
	// Create priority select
	const prioritySelect = createPrioritySelect('Medium', false, 'editable');
	priorityCell.appendChild(prioritySelect);
	
	// Create status select  
	const statusSelect = createStatusSelect('Applied', false, 'editable');
	statusCell.appendChild(statusSelect);
	
	// Create phase select
	const phaseSelect = createPhaseSelect('Application Review', false, 'editable');
	currentPhaseCell.appendChild(phaseSelect);
	
	// Fill other cells
	companyCell.innerHTML = '<input class="editable" placeholder="Company Name" list="companiesDatalist">';
	positionCell.innerHTML = '<input class="editable" placeholder="Position Title" list="positionsDatalist">';
	appliedDateCell.innerHTML = `<input class="editable" type="date" value="${new Date().toISOString().split("T")[0]}">`;
	nextTaskCell.innerHTML = '<input class="editable" placeholder="Next Task">';
	dueDateCell.innerHTML = '<input class="editable" type="date">';
	contactCell.innerHTML = '<input class="editable" placeholder="Name & Email">';
	salaryCell.innerHTML = '<input class="editable" placeholder="Salary Range">';
	locationCell.innerHTML = '<input class="editable" placeholder="Location" list="locationsDatalist">';
	notesCell.innerHTML = '<input class="editable" placeholder="Notes">';
	actionsCell.innerHTML = '<button onclick="saveRow(this)" class="action-btn edit-btn"><span class="material-symbols-outlined">save</span></button>';
	
	updateStats();
}

function editRow(button) {
	const row = button.closest("tr");
	const cells = row.querySelectorAll("td");

	// Make cells editable (simplified for demo)
	alert(
		"Edit functionality would be implemented here. In a real app, you would make cells editable or open a modal.",
	);
}

function deleteJob(jobId) {
	const jobToDelete = jobsData.find(job => job.id === jobId);
	if (!jobToDelete) return;
	
	const confirmed = confirm(`Are you sure you want to delete the application for ${jobToDelete.position} at ${jobToDelete.company}?`);
	
	if (confirmed) {
		// Remove from jobsData
		jobsData = jobsData.filter(job => job.id !== jobId);
		
		// Save to localStorage
		saveToLocalStorage();
		
		// Refresh the interface
		populateTable(jobsData);
		generateHeaderFilters();
		generateDataLists();
		updateStats();
	}
}

function saveRow(button) {
	const row = button.closest("tr");
	const cells = row.cells;
	
	// Get values from the row
	const prioritySelect = cells[0].querySelector('select');
	const statusSelect = cells[4].querySelector('select');
	const phaseSelect = cells[5].querySelector('select');
	
	const newJob = {
		id: Date.now(), // Simple ID generation
		priority: prioritySelect ? prioritySelect.value : 'Medium',
		company: cells[1].querySelector('input').value,
		position: cells[2].querySelector('input').value,
		appliedDate: cells[3].querySelector('input').value,
		status: statusSelect ? statusSelect.value : 'Applied',
		currentPhase: phaseSelect ? phaseSelect.value : 'Application Review',
		nextTask: cells[6].querySelector('input').value,
		dueDate: cells[7].querySelector('input').value,
		contactPerson: cells[8].querySelector('input').value.split('\\n')[0] || '',
		contactEmail: cells[8].querySelector('input').value.split('\\n')[1] || '',
		salaryRange: cells[9].querySelector('input').value,
		location: cells[10].querySelector('input').value,
		notes: cells[11].querySelector('input').value
	};
	
	// Add to jobsData and save
	jobsData.unshift(newJob);
	saveToLocalStorage();
	
	// Refresh the table and filters
	populateTable(jobsData);
	generateHeaderFilters();
	generateDataLists();
	updateStats();
}

function filterByStatus(status) {
	let filteredJobs = jobsData;
	if (status) {
		filteredJobs = jobsData.filter((job) => job.status === status);
	}
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

function filterByPriority(priority) {
	let filteredJobs = jobsData;
	if (priority) {
		filteredJobs = jobsData.filter((job) => job.priority === priority);
	}
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

function filterByPhase(phase) {
	let filteredJobs = jobsData;
	if (phase) {
		filteredJobs = jobsData.filter((job) => job.currentPhase === phase);
	}
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

function updateStats(filteredJobs = null) {
	const jobs = filteredJobs || jobsData;
	let total = jobs.length;
	let active = 0;
	let interviews = 0;
	let offers = 0;
	let rejections = 0;

	jobs.forEach((job) => {
		const status = job.status;
		if (status !== "Rejected" && status !== "Withdrawn") active++;
		if (status.includes("Interview") || status === "Final Round") interviews++;
		if (status === "Offer") offers++;
		if (status === "Rejected") rejections++;
	});

	document.getElementById("totalApps").textContent = total;
	document.getElementById("activeApps").textContent = active;
	document.getElementById("interviews").textContent = interviews;
	document.getElementById("offers").textContent = offers;
	document.getElementById("rejections").textContent = rejections;
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
	if (!event.target.closest('.header-with-filter')) {
		document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
			dropdown.style.display = 'none';
		});
	}
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", loadJobsData);
