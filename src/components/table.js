// ============================================================================
// TABLE AND JOB ROW COMPONENTS
// ============================================================================

// Priority cell component
const PriorityCell = ({ priority }) => {
	return h(
		"td.priority-cell",
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
		h("td.company-name", { title: job.company }, job.company),
		h("td.position-name", { title: job.position }, job.position),
		h(
			"td.current-phase",
			h(
				"div.phase-display",
				h(
					"span.phase-main",
					(() => {
						const phaseText = getPhaseText(job.currentPhase);
						return phaseText && !phaseText.startsWith("phases.") ? phaseText : job.currentPhase;
					})()
				),
				job.currentSubstep && job.currentSubstep !== job.currentPhase
					? h(
							"span.phase-substep",
							(() => {
								const substepText = getSubstepText(job.currentSubstep);
								return substepText && !substepText.startsWith("substeps.")
									? substepText
									: job.currentSubstep;
							})()
						)
					: null
			)
		),
		h("td.salary", { title: job.salaryRange }, job.salaryRange),
		h("td.location", { title: job.location }, job.location),
		h(
			"td.actions-cell",
			(() => {
				const actionIconsChildren = [];

				// Source link icon if sourceUrl exists
				if (job.sourceUrl) {
					actionIconsChildren.push(
						h(
							"a.kanban-icon-btn.kanban-source-link",
							{
								href: job.sourceUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								title: "View job posting",
								onclick: (e) => e.stopPropagation(),
							},
							h("span.material-symbols-outlined", "link")
						)
					);
				}

				// Notes button - exclude archived items
				const notesCount = (job.notes || []).filter((note) => !note.archived).length;
				const notesButton = h(
					"button.kanban-icon-btn",
					{
						title: `Notes (${notesCount})`,
						onclick: (e) => {
							e.stopPropagation();
							openNotesModal(job);
						},
					},
					h("span.material-symbols-outlined", "note")
				);
				if (notesCount > 0) {
					notesButton.appendChild(h("span.kanban-count-badge", notesCount.toString()));
				}
				actionIconsChildren.push(notesButton);

				// Tasks button - exclude archived items
				const tasksCount = (job.tasks || []).filter((task) => !task.archived).length;
				const tasksButton = h(
					"button.kanban-icon-btn",
					{
						title: `Tasks (${tasksCount})`,
						onclick: (e) => {
							e.stopPropagation();
							openTasksModal(job);
						},
					},
					h("span.material-symbols-outlined", "task_alt")
				);
				if (tasksCount > 0) {
					tasksButton.appendChild(h("span.kanban-count-badge", tasksCount.toString()));
				}
				actionIconsChildren.push(tasksButton);

				// Contacts button - exclude archived items
				const contactsCount = (job.contacts || []).filter((contact) => !contact.archived).length;
				const contactsButton = h(
					"button.kanban-icon-btn",
					{
						title: `Contacts (${contactsCount})`,
						onclick: (e) => {
							e.stopPropagation();
							openContactsModal(job);
						},
					},
					h("span.material-symbols-outlined", "person")
				);
				if (contactsCount > 0) {
					contactsButton.appendChild(h("span.kanban-count-badge", contactsCount.toString()));
				}
				actionIconsChildren.push(contactsButton);

				// Edit button
				actionIconsChildren.push(
					h(
						"button.kanban-icon-btn",
						{
							title: "Edit job",
							onclick: (e) => {
								e.stopPropagation();
								onEdit(job);
							},
						},
						h("span.material-symbols-outlined", "edit")
					)
				);

				// Archive button
				actionIconsChildren.push(
					h(
						"button.kanban-icon-btn",
						{
							title: I18n.t("actions.archive") || "Archive job",
							onclick: (e) => {
								e.stopPropagation();
								onDelete(job);
							},
						},
						h("span.material-symbols-outlined", "archive")
					)
				);

				const actionIcons = h("div.kanban-action-icons");
				actionIconsChildren.forEach((child) => actionIcons.appendChild(child));
				return actionIcons;
			})()
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
