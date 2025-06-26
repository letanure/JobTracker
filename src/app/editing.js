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

// Archive job function
async function archiveJob(job) {
	// Confirm archiving using async confirm dialog
	const confirmed = await confirm(
		I18n.t("messages.confirmArchive", { position: job.position, company: job.company }) ||
			`Are you sure you want to archive the application for ${job.position} at ${job.company}?`
	);

	if (confirmed) {
		// Mark job as archived in original data
		const originalIndex = originalData.findIndex((j) => j.id === job.id);
		if (originalIndex !== -1) {
			originalData[originalIndex].archived = true;
			originalData[originalIndex].archivedAt = new Date().toISOString();

			// Update filtered data to exclude archived jobs
			jobsData = originalData.filter((job) => !job.archived);
			saveToLocalStorage();
			refreshInterface();
		}
	}
}

// Delete job function (kept for compatibility)
async function deleteJob(job) {
	// Redirect to archive instead of delete
	await archiveJob(job);
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
