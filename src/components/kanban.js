// ============================================================================
// KANBAN BOARD COMPONENT
// ============================================================================

const KanbanBoard = {
	// Create the kanban board
	create: () => {
		const boardContainer = h("div", { className: "kanban-board" });
		
		// Create columns for each phase
		PHASES.forEach(phase => {
			const column = KanbanBoard.createColumn(phase);
			boardContainer.appendChild(column);
		});
		
		return boardContainer;
	},

	// Create a column for a specific phase
	createColumn: (phase) => {
		const phaseJobs = jobsData.filter(job => job.currentPhase === phase);
		const columnTitle = getPhaseText(phase);
		
		const column = h("div", { 
			className: "kanban-column",
			"data-phase": phase
		});
		
		// Column header with title and count
		const header = h("div", { className: "kanban-column-header" },
			h("div", { className: "kanban-column-title" },
				h("span", { className: "kanban-column-name" }, columnTitle),
				h("span", { className: "kanban-column-count" }, phaseJobs.length.toString())
			)
		);
		
		// Column body with job cards
		const body = h("div", { className: "kanban-column-body" });
		
		phaseJobs.forEach(job => {
			const card = KanbanBoard.createJobCard(job);
			body.appendChild(card);
		});
		
		// Add drop zone styling
		body.addEventListener('dragover', KanbanBoard.handleDragOver);
		body.addEventListener('drop', (e) => KanbanBoard.handleDrop(e, phase));
		
		column.appendChild(header);
		column.appendChild(body);
		
		return column;
	},

	// Create a job card
	createJobCard: (job) => {
		const card = h("div", { 
			className: "kanban-job-card",
			draggable: true,
			"data-job-id": job.id
		});
		
		// Add drag event listeners
		card.addEventListener('dragstart', (e) => KanbanBoard.handleDragStart(e, job));
		card.addEventListener('dragend', KanbanBoard.handleDragEnd);
		
		// Priority indicator
		const priorityDot = h("div", { 
			className: `kanban-priority-dot priority-${job.priority}` 
		});
		
		// Company name
		const company = h("div", { className: "kanban-job-company" }, job.company);
		
		// Position title
		const position = h("div", { className: "kanban-job-position" }, job.position);
		
		// Substep if available
		let substep = null;
		if (job.currentSubstep && job.currentSubstep !== job.currentPhase) {
			substep = h("div", { className: "kanban-job-substep" }, getSubstepText(job.currentSubstep));
		}
		
		// Job metadata (salary, location)
		const metadata = [];
		if (job.salaryRange) {
			metadata.push(h("span", { className: "kanban-job-salary" }, job.salaryRange));
		}
		if (job.location) {
			metadata.push(h("span", { className: "kanban-job-location" }, job.location));
		}
		
		const metadataRow = metadata.length > 0 ? 
			h("div", { className: "kanban-job-metadata" }, ...metadata) : null;
		
		// Activity indicators (notes, tasks, contacts)
		const activities = [];
		
		if (job.notes && job.notes.length > 0) {
			const activeNotes = job.notes.filter(note => !note.archived);
			if (activeNotes.length > 0) {
				activities.push(
					h("span", { 
						className: "kanban-activity-indicator notes",
						title: `${activeNotes.length} note${activeNotes.length !== 1 ? 's' : ''}`
					},
						h("span", { className: "material-symbols-outlined" }, "note"),
						h("span", { className: "kanban-activity-count" }, activeNotes.length.toString())
					)
				);
			}
		}
		
		if (job.tasks && job.tasks.length > 0) {
			const activeTasks = job.tasks.filter(task => !task.archived);
			const doneTasks = activeTasks.filter(task => task.status === 'done');
			if (activeTasks.length > 0) {
				activities.push(
					h("span", { 
						className: "kanban-activity-indicator tasks",
						title: `${doneTasks.length}/${activeTasks.length} tasks completed`
					},
						h("span", { className: "material-symbols-outlined" }, "task_alt"),
						h("span", { className: "kanban-activity-count" }, `${doneTasks.length}/${activeTasks.length}`)
					)
				);
			}
		}
		
		if (job.contacts && job.contacts.length > 0) {
			const activeContacts = job.contacts.filter(contact => !contact.archived);
			if (activeContacts.length > 0) {
				activities.push(
					h("span", { 
						className: "kanban-activity-indicator contacts",
						title: `${activeContacts.length} contact${activeContacts.length !== 1 ? 's' : ''}`
					},
						h("span", { className: "material-symbols-outlined" }, "person"),
						h("span", { className: "kanban-activity-count" }, activeContacts.length.toString())
					)
				);
			}
		}
		
		const activitiesRow = activities.length > 0 ? 
			h("div", { className: "kanban-job-activities" }, ...activities) : null;
		
		// Card click handler to view/edit job
		card.addEventListener('click', (e) => {
			if (e.target.closest('.kanban-activity-indicator')) {
				// Handle activity indicator clicks
				const indicator = e.target.closest('.kanban-activity-indicator');
				if (indicator.classList.contains('notes')) {
					openNotesModal(job);
				} else if (indicator.classList.contains('tasks')) {
					openTasksModal(job);
				} else if (indicator.classList.contains('contacts')) {
					openContactsModal(job);
				}
			} else {
				// Handle card click to edit job in modal
				KanbanBoard.openJobEditModal(job);
			}
		});
		
		// Assemble card
		card.appendChild(priorityDot);
		card.appendChild(company);
		card.appendChild(position);
		if (substep) card.appendChild(substep);
		if (metadataRow) card.appendChild(metadataRow);
		if (activitiesRow) card.appendChild(activitiesRow);
		
		return card;
	},

	// Drag and drop handlers
	handleDragStart: (e, job) => {
		e.dataTransfer.setData('text/plain', job.id.toString());
		e.target.classList.add('dragging');
		document.querySelectorAll('.kanban-column').forEach(col => {
			col.classList.add('drag-active');
		});
	},

	handleDragEnd: (e) => {
		e.target.classList.remove('dragging');
		document.querySelectorAll('.kanban-column').forEach(col => {
			col.classList.remove('drag-active', 'drag-over');
		});
	},

	handleDragOver: (e) => {
		e.preventDefault();
		const column = e.currentTarget.closest('.kanban-column');
		column.classList.add('drag-over');
	},

	handleDrop: (e, targetPhase) => {
		e.preventDefault();
		const jobId = parseInt(e.dataTransfer.getData('text/plain'));
		const job = jobsData.find(j => j.id === jobId);
		
		if (job && job.currentPhase !== targetPhase) {
			// Update job phase
			job.currentPhase = targetPhase;
			// Clear substep if moving to a different phase that doesn't support it
			if (!getSubstepsForPhase(targetPhase).includes(job.currentSubstep)) {
				job.currentSubstep = targetPhase;
			}
			
			// Save changes
			saveToLocalStorage();
			
			// Refresh the kanban board
			KanbanBoard.refresh();
			
			// Also refresh the main table if it's visible
			if (typeof refreshInterface === 'function') {
				refreshInterface();
			}
		}
		
		// Clean up drag styling
		document.querySelectorAll('.kanban-column').forEach(col => {
			col.classList.remove('drag-active', 'drag-over');
		});
	},

	// Refresh the kanban board
	refresh: () => {
		const boardContainer = document.querySelector('.kanban-board');
		if (boardContainer) {
			// Clear existing content
			boardContainer.innerHTML = '';
			
			// Recreate columns
			PHASES.forEach(phase => {
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

	// Create job editing modal
	createJobEditModal: (job) => {
		const handleSave = () => {
			const modal = document.querySelector('.kanban-job-edit-modal');
			const form = modal.querySelector('form');
			
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
				sourceUrl: form.sourceUrl.value.trim()
			};

			// Validation
			if (!updatedJob.company || !updatedJob.position) {
				alert(I18n.t('validation.companyPositionRequired') || 'Company and position are required');
				return;
			}

			// Update job in data
			const jobIndex = jobsData.findIndex(j => j.id === job.id);
			if (jobIndex !== -1) {
				Object.assign(jobsData[jobIndex], updatedJob);
				saveToLocalStorage();
				
				// Refresh kanban board
				KanbanBoard.refresh();
				
				// Also refresh main table if visible
				if (typeof refreshInterface === 'function') {
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
		const companies = [...new Set(jobsData.map(j => j.company).filter(Boolean))];
		const positions = [...new Set(jobsData.map(j => j.position).filter(Boolean))];
		const locations = [...new Set(jobsData.map(j => j.location).filter(Boolean))];

		const modal = h("div", {
			className: "modal-overlay kanban-job-edit-modal",
			onclick: (e) => e.target === e.currentTarget && handleClose()
		},
			h("div", { className: "modal job-edit-modal" },
				h("div", { className: "modal-header" },
					h("h3", { className: "modal-title" }, I18n.t("kanban.editJob") || "Edit Job"),
					h("button", { className: "modal-close", onclick: handleClose }, "×")
				),
				h("div", { className: "modal-body" },
					h("form", { className: "job-edit-form" },
						// Priority and Phase row
						h("div", { className: "form-row" },
							h("div", { className: "form-field" },
								h("label", {}, I18n.t("table.headers.priority") || "Priority"),
								h("select", { name: "priority" },
									h("option", { value: "high" }, I18n.t("priorities.high") || "High"),
									h("option", { value: "medium" }, I18n.t("priorities.medium") || "Medium"),
									h("option", { value: "low" }, I18n.t("priorities.low") || "Low")
								)
							),
							h("div", { className: "form-field" },
								h("label", {}, I18n.t("table.headers.currentPhase") || "Phase"),
								h("select", { 
									name: "phase",
									onchange: (e) => {
										const substepSelect = e.target.form.substep;
										const selectedPhase = e.target.value;
										const substeps = getSubstepsForPhase(selectedPhase);
										
										// Update substep options
										substepSelect.innerHTML = '';
										const mainOption = h("option", { value: selectedPhase }, getPhaseText(selectedPhase));
										substepSelect.appendChild(mainOption);
										substeps.forEach(substep => {
											const option = h("option", { value: substep }, getSubstepText(substep));
											substepSelect.appendChild(option);
										});
										substepSelect.value = selectedPhase;
									}
								},
									...PHASES.map(phase => 
										h("option", { value: phase }, getPhaseText(phase))
									)
								)
							)
						),
						
						// Company and Position row
						h("div", { className: "form-row" },
							h("div", { className: "form-field" },
								h("label", {}, I18n.t("table.headers.company") || "Company"),
								h("input", {
									type: "text",
									name: "company",
									required: true,
									list: "companies-list"
								}),
								h("datalist", { id: "companies-list" },
									...companies.map(company => h("option", { value: company }))
								)
							),
							h("div", { className: "form-field" },
								h("label", {}, I18n.t("table.headers.position") || "Position"),
								h("input", {
									type: "text",
									name: "position",
									required: true,
									list: "positions-list"
								}),
								h("datalist", { id: "positions-list" },
									...positions.map(position => h("option", { value: position }))
								)
							)
						),

						// Substep
						h("div", { className: "form-row" },
							h("div", { className: "form-field full-width" },
								h("label", {}, I18n.t("table.headers.substep") || "Substep"),
								h("select", { name: "substep" },
									h("option", { value: job.currentPhase }, getPhaseText(job.currentPhase)),
									...getSubstepsForPhase(job.currentPhase).map(substep =>
										h("option", { value: substep }, getSubstepText(substep))
									)
								)
							)
						),

						// Salary and Location row
						h("div", { className: "form-row" },
							h("div", { className: "form-field" },
								h("label", {}, I18n.t("table.headers.salaryRange") || "Salary Range"),
								h("input", {
									type: "text",
									name: "salaryRange",
									placeholder: "e.g. $50k - $70k"
								})
							),
							h("div", { className: "form-field" },
								h("label", {}, I18n.t("table.headers.location") || "Location"),
								h("input", {
									type: "text",
									name: "location",
									list: "locations-list"
								}),
								h("datalist", { id: "locations-list" },
									...locations.map(location => h("option", { value: location }))
								)
							)
						),

						// Source URL
						h("div", { className: "form-row" },
							h("div", { className: "form-field full-width" },
								h("label", {}, I18n.t("table.headers.sourceUrl") || "Source URL"),
								h("input", {
									type: "url",
									name: "sourceUrl",
									placeholder: "https://"
								})
							)
						)
					)
				),
				h("div", { className: "modal-footer" },
					h("button", {
						type: "button",
						className: "btn-secondary",
						onclick: handleClose
					}, I18n.t("modals.common.cancel") || "Cancel"),
					h("button", {
						type: "button",
						className: "btn-primary",
						onclick: handleSave
					}, I18n.t("modals.common.save") || "Save")
				)
			)
		);

		// Set form values after modal is created
		setTimeout(() => {
			const form = modal.querySelector('form');
			if (form) {
				form.priority.value = job.priority;
				form.phase.value = job.currentPhase;
				form.company.value = job.company;
				form.position.value = job.position;
				form.substep.value = job.currentSubstep || job.currentPhase;
				form.salaryRange.value = job.salaryRange || "";
				form.location.value = job.location || "";
				form.sourceUrl.value = job.sourceUrl || "";
			}
		}, 0);

		return modal;
	},

	// Close job editing modal
	closeJobEditModal: () => {
		const modal = document.querySelector('.kanban-job-edit-modal');
		if (modal) {
			modal.remove();
		}
	},

	// Initialize the kanban board in the applications tab
	init: () => {
		const applicationsTab = document.querySelector('[data-tab="applications"]');
		if (applicationsTab) {
			// Clear existing content
			applicationsTab.innerHTML = '';
			
			// Create board header
			const header = h("div", { className: "kanban-header" },
				h("h2", { className: "kanban-title" }, I18n.t("kanban.title")),
				h("div", { className: "kanban-stats" },
					h("span", { className: "kanban-total-jobs" }, 
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
		}
	}
};

// Make kanban board available globally
window.KanbanBoard = KanbanBoard;