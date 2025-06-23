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
			{ className: "actions-cell" },
			h(
				"div",
				{ className: "kanban-action-icons" },
				// Source link icon if sourceUrl exists  
				job.sourceUrl && h(
					"a",
					{
						className: "kanban-icon-btn kanban-source-link",
						href: job.sourceUrl,
						target: "_blank",
						rel: "noopener noreferrer",
						title: "View job posting",
						onclick: (e) => e.stopPropagation(),
					},
					h("span", { className: "material-symbols-outlined" }, "link")
				),
				
				// Notes icon with counter
				h(
					"button",
					{
						className: "kanban-icon-btn",
						title: `Notes (${(job.notes || []).length})`,
						onclick: (e) => {
							e.stopPropagation();
							openNotesModal(job);
						},
					},
					h("span", { className: "material-symbols-outlined" }, "note"),
					(job.notes || []).length > 0 && h("span", { className: "kanban-count-badge" }, (job.notes || []).length.toString())
				),
				
				// Tasks icon with counter  
				h(
					"button",
					{
						className: "kanban-icon-btn",
						title: `Tasks (${(job.tasks || []).length})`,
						onclick: (e) => {
							e.stopPropagation();
							openTasksModal(job);
						},
					},
					h("span", { className: "material-symbols-outlined" }, "task_alt"),
					(job.tasks || []).length > 0 && h("span", { className: "kanban-count-badge" }, (job.tasks || []).length.toString())
				),
				
				// Contacts icon with counter
				h(
					"button",
					{
						className: "kanban-icon-btn",
						title: `Contacts (${(job.contacts || []).length})`,
						onclick: (e) => {
							e.stopPropagation();
							openContactsModal(job);
						},
					},
					h("span", { className: "material-symbols-outlined" }, "person"),
					(job.contacts || []).length > 0 && h("span", { className: "kanban-count-badge" }, (job.contacts || []).length.toString())
				),
				
				// Edit button
				h("button", {
					className: "kanban-icon-btn",
					title: "Edit job",
					onclick: (e) => {
						e.stopPropagation();
						onEdit(job);
					},
				}, h("span", { className: "material-symbols-outlined" }, "edit")),
				
				// Delete button
				h("button", {
					className: "kanban-icon-btn",
					title: "Delete job", 
					onclick: (e) => {
						e.stopPropagation();
						onDelete(job);
					},
				}, h("span", { className: "material-symbols-outlined" }, "delete"))
			)
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
