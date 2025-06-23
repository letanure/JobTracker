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
				h("span", { className: "tasks-column-count" }, statusTasks.length.toString())
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
					title: "Edit Task",
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
					title: "View Job",
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
