// ============================================================================
// TABLE AND JOB ROW COMPONENTS
// ============================================================================

// Priority cell component
const PriorityCell = ({ priority }) => {
	return h(
		"td",
		{ className: "priority-cell" },
		h("span", { className: `priority priority-${priority}` }),
		getPriorityText(priority)
	);
};

// Job row component
const JobRow = ({ job, onEdit, onDelete }) => {
	const row = h(
		"tr",
		{ "data-job-id": job.id },
		PriorityCell({ priority: job.priority }),
		h("td", { className: "company-name" }, job.company),
		h("td", { className: "position-name" }, job.position),
		h("td", { className: "current-phase" }, getPhaseText(job.currentPhase)),
		h("td", { className: "contact", innerHTML: `${job.contactPerson}<br>${job.contactEmail}` }),
		h("td", { className: "salary" }, job.salaryRange),
		h("td", { className: "location" }, job.location),
		h(
			"td",
			{ className: "notes" },
			NotesCount({
				notes: job.notes || [],
				onClick: () => openNotesModal(job),
			})
		),
		h(
			"td",
			{ className: "tasks" },
			TasksCount({
				tasks: job.tasks || [],
				onClick: () => openTasksModal(job),
			})
		),
		h(
			"td",
			{ className: "actions-cell" },
			h("button", {
				className: "action-btn edit-btn",
				onclick: () => onEdit(job),
				innerHTML: '<span class="material-symbols-outlined">edit</span>'
			}),
			h("button", {
				className: "action-btn delete-btn",
				onclick: () => onDelete(job),
				innerHTML: '<span class="material-symbols-outlined">delete</span>'
			})
		)
	);

	// Double-click to edit
	row.addEventListener("dblclick", () => onEdit(job));

	return row;
};

// Modal close function
const closeModal = () => {
	const modals = document.querySelectorAll(".modal-overlay");
	modals.forEach((modal) => modal.remove());
};