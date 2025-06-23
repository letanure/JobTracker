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

		const statusTasks = allTasks.filter((task) => task.status === status);
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

		// Add drop zone event listeners to both column and body
		const dragOverHandler = (e) => TasksBoard.handleDragOver(e);
		const dragLeaveHandler = (e) => TasksBoard.handleDragLeave(e);
		const dropHandler = (e) => TasksBoard.handleDrop(e, status);

		column.addEventListener("dragover", dragOverHandler);
		column.addEventListener("dragleave", dragLeaveHandler);
		column.addEventListener("drop", dropHandler);

		body.addEventListener("dragover", dragOverHandler);
		body.addEventListener("dragleave", dragLeaveHandler);
		body.addEventListener("drop", dropHandler);

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

		// Add drag event listeners
		card.addEventListener("dragstart", (e) => TasksBoard.handleDragStart(e, task));
		card.addEventListener("dragend", TasksBoard.handleDragEnd);

		// Priority indicator
		const priorityDot = h("div", {
			className: `tasks-priority-dot priority-${task.priority}`,
		});

		// Task content
		const content = h(
			"div",
			{ className: "tasks-task-content" },
			h("div", { className: "tasks-task-text" }, task.task || task.description)
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

		// Action icons
		const actionIcons = h(
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
		);

		// Assemble card
		card.appendChild(priorityDot);
		card.appendChild(content);
		card.appendChild(jobContext);
		card.appendChild(actionIcons);

		return card;
	},

	// Drag and drop handlers
	handleDragStart: (e, task) => {
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", JSON.stringify({ taskId: task.id, jobId: task.jobId }));
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
	},

	handleDragOver: (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		const column = e.currentTarget.closest(".tasks-column");
		column.classList.add("drag-over");
	},

	handleDragLeave: (e) => {
		// Only remove drag-over if we're leaving the column entirely
		if (!e.currentTarget.contains(e.relatedTarget)) {
			const column = e.currentTarget.closest(".tasks-column");
			column.classList.remove("drag-over");
		}
	},

	handleDrop: (e, targetStatus) => {
		e.preventDefault();

		try {
			const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
			const { taskId, jobId } = dragData;

			// Find the job and task
			const jobIndex = jobsData.findIndex((j) => j.id === Number.parseInt(jobId));
			if (jobIndex === -1) return;

			const taskIndex = jobsData[jobIndex].tasks.findIndex(
				(t) => t.id.toString() === taskId.toString()
			);
			if (taskIndex === -1) return;

			const task = jobsData[jobIndex].tasks[taskIndex];

			if (task && task.status !== targetStatus) {
				// Update task status
				jobsData[jobIndex].tasks[taskIndex].status = targetStatus;

				// Save changes
				saveToLocalStorage();

				// Refresh the tasks board
				TasksBoard.refresh();

				// Also refresh the main table if it's visible
				if (typeof refreshInterface === "function") {
					refreshInterface();
				}
			}
		} catch (error) {
			console.error("Error in drop handler:", error);
		}

		// Clean up drag styling
		document.querySelectorAll(".tasks-column").forEach((col) => {
			col.classList.remove("drag-active", "drag-over");
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

	// Open task edit modal (reuse existing task modal functionality)
	openTaskEditModal: (task) => {
		// Find the job for this task
		const job = jobsData.find((j) => j.id === task.jobId);
		if (job) {
			openTasksModal(job);
		}
	},

	// Open add task modal with job selection
	openAddTaskModal: () => {
		const modal = TasksBoard.createAddTaskModal();
		document.body.appendChild(modal);
	},

	// Create add task modal
	createAddTaskModal: () => {
		const handleSave = async () => {
			const modal = document.querySelector(".tasks-add-task-modal");
			const form = modal.querySelector("form");

			const jobId = Number.parseInt(form.jobSelect.value);
			const taskText = form.taskText.value.trim();

			// Validation
			if (!jobId) {
				await alert(I18n.t("validation.jobRequired") || "Please select a job");
				return;
			}

			if (!taskText) {
				await alert(I18n.t("validation.taskRequired") || "Please enter a task description");
				return;
			}

			// Find the job
			const jobIndex = jobsData.findIndex((j) => j.id === jobId);
			if (jobIndex === -1) return;

			// Create new task
			const newTask = {
				id: Date.now().toString(),
				task: taskText,
				status: form.taskStatus.value || "todo",
				priority: form.taskPriority.value || "medium",
				dueDate: form.dueDate.value || null,
				duration: form.duration.value || null,
				createdAt: new Date().toISOString(),
				archived: false,
			};

			// Add to job
			if (!jobsData[jobIndex].tasks) {
				jobsData[jobIndex].tasks = [];
			}
			jobsData[jobIndex].tasks.push(newTask);

			// Save to localStorage
			saveToLocalStorage();

			// Close modal
			TasksBoard.closeAddTaskModal();

			// Refresh tasks board
			TasksBoard.refresh();

			// Update interface
			if (typeof refreshInterface === "function") {
				refreshInterface();
			}
		};

		const handleClose = () => {
			TasksBoard.closeAddTaskModal();
		};

		// Get jobs for selection
		const jobOptions = jobsData.map((job) => ({
			id: job.id,
			text: `${job.company} - ${job.position}`,
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
					h("h3", { className: "modal-title" }, I18n.t("modals.tasks.addButton") || "Add Task"),
					h("button", { className: "modal-close", onclick: handleClose }, "×")
				),
				h(
					"div",
					{ className: "modal-body" },
					h(
						"form",
						{ className: "add-task-form" },
						// Job selection (full width)
						h(
							"div",
							{ className: "add-task-job-row" },
							h(
								"select",
								{ name: "jobSelect", required: true, className: "add-task-job-select" },
								h("option", { value: "" }, I18n.t("common.chooseJob") || "Choose a job..."),
								...jobOptions.map((job) => h("option", { value: job.id }, job.text))
							)
						),
						// Status, Priority, Due Date, Duration (grid layout like existing tasks modal)
						h(
							"div",
							{ className: "task-form-grid" },
							h(
								"select",
								{
									name: "taskStatus",
									className: "add-task-status",
									title: "Status",
								},
								h("option", { value: "todo", selected: true }, I18n.t("modals.tasks.statusTodo") || "To Do"),
								h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress") || "In Progress"),
								h("option", { value: "done" }, I18n.t("modals.tasks.statusDone") || "Done")
							),
							h(
								"select",
								{
									name: "taskPriority",
									className: "add-task-priority",
									title: "Priority",
								},
								h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow") || "Low"),
								h("option", { value: "medium", selected: true }, I18n.t("modals.tasks.priorityMedium") || "Medium"),
								h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh") || "High")
							),
							h("input", {
								type: "date",
								name: "dueDate",
								className: "add-task-due-date",
								title: "Due Date",
							}),
							h(
								"select",
								{
									name: "duration",
									className: "add-task-duration",
									title: "Duration",
								},
								h("option", { value: "" }, "—"),
								h("option", { value: "15min" }, "15 min"),
								h("option", { value: "30min" }, "30 min"),
								h("option", { value: "1h" }, "1h"),
								h("option", { value: "1h30" }, "1:30"),
								h("option", { value: "2h" }, "2h"),
								h("option", { value: "3h" }, "3h")
							)
						),
						// Task text (full width)
						h(
							"div",
							{ className: "add-task-text-row" },
							h("textarea", {
								name: "taskText",
								className: "add-task-textarea",
								placeholder: I18n.t("modals.tasks.placeholder") || "Enter your task here...",
								required: true,
								rows: 3,
							})
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
						I18n.t("modals.tasks.addButton") || "Add Task"
					)
				)
			)
		);

		return modal;
	},

	// Close add task modal
	closeAddTaskModal: () => {
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
