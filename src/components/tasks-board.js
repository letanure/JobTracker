// ============================================================================
// TASKS BOARD COMPONENT
// ============================================================================

const TasksBoard = {
	// Create the tasks board
	create: () => {
		const boardContainer = h("div", { className: "tasks-board" });

		// Create columns for each task status
		TASK_STATUSES.forEach((status) => {
			const column = TasksBoard.createColumn(status);
			boardContainer.appendChild(column);
		});

		return boardContainer;
	},

	// Create a column for a specific task status
	createColumn: (status) => {
		// Get all tasks from all jobs
		const allTasks = [];
		jobsData.forEach((job) => {
			if (job.tasks && job.tasks.length > 0) {
				job.tasks.forEach((task) => {
					// Add job context to task
					allTasks.push({
						...task,
						jobId: job.id,
						jobCompany: job.company,
						jobPosition: job.position,
						jobPhase: job.currentPhase,
					});
				});
			}
		});

		const statusTasks = allTasks
			.filter((task) => task.status === status)
			.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)); // Sort by sortOrder within status
		const columnTitle = getTaskStatusText(status);

		const column = h("div", {
			className: "tasks-column",
			"data-status": status,
		});

		// Column header with title and count
		const header = h(
			"div",
			{ className: "tasks-column-header" },
			h(
				"div",
				{ className: "tasks-column-title" },
				h("span", { className: "tasks-column-name" }, columnTitle),
				h(
					"div",
					{ className: "tasks-column-actions" },
					// Add "Add Task" button for todo column (left of counter)
					status === "todo" && h(
						"button",
						{
							className: "tasks-add-task-btn",
							onclick: () => TasksBoard.openAddTaskModal(),
						},
						h("span", { className: "material-symbols-outlined" }, "add"),
						I18n.t("modals.tasks.addButton") || "Add Task"
					),
					h("span", { className: "tasks-column-count" }, statusTasks.length.toString())
				)
			)
		);

		// Column body with task cards
		const body = h("div", { className: "tasks-column-body" });

		statusTasks.forEach((task) => {
			const card = TasksBoard.createTaskCard(task);
			body.appendChild(card);
		});

		// Add drop zone event listeners only to body (like kanban)
		body.addEventListener("dragover", TasksBoard.handleDragOver);
		body.addEventListener("drop", (e) => TasksBoard.handleDrop(e, status));

		column.appendChild(header);
		column.appendChild(body);

		return column;
	},

	// Create a task card
	createTaskCard: (task) => {
		const card = h("div", {
			className: "tasks-task-card",
			draggable: true,
			"data-task-id": task.id,
			"data-job-id": task.jobId,
		});

		// Add click event listener to open task editing
		card.addEventListener("click", (e) => {
			// Don't trigger if clicking on action buttons
			if (e.target.closest('.tasks-icon-btn')) {
				return;
			}
			TasksBoard.openTaskEditModal(task);
		});

		// Add drag event listeners
		card.addEventListener("dragstart", (e) => TasksBoard.handleDragStart(e, task));
		card.addEventListener("dragend", TasksBoard.handleDragEnd);

		// Priority indicator
		const priorityDot = h("div", {
			className: `tasks-priority-dot priority-${task.priority}`,
		});

		// Due date indicator
		const dueDateIndicator = TasksBoard.createDueDateIndicator(task);

		// Task content
		const content = h(
			"div",
			{ className: "tasks-task-content" },
			h("div", { className: "tasks-task-text" }, task.task || task.text || task.description || "Untitled task")
		);

		// Job context information
		const jobContext = h(
			"div",
			{ className: "tasks-job-context" },
			h(
				"div",
				{ className: "tasks-job-info" },
				h("span", { className: "material-symbols-outlined tasks-job-icon" }, "business"),
				h("span", { className: "tasks-job-text" }, `${task.jobCompany} — ${task.jobPosition}`)
			),
			h(
				"div",
				{ className: "tasks-job-phase" },
				h("span", { className: "material-symbols-outlined tasks-phase-icon" }, "schedule"),
				h("span", { className: "tasks-phase-text" }, getPhaseText(task.jobPhase))
			)
		);

		// Card footer with due date indicator and action icons
		const cardFooter = h(
			"div",
			{ className: "tasks-card-footer" },
			// Due date indicator aligned left
			dueDateIndicator,
			// Action icons aligned right
			h(
				"div",
				{ className: "tasks-action-icons" },
				h(
					"button",
					{
						className: "tasks-icon-btn",
						title: I18n.t("modals.tasks.editTitle") || "Edit Task",
						onclick: (e) => {
							e.stopPropagation();
							TasksBoard.openTaskEditModal(task);
						},
					},
					h("span", { className: "material-symbols-outlined" }, "edit")
				),

				h(
					"button",
					{
						className: "tasks-icon-btn",
						title: I18n.t("common.viewJob") || "View Job",
						onclick: (e) => {
							e.stopPropagation();
							TasksBoard.openJobModal(task);
						},
					},
					h("span", { className: "material-symbols-outlined" }, "work")
				)
			)
		);

		// Assemble card
		card.appendChild(priorityDot);
		card.appendChild(content);
		card.appendChild(jobContext);
		card.appendChild(cardFooter);

		return card;
	},

	// Create due date indicator
	createDueDateIndicator: (task) => {
		if (!task.dueDate) return null;

		const now = new Date();
		const dueDate = new Date(task.dueDate);
		const diffTime = dueDate - now;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		// Don't show indicator if due date is more than 7 days away
		if (diffDays > 7) return null;

		let className = "tasks-due-date-indicator";
		let icon = "schedule";
		let text = "";

		if (diffDays < 0) {
			// Overdue
			className += " overdue";
			icon = "warning";
			text = I18n.t("modals.tasks.daysOverdue", {days: Math.abs(diffDays)}) || `${Math.abs(diffDays)} days overdue`;
		} else if (diffDays === 0) {
			// Due today
			className += " due-today";
			icon = "today";
			text = I18n.t("modals.tasks.dueToday") || "Due today";
		} else if (diffDays === 1) {
			// Due tomorrow
			className += " due-soon";
			icon = "schedule";
			text = I18n.t("modals.tasks.dueTomorrow") || "Due tomorrow";
		} else {
			// Due in a few days
			className += " due-soon";
			icon = "schedule";
			text = I18n.t("modals.tasks.dueInDays", {days: diffDays}) || `Due in ${diffDays} days`;
		}

		return h(
			"div",
			{ className, title: `Due: ${dueDate.toLocaleDateString()}` },
			h("span", { className: "material-symbols-outlined" }, icon),
			h("span", { className: "due-date-text" }, text)
		);
	},

	// Drag and drop handlers
	handleDragStart: (e, task) => {
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", JSON.stringify({ 
			taskId: task.id, 
			jobId: task.jobId,
			sourceStatus: task.status,
			sourceSortOrder: task.sortOrder || 0
		}));
		e.target.classList.add("dragging");
		document.querySelectorAll(".tasks-column").forEach((col) => {
			col.classList.add("drag-active");
		});
	},

	handleDragEnd: (e) => {
		e.target.classList.remove("dragging");
		document.querySelectorAll(".tasks-column").forEach((col) => {
			col.classList.remove("drag-active", "drag-over");
		});
		// Clean up any remaining placeholders
		document.querySelectorAll('.drop-placeholder').forEach(placeholder => {
			placeholder.remove();
		});
	},

	handleDragOver: (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		const column = e.currentTarget.closest(".tasks-column");
		if (column) {
			column.classList.add("drag-over");
		}

		// Add visual drop placeholder
		TasksBoard.updateDropPlaceholder(e);
	},

	// Add visual placeholder showing where the task will be dropped
	updateDropPlaceholder: (e) => {
		const columnBody = e.currentTarget;
		const cards = Array.from(columnBody.children).filter(card => 
			card.classList.contains('tasks-task-card') && 
			!card.classList.contains('dragging') && 
			!card.classList.contains('drop-placeholder')
		);

		// Remove existing drop placeholders
		columnBody.querySelectorAll('.drop-placeholder').forEach(placeholder => {
			placeholder.remove();
		});

		const mouseY = e.clientY;
		let insertIndex = cards.length;

		// Find insertion point based on mouse position relative to existing cards
		for (let i = 0; i < cards.length; i++) {
			const cardRect = cards[i].getBoundingClientRect();
			const cardCenter = cardRect.top + cardRect.height / 2;
			
			if (mouseY < cardCenter) {
				insertIndex = i;
				break;
			}
		}

		// Create placeholder card that matches the dragged card's size
		const placeholder = h('div', { 
			className: 'drop-placeholder tasks-task-card',
			style: 'opacity: 0.3; border: 2px dashed var(--blue-500); background: var(--blue-50); transform: none;'
		}, h('div', { 
			style: 'height: 120px; display: flex; align-items: center; justify-content: center; color: var(--blue-600); font-size: 14px; font-weight: 500;'
		}, 'Drop here'));
		
		if (insertIndex === cards.length) {
			// Insert at the end
			columnBody.appendChild(placeholder);
		} else {
			// Insert before the card at insertIndex
			columnBody.insertBefore(placeholder, cards[insertIndex]);
		}
	},


	handleDrop: (e, targetStatus) => {
		e.preventDefault();

		try {
			const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
			const { taskId, jobId, sourceStatus } = dragData;

			// Find the job and task
			const jobIndex = jobsData.findIndex((j) => j.id === Number.parseInt(jobId));
			if (jobIndex === -1) return;

			const taskIndex = jobsData[jobIndex].tasks.findIndex(
				(t) => t.id.toString() === taskId.toString()
			);
			if (taskIndex === -1) return;

			const task = jobsData[jobIndex].tasks[taskIndex];
			if (!task) return;

			// Calculate drop position based on placeholder location
			const columnBody = e.currentTarget;
			const placeholder = columnBody.querySelector('.drop-placeholder');
			
			let targetPosition = 0;
			
			if (placeholder) {
				// Get all non-dragging, non-placeholder cards to find the correct position
				const cards = Array.from(columnBody.children).filter(card => 
					card.classList.contains('tasks-task-card') && 
					!card.classList.contains('dragging') && 
					!card.classList.contains('drop-placeholder')
				);
				
				// Find the position of the placeholder relative to actual cards
				const allChildren = Array.from(columnBody.children);
				const placeholderIndex = allChildren.indexOf(placeholder);
				
				// Count how many actual task cards are before the placeholder
				targetPosition = 0;
				for (let i = 0; i < placeholderIndex; i++) {
					if (allChildren[i].classList.contains('tasks-task-card') && 
						!allChildren[i].classList.contains('drop-placeholder') && 
						!allChildren[i].classList.contains('dragging')) {
						targetPosition++;
					}
				}
			}

			// Handle status change or reordering
			if (sourceStatus !== targetStatus) {
				// Moving between statuses
				task.status = targetStatus;
				jobsData[jobIndex].tasks[taskIndex].status = targetStatus;

				// Update positions in target status
				TasksBoard.updateTaskPositionsInStatus(targetStatus, taskId, targetPosition);
			} else {
				// Reordering within same status
				TasksBoard.updateTaskPositionsInStatus(targetStatus, taskId, targetPosition);
			}

			// Save changes
			saveToLocalStorage();

			// Refresh the tasks board
			TasksBoard.refresh();

			// Also refresh the main table if it's visible
			if (typeof refreshInterface === "function") {
				refreshInterface();
			}
			if (typeof Dashboard !== "undefined" && TabNavigation.activeTab === "dashboard") {
				Dashboard.refresh();
			}
		} catch (error) {
			console.error("Error in drop handler:", error);
		}

		// Clean up drag styling and placeholders
		document.querySelectorAll(".tasks-column").forEach((col) => {
			col.classList.remove("drag-active", "drag-over");
		});
		document.querySelectorAll('.drop-placeholder').forEach(placeholder => {
			placeholder.remove();
		});
	},

	// Update sort orders for tasks within a specific status
	updateTaskPositionsInStatus: (status, movedTaskId, targetPosition) => {
		// Get all tasks with this status from all jobs, sorted by current sortOrder
		const statusTasks = [];
		jobsData.forEach((job, jobIndex) => {
			if (job.tasks) {
				job.tasks.forEach((task, taskIndex) => {
					if (task.status === status) {
						statusTasks.push({
							...task,
							jobIndex,
							taskIndex
						});
					}
				});
			}
		});

		// Sort by current sortOrder
		statusTasks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

		// Find and remove the moved task from its current position
		const movedTaskIndex = statusTasks.findIndex(task => task.id.toString() === movedTaskId.toString());
		let movedTask = null;
		
		if (movedTaskIndex !== -1) {
			movedTask = statusTasks.splice(movedTaskIndex, 1)[0];
		}

		// Insert the moved task at the target position
		if (movedTask) {
			statusTasks.splice(targetPosition, 0, movedTask);
		}

		// Update sortOrder for all tasks in this status
		statusTasks.forEach((task, index) => {
			if (task.jobIndex !== undefined && task.taskIndex !== undefined) {
				jobsData[task.jobIndex].tasks[task.taskIndex].sortOrder = index;
			}
		});
	},

	// Refresh the tasks board
	refresh: () => {
		const boardContainer = document.querySelector(".tasks-board");
		if (boardContainer) {
			// Clear existing content
			boardContainer.innerHTML = "";

			// Recreate columns
			TASK_STATUSES.forEach((status) => {
				const column = TasksBoard.createColumn(status);
				boardContainer.appendChild(column);
			});
		}
	},

	// Use the TasksBoard version for both create and edit

	// Open add task modal with job selection
	openAddTaskModal: () => {
		const modal = TasksBoard.createTaskModal();
		document.body.appendChild(modal);
	},

	// Open task edit modal using the same modal but in edit mode
	openTaskEditModal: (task) => {
		// Find the job for this task
		const job = jobsData.find((j) => j.id === task.jobId);
		if (job) {
			const modal = TasksBoard.createTaskModal(task, job);
			document.body.appendChild(modal);
		}
	},

	// Create unified task modal (for both creating and editing tasks)
	createTaskModal: (task = null, job = null) => {
		const isEditMode = !!task;
		const modalTitle = isEditMode ? 
			(I18n.t("modals.tasks.editTitle") || "Edit Task") : 
			(I18n.t("modals.tasks.addButton") || "Add Task");

		const handleSave = async () => {
			const modal = document.querySelector(".tasks-add-task-modal");
			const form = modal.querySelector("form");

			const taskText = form.taskText.value.trim();
			const status = form.taskStatus.value;
			const priority = form.taskPriority.value;
			const dueDate = form.dueDate.value || null;
			const duration = form.duration.value || null;

			if (!taskText) {
				await alert(I18n.t("validation.taskRequired") || "Please enter a task description");
				return;
			}

			if (isEditMode) {
				// Edit existing task
				const jobIndex = jobsData.findIndex(j => j.id === job.id);
				if (jobIndex === -1) return;

				const taskIndex = jobsData[jobIndex].tasks.findIndex(t => t.id === task.id);
				if (taskIndex === -1) return;

				// Update task
				jobsData[jobIndex].tasks[taskIndex] = {
					...jobsData[jobIndex].tasks[taskIndex],
					task: taskText,
					text: taskText,
					description: taskText,
					status: status,
					priority: priority,
					dueDate: dueDate,
					duration: duration
				};
			} else {
				// Create new task
				const jobId = Number.parseInt(form.jobSelect.value);

				if (!jobId) {
					await alert(I18n.t("validation.jobRequired") || "Please select a job");
					return;
				}

				// Find the job
				const jobIndex = jobsData.findIndex((j) => j.id === jobId);
				if (jobIndex === -1) return;

				// Create new task
				const newTask = {
					id: Date.now().toString(),
					task: taskText,
					text: taskText,
					description: taskText,
					status: status,
					priority: priority,
					dueDate: dueDate,
					duration: duration,
					createdAt: new Date().toISOString(),
					archived: false,
					sortOrder: 0, // New tasks start at the beginning
				};

				// Add to job
				if (!jobsData[jobIndex].tasks) {
					jobsData[jobIndex].tasks = [];
				}
				jobsData[jobIndex].tasks.push(newTask);
			}

			// Save to localStorage
			saveToLocalStorage();

			// Close modal
			TasksBoard.closeTaskModal();

			// Refresh tasks board
			TasksBoard.refresh();

			// Update interface
			if (typeof refreshInterface === "function") {
				refreshInterface();
			}
			if (typeof Dashboard !== "undefined" && TabNavigation.activeTab === "dashboard") {
				Dashboard.refresh();
			}
		};

		const handleClose = () => {
			TasksBoard.closeTaskModal();
		};

		const handleDelete = async () => {
			if (!isEditMode) return; // No delete for new tasks
			
			const confirmed = await confirm(
				I18n.t("messages.confirmDelete", { task: task.task || task.text || task.description }) ||
				`Are you sure you want to delete this task?`
			);

			if (confirmed) {
				// Find and remove the task
				const jobIndex = jobsData.findIndex(j => j.id === job.id);
				if (jobIndex === -1) return;

				const taskIndex = jobsData[jobIndex].tasks.findIndex(t => t.id === task.id);
				if (taskIndex === -1) return;

				// Remove task
				jobsData[jobIndex].tasks.splice(taskIndex, 1);

				// Save to localStorage
				saveToLocalStorage();

				// Close modal
				TasksBoard.closeTaskModal();

				// Refresh relevant interfaces
				if (typeof refreshInterface === "function") {
					refreshInterface();
				}
				if (typeof TasksBoard !== "undefined") {
					TasksBoard.refresh();
				}
				if (typeof Dashboard !== "undefined" && TabNavigation.activeTab === "dashboard") {
					Dashboard.refresh();
				}
			}
		};

		// Get jobs for selection
		const jobOptions = jobsData.map((jobOption) => ({
			id: jobOption.id,
			text: `${jobOption.company} - ${jobOption.position}`,
		}));

		const modal = h(
			"div",
			{
				className: "modal-overlay tasks-add-task-modal",
				onclick: (e) => e.target === e.currentTarget && handleClose(),
			},
			h(
				"div",
				{ className: "modal" },
				h(
					"div",
					{ className: "modal-header" },
					h("h3", { className: "modal-title" }, modalTitle),
					h("button", { className: "modal-close", onclick: handleClose }, "×")
				),
				h(
					"div",
					{ className: "modal-body" },
					h(
						"form",
						{ className: "add-task-form" },
						// Job selection (create mode) or job info (edit mode)
						isEditMode ? 
							h(
								"div",
								{ className: "add-task-job-row" },
								h("div", { className: "job-info-display", style: "padding: 8px 12px; background: var(--gray-50); border-radius: 6px; font-weight: 500;" }, `${job.company} - ${job.position}`)
							) :
							h(
								"div",
								{ className: "add-task-job-row" },
								h(
									"select",
									{ name: "jobSelect", required: true, className: "add-task-job-select" },
									h("option", { value: "" }, I18n.t("common.chooseJob") || "Choose a job..."),
									...jobOptions.map((jobOption) => h("option", { value: jobOption.id }, jobOption.text))
								)
							),
						// Status, Priority, Due Date, Duration (grid layout like existing tasks modal)
						h(
							"div",
							{ className: "task-form-grid" },
							(() => {
								const statusSelect = h(
									"select",
									{
										name: "taskStatus",
										className: "add-task-status",
										title: "Status"
									},
									h("option", { value: "todo" }, I18n.t("modals.tasks.statusTodo") || "To Do"),
									h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress") || "In Progress"),
									h("option", { value: "done" }, I18n.t("modals.tasks.statusDone") || "Done")
								);
								if (isEditMode) {
									statusSelect.value = task.status || "todo";
								} else {
									statusSelect.value = "todo";
								}
								return statusSelect;
							})(),
							(() => {
								const prioritySelect = h(
									"select",
									{
										name: "taskPriority",
										className: "add-task-priority",
										title: "Priority"
									},
									h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow") || "Low"),
									h("option", { value: "medium" }, I18n.t("modals.tasks.priorityMedium") || "Medium"),
									h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh") || "High")
								);
								if (isEditMode) {
									prioritySelect.value = task.priority || "medium";
								} else {
									prioritySelect.value = "medium";
								}
								return prioritySelect;
							})(),
							(() => {
								const dueDateInput = h("input", {
									type: "datetime-local",
									name: "dueDate",
									className: "add-task-due-date",
									title: "Due Date & Time"
								});
								if (isEditMode && task.dueDate) {
									try {
										dueDateInput.value = new Date(task.dueDate).toISOString().slice(0, 16);
									} catch (e) {
										console.warn("Invalid date format:", task.dueDate);
									}
								}
								return dueDateInput;
							})(),
							(() => {
								const durationSelect = h(
									"select",
									{
										name: "duration",
										className: "add-task-duration",
										title: "Duration"
									},
									h("option", { value: "" }, "—"),
									h("option", { value: "15min" }, "15 min"),
									h("option", { value: "30min" }, "30 min"),
									h("option", { value: "1h" }, "1h"),
									h("option", { value: "1h30" }, "1:30"),
									h("option", { value: "2h" }, "2h"),
									h("option", { value: "3h" }, "3h")
								);
								if (isEditMode) {
									durationSelect.value = task.duration || "";
								}
								return durationSelect;
							})()
						),
						// Task text (full width)
						h(
							"div",
							{ className: "add-task-text-row" },
							(() => {
								const textarea = h("textarea", {
									name: "taskText",
									className: "add-task-textarea",
									placeholder: I18n.t("modals.tasks.placeholder") || "Enter your task here...",
									required: true,
									rows: 3
								});
								
								// Set the text content for edit mode
								if (isEditMode) {
									textarea.value = task.task || task.text || task.description || "";
								}
								
								return textarea;
							})()
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
					// Show delete button in edit mode
					isEditMode && h(
						"button",
						{
							type: "button",
							className: "btn-danger",
							onclick: handleDelete,
						},
						I18n.t("modals.common.delete") || "Delete"
					),
					h(
						"button",
						{
							type: "button",
							className: "btn-primary",
							onclick: handleSave,
						},
						isEditMode ? (I18n.t("modals.common.save") || "Save") : (I18n.t("modals.tasks.addButton") || "Add Task")
					)
				)
			)
		);

		return modal;
	},

	// Close task modal
	closeTaskModal: () => {
		const modal = document.querySelector(".tasks-add-task-modal");
		if (modal) {
			modal.remove();
		}
	},

	// Open job modal to show job details
	openJobModal: (task) => {
		// Find the job for this task
		const job = jobsData.find((j) => j.id === task.jobId);
		if (job) {
			// You could open the job edit modal or create a job view modal
			// For now, let's open the job edit modal from kanban
			if (typeof KanbanBoard !== "undefined" && KanbanBoard.openJobEditModal) {
				KanbanBoard.openJobEditModal(job);
			}
		}
	},

	// Initialize the tasks board in the tasks tab
	init: () => {
		const tasksTab = document.querySelector('.tab-content[data-tab="tasks"]');

		if (tasksTab) {
			// Only clear and initialize if not already initialized
			if (!tasksTab.querySelector(".tasks-container")) {
				// Clear existing content
				tasksTab.innerHTML = "";

				// Get total task count
				let totalTasks = 0;
				jobsData.forEach((job) => {
					if (job.tasks) {
						totalTasks += job.tasks.length;
					}
				});

				// Create board header
				const header = h(
					"div",
					{ className: "tab-header" },
					h("h2", { className: "tab-title" }, I18n.t("tabs.tasks")),
					h(
						"div",
						{ className: "tasks-stats" },
						h("span", { className: "tasks-total-count" }, `${totalTasks} total tasks`)
					)
				);

				// Create the tasks board
				const board = TasksBoard.create();

				// Add to container
				const container = h("div", { className: "tasks-container" });
				container.appendChild(header);
				container.appendChild(board);

				tasksTab.appendChild(container);
			} else {
				// Just refresh the existing board
				TasksBoard.refresh();
			}
		}
	},
};

// Make tasks board available globally
window.TasksBoard = TasksBoard;
