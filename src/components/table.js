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
		h("td", { className: "current-phase" }, 
			h("div", { className: "phase-display" }, 
				h("span", { className: "phase-main" }, getPhaseText(job.currentPhase)),
				job.currentSubstep ? h("span", { className: "phase-substep" }, getSubstepText(job.currentSubstep)) : null
			)
		),
		h("td", { className: "salary" }, job.salaryRange),
		h("td", { className: "location" }, job.location),
		h("td", { className: "source-url" }, 
			job.sourceUrl ? h("a", { 
				href: job.sourceUrl, 
				target: "_blank", 
				rel: "noopener noreferrer",
				className: "source-link",
				title: job.sourceUrl
			}, h("span", { className: "material-symbols-outlined" }, "open_in_new")) : ""
		),
		h(
			"td",
			{ className: "contact" },
			ContactsCount({
				contacts: job.contacts || [],
				onClick: () => openContactsModal(job),
			})
		),
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