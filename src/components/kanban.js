// ============================================================================
// KANBAN BOARD COMPONENT
// ============================================================================

const KanbanBoard = {
	// Create the kanban board
	createBoard: () => {
		const boardContainer = h("div.kanban-board");

		// Create columns for each phase
		PHASES.forEach((phase) => {
			const column = KanbanBoard.createColumn(phase);
			boardContainer.appendChild(column);
		});

		return boardContainer;
	},

	// Create a column for a specific phase
	createColumn: (phase) => {
		const phaseJobs = jobsData
			.filter((job) => job.currentPhase === phase)
			.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)); // Sort by sortOrder within phase
		const columnTitle = getPhaseText(phase);

		const column = h("div.kanban-column", {
			"data-phase": phase,
		});

		// Column header with title and count
		const header = h(
			"div.kanban-column-header",
			h(
				"div.kanban-column-title",
				h("span.kanban-column-name", columnTitle),
				h(
					"div.kanban-column-actions",
					// Add "Add Job" button for wishlist column (left of counter)
					phase === "wishlist" &&
						h(
							"button.kanban-add-job-btn",
							{
								onclick: () => KanbanBoard.openAddJobModal(),
							},
							h("span.material-symbols-outlined", "add"),
							I18n.t("kanban.addJob") || "Add Job"
						),
					h("span.kanban-column-count", phaseJobs.length.toString())
				)
			)
		);

		// Column body with job cards
		const body = h("div.kanban-column-body");

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
		const card = h("div.kanban-job-card", {
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
			"div.kanban-job-header",
			h("span.material-symbols-outlined kanban-job-icon", "business"),
			h(
				"div.kanban-job-title",
				h("div.kanban-job-company", job.company),
				h("div.kanban-job-position", job.position)
			)
		);

		// Current phase with substeps progression
		const phaseSection = KanbanBoard.createPhaseSection(job);

		// Job metadata (salary, location)
		const metadata = [];
		if (job.salaryRange) {
			metadata.push(
				h(
					"div.kanban-metadata-item",
					h("span.material-symbols-outlined kanban-metadata-icon", "payments"),
					h("span.kanban-metadata-text", job.salaryRange)
				)
			);
		}
		if (job.location) {
			metadata.push(
				h(
					"div.kanban-metadata-item",
					h("span.material-symbols-outlined kanban-metadata-icon", "location_on"),
					h("span.kanban-metadata-text", job.location)
				)
			);
		}

		const metadataRow = metadata.length > 0 ? h("div.kanban-job-metadata", ...metadata) : null;

		// Action icons with counts (notes, tasks, contacts) - exclude archived items
		const notesCount = job.notes ? job.notes.filter((note) => !note.archived).length : 0;
		const tasksCount = job.tasks ? job.tasks.filter((task) => !task.archived).length : 0;
		const contactsCount = job.contacts
			? job.contacts.filter((contact) => !contact.archived).length
			: 0;

		const actionIconsChildren = [];

		// Source link icon if sourceUrl exists (first position)
		if (job.sourceUrl) {
			actionIconsChildren.push(
				h(
					"a.kanban-icon-btn.kanban-source-link",
					{
						href: job.sourceUrl,
						target: "_blank",
						rel: "noopener noreferrer",
						title: I18n.t("tooltips.viewJobPosting"),
						onclick: (e) => e.stopPropagation(),
					},
					h("span.material-symbols-outlined", "link")
				)
			);
		}

		// Notes button
		const notesButton = h(
			"button.kanban-icon-btn",
			{
				title: I18n.t("table.countFormat.notes", { count: notesCount }),
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

		// Tasks button
		const tasksButton = h(
			"button.kanban-icon-btn",
			{
				title: I18n.t("table.countFormat.tasks", { count: tasksCount }),
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

		// Contacts button
		const contactsButton = h(
			"button.kanban-icon-btn",
			{
				title: I18n.t("table.countFormat.contacts", { count: contactsCount }),
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

		const actionIcons = h("div.kanban-action-icons");
		actionIconsChildren.forEach((child) => actionIcons.appendChild(child));

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
		const availableSubsteps =
			selectedSubsteps.length > 0 ? selectedSubsteps : getSubstepsForPhase(currentPhase);

		const phaseHeader = h(
			"div.kanban-phase-header",
			h("span.material-symbols-outlined kanban-phase-icon", "schedule"),
			h("span.kanban-phase-text", `${getPhaseText(currentPhase)} ${I18n.t("kanban.stage")}`)
		);

		const substepsList = h("div.kanban-substeps-list");

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
					h("span.material-symbols-outlined kanban-substep-icon", icon),
					h("span.kanban-substep-text", getSubstepText(substep))
				);

				substepsList.appendChild(substepItem);
			});
		} else {
			// No substeps, just show the phase
			const phaseItem = h(
				"div.kanban-substep-item current",
				h("span.material-symbols-outlined kanban-substep-icon", "radio_button_checked"),
				h("span.kanban-substep-text", getPhaseText(currentPhase))
			);
			substepsList.appendChild(phaseItem);
		}

		return h("div.kanban-phase-section", phaseHeader, substepsList);
	},

	// Drag and drop handlers
	handleDragStart: (e, job) => {
		e.dataTransfer.setData(
			"text/plain",
			JSON.stringify({
				jobId: job.id,
				sourcePhase: job.currentPhase,
				sourceSortOrder: job.sortOrder || 0,
			})
		);
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

		// Clean up all drop indicators and placeholders
		document.querySelectorAll(".drop-indicator, .drop-placeholder").forEach((element) => {
			element.remove();
		});
	},

	handleDragOver: (e) => {
		e.preventDefault();
		const column = e.currentTarget.closest(".kanban-column");
		column.classList.add("drag-over");

		// Add visual drop indicator
		KanbanBoard.updateDropIndicator(e);
	},

	// Add visual placeholder showing where the card will be dropped
	updateDropIndicator: (e) => {
		const columnBody = e.currentTarget;
		const cards = Array.from(columnBody.children).filter(
			(card) => card.classList.contains("kanban-job-card") && !card.classList.contains("dragging")
		);

		// Remove existing drop placeholders and indicators
		columnBody.querySelectorAll(".drop-indicator, .drop-placeholder").forEach((placeholder) => {
			placeholder.remove();
		});

		const mouseY = e.clientY;
		let insertIndex = cards.length;

		// Find insertion point
		for (let i = 0; i < cards.length; i++) {
			const cardRect = cards[i].getBoundingClientRect();
			const cardCenter = cardRect.top + cardRect.height / 2;

			if (mouseY < cardCenter) {
				insertIndex = i;
				break;
			}
		}

		// Create placeholder card that matches the dragged card's size
		const placeholder = h(
			"div.drop-placeholder.kanban-job-card",
			{},
			h("div.drop-placeholder-content", {}, I18n.t("kanban.dropHere"))
		);

		if (insertIndex === cards.length) {
			// Insert at the end
			columnBody.appendChild(placeholder);
		} else {
			// Insert before the card at insertIndex
			columnBody.insertBefore(placeholder, cards[insertIndex]);
		}
	},

	handleDrop: (e, targetPhase) => {
		e.preventDefault();

		try {
			const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
			const { jobId, sourcePhase } = dragData;
			const job = jobsData.find((j) => j.id === jobId);

			if (!job) return;

			// Calculate drop position based on placeholder location
			const columnBody = e.currentTarget;
			const placeholder = columnBody.querySelector(".drop-placeholder");

			let targetPosition = 0;

			if (placeholder) {
				// Find the position of the placeholder among actual job cards
				const allCards = Array.from(columnBody.children);
				const placeholderIndex = allCards.indexOf(placeholder);

				// Count how many actual job cards are before the placeholder
				targetPosition = 0;
				for (let i = 0; i < placeholderIndex; i++) {
					if (
						allCards[i].classList.contains("kanban-job-card") &&
						!allCards[i].classList.contains("drop-placeholder") &&
						!allCards[i].classList.contains("dragging")
					) {
						targetPosition++;
					}
				}
			} else {
				// Fallback: use mouse position if no placeholder found
				const cards = Array.from(columnBody.children).filter(
					(card) =>
						card.classList.contains("kanban-job-card") &&
						!card.classList.contains("dragging") &&
						!card.classList.contains("drop-placeholder")
				);

				const mouseY = e.clientY;
				targetPosition = cards.length;

				for (let i = 0; i < cards.length; i++) {
					const cardRect = cards[i].getBoundingClientRect();
					const cardCenter = cardRect.top + cardRect.height / 2;

					if (mouseY < cardCenter) {
						targetPosition = i;
						break;
					}
				}
			}

			// Handle phase change or reordering
			if (sourcePhase !== targetPhase) {
				// Moving between phases
				job.currentPhase = targetPhase;

				// Track when job moves to applied status
				if (targetPhase === "applied" && !job.appliedDate) {
					job.appliedDate = new Date().toISOString();
				}

				// Clear substep if moving to a different phase that doesn't support it
				if (!getSubstepsForPhase(targetPhase).includes(job.currentSubstep)) {
					job.currentSubstep = targetPhase;
				}

				// Update positions in target phase
				KanbanBoard.updatePositionsInPhase(targetPhase, job.id, targetPosition);
			} else {
				// Reordering within same phase
				KanbanBoard.updatePositionsInPhase(targetPhase, job.id, targetPosition);
			}

			// Save changes
			saveToLocalStorage();

			// Refresh the kanban board
			KanbanBoard.refresh();

			// Also refresh the main table if it's visible
			if (typeof refreshInterface === "function") {
				refreshInterface();
			}
		} catch (error) {
			console.error("Error in drop handler:", error);
		}

		// Clean up drag styling
		document.querySelectorAll(".kanban-column").forEach((col) => {
			col.classList.remove("drag-active", "drag-over");
		});

		// Clean up all drop indicators and placeholders
		document.querySelectorAll(".drop-indicator, .drop-placeholder").forEach((element) => {
			element.remove();
		});
	},

	// Update sort orders for jobs in a specific phase
	updatePositionsInPhase: (phase, movedJobId, targetPosition) => {
		const phaseJobs = jobsData
			.filter((job) => job.currentPhase === phase)
			.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

		// Remove the moved job from its current position
		const movedJobIndex = phaseJobs.findIndex((job) => job.id === movedJobId);
		if (movedJobIndex !== -1) {
			phaseJobs.splice(movedJobIndex, 1);
		}

		// Insert the moved job at the target position
		const movedJob = jobsData.find((job) => job.id === movedJobId);
		if (movedJob) {
			phaseJobs.splice(targetPosition, 0, movedJob);
		}

		// Update sortOrder for all jobs in this phase
		phaseJobs.forEach((job, index) => {
			const jobIndex = jobsData.findIndex((j) => j.id === job.id);
			if (jobIndex !== -1) {
				jobsData[jobIndex].sortOrder = index;
			}
		});
	},

	// Create current step selector with optgroups
	createCurrentStepSelector: (job) => {
		const select = h("select.current-step-selector", {
			name: "currentStep",
			required: true,
			onchange: (e) => KanbanBoard.handleCurrentStepChange(e, job),
		});

		// Track if we have any options to determine default selection
		let hasOptions = false;
		let firstOptionValue = null;

		// Add option groups for each phase
		PHASES.forEach((phase) => {
			const selectedSubsteps = job.selectedSubsteps?.[phase] || [];

			// Only show phases that have selected substeps
			if (selectedSubsteps.length > 0) {
				// Create optgroup for this phase
				const optgroup = h("optgroup", { label: getPhaseText(phase) });

				// Add substep options only (no phase-level option)
				selectedSubsteps.forEach((substep) => {
					const optionValue = `${phase}:${substep}`;

					// Track first available option for default selection
					if (!hasOptions) {
						firstOptionValue = optionValue;
						hasOptions = true;
					}

					const substepOption = h(
						"option",
						{
							value: optionValue,
							selected: job.currentPhase === phase && job.currentSubstep === substep,
						},
						getSubstepText(substep)
					);
					optgroup.appendChild(substepOption);
				});

				select.appendChild(optgroup);
			}
		});

		// If no current step is set but we have options, set the first one as default
		if (hasOptions && (!job.currentPhase || !job.currentSubstep)) {
			if (firstOptionValue) {
				const [defaultPhase, defaultSubstep] = firstOptionValue.split(":");
				job.currentPhase = defaultPhase;
				job.currentSubstep = defaultSubstep;

				// Set the select value to the first option
				setTimeout(() => {
					if (select.value !== firstOptionValue) {
						select.value = firstOptionValue;
					}
				}, 0);
			}
		}

		return select;
	},

	// Refresh current step selector when workflow changes
	refreshCurrentStepSelector: (modal, job) => {
		const currentStepSelector = modal.querySelector(".current-step-selector");
		if (currentStepSelector) {
			// Store the current value before replacement
			const currentValue = currentStepSelector.value;

			// Create new selector
			const newSelector = KanbanBoard.createCurrentStepSelector(job);

			// Check if the current value is still valid in the new selector
			const isCurrentValueStillValid = newSelector.querySelector(`option[value="${currentValue}"]`);

			// If current value is still valid, preserve it; otherwise go to first available
			if (isCurrentValueStillValid) {
				newSelector.value = currentValue;
			} else {
				// Find the first available option and select it
				const firstOption = newSelector.querySelector("option[value]");
				if (firstOption) {
					newSelector.value = firstOption.value;
					// Update the job's current step to match the first available option
					const [phase, substep] = firstOption.value.split(":");
					job.currentPhase = phase;
					job.currentSubstep = substep;
				} else {
					// No options available, clear current step
					job.currentPhase = null;
					job.currentSubstep = null;
				}
			}

			// Replace the old one
			currentStepSelector.parentNode.replaceChild(newSelector, currentStepSelector);
		}
	},

	// Handle current step change
	handleCurrentStepChange: (e, job) => {
		const [phase, substep] = e.target.value.split(":");

		// Update job current phase and substep
		job.currentPhase = phase;
		job.currentSubstep = substep;

		// Update workflow selector visual state
		const modal = e.target.closest(".modal");

		// Remove current indicators from all substeps
		const allSubsteps = modal.querySelectorAll(".workflow-substep-item");
		allSubsteps.forEach((item) => {
			item.classList.remove("current");
			const indicator = item.querySelector(".current-indicator");
			if (indicator) {
				indicator.remove();
			}
		});

		// Remove current phase highlighting
		const allPhases = modal.querySelectorAll(".workflow-phase");
		allPhases.forEach((phaseEl) => phaseEl.classList.remove("current-phase"));

		// Add current phase highlighting
		const currentPhaseElement = modal.querySelector(`[data-phase="${phase}"]`);
		if (currentPhaseElement) {
			currentPhaseElement.classList.add("current-phase");
		}

		// Add current substep highlighting if it's not the phase itself
		if (substep !== phase) {
			const currentSubstepElement = modal.querySelector(
				`[data-phase="${phase}"][data-substep="${substep}"]`
			);
			if (currentSubstepElement) {
				currentSubstepElement.classList.add("current");
				const toggle = currentSubstepElement.querySelector(".workflow-substep-toggle");
				if (toggle && !toggle.querySelector(".current-indicator")) {
					toggle.appendChild(h("span.current-indicator", I18n.t("kanban.current")));
				}
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

	// Create workflow selector component
	createWorkflowSelector: (job) => {
		const workflowContainer = h("div.workflow-selector");

		// Create phase sections
		Object.entries(PHASE_SUBSTEPS).forEach(([phase, substeps]) => {
			const selectedSubsteps = job.selectedSubsteps?.[phase] || [];
			const isCurrentPhase = job.currentPhase === phase;

			const phaseSection = h(
				"div",
				{
					className: `workflow-phase ${isCurrentPhase ? "current-phase" : ""}`,
					"data-phase": phase,
				},
				// Phase header
				h(
					"div.workflow-phase-header",
					h(
						"button",
						{
							type: "button",
							className: `workflow-phase-toggle ${selectedSubsteps.length > 0 ? "has-substeps" : ""}`,
							onclick: (e) => KanbanBoard.togglePhaseExpansion(e, phase),
						},
						h("span.material-symbols-outlined", "expand_more"),
						h("span.workflow-phase-title", getPhaseText(phase)),
						h("span.workflow-phase-count", `${selectedSubsteps.length}/${substeps.length}`)
					)
				),
				// Substeps list (initially collapsed)
				h(
					"div.workflow-substeps-list",
					{
						className: "hidden",
					},
					...substeps.map((substep) => {
						const isSelected = selectedSubsteps.includes(substep);
						const isCurrent = job.currentSubstep === substep && isCurrentPhase;

						return h(
							"div",
							{
								className: `workflow-substep-item ${isSelected ? "selected" : ""} ${isCurrent ? "current" : ""}`,
								"data-phase": phase,
								"data-substep": substep,
							},
							h(
								"button.workflow-substep-toggle",
								{
									type: "button",
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
								h(
									"span.material-symbols-outlined",
									isSelected ? "check_circle" : "radio_button_unchecked"
								),
								h("span.workflow-substep-text", getSubstepText(substep)),
								isCurrent && h("span.current-indicator", I18n.t("kanban.current"))
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
		const phaseElement = e.target.closest(".workflow-phase");
		const substepsList = phaseElement.querySelector(".workflow-substeps-list");
		const toggleIcon = phaseElement.querySelector(".material-symbols-outlined");

		if (substepsList.style.display === "none") {
			substepsList.style.display = "block";
			toggleIcon.textContent = "expand_less";
			phaseElement.classList.add("expanded");
		} else {
			substepsList.style.display = "none";
			toggleIcon.textContent = "expand_more";
			phaseElement.classList.remove("expanded");
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
			job.selectedSubsteps[phase] = selectedSubsteps.filter((s) => s !== substep);
		} else {
			// Add substep
			job.selectedSubsteps[phase].push(substep);
		}

		// Update the visual state
		const substepElement = e.target.closest(".workflow-substep-item");
		const icon = substepElement.querySelector(".material-symbols-outlined");

		if (isSelected) {
			substepElement.classList.remove("selected");
			icon.textContent = "radio_button_unchecked";
		} else {
			substepElement.classList.add("selected");
			icon.textContent = "check_circle";
		}

		// Update phase counter
		const phaseElement = e.target.closest(".workflow-phase");
		const counter = phaseElement.querySelector(".workflow-phase-count");
		const totalSubsteps = PHASE_SUBSTEPS[phase].length;
		const selectedCount = job.selectedSubsteps[phase].length;
		counter.textContent = `${selectedCount}/${totalSubsteps}`;

		// Update phase toggle styling
		const phaseToggle = phaseElement.querySelector(".workflow-phase-toggle");
		if (selectedCount > 0) {
			phaseToggle.classList.add("has-substeps");
		} else {
			phaseToggle.classList.remove("has-substeps");
		}

		// If this substep was the current one and we're removing it, clear current substep
		if (isSelected && job.currentSubstep === substep) {
			// Clear current substep
			job.currentSubstep = null;
			job.currentPhase = null;
		}

		// Refresh the current step selector to reflect new available substeps
		KanbanBoard.refreshCurrentStepSelector(e.target.closest(".modal"), job);

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
		const modal = e.target.closest(".modal");
		const phaseSelect = modal.querySelector('select[name="phase"]');
		const substepInput = modal.querySelector('input[name="substep"]');

		if (phaseSelect) {
			phaseSelect.value = phase;
		}
		if (substepInput) {
			substepInput.value = getSubstepText(substep);
		}

		// Update visual state - remove current indicator from all substeps
		const allSubsteps = modal.querySelectorAll(".workflow-substep-item");
		allSubsteps.forEach((item) => {
			item.classList.remove("current");
			const indicator = item.querySelector(".current-indicator");
			if (indicator) {
				indicator.remove();
			}
		});

		// Add current indicator to selected substep
		const substepElement = e.target.closest(".workflow-substep-item");
		substepElement.classList.add("current");
		const toggle = substepElement.querySelector(".workflow-substep-toggle");
		if (!toggle.querySelector(".current-indicator")) {
			toggle.appendChild(h("span.current-indicator", I18n.t("kanban.current")));
		}

		// Update current phase highlighting
		const allPhases = modal.querySelectorAll(".workflow-phase");
		allPhases.forEach((phaseEl) => phaseEl.classList.remove("current-phase"));

		const currentPhaseElement = modal.querySelector(`[data-phase="${phase}"]`);
		if (currentPhaseElement) {
			currentPhaseElement.classList.add("current-phase");
		}

		// Refresh the current step selector to reflect the new selection
		KanbanBoard.refreshCurrentStepSelector(modal, job);

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

			// Get current step from selector
			const currentStepSelect = form.querySelector(".current-step-selector");
			const [currentPhase, currentSubstep] = currentStepSelect
				? currentStepSelect.value.split(":")
				: [job.currentPhase, job.currentSubstep];

			// Get form values manually
			const updatedJob = {
				...job,
				priority: form.priority.value,
				company: form.company.value.trim(),
				position: form.position.value.trim(),
				currentPhase: currentPhase,
				currentSubstep: currentSubstep,
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

			// Validate current step is selected
			if (!updatedJob.currentPhase || !updatedJob.currentSubstep) {
				await alert(I18n.t("validation.currentStepRequired") || "Current step is required");
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
			"div.modal-overlay.kanban-job-edit-modal",
			{
				onclick: (e) => e.target === e.currentTarget && handleClose(),
			},
			h(
				"div.modal job-edit-modal",
				h(
					"div.modal-header",
					h("h3.modal-title", I18n.t("kanban.editJob") || "Edit Job"),
					h("button.modal-close", { onclick: handleClose }, "×")
				),
				h(
					"div.modal-body",
					h(
						"form.job-edit-form",
						// Company and Position row (FIRST)
						h(
							"div.form-row",
							h(
								"div.form-field",
								h("label", I18n.t("table.headers.company") || "Company"),
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
								"div.form-field",
								h("label", I18n.t("table.headers.position") || "Position"),
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
							"div.form-row",
							h(
								"div.form-field",
								h("label", I18n.t("table.headers.salaryRange") || "Salary Range"),
								h("input", {
									type: "text",
									name: "salaryRange",
									placeholder: I18n.t("table.placeholders.salaryExample"),
								})
							),
							h(
								"div.form-field",
								h("label", I18n.t("table.headers.location") || "Location"),
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

						// Source URL and Priority row
						h(
							"div.form-row",
							h(
								"div.form-field",
								h("label", I18n.t("table.headers.sourceUrl") || "Source URL"),
								h("input", {
									type: "url",
									name: "sourceUrl",
									placeholder: I18n.t("table.placeholders.urlExample"),
								})
							),
							h(
								"div.form-field",
								h("label", I18n.t("table.headers.priority") || "Priority"),
								h(
									"select",
									{ name: "priority" },
									h("option", { value: "high" }, I18n.t("priorities.high") || "High"),
									h("option", { value: "medium" }, I18n.t("priorities.medium") || "Medium"),
									h("option", { value: "low" }, I18n.t("priorities.low") || "Low")
								)
							)
						),

						// Current Step Selection
						h(
							"div.form-row",
							h(
								"div.form-field full-width",
								h("label", h("span", I18n.t("forms.currentStep")), h("span.required-asterisk", I18n.t("forms.requiredAsterisk"))),
								KanbanBoard.createCurrentStepSelector(job)
							)
						),

						// Workflow Configuration
						h(
							"div.form-row",
							h(
								"div.form-field.full-width",
								h("label", I18n.t("kanban.workflowConfig") || "Workflow Configuration"),
								h(
									"div.workflow-description",
									I18n.t("kanban.workflowDescription") ||
										"Select and configure the steps for each phase of this job:"
								),
								KanbanBoard.createWorkflowSelector(job)
							)
						)
					)
				),
				h(
					"div.modal-footer",
					// Delete button - always visible
					h(
						"button.btn-danger",
						{
							type: "button",
							onclick: async () => {
								// Check if this is an existing job (has company and position filled)
								const isExistingJob = job.company && job.position;

								if (isExistingJob) {
									// For existing jobs, confirm deletion
									const confirmed = await confirm(
										I18n.t("messages.confirmDelete", {
											position: job.position,
											company: job.company,
										}) ||
											`Are you sure you want to delete the application for ${job.position} at ${job.company}?`
									);
									if (confirmed) {
										// Remove from array
										const index = jobsData.findIndex((j) => j.id === job.id);
										if (index !== -1) {
											jobsData.splice(index, 1);
											saveToLocalStorage();
											KanbanBoard.refresh();
											// Also refresh main table if visible
											if (typeof refreshInterface === "function") {
												refreshInterface();
											}
										}
										handleClose();
									}
								} else {
									// For new jobs, just close modal (no confirmation needed)
									handleClose();
								}
							},
						},
						I18n.t("modals.common.delete") || "Delete"
					),
					h(
						"button.btn-secondary",
						{ type: "button", onclick: handleClose },
						I18n.t("modals.common.cancel") || "Cancel"
					),
					h(
						"button.btn-primary",
						{ type: "button", onclick: handleSave },
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
				form.company.value = job.company;
				form.position.value = job.position;
				form.salaryRange.value = job.salaryRange || "";
				form.location.value = job.location || "";
				form.sourceUrl.value = job.sourceUrl || "";

				// Set current step selector value
				const currentStepValue = `${job.currentPhase}:${job.currentSubstep || job.currentPhase}`;
				const currentStepSelect = form.querySelector(".current-step-selector");
				if (currentStepSelect) {
					currentStepSelect.value = currentStepValue;
				}
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
						const jobToRemove = jobsData.find(
							(job) => !job.company && !job.position && job.currentPhase === "wishlist"
						);
						if (jobToRemove) {
							const index = jobsData.findIndex((j) => j.id === jobToRemove.id);
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
					"div.tab-header",
					h("h2.tab-title", I18n.t("kanban.title")),
					h(
						"div.kanban-stats",
						h("span.kanban-total-jobs", I18n.t("kanban.totalJobs", { count: jobsData.length }))
					)
				);

				// Create the kanban board
				const board = KanbanBoard.createBoard();

				// Add to container
				const container = h("div.kanban-container");
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
