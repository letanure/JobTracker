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

function generateSelectOptions() {
	const statusSelect = document.querySelector('.controls select[onchange*="filterByStatus"]');
	const prioritySelect = document.querySelector('.controls select[onchange*="filterByPriority"]');
	
	// Clear existing options except first
	statusSelect.innerHTML = '<option value="">All Statuses</option>';
	prioritySelect.innerHTML = '<option value="">All Priorities</option>';
	
	// Generate status options
	STATUSES.forEach(status => {
		const option = document.createElement('option');
		option.value = status;
		option.textContent = status;
		statusSelect.appendChild(option);
	});
	
	// Generate priority options
	PRIORITIES.forEach(priority => {
		const option = document.createElement('option');
		option.value = priority;
		option.textContent = `${priority} Priority`;
		prioritySelect.appendChild(option);
	});
}

async function loadJobsData() {
	try {
		const response = await fetch("data.json");
		const data = await response.json();
		jobsData = data.jobs;
		populateTable(jobsData);
		generateSelectOptions();
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
	newRow.innerHTML = `
        <td><span class="priority priority-medium"></span>Medium</td>
        <td class="company-name"><input class="editable" placeholder="Company Name"></td>
        <td><input class="editable" placeholder="Position Title"></td>
        <td class="date"><input class="editable" type="date" value="${new Date().toISOString().split("T")[0]}"></td>
        <td><span class="status status-applied">Applied</span></td>
        <td><input class="editable" placeholder="Current Phase"></td>
        <td><span class="next-task"><input class="editable" placeholder="Next Task"></span></td>
        <td class="date"><input class="editable" type="date"></td>
        <td class="contact"><input class="editable" placeholder="Name & Email"></td>
        <td class="salary"><input class="editable" placeholder="Salary Range"></td>
        <td><input class="editable" placeholder="Location"></td>
        <td class="notes"><input class="editable" placeholder="Notes"></td>
        <td><button onclick="saveRow(this)">Save</button></td>
    `;
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

// Initialize on page load
document.addEventListener("DOMContentLoaded", loadJobsData);
