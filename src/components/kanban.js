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
		const phaseJobs = jobsData.filter(job => job.phase === phase);
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
		if (job.substep && job.substep !== job.phase) {
			substep = h("div", { className: "kanban-job-substep" }, getSubstepText(job.substep));
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
				// Handle card click to edit job
				if (typeof editJob === 'function') {
					editJob(job);
				}
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
		
		if (job && job.phase !== targetPhase) {
			// Update job phase
			job.phase = targetPhase;
			// Clear substep if moving to a different phase that doesn't support it
			if (!getSubstepsForPhase(targetPhase).includes(job.substep)) {
				job.substep = targetPhase;
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