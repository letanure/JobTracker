// ============================================================================
// TASK MODAL COMPONENT
// ============================================================================

// Unified modal component for viewing and adding tasks
const TasksModal = ({ job, onClose }) => {
	const tasks = job.tasks || [];
	const activeTasks = tasks.filter((task) => !task.archived);
	const archivedTasks = tasks.filter((task) => task.archived);
	const sortedActiveTasks = [...activeTasks].sort(
		(a, b) => new Date(a.createdDate || a.date) - new Date(b.createdDate || b.date)
	);
	const sortedArchivedTasks = [...archivedTasks].sort(
		(a, b) => new Date(a.createdDate || a.date) - new Date(b.createdDate || b.date)
	);

	const handleAddTask = () => {
		const textarea = document.querySelector(".add-task-textarea");
		const statusSelect = document.querySelector(".add-task-status");
		const prioritySelect = document.querySelector(".add-task-priority");
		const dueDateInput = document.querySelector(".add-task-due-date");
		const durationSelect = document.querySelector(".add-task-duration");
		const taskText = textarea.value.trim();

		if (!taskText) {
			// Show error message instead of alert
			showValidationError(textarea, "Task text is required");
			return;
		}

		// Use datetime-local value directly
		let dueDate = null;
		if (dueDateInput.value) {
			dueDate = new Date(dueDateInput.value).toISOString();
		}

		const newTask = {
			id: Date.now(),
			createdDate: new Date().toISOString(),
			text: taskText,
			status: statusSelect.value || "todo",
			priority: prioritySelect.value || "medium",
			dueDate: dueDate,
			duration: durationSelect.value || null,
		};

		// Add task to job data
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		if (!jobsData[jobIndex].tasks) {
			jobsData[jobIndex].tasks = [];
		}

		jobsData[jobIndex].tasks.push(newTask);
		saveToLocalStorage();

		// Update the job object for this modal
		job.tasks = jobsData[jobIndex].tasks;

		// Refresh modal without flicker
		refreshTasksModal(job);

		// Clear the form
		textarea.value = "";
		statusSelect.value = "todo";
		prioritySelect.value = "medium";
		dueDateInput.value = "";
		durationSelect.value = "";

		// Focus back to the first field (status select)
		statusSelect.focus();

		// Update the tasks count in the table (refresh interface for count update)
		refreshInterface();
	};

	const enableTaskEditing = (task, job) => {
		const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
		if (!taskElement) return;

		const taskRow = taskElement.closest("tr");
		if (!taskRow) return;

		// Store original state
		taskRow.dataset.editing = "true";

		// Replace status display with select
		const statusDisplay = taskRow.querySelector(".task-status-display");
		const statusSelect = h(
			"select",
			{
				className: "task-status-edit",
				value: task.status,
			},
			h("option", { value: "todo" }, I18n.t("modals.tasks.statusTodo")),
			h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress")),
			h("option", { value: "done" }, I18n.t("modals.tasks.statusDone"))
		);
		statusDisplay.parentNode.replaceChild(statusSelect, statusDisplay);

		// Replace priority display with select
		const priorityDisplay = taskRow.querySelector(".task-priority-display");
		const prioritySelect = h(
			"select",
			{
				className: "task-priority-edit",
				value: task.priority,
			},
			h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow")),
			h("option", { value: "medium" }, I18n.t("modals.tasks.priorityMedium")),
			h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh"))
		);
		priorityDisplay.parentNode.replaceChild(prioritySelect, priorityDisplay);

		// Replace due date display with input
		const dueDateDisplay = taskRow.querySelector(".task-due-date-display");
		const currentDate = task.dueDate ? task.dueDate.split("T")[0] : "";
		const dateInput = h("input", {
			type: "date",
			value: currentDate,
			className: "task-due-date-edit",
		});
		dueDateDisplay.parentNode.replaceChild(dateInput, dueDateDisplay);

		// Replace duration display with select
		const durationDisplay = taskRow.querySelector(".task-duration-display");
		const durationSelect = h(
			"select",
			{
				className: "task-duration-edit",
			},
			h("option", { value: "", selected: !task.duration }, "—"),
			h("option", { value: "15min", selected: task.duration === "15min" }, "15 min"),
			h("option", { value: "30min", selected: task.duration === "30min" }, "30 min"),
			h("option", { value: "1h", selected: task.duration === "1h" }, "1h"),
			h("option", { value: "1h30", selected: task.duration === "1h30" }, "1:30"),
			h("option", { value: "2h", selected: task.duration === "2h" }, "2h"),
			h("option", { value: "3h", selected: task.duration === "3h" }, "3h")
		);
		durationDisplay.parentNode.replaceChild(durationSelect, durationDisplay);

		// Update edit button to save and add cancel button
		const editBtn = taskRow.querySelector(".edit-task-btn");
		editBtn.innerHTML = '<span class="material-symbols-outlined icon-14">check</span>';
		editBtn.title = I18n.t("modals.common.save");
		editBtn.onclick = () => saveTaskChanges(task, job);

		// Add cancel button next to save button
		const actionsCell = taskRow.querySelector(".tasks-table-actions");
		const cancelBtn = h("button", {
			className: "action-btn cancel-btn ",
			title: I18n.t("modals.common.cancel"),
			innerHTML: '<span class="material-symbols-outlined icon-14">close</span>',
			onclick: () => disableTaskEditing(task, job),
		});
		actionsCell.appendChild(cancelBtn);

		// Make task text editable
		const taskTextRow = taskRow.nextElementSibling;
		const taskTextCell = taskTextRow?.querySelector(".task-text-cell");
		if (taskTextCell) {
			const currentText = task.text || "";
			const textarea = document.createElement("textarea");
			textarea.value = currentText;
			textarea.className = "task-text-edit";
			textarea.rows = 2;
			textarea.style.width = "100%";
			textarea.style.resize = "vertical";

			// Add better event handling
			textarea.addEventListener("input", (e) => {
				// Store the current value in a data attribute for later retrieval
				textarea.dataset.currentValue = e.target.value;
			});

			// Add keyboard shortcuts
			textarea.addEventListener("keydown", (e) => {
				if (e.key === "Enter" && e.ctrlKey) {
					e.preventDefault();
					saveTaskChanges(task, job);
				} else if (e.key === "Escape") {
					e.preventDefault();
					disableTaskEditing(task, job);
				}
			});

			taskTextCell.innerHTML = "";
			taskTextCell.appendChild(textarea);
			textarea.focus();
			textarea.select(); // Select all text for easy editing

			// Store reference to textarea for saving
			taskRow.dataset.textarea = "true";
			taskTextRow.dataset.textEditing = "true";
		}
	};

	const saveTaskChanges = (task, job) => {
		// Get all form values before refreshing the modal
		const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
		if (!taskElement) return;

		const taskRow = taskElement.closest("tr");
		const textRow = taskRow?.nextElementSibling;

		// Get all the form values
		const statusSelect = taskRow?.querySelector(".task-status-edit");
		const prioritySelect = taskRow?.querySelector(".task-priority-edit");
		const dueDateInput = taskRow?.querySelector(".task-due-date-edit");
		const durationSelect = taskRow?.querySelector(".task-duration-edit");
		const textarea = textRow?.querySelector(".task-text-edit");

		// Validate task text
		if (textarea) {
			const newText = textarea.value.trim();
			if (!newText) {
				showValidationError(textarea, "Task description is required");
				return; // Don't refresh modal yet, let user fix the error
			}
		}

		// Update all fields in the data
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		// Update each field if the input exists
		if (statusSelect) {
			jobsData[jobIndex].tasks[taskIndex].status = statusSelect.value;
		}
		if (prioritySelect) {
			jobsData[jobIndex].tasks[taskIndex].priority = prioritySelect.value;
		}
		if (dueDateInput) {
			jobsData[jobIndex].tasks[taskIndex].dueDate = dueDateInput.value || null;
		}
		if (durationSelect) {
			jobsData[jobIndex].tasks[taskIndex].duration = durationSelect.value || null;
		}
		if (textarea) {
			jobsData[jobIndex].tasks[taskIndex].text = textarea.value.trim();
		}

		// Save to localStorage
		saveToLocalStorage();

		// Refresh the modal to restore display state
		refreshTasksModal(job);

		// Update interface
		refreshInterface();
	};

	const disableTaskEditing = (task, job) => {
		// Just refresh the modal to restore display state
		// No need to find the taskRow since refreshTasksModal will recreate everything
		refreshTasksModal(job);
	};

	const saveTaskText = (task, job, newText, cell) => {
		const trimmedText = newText.trim();

		if (!trimmedText) {
			showValidationError(cell, "Task text is required");
			return;
		}

		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		// Update the data
		jobsData[jobIndex].tasks[taskIndex].text = trimmedText;
		saveToLocalStorage();

		// Update the cell display
		restoreTaskCell(jobsData[jobIndex].tasks[taskIndex], cell);

		// Update interface
		refreshInterface();
	};

	const updateTaskText = (task, job, newText) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		// Update the data (newText is already trimmed from calling function)
		jobsData[jobIndex].tasks[taskIndex].text = newText;
		saveToLocalStorage();

		// Update interface
		refreshInterface();
	};

	const updateTaskDueDate = (task, job, newDate) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		// Update the data
		jobsData[jobIndex].tasks[taskIndex].dueDate = newDate ? `${newDate}T00:00:00.000Z` : null;
		saveToLocalStorage();

		// Update interface
		refreshInterface();
	};

	const updateTaskDuration = (task, job, newDuration) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		// Update the data
		jobsData[jobIndex].tasks[taskIndex].duration = newDuration || null;
		saveToLocalStorage();

		// Update interface
		refreshInterface();
	};

	const formatDuration = (duration) => {
		if (!duration) return "—";

		// Map duration values to display text
		const durationMap = {
			"15min": "15 min",
			"30min": "30 min",
			"1h": "1h",
			"1h30": "1:30",
			"2h": "2h",
			"3h": "3h",
		};

		return durationMap[duration] || duration;
	};

	const archiveTask = (task, job) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		// Store archived section state before refresh
		const archivedTable = document.getElementById("archived-tasks-table");
		const wasExpanded = archivedTable && archivedTable.style.display === "table";

		jobsData[jobIndex].tasks[taskIndex].archived = !task.archived;
		saveToLocalStorage();

		// Refresh modal without flicker
		refreshTasksModal(job);

		// Restore archived section state after refresh
		if (wasExpanded) {
			setTimeout(() => {
				const newArchivedTable = document.getElementById("archived-tasks-table");
				const expandIcon = document.getElementById("archived-tasks-icon");
				if (newArchivedTable) {
					newArchivedTable.style.display = "table";
					if (expandIcon) expandIcon.textContent = "expand_less";
				}
			}, 0);
		}

		// Update interface
		refreshInterface();
	};

	const updateTaskStatus = (task, job, newStatus) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		jobsData[jobIndex].tasks[taskIndex].status = newStatus;
		saveToLocalStorage();

		// Refresh modal without flicker
		refreshTasksModal(job);

		// Update interface
		refreshInterface();
	};

	const updateTaskPriority = (task, job, newPriority) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		jobsData[jobIndex].tasks[taskIndex].priority = newPriority;
		saveToLocalStorage();

		// Refresh modal without flicker
		refreshTasksModal(job);

		// Update interface
		refreshInterface();
	};

	const refreshTasksModal = (job) => {
		const modalBody = document.querySelector(".modal-body");
		if (!modalBody) return;

		// Get updated data
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		job.tasks = jobsData[jobIndex].tasks || [];
		const tasks = job.tasks;
		const activeTasks = tasks.filter((task) => !task.archived);
		const archivedTasks = tasks.filter((task) => task.archived);
		const sortedActiveTasks = [...activeTasks].sort(
			(a, b) => new Date(a.createdDate || a.date) - new Date(b.createdDate || b.date)
		);
		const sortedArchivedTasks = [...archivedTasks].sort(
			(a, b) => new Date(a.createdDate || a.date) - new Date(b.createdDate || b.date)
		);

		// Recreate modal body content
		modalBody.innerHTML = "";
		modalBody.appendChild(createTasksContent(job, sortedActiveTasks, sortedArchivedTasks));
	};

	const createTasksContent = (job, sortedActiveTasks, sortedArchivedTasks) => {
		return h(
			"div",
			{},
			// Active tasks table
			sortedActiveTasks.length > 0
				? h(
						"div",
						{ className: "tasks-table-container" },
						h(
							"table",
							{ className: "tasks-table" },
							h(
								"thead",
								{},
								h(
									"tr",
									{},
									h("th", {}, "Status"),
									h("th", {}, "Priority"),
									h("th", {}, "Due Date"),
									h("th", {}, "Duration"),
									h("th", {}, "Actions")
								)
							),
							h(
								"tbody",
								{},
								...sortedActiveTasks.flatMap((task) => [
									h(
										"tr",
										{ key: task.id, className: "task-info-row" },
										h(
											"td",
											{ className: "task-status-cell" },
											h(
												"span",
												{
													className: "task-status-display",
													"data-task-id": task.id,
													"data-field": "status",
												},
												getTaskStatusText(task.status)
											)
										),
										h(
											"td",
											{ className: "task-priority-cell" },
											h(
												"span",
												{
													className: "task-priority-display",
													"data-task-id": task.id,
													"data-field": "priority",
												},
												getPriorityText(task.priority)
											)
										),
										h(
											"td",
											{ className: "task-due-date-cell" },
											h(
												"span",
												{
													className: "task-due-date-display",
													"data-task-id": task.id,
													"data-field": "dueDate",
												},
												task.dueDate ? formatDate(task.dueDate) : "—"
											)
										),
										h(
											"td",
											{ className: "task-duration-cell" },
											h(
												"span",
												{
													className: "task-duration-display",
													"data-task-id": task.id,
													"data-field": "duration",
												},
												formatDuration(task.duration)
											)
										),
										h(
											"td",
											{ className: "tasks-table-actions" },
											h("button", {
												className: "action-btn edit-task-btn ",
												title: I18n.t("modals.tasks.editTitle"),
												innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
												onclick: () => enableTaskEditing(task, job),
											}),
											h("button", {
												className: "action-btn archive-btn ",
												title: I18n.t("modals.tasks.archiveTitle"),
												innerHTML: '<span class="material-symbols-outlined icon-14">archive</span>',
												onclick: () => archiveTask(task, job),
											})
										)
									),
									h(
										"tr",
										{ key: `${task.id}-text`, className: "task-text-row" },
										h(
											"td",
											{
												colspan: 5,
												className: "task-text-cell",
											},
											task.text
										)
									),
								])
							)
						)
					)
				: h("p", { className: "modal-empty-message" }, I18n.t("modals.tasks.emptyState")),

			// Archived tasks section
			sortedArchivedTasks.length > 0
				? h(
						"div",
						{ className: "archived-tasks-section" },
						h(
							"h4",
							{
								className: "tasks-archived-header",
								onclick: () => {
									const archivedTable = document.getElementById("archived-tasks-table");
									const expandIcon = document.getElementById("archived-tasks-icon");
									if (archivedTable.style.display === "none") {
										archivedTable.style.display = "table";
										expandIcon.textContent = "expand_less";
									} else {
										archivedTable.style.display = "none";
										expandIcon.textContent = "expand_more";
									}
								},
							},
							h(
								"span",
								{ className: "material-symbols-outlined expand-icon", id: "archived-tasks-icon" },
								"expand_more"
							),
							I18n.t("modals.tasks.archivedSection", { count: sortedArchivedTasks.length })
						),
						h(
							"table",
							{
								id: "archived-tasks-table",
								className: "tasks-table archived",
								style: "display: none",
							},
							h(
								"thead",
								{},
								h(
									"tr",
									{},
									h("th", {}, "Status"),
									h("th", {}, "Priority"),
									h("th", {}, "Task"),
									h("th", {}, "Due Date"),
									h("th", {}, "Actions")
								)
							),
							h(
								"tbody",
								{},
								...sortedArchivedTasks.map((task) =>
									h(
										"tr",
										{ key: task.id },
										h("td", {}, getTaskStatusText(task.status)),
										h("td", {}, getPriorityText(task.priority)),
										h("td", { className: "archived-task-text-cell" }, task.text),
										h("td", {}, task.dueDate ? formatDate(task.dueDate) : "—"),
										h(
											"td",
											{ className: "tasks-table-actions" },
											h("button", {
												className: "action-btn archive-btn ",
												title: I18n.t("modals.tasks.unarchiveTitle"),
												innerHTML:
													'<span class="material-symbols-outlined icon-14">unarchive</span>',
												onclick: () => archiveTask(task, job),
											})
										)
									)
								)
							)
						)
					)
				: null,

			// Add task form section
			h(
				"div",
				{ className: "add-task-section" },
				h("h4", { className: "add-task-title" }, I18n.t("modals.tasks.addSection")),
				h(
					"form",
					{
						className: "add-task-form",
						onsubmit: (e) => {
							e.preventDefault();
							handleAddTask();
						},
					},
					h(
						"div",
						{ className: "add-task-form-row" },
						h(
							"div",
							{ className: "add-task-field" },
							h("label", {}, I18n.t("modals.tasks.status")),
							h(
								"select",
								{
									className: "add-task-status",
									value: "todo",
								},
								h("option", { value: "todo" }, I18n.t("modals.tasks.statusTodo")),
								h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress")),
								h("option", { value: "done" }, I18n.t("modals.tasks.statusDone"))
							)
						),
						h(
							"div",
							{ className: "add-task-field" },
							h("label", {}, I18n.t("modals.tasks.priority")),
							h(
								"select",
								{
									className: "add-task-priority",
									value: "medium",
								},
								h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow")),
								h("option", { value: "medium" }, I18n.t("modals.tasks.priorityMedium")),
								h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh"))
							)
						),
						h(
							"div",
							{ className: "add-task-field" },
							h("label", {}, I18n.t("modals.tasks.dueDate")),
							h("input", {
								type: "datetime-local",
								className: "add-task-due-date",
								placeholder: "Due date & time (optional)",
							})
						),
						h(
							"div",
							{ className: "add-task-field" },
							h("label", {}, I18n.t("modals.tasks.duration")),
							h(
								"select",
								{
									className: "add-task-duration",
								},
								h("option", { value: "" }, "—"),
								h("option", { value: "15min" }, "15 min"),
								h("option", { value: "30min" }, "30 min"),
								h("option", { value: "1h" }, "1h"),
								h("option", { value: "1h30" }, "1:30"),
								h("option", { value: "2h" }, "2h"),
								h("option", { value: "3h" }, "3h")
							)
						)
					),
					h("textarea", {
						className: "add-task-textarea",
						placeholder: I18n.t("modals.tasks.placeholder"),
						rows: 2,
						onkeydown: (e) => {
							if (e.key === "Enter" && e.shiftKey) {
								e.preventDefault();
								handleAddTask();
							}
						},
					}),
					h(
						"div",
						{ className: "add-task-form-actions" },
						h(
							"button",
							{
								type: "submit",
								className: "action-btn primary-btn",
							},
							I18n.t("modals.tasks.addButton")
						)
					)
				)
			)
		);
	};

	const showValidationError = (element, message) => {
		// Remove existing error
		const existingError = element.parentNode.querySelector(".validation-error");
		if (existingError) {
			existingError.remove();
		}

		// Add error message
		const errorElement = h(
			"div",
			{
				className: "validation-error",
			},
			message
		);

		element.parentNode.appendChild(errorElement);
		element.focus();

		// Remove error after 3 seconds
		setTimeout(() => {
			if (errorElement.parentNode) {
				errorElement.remove();
			}
		}, 3000);
	};

	return h(
		"div",
		{
			className: "modal-overlay",
			onclick: (e) => e.target === e.currentTarget && onClose(),
		},
		h(
			"div",
			{ className: "modal" },
			h(
				"div",
				{ className: "modal-header" },
				h(
					"h3",
					{ className: "modal-title" },
					I18n.t("modals.tasks.title", { position: job.position, company: job.company })
				),
				h("button", { className: "modal-close", onclick: onClose }, "×")
			),
			h(
				"div",
				{ className: "modal-body" },
				createTasksContent(job, sortedActiveTasks, sortedArchivedTasks)
			)
		)
	);
};

// Make TasksModal available globally
window.TasksModal = TasksModal;
