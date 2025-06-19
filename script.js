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

let jobsData = [];
let originalData = [];

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

function generateHeaderFilters() {
	generatePriorityDropdown();
	generateStatusDropdown();
}

function generatePriorityDropdown() {
	const dropdown = document.getElementById('priorityDropdown');
	dropdown.innerHTML = '';
	
	// Add "All" option
	const allOption = document.createElement('div');
	allOption.className = 'dropdown-option';
	allOption.textContent = 'All Priorities';
	allOption.onclick = () => {
		filterByPriority('');
		closeDropdown('priorityDropdown');
	};
	dropdown.appendChild(allOption);
	
	// Add priority options
	PRIORITIES.forEach(priority => {
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
	
	// Add "All" option
	const allOption = document.createElement('div');
	allOption.className = 'dropdown-option';
	allOption.textContent = 'All Statuses';
	allOption.onclick = () => {
		filterByStatus('');
		closeDropdown('statusDropdown');
	};
	dropdown.appendChild(allOption);
	
	// Add status options
	STATUSES.forEach(status => {
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

async function loadJobsData() {
	try {
		const response = await fetch("data.json");
		const data = await response.json();
		jobsData = data.jobs;
		populateTable(jobsData);
		generateHeaderFilters();
		initializeData();
	} catch (error) {
		console.error("Error loading jobs data:", error);
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
            <td><button onclick="editRow(this)">Edit</button></td>
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
	
	// Fill other cells
	companyCell.innerHTML = '<input class="editable" placeholder="Company Name">';
	positionCell.innerHTML = '<input class="editable" placeholder="Position Title">';
	appliedDateCell.innerHTML = `<input class="editable" type="date" value="${new Date().toISOString().split("T")[0]}">`;
	currentPhaseCell.innerHTML = '<input class="editable" placeholder="Current Phase">';
	nextTaskCell.innerHTML = '<input class="editable" placeholder="Next Task">';
	dueDateCell.innerHTML = '<input class="editable" type="date">';
	contactCell.innerHTML = '<input class="editable" placeholder="Name & Email">';
	salaryCell.innerHTML = '<input class="editable" placeholder="Salary Range">';
	locationCell.innerHTML = '<input class="editable" placeholder="Location">';
	notesCell.innerHTML = '<input class="editable" placeholder="Notes">';
	actionsCell.innerHTML = '<button onclick="saveRow(this)">Save</button>';
	
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

function saveRow(button) {
	const row = button.closest("tr");
	// Save functionality would be implemented here
	button.textContent = "Edit";
	button.onclick = function () {
		editRow(this);
	};
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
