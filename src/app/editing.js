// ============================================================================
// JOB EDITING FUNCTIONS - USING MODAL INTERFACE
// ============================================================================

// Edit job function - opens kanban modal for editing
function editJob(job) {
	// Use the kanban modal for job editing
	if (typeof KanbanBoard !== "undefined" && KanbanBoard.openJobEditModal) {
		KanbanBoard.openJobEditModal(job);
	} else {
		console.error("KanbanBoard not available for job editing");
	}
}

// Delete job function
async function deleteJob(job) {
	// Confirm deletion using async confirm dialog
	const confirmed = await confirm(
		I18n.t("messages.confirmDelete", { position: job.position, company: job.company }) ||
			`Are you sure you want to delete the application for ${job.position} at ${job.company}?`
	);

	if (confirmed) {
		// Remove from array
		const index = jobsData.findIndex((j) => j.id === job.id);
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
	// Use the kanban modal for job creation
	if (typeof KanbanBoard !== "undefined" && KanbanBoard.openAddJobModal) {
		KanbanBoard.openAddJobModal();
	} else {
		console.error("KanbanBoard not available for job creation");
	}
}

// Legacy functions - kept for compatibility but not used with modal interface
function updateSubstepOptions(phaseSelect, jobId) {
	// This function is no longer needed with the modal interface
	// Kept for backward compatibility
	console.warn("updateSubstepOptions is deprecated with modal interface");
}

function saveInlineEdit(jobId) {
	// This function is no longer needed with the modal interface
	// Kept for backward compatibility
	console.warn("saveInlineEdit is deprecated with modal interface");
}

function cancelInlineEdit(jobId) {
	// This function is no longer needed with the modal interface
	// Kept for backward compatibility
	console.warn("cancelInlineEdit is deprecated with modal interface");
}
