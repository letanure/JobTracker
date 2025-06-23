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
		h("td", { className: "company-name", title: job.company }, job.company),
		h("td", { className: "position-name", title: job.position }, job.position),
		h(
			"td",
			{ className: "current-phase" },
			h(
				"div",
				{ className: "phase-display" },
				h("span", { className: "phase-main" }, (() => {
					const phaseText = getPhaseText(job.currentPhase);
					return phaseText && !phaseText.startsWith('phases.') ? phaseText : job.currentPhase;
				})()),
				job.currentSubstep && job.currentSubstep !== job.currentPhase
					? h("span", { className: "phase-substep" }, (() => {
						const substepText = getSubstepText(job.currentSubstep);
						return substepText && !substepText.startsWith('substeps.') ? substepText : job.currentSubstep;
					})())
					: null
			)
		),
		h("td", { className: "salary", title: job.salaryRange }, job.salaryRange),
		h("td", { className: "location", title: job.location }, job.location),
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
				innerHTML: '<span class="material-symbols-outlined">edit</span>',
			}),
			h("button", {
				className: "action-btn delete-btn",
				onclick: () => onDelete(job),
				innerHTML: '<span class="material-symbols-outlined">delete</span>',
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
