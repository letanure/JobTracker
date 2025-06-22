// ============================================================================
// INLINE EDITING FUNCTIONS
// ============================================================================

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
		<td class="phase-cell">
			<select class="inline-edit phase-select" data-field="currentPhase" onchange="updateSubstepOptions(this, ${job.id})">
				${PHASES.map(phase => 
					`<option value="${phase}" ${job.currentPhase === phase ? "selected" : ""}>${getPhaseText(phase)}</option>`
				).join("")}
			</select>
			<select class="inline-edit substep-select" data-field="currentSubstep" id="substep-${job.id}">
				<option value="">${I18n.t("substeps.none")}</option>
				${job.currentPhase && getSubstepsForPhase(job.currentPhase).map(substep => 
					`<option value="${substep}" ${job.currentSubstep === substep ? "selected" : ""}>${getSubstepText(substep)}</option>`
				).join("")}
			</select>
		</td>
		<td class="contact" data-job-id="${job.id}">
			${ContactsCount({
				contacts: job.contacts || [],
				onClick: null, // Will be attached after rendering
			}).outerHTML}
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
		<td>
			<input type="url" class="inline-edit" data-field="sourceUrl" value="${job.sourceUrl || ""}" 
				placeholder="${I18n.t("table.placeholders.sourceUrl")}">
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
	
	// Attach click handlers for notes, tasks, and contacts
	const notesCell = row.querySelector('.notes .notes-count');
	const tasksCell = row.querySelector('.tasks .tasks-count');
	const contactsCell = row.querySelector('.contact .contacts-count');
	
	if (notesCell) {
		notesCell.addEventListener('click', () => openNotesModal(job));
	}
	
	if (tasksCell) {
		tasksCell.addEventListener('click', () => openTasksModal(job));
	}
	
	if (contactsCell) {
		contactsCell.addEventListener('click', () => openContactsModal(job));
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
					!job.location.trim() && 
					!job.sourceUrl.trim();
	
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
		// Instead of restoring HTML (which loses event listeners),
		// we'll refresh the interface to properly recreate the row
		row.classList.remove("editing");
		refreshInterface();
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
		currentSubstep: "",
		completedSubsteps: [],
		contactPerson: "",
		contactEmail: "",
		salaryRange: "",
		location: "",
		sourceUrl: "",
		notes: [],
		tasks: [],
		contacts: []
	};
	
	jobsData.push(newJob);
	originalData = [...jobsData];
	saveToLocalStorage();
	refreshInterface();
	
	// Auto-edit the new row
	setTimeout(() => editJob(newJob), 100);
}

// Function to update substep options when phase changes
function updateSubstepOptions(phaseSelect, jobId) {
	const substepSelect = document.getElementById(`substep-${jobId}`);
	if (!substepSelect) return;
	
	const selectedPhase = phaseSelect.value;
	const substeps = getSubstepsForPhase(selectedPhase);
	
	// Clear current options
	substepSelect.innerHTML = `<option value="">${I18n.t("substeps.none")}</option>`;
	
	// Add substeps for the selected phase
	substeps.forEach(substep => {
		const option = document.createElement('option');
		option.value = substep;
		option.textContent = getSubstepText(substep);
		substepSelect.appendChild(option);
	});
}