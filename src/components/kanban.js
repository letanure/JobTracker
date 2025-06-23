// ============================================================================
// KANBAN BOARD COMPONENT
// ============================================================================

const KanbanBoard = {
	// Create the kanban board
	create: () => {
		const boardContainer = h("div", { className: "kanban-board" });

		// Create columns for each phase
		PHASES.forEach((phase) => {
			const column = KanbanBoard.createColumn(phase);
			boardContainer.appendChild(column);
		});

		return boardContainer;
	},

	// Create a column for a specific phase
	createColumn: (phase) => {
		const phaseJobs = jobsData.filter((job) => job.currentPhase === phase);
		const columnTitle = getPhaseText(phase);

		const column = h("div", {
			className: "kanban-column",
			"data-phase": phase,
		});

		// Column header with title and count
		const header = h(
			"div",
			{ className: "kanban-column-header" },
			h(
				"div",
				{ className: "kanban-column-title" },
				h("span", { className: "kanban-column-name" }, columnTitle),
				h(
					"div",
					{ className: "kanban-column-actions" },
					// Add "Add Job" button for wishlist column (left of counter)
					phase === "wishlist" && h(
						"button",
						{
							className: "kanban-add-job-btn",
							onclick: () => KanbanBoard.openAddJobModal(),
						},
						h("span", { className: "material-symbols-outlined" }, "add"),
						I18n.t("kanban.addJob") || "Add Job"
					),
					h("span", { className: "kanban-column-count" }, phaseJobs.length.toString())
				)
			)
		);

		// Column body with job cards
		const body = h("div", { className: "kanban-column-body" });

		phaseJobs.forEach((job) => {
			const card = KanbanBoard.createJobCard(job);
			body.appendChild(card);
		});

		// Add drop zone styling
		body.addEventListener("dragover", KanbanBoard.handleDragOver);
		body.addEventListener("drop", (e) => KanbanBoard.handleDrop(e, phase));

		column.appendChild(header);
		column.appendChild(body);

		return column;
	},

	// Create a job card
	createJobCard: (job) => {
		const card = h("div", {
			className: "kanban-job-card",
			draggable: true,
			"data-job-id": job.id,
		});

		// Add drag event listeners
		card.addEventListener("dragstart", (e) => KanbanBoard.handleDragStart(e, job));
		card.addEventListener("dragend", KanbanBoard.handleDragEnd);

		// Priority indicator
		const priorityDot = h("div", {
			className: `kanban-priority-dot priority-${job.priority}`,
		});

		// Company and position header with icon
		const header = h(
			"div",
			{ className: "kanban-job-header" },
			h("span", { className: "material-symbols-outlined kanban-job-icon" }, "business"),
			h(
				"div",
				{ className: "kanban-job-title" },
				h("div", { className: "kanban-job-company" }, job.company),
				h("div", { className: "kanban-job-position" }, job.position)
			)
		);

		// Current phase with substeps progression
		const phaseSection = KanbanBoard.createPhaseSection(job);

		// Job metadata (salary, location)
		const metadata = [];
		if (job.salaryRange) {
			metadata.push(
				h(
					"div",
					{ className: "kanban-metadata-item" },
					h("span", { className: "material-symbols-outlined kanban-metadata-icon" }, "payments"),
					h("span", { className: "kanban-metadata-text" }, job.salaryRange)
				)
			);
		}
		if (job.location) {
			metadata.push(
				h(
					"div",
					{ className: "kanban-metadata-item" },
					h("span", { className: "material-symbols-outlined kanban-metadata-icon" }, "location_on"),
					h("span", { className: "kanban-metadata-text" }, job.location)
				)
			);
		}

		const metadataRow =
			metadata.length > 0 ? h("div", { className: "kanban-job-metadata" }, ...metadata) : null;

		// Action icons with counts (notes, tasks, contacts)
		const notesCount = job.notes ? job.notes.length : 0;
		const tasksCount = job.tasks ? job.tasks.length : 0;
		const contactsCount = job.contacts ? job.contacts.length : 0;

		const actionIcons = h(
			"div",
			{ className: "kanban-action-icons" },
			// Source link icon if sourceUrl exists (first position)
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
			
			h(
				"button",
				{
					className: "kanban-icon-btn",
					title: `Notes (${notesCount})`,
					onclick: (e) => {
						e.stopPropagation();
						openNotesModal(job);
					},
				},
				h("span", { className: "material-symbols-outlined" }, "note"),
				notesCount > 0 && h("span", { className: "kanban-count-badge" }, notesCount.toString())
			),

			h(
				"button",
				{
					className: "kanban-icon-btn",
					title: `Tasks (${tasksCount})`,
					onclick: (e) => {
						e.stopPropagation();
						openTasksModal(job);
					},
				},
				h("span", { className: "material-symbols-outlined" }, "task_alt"),
				tasksCount > 0 && h("span", { className: "kanban-count-badge" }, tasksCount.toString())
			),

			h(
				"button",
				{
					className: "kanban-icon-btn",
					title: `Contacts (${contactsCount})`,
					onclick: (e) => {
						e.stopPropagation();
						openContactsModal(job);
					},
				},
				h("span", { className: "material-symbols-outlined" }, "person"),
				contactsCount > 0 &&
					h("span", { className: "kanban-count-badge" }, contactsCount.toString())
			)
		);

		// Card click handler to view/edit job
		card.addEventListener("click", (e) => {
			// Don't trigger if clicking on action buttons
			if (e.target.closest(".kanban-icon-btn")) {
				return;
			}
			// Handle card click to edit job in modal
			KanbanBoard.openJobEditModal(job);
		});

		// Assemble card
		card.appendChild(priorityDot);
		card.appendChild(header);
		if (phaseSection) card.appendChild(phaseSection);
		if (metadataRow) card.appendChild(metadataRow);
		card.appendChild(actionIcons);

		return card;
	},

	// Create phase section with substep progression
	createPhaseSection: (job) => {
		const currentPhase = job.currentPhase;

		// Don't show phase section for wishlist and rejected_withdrawn items
		if (currentPhase === "wishlist" || currentPhase === "rejected_withdrawn") {
			return null;
		}

		const currentSubstep = job.currentSubstep || currentPhase;
		const completedSubsteps = job.completedSubsteps || [];
		// Use selected substeps for this phase, fallback to all available substeps
		const selectedSubsteps = job.selectedSubsteps?.[currentPhase] || [];
		const availableSubsteps = selectedSubsteps.length > 0 ? selectedSubsteps : getSubstepsForPhase(currentPhase);

		const phaseHeader = h(
			"div",
			{ className: "kanban-phase-header" },
			h("span", { className: "material-symbols-outlined kanban-phase-icon" }, "schedule"),
			h("span", { className: "kanban-phase-text" }, `${getPhaseText(currentPhase)} Stage:`)
		);

		const substepsList = h("div", { className: "kanban-substeps-list" });

		if (availableSubsteps.length > 0) {
			// Show progression through substeps
			availableSubsteps.forEach((substep) => {
				const isCompleted = completedSubsteps.includes(substep);
				const isCurrent = substep === currentSubstep;
				const isPending = !isCompleted && !isCurrent;

				let icon = "radio_button_unchecked"; // Pending
				let className = "kanban-substep-item pending";

				if (isCompleted) {
					icon = "check_circle";
					className = "kanban-substep-item completed";
				} else if (isCurrent) {
					icon = "radio_button_checked";
					className = "kanban-substep-item current";
				}

				const substepItem = h(
					"div",
					{ className },
					h("span", { className: "material-symbols-outlined kanban-substep-icon" }, icon),
					h("span", { className: "kanban-substep-text" }, getSubstepText(substep))
				);

				substepsList.appendChild(substepItem);
			});
		} else {
			// No substeps, just show the phase
			const phaseItem = h(
				"div",
				{ className: "kanban-substep-item current" },
				h(
					"span",
					{ className: "material-symbols-outlined kanban-substep-icon" },
					"radio_button_checked"
				),
				h("span", { className: "kanban-substep-text" }, getPhaseText(currentPhase))
			);
			substepsList.appendChild(phaseItem);
		}

		return h("div", { className: "kanban-phase-section" }, phaseHeader, substepsList);
	},

	// Drag and drop handlers
	handleDragStart: (e, job) => {
		e.dataTransfer.setData("text/plain", job.id.toString());
		e.target.classList.add("dragging");
		document.querySelectorAll(".kanban-column").forEach((col) => {
			col.classList.add("drag-active");
		});
	},

	handleDragEnd: (e) => {
		e.target.classList.remove("dragging");
		document.querySelectorAll(".kanban-column").forEach((col) => {
			col.classList.remove("drag-active", "drag-over");
		});
	},

	handleDragOver: (e) => {
		e.preventDefault();
		const column = e.currentTarget.closest(".kanban-column");
		column.classList.add("drag-over");
	},

	handleDrop: (e, targetPhase) => {
		e.preventDefault();
		const jobId = Number.parseInt(e.dataTransfer.getData("text/plain"));
		const job = jobsData.find((j) => j.id === jobId);

		if (job && job.currentPhase !== targetPhase) {
			// Update job phase
			job.currentPhase = targetPhase;

			// Track when job moves to applied status
			if (targetPhase === "applied" && !job.appliedDate) {
				job.appliedDate = new Date().toISOString();
			}

			// Clear substep if moving to a different phase that doesn't support it
			if (!getSubstepsForPhase(targetPhase).includes(job.currentSubstep)) {
				job.currentSubstep = targetPhase;
			}

			// Save changes
			saveToLocalStorage();

			// Refresh the kanban board
			KanbanBoard.refresh();

			// Also refresh the main table if it's visible
			if (typeof refreshInterface === "function") {
				refreshInterface();
			}
		}

		// Clean up drag styling
		document.querySelectorAll(".kanban-column").forEach((col) => {
			col.classList.remove("drag-active", "drag-over");
		});
	},

	// Create workflow selector component
	createWorkflowSelector: (job) => {
		const workflowContainer = h("div", { className: "workflow-selector" });

		// Create phase sections
		Object.entries(PHASE_SUBSTEPS).forEach(([phase, substeps]) => {
			const selectedSubsteps = job.selectedSubsteps?.[phase] || [];
			const isCurrentPhase = job.currentPhase === phase;
			
			const phaseSection = h(
				"div",
				{ 
					className: `workflow-phase ${isCurrentPhase ? 'current-phase' : ''}`,
					"data-phase": phase
				},
				// Phase header
				h(
					"div",
					{ className: "workflow-phase-header" },
					h(
						"button",
						{
							type: "button",
							className: `workflow-phase-toggle ${selectedSubsteps.length > 0 ? 'has-substeps' : ''}`,
							onclick: (e) => KanbanBoard.togglePhaseExpansion(e, phase),
						},
						h("span", { className: "material-symbols-outlined" }, "expand_more"),
						h("span", { className: "workflow-phase-title" }, getPhaseText(phase)),
						h("span", { className: "workflow-phase-count" }, `${selectedSubsteps.length}/${substeps.length}`)
					)
				),
				// Substeps list (initially collapsed)
				h(
					"div",
					{ 
						className: "workflow-substeps-list",
						style: "display: none;"
					},
					...substeps.map(substep => {
						const isSelected = selectedSubsteps.includes(substep);
						const isCurrent = job.currentSubstep === substep && isCurrentPhase;
						
						return h(
							"div",
							{ 
								className: `workflow-substep-item ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`,
								"data-phase": phase,
								"data-substep": substep
							},
							h(
								"button",
								{
									type: "button",
									className: "workflow-substep-toggle",
									onclick: (e) => {
										if (e.shiftKey) {
											// Shift+click to set as current substep
											KanbanBoard.setCurrentSubstep(e, job, phase, substep);
										} else {
											// Regular click to toggle selection
											KanbanBoard.toggleSubstep(e, job, phase, substep);
										}
									},
								},
								h("span", { className: "material-symbols-outlined" }, isSelected ? "check_circle" : "radio_button_unchecked"),
								h("span", { className: "workflow-substep-text" }, getSubstepText(substep)),
								isCurrent && h("span", { className: "current-indicator" }, "current")
							)
						);
					})
				)
			);
			
			workflowContainer.appendChild(phaseSection);
		});

		return workflowContainer;
	},

	// Toggle phase expansion in workflow selector
	togglePhaseExpansion: (e, phase) => {
		e.preventDefault();
		const phaseElement = e.target.closest('.workflow-phase');
		const substepsList = phaseElement.querySelector('.workflow-substeps-list');
		const toggleIcon = phaseElement.querySelector('.material-symbols-outlined');
		
		if (substepsList.style.display === 'none') {
			substepsList.style.display = 'block';
			toggleIcon.textContent = 'expand_less';
			phaseElement.classList.add('expanded');
		} else {
			substepsList.style.display = 'none';
			toggleIcon.textContent = 'expand_more';
			phaseElement.classList.remove('expanded');
		}
	},

	// Toggle substep selection in workflow selector
	toggleSubstep: (e, job, phase, substep) => {
		e.preventDefault();
		
		// Initialize selectedSubsteps if not exists
		if (!job.selectedSubsteps) {
			job.selectedSubsteps = {};
		}
		if (!job.selectedSubsteps[phase]) {
			job.selectedSubsteps[phase] = [];
		}

		const selectedSubsteps = job.selectedSubsteps[phase];
		const isSelected = selectedSubsteps.includes(substep);
		
		if (isSelected) {
			// Remove substep
			job.selectedSubsteps[phase] = selectedSubsteps.filter(s => s !== substep);
		} else {
			// Add substep
			job.selectedSubsteps[phase].push(substep);
		}

		// Update the visual state
		const substepElement = e.target.closest('.workflow-substep-item');
		const icon = substepElement.querySelector('.material-symbols-outlined');
		
		if (isSelected) {
			substepElement.classList.remove('selected');
			icon.textContent = 'radio_button_unchecked';
		} else {
			substepElement.classList.add('selected');
			icon.textContent = 'check_circle';
		}

		// Update phase counter
		const phaseElement = e.target.closest('.workflow-phase');
		const counter = phaseElement.querySelector('.workflow-phase-count');
		const totalSubsteps = PHASE_SUBSTEPS[phase].length;
		const selectedCount = job.selectedSubsteps[phase].length;
		counter.textContent = `${selectedCount}/${totalSubsteps}`;

		// Update phase toggle styling
		const phaseToggle = phaseElement.querySelector('.workflow-phase-toggle');
		if (selectedCount > 0) {
			phaseToggle.classList.add('has-substeps');
		} else {
			phaseToggle.classList.remove('has-substeps');
		}

		// If this substep was the current one and we're removing it, update current substep
		if (isSelected && job.currentSubstep === substep) {
			// Set to phase name as default
			job.currentSubstep = phase;
			// Update the input field
			const modal = e.target.closest('.modal');
			const substepInput = modal.querySelector('input[name="substep"]');
			if (substepInput) {
				substepInput.value = getPhaseText(phase);
			}
		}

		// Save changes
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex !== -1) {
			Object.assign(jobsData[jobIndex], job);
			saveToLocalStorage();
			KanbanBoard.refresh();
		}
	},

	// Set current substep in workflow selector
	setCurrentSubstep: (e, job, phase, substep) => {
		e.preventDefault();
		
		// Update current phase and substep
		job.currentPhase = phase;
		job.currentSubstep = substep;

		// Update the input fields
		const modal = e.target.closest('.modal');
		const phaseSelect = modal.querySelector('select[name="phase"]');
		const substepInput = modal.querySelector('input[name="substep"]');
		
		if (phaseSelect) {
			phaseSelect.value = phase;
		}
		if (substepInput) {
			substepInput.value = getSubstepText(substep);
		}

		// Update visual state - remove current indicator from all substeps
		const allSubsteps = modal.querySelectorAll('.workflow-substep-item');
		allSubsteps.forEach(item => {
			item.classList.remove('current');
			const indicator = item.querySelector('.current-indicator');
			if (indicator) {
				indicator.remove();
			}
		});

		// Add current indicator to selected substep
		const substepElement = e.target.closest('.workflow-substep-item');
		substepElement.classList.add('current');
		const toggle = substepElement.querySelector('.workflow-substep-toggle');
		if (!toggle.querySelector('.current-indicator')) {
			toggle.appendChild(h("span", { className: "current-indicator" }, "current"));
		}

		// Update current phase highlighting
		const allPhases = modal.querySelectorAll('.workflow-phase');
		allPhases.forEach(phaseEl => phaseEl.classList.remove('current-phase'));
		
		const currentPhaseElement = modal.querySelector(`[data-phase="${phase}"]`);
		if (currentPhaseElement) {
			currentPhaseElement.classList.add('current-phase');
		}

		// Save changes
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex !== -1) {
			Object.assign(jobsData[jobIndex], job);
			saveToLocalStorage();
			KanbanBoard.refresh();
		}
	},

	// Refresh the kanban board
	refresh: () => {
		const boardContainer = document.querySelector(".kanban-board");
		if (boardContainer) {
			// Clear existing content
			boardContainer.innerHTML = "";

			// Recreate columns
			PHASES.forEach((phase) => {
				const column = KanbanBoard.createColumn(phase);
				boardContainer.appendChild(column);
			});
		}
	},

	// Open job editing modal
	openJobEditModal: (job) => {
		const modal = KanbanBoard.createJobEditModal(job);
		document.body.appendChild(modal);
	},

	// Open add job modal
	openAddJobModal: () => {
		// Create a new job object with default values
		const newJob = {
			id: Date.now(),
			priority: "medium",
			company: "",
			position: "",
			appliedDate: new Date().toISOString(),
			currentPhase: "wishlist",
			currentSubstep: "wishlist",
			completedSubsteps: [],
			selectedSubsteps: { ...DEFAULT_SELECTED_SUBSTEPS }, // Pre-populate with default substeps
			salaryRange: "",
			location: "",
			sourceUrl: "",
			notes: [],
			tasks: [],
			contacts: [],
		};

		// Add to jobsData temporarily
		jobsData.push(newJob);

		// Open the edit modal for the new job
		const modal = KanbanBoard.createJobEditModal(newJob);
		modal.classList.add("add-job-modal");
		
		// Modify the modal title
		const title = modal.querySelector(".modal-title");
		if (title) {
			title.textContent = I18n.t("kanban.addJob") || "Add Job";
		}

		document.body.appendChild(modal);
	},

	// Create job editing modal
	createJobEditModal: (job) => {
		const handleSave = async () => {
			const modal = document.querySelector(".kanban-job-edit-modal");
			const form = modal.querySelector("form");

			// Get form values manually
			const updatedJob = {
				...job,
				priority: form.priority.value,
				company: form.company.value.trim(),
				position: form.position.value.trim(),
				currentPhase: form.phase.value,
				currentSubstep: form.substep.value,
				salaryRange: form.salaryRange.value.trim(),
				location: form.location.value.trim(),
				sourceUrl: form.sourceUrl.value.trim(),
			};

			// Selected substeps are already updated in real-time by the workflow selector
			// Just preserve the existing selectedSubsteps
			updatedJob.selectedSubsteps = job.selectedSubsteps || {};

			// Validation
			if (!updatedJob.company || !updatedJob.position) {
				await alert(
					I18n.t("validation.companyPositionRequired") || "Company and position are required"
				);
				return;
			}

			// Update job in data
			const jobIndex = jobsData.findIndex((j) => j.id === job.id);
			if (jobIndex !== -1) {
				// Track when job moves to applied status
				if (
					updatedJob.currentPhase === "applied" &&
					jobsData[jobIndex].currentPhase !== "applied" &&
					!jobsData[jobIndex].appliedDate
				) {
					updatedJob.appliedDate = new Date().toISOString();
				}

				Object.assign(jobsData[jobIndex], updatedJob);
				saveToLocalStorage();

				// Refresh kanban board
				KanbanBoard.refresh();

				// Also refresh main table if visible
				if (typeof refreshInterface === "function") {
					refreshInterface();
				}
			}

			// Close modal
			KanbanBoard.closeJobEditModal();
		};

		const handleClose = () => {
			KanbanBoard.closeJobEditModal();
		};

		// Get unique values for autocomplete
		const companies = [...new Set(jobsData.map((j) => j.company).filter(Boolean))];
		const positions = [...new Set(jobsData.map((j) => j.position).filter(Boolean))];
		const locations = [...new Set(jobsData.map((j) => j.location).filter(Boolean))];

		const modal = h(
			"div",
			{
				className: "modal-overlay kanban-job-edit-modal",
				onclick: (e) => e.target === e.currentTarget && handleClose(),
			},
			h(
				"div",
				{ className: "modal job-edit-modal" },
				h(
					"div",
					{ className: "modal-header" },
					h("h3", { className: "modal-title" }, I18n.t("kanban.editJob") || "Edit Job"),
					h("button", { className: "modal-close", onclick: handleClose }, "×")
				),
				h(
					"div",
					{ className: "modal-body" },
					h(
						"form",
						{ className: "job-edit-form" },
						// Priority row
						h(
							"div",
							{ className: "form-row" },
							h(
								"div",
								{ className: "form-field full-width" },
								h("label", {}, I18n.t("table.headers.priority") || "Priority"),
								h(
									"select",
									{ name: "priority" },
									h("option", { value: "high" }, I18n.t("priorities.high") || "High"),
									h("option", { value: "medium" }, I18n.t("priorities.medium") || "Medium"),
									h("option", { value: "low" }, I18n.t("priorities.low") || "Low")
								)
							)
						),

						// Current Phase and Substep Selection
						h(
							"div",
							{ className: "form-row" },
							h(
								"div",
								{ className: "form-field" },
								h("label", {}, I18n.t("table.headers.currentPhase") || "Current Phase"),
								h(
									"select",
									{ name: "phase" },
									...PHASES.map((phase) => h("option", { value: phase }, getPhaseText(phase)))
								)
							),
							h(
								"div",
								{ className: "form-field" },
								h("label", {}, I18n.t("table.headers.substep") || "Current Substep"),
								h("input", {
									type: "text",
									name: "substep",
									readonly: true,
									placeholder: "Select from workflow below"
								})
							)
						),

						// Workflow Configuration
						h(
							"div",
							{ className: "form-row" },
							h(
								"div",
								{ className: "form-field full-width" },
								h("label", {}, I18n.t("kanban.workflowConfig") || "Workflow Configuration"),
								h("div", { className: "workflow-description" }, I18n.t("kanban.workflowDescription") || "Select and configure the steps for each phase of this job:"),
								KanbanBoard.createWorkflowSelector(job)
							)
						),

						// Company and Position row
						h(
							"div",
							{ className: "form-row" },
							h(
								"div",
								{ className: "form-field" },
								h("label", {}, I18n.t("table.headers.company") || "Company"),
								h("input", {
									type: "text",
									name: "company",
									required: true,
									list: "companies-list",
								}),
								h(
									"datalist",
									{ id: "companies-list" },
									...companies.map((company) => h("option", { value: company }))
								)
							),
							h(
								"div",
								{ className: "form-field" },
								h("label", {}, I18n.t("table.headers.position") || "Position"),
								h("input", {
									type: "text",
									name: "position",
									required: true,
									list: "positions-list",
								}),
								h(
									"datalist",
									{ id: "positions-list" },
									...positions.map((position) => h("option", { value: position }))
								)
							)
						),

						// Salary and Location row
						h(
							"div",
							{ className: "form-row" },
							h(
								"div",
								{ className: "form-field" },
								h("label", {}, I18n.t("table.headers.salaryRange") || "Salary Range"),
								h("input", {
									type: "text",
									name: "salaryRange",
									placeholder: "e.g. $50k - $70k",
								})
							),
							h(
								"div",
								{ className: "form-field" },
								h("label", {}, I18n.t("table.headers.location") || "Location"),
								h("input", {
									type: "text",
									name: "location",
									list: "locations-list",
								}),
								h(
									"datalist",
									{ id: "locations-list" },
									...locations.map((location) => h("option", { value: location }))
								)
							)
						),


						// Source URL
						h(
							"div",
							{ className: "form-row" },
							h(
								"div",
								{ className: "form-field full-width" },
								h("label", {}, I18n.t("table.headers.sourceUrl") || "Source URL"),
								h("input", {
									type: "url",
									name: "sourceUrl",
									placeholder: "https://",
								})
							)
						)
					)
				),
				h(
					"div",
					{ className: "modal-footer" },
					h(
						"button",
						{
							type: "button",
							className: "btn-secondary",
							onclick: handleClose,
						},
						I18n.t("modals.common.cancel") || "Cancel"
					),
					h(
						"button",
						{
							type: "button",
							className: "btn-primary",
							onclick: handleSave,
						},
						I18n.t("modals.common.save") || "Save"
					)
				)
			)
		);

		// Set form values after modal is created
		setTimeout(() => {
			const form = modal.querySelector("form");
			if (form) {
				form.priority.value = job.priority;
				form.phase.value = job.currentPhase;
				form.company.value = job.company;
				form.position.value = job.position;
				form.substep.value = job.currentSubstep ? getSubstepText(job.currentSubstep) : getPhaseText(job.currentPhase);
				form.salaryRange.value = job.salaryRange || "";
				form.location.value = job.location || "";
				form.sourceUrl.value = job.sourceUrl || "";
			}
		}, 0);

		return modal;
	},

	// Close job editing modal
	closeJobEditModal: () => {
		const modal = document.querySelector(".kanban-job-edit-modal");
		if (modal) {
			// If this is an add job modal, check if the job should be removed
			if (modal.classList.contains("add-job-modal")) {
				// Find the job that was being added
				const form = modal.querySelector("form");
				if (form) {
					const company = form.company?.value?.trim() || "";
					const position = form.position?.value?.trim() || "";
					
					// If both company and position are empty, remove the job
					if (!company && !position) {
						// Find the job in jobsData by looking for recent entries with empty fields
						const jobToRemove = jobsData.find(job => 
							!job.company && !job.position && job.currentPhase === "wishlist"
						);
						if (jobToRemove) {
							const index = jobsData.findIndex(j => j.id === jobToRemove.id);
							if (index !== -1) {
								jobsData.splice(index, 1);
								saveToLocalStorage();
								KanbanBoard.refresh();
							}
						}
					}
				}
			}
			modal.remove();
		}
	},

	// Initialize the kanban board in the applications tab
	init: () => {
		const applicationsTab = document.querySelector('.tab-content[data-tab="applications"]');
		if (applicationsTab) {
			// Only clear and initialize if not already initialized
			if (!applicationsTab.querySelector(".kanban-container")) {
				// Clear existing content
				applicationsTab.innerHTML = "";

				// Create board header
				const header = h(
					"div",
					{ className: "tab-header" },
					h("h2", { className: "tab-title" }, I18n.t("kanban.title")),
					h(
						"div",
						{ className: "kanban-stats" },
						h(
							"span",
							{ className: "kanban-total-jobs" },
							I18n.t("kanban.totalJobs", { count: jobsData.length })
						)
					)
				);

				// Create the kanban board
				const board = KanbanBoard.create();

				// Add to container
				const container = h("div", { className: "kanban-container" });
				container.appendChild(header);
				container.appendChild(board);

				applicationsTab.appendChild(container);
			} else {
				// Just refresh the existing board
				KanbanBoard.refresh();
			}
		}
	},
};

// Make kanban board available globally
window.KanbanBoard = KanbanBoard;
