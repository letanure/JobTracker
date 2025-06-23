// ============================================================================
// TASKS SYSTEM COMPONENTS
// ============================================================================

// Tasks count display component with colored counters
const TasksCount = ({ tasks = [], onClick }) => {
	const activeTasks = tasks.filter((task) => !task.archived);
	const todoCount = activeTasks.filter((task) => task.status === "todo").length;
	const inProgressCount = activeTasks.filter((task) => task.status === "in-progress").length;
	const doneCount = activeTasks.filter((task) => task.status === "done").length;
	const totalActiveCount = activeTasks.length;
	const archivedCount = tasks.length - totalActiveCount;

	const className = totalActiveCount === 0 ? "tasks-count zero" : "tasks-count";

	return h(
		"span",
		{
			className,
			onclick: onClick, // Always allow clicks to open modal
			title: `${totalActiveCount} active task${totalActiveCount !== 1 ? "s" : ""} (${todoCount} todo, ${inProgressCount} in progress, ${doneCount} done)${archivedCount > 0 ? ` + ${archivedCount} archived` : ""}`,
		},
		h("span", { className: "task-count-todo" }, todoCount.toString()),
		h("span", { className: "task-count-separator" }, "/"),
		h("span", { className: "task-count-in-progress" }, inProgressCount.toString()),
		h("span", { className: "task-count-separator" }, "/"),
		h("span", { className: "task-count-done" }, doneCount.toString())
	);
};

// Individual task item component
const TaskItem = ({ task, job }) => {
	const isArchived = task.archived || false;

	const handleArchiveToggle = () => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		jobsData[jobIndex].tasks[taskIndex].archived = !isArchived;
		saveToLocalStorage();

		// Update the task element in place
		const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
		if (taskElement) {
			const newArchiveStatus = !isArchived;
			taskElement.style.opacity = newArchiveStatus ? "0.6" : "1";
			taskElement.style.filter = newArchiveStatus ? "grayscale(0.5)" : "none";
			taskElement.className = `task-item ${newArchiveStatus ? "archived" : ""}`;

			// Update archive button
			const archiveBtn = taskElement.querySelector(".archive-btn");
			if (archiveBtn) {
				archiveBtn.innerHTML = `<span class="material-symbols-outlined icon-14">${newArchiveStatus ? "unarchive" : "archive"}</span>`;
			}
		}

		// Update interface
		refreshInterface();
	};

	const handleStatusChange = (newStatus) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		jobsData[jobIndex].tasks[taskIndex].status = newStatus;
		saveToLocalStorage();

		// Update status element in place
		const statusElement = document.querySelector(`[data-task-id="${task.id}"] .task-status`);
		if (statusElement) {
			statusElement.className = `task-status status-${newStatus}`;
			statusElement.textContent = getTaskStatusText(newStatus);
		}

		// Update interface
		refreshInterface();
	};

	const handlePriorityChange = (newPriority) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		jobsData[jobIndex].tasks[taskIndex].priority = newPriority;
		saveToLocalStorage();

		// Update priority element in place
		const priorityElement = document.querySelector(`[data-task-id="${task.id}"] .task-priority`);
		if (priorityElement) {
			priorityElement.className = `task-priority priority-${newPriority}`;
			priorityElement.textContent = getPriorityText(newPriority);
		}

		// Update interface
		refreshInterface();
	};

	const handleDueDateChange = (newDueDate) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;

		jobsData[jobIndex].tasks[taskIndex].dueDate = newDueDate;
		saveToLocalStorage();

		// Update due date element in place
		const dueDateElement = document.querySelector(`[data-task-id="${task.id}"] .task-due-date`);
		if (dueDateElement) {
			dueDateElement.textContent = newDueDate ? formatDate(newDueDate) : "No due date";
		}

		// Update interface
		refreshInterface();
	};

	const handleEdit = () => {
		const taskTextElement = document.querySelector(`[data-task-id="${task.id}"] .task-text`);
		if (!taskTextElement) return;

		const currentText = task.text;
		const textarea = h("textarea", {
			className: "task-edit-textarea",
			textContent: currentText,
		});

		const saveBtn = h("button", {
			className: "action-btn edit-btn edit-save-btn",
			textContent: I18n.t("modals.common.save"),
			onclick: () => {
				const newText = textarea.value.trim();
				if (!newText) return;

				const jobIndex = jobsData.findIndex((j) => j.id === job.id);
				if (jobIndex === -1) return;

				const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
				if (taskIndex === -1) return;

				jobsData[jobIndex].tasks[taskIndex].text = newText;
				saveToLocalStorage();

				// Update in place - replace textarea with new text
				taskTextElement.innerHTML = "";
				taskTextElement.textContent = newText;

				// Update interface
				refreshInterface();
			},
		});

		const cancelBtn = h("button", {
			className: "action-btn cancel-btn edit-cancel-btn",
			textContent: I18n.t("modals.common.cancel"),
			onclick: () => {
				// Cancel editing - restore original text
				taskTextElement.innerHTML = "";
				taskTextElement.textContent = task.text;
			},
		});

		taskTextElement.innerHTML = "";
		taskTextElement.appendChild(textarea);
		taskTextElement.appendChild(h("div", {}, saveBtn, cancelBtn));
		textarea.focus();
	};

	return h(
		"div",
		{
			className: `task-item ${isArchived ? "archived" : ""}`,
			"data-task-id": task.id,
		},
		h(
			"div",
			{
				className: "task-header task-header-layout",
			},
			h(
				"div",
				{ className: "task-controls-row" },
				h(
					"select",
					{
						className: "task-status inline-select",
						value: task.status,
						onchange: (e) => handleStatusChange(e.target.value),
					},
					h("option", { value: "todo" }, I18n.t("modals.tasks.statusTodo")),
					h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress")),
					h("option", { value: "done" }, I18n.t("modals.tasks.statusDone"))
				),
				h(
					"select",
					{
						className: "task-priority inline-select",
						value: task.priority,
						onchange: (e) => handlePriorityChange(e.target.value),
					},
					h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow")),
					h("option", { value: "medium" }, I18n.t("modals.tasks.priorityMedium")),
					h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh"))
				),
				h("input", {
					type: "date",
					className: "task-due-date inline-input",
					value: task.dueDate ? task.dueDate.split("T")[0] : "",
					onchange: (e) =>
						handleDueDateChange(e.target.value ? `${e.target.value}T00:00:00.000Z` : null),
				})
			),
			h(
				"div",
				{ className: "task-actions modal-actions-row" },
				h("button", {
					className: "action-btn edit-task-btn icon-btn-transparent",
					title: I18n.t("modals.tasks.editTitle"),
					innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
					onclick: handleEdit,
				}),
				h("button", {
					className: "action-btn archive-btn icon-btn-transparent",
					title: isArchived
						? I18n.t("modals.tasks.unarchiveTitle")
						: I18n.t("modals.tasks.archiveTitle"),
					innerHTML: `<span class="material-symbols-outlined icon-14">${isArchived ? "unarchive" : "archive"}</span>`,
					onclick: handleArchiveToggle,
				})
			)
		),
		h(
			"div",
			{
				className: "task-text",
			},
			task.text
		)
	);
};

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
			className: "action-btn cancel-btn icon-btn-transparent",
			title: I18n.t("modals.common.cancel"),
			innerHTML: '<span class="material-symbols-outlined icon-14">close</span>',
			onclick: () => disableTaskEditing(task, job)
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
												className: "action-btn edit-task-btn icon-btn-transparent",
												title: I18n.t("modals.tasks.editTitle"),
												innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
												onclick: () => enableTaskEditing(task, job),
											}),
											h("button", {
												className: "action-btn archive-btn icon-btn-transparent",
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
												className: "action-btn archive-btn icon-btn-transparent",
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
						}
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
								placeholder: "Due date & time (optional)"
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

// Simple task editing system
const enableTaskEditing = (task, job) => {
	const taskRow = document.querySelector(`[data-task-id="${task.id}"]`);
	if (!taskRow) return;

	// Replace entire row with editing structure
	taskRow.innerHTML = `
		<td class="task-status-cell">
			<select class="task-edit-input" data-field="status">
				<option value="todo" ${task.status === 'todo' ? 'selected' : ''}>${I18n.t('modals.tasks.statusTodo')}</option>
				<option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>${I18n.t('modals.tasks.statusInProgress')}</option>
				<option value="done" ${task.status === 'done' ? 'selected' : ''}>${I18n.t('modals.tasks.statusDone')}</option>
			</select>
		</td>
		<td class="task-priority-cell">
			<select class="task-edit-input" data-field="priority">
				<option value="low" ${task.priority === 'low' ? 'selected' : ''}>${I18n.t('modals.tasks.priorityLow')}</option>
				<option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>${I18n.t('modals.tasks.priorityMedium')}</option>
				<option value="high" ${task.priority === 'high' ? 'selected' : ''}>${I18n.t('modals.tasks.priorityHigh')}</option>
			</select>
		</td>
		<td class="task-due-date-cell">
			<input type="date" class="task-edit-input" data-field="dueDate" value="${task.dueDate ? task.dueDate.split('T')[0] : ''}" />
		</td>
		<td class="task-duration-cell">
			<select class="task-edit-input" data-field="duration">
				<option value="" ${!task.duration ? 'selected' : ''}>—</option>
				<option value="15min" ${task.duration === '15min' ? 'selected' : ''}>15 min</option>
				<option value="30min" ${task.duration === '30min' ? 'selected' : ''}>30 min</option>
				<option value="1h" ${task.duration === '1h' ? 'selected' : ''}>1h</option>
				<option value="1h30" ${task.duration === '1h30' ? 'selected' : ''}>1:30</option>
				<option value="2h" ${task.duration === '2h' ? 'selected' : ''}>2h</option>
				<option value="3h" ${task.duration === '3h' ? 'selected' : ''}>3h</option>
			</select>
		</td>
		<td class="tasks-table-actions">
			<button class="action-btn save-task-btn icon-btn-transparent" title="${I18n.t('modals.common.save')}">
				<span class="material-symbols-outlined icon-14">check</span>
			</button>
			<button class="action-btn cancel-task-btn icon-btn-transparent" title="${I18n.t('modals.common.cancel')}">
				<span class="material-symbols-outlined icon-14">close</span>
			</button>
		</td>
	`;

	// Find the task text row (next sibling)
	const taskTextRow = taskRow.nextElementSibling;
	if (taskTextRow && taskTextRow.classList.contains('task-text-row')) {
		taskTextRow.innerHTML = `
			<td colspan="5" class="task-text-cell">
				<textarea class="task-text-edit" rows="2" placeholder="${I18n.t('modals.tasks.placeholder')}">${task.text || ''}</textarea>
			</td>
		`;

		// Add Shift+Enter support for textarea
		const textarea = taskTextRow.querySelector('.task-text-edit');
		textarea.onkeydown = (e) => {
			if (e.key === "Enter" && e.shiftKey) {
				e.preventDefault();
				saveTaskEdits(task, job);
			}
		};
	}

	// Add event listeners to buttons
	const saveBtn = taskRow.querySelector('.save-task-btn');
	const cancelBtn = taskRow.querySelector('.cancel-task-btn');

	saveBtn.onclick = () => saveTaskEdits(task, job);
	cancelBtn.onclick = () => cancelTaskEdits(task, job);

	// Focus first input
	const firstInput = taskRow.querySelector('.task-edit-input');
	if (firstInput) firstInput.focus();
};

const saveTaskEdits = (task, job) => {
	const taskRow = document.querySelector(`[data-task-id="${task.id}"]`);
	if (!taskRow) return;

	// Get all input values
	const inputs = taskRow.querySelectorAll('.task-edit-input');
	const newData = {};
	
	inputs.forEach(input => {
		newData[input.dataset.field] = input.value.trim();
	});

	// Get textarea value from task text row
	const taskTextRow = taskRow.nextElementSibling;
	const textarea = taskTextRow?.querySelector('.task-text-edit');
	if (textarea) {
		newData.text = textarea.value.trim();
	}

	// Validation
	if (!newData.text) {
		alert('Task text is required');
		return;
	}

	// Update data
	const jobIndex = jobsData.findIndex(j => j.id === job.id);
	const taskIndex = jobsData[jobIndex].tasks.findIndex(t => t.id === task.id);

	jobsData[jobIndex].tasks[taskIndex].status = newData.status;
	jobsData[jobIndex].tasks[taskIndex].priority = newData.priority;
	jobsData[jobIndex].tasks[taskIndex].dueDate = newData.dueDate ? `${newData.dueDate}T23:59:59.999Z` : null;
	jobsData[jobIndex].tasks[taskIndex].duration = newData.duration || null;
	jobsData[jobIndex].tasks[taskIndex].text = newData.text;

	// Save and refresh in place (no flicker!)
	saveToLocalStorage();
	refreshTasksModal(job);
	refreshInterface();
};

const cancelTaskEdits = (task, job) => {
	// Refresh modal to restore original content (no flicker!)
	refreshTasksModal(job);
};

// Refresh tasks modal content
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

// Create tasks content for modal (extracted to fix scope issue)
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
								h("th", { className: "status-col" }, I18n.t("modals.tasks.statusHeader")),
								h("th", { className: "priority-col" }, I18n.t("modals.tasks.priorityHeader")),
								h("th", { className: "due-date-col" }, I18n.t("modals.tasks.dueDateHeader")),
								h("th", { className: "duration-col" }, I18n.t("modals.tasks.durationHeader")),
								h("th", { className: "actions-col" }, I18n.t("modals.tasks.actionsHeader"))
							)
						),
						h(
							"tbody",
							{},
							...sortedActiveTasks.flatMap((task) => [
								// Task header row
								h(
									"tr",
									{ key: `${task.id}-header`, "data-task-id": task.id },
									h(
										"td",
										{ className: "task-status-cell" },
										h("span", { className: "task-status-display" }, getTaskStatusText(task.status))
									),
									h(
										"td",
										{ className: "task-priority-cell" },
										h("span", { className: "task-priority-display" }, I18n.t(`modals.tasks.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`))
									),
									h(
										"td",
										{ className: "task-due-date-cell" },
										h("span", { className: "task-due-date-display" }, task.dueDate ? formatDate(task.dueDate) : "—")
									),
									h(
										"td",
										{ className: "task-duration-cell" },
										h("span", { className: "task-duration-display" }, task.duration || "—")
									),
									h(
										"td",
										{ className: "tasks-table-actions" },
										h("button", {
											className: "action-btn edit-task-btn icon-btn-transparent",
											title: I18n.t("modals.tasks.editTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
											onclick: () => enableTaskEditing(task, job),
										}),
										h("button", {
											className: "action-btn archive-btn icon-btn-transparent",
											title: I18n.t("modals.tasks.archiveTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">archive</span>',
											onclick: () => archiveTask(task, job),
										})
									)
								),
								// Task text row
								h(
									"tr",
									{ key: `${task.id}-text`, className: "task-text-row" },
									h("td", { colspan: 5, className: "task-text-cell" }, task.text)
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
							{
								className: "material-symbols-outlined expand-icon",
								id: "archived-tasks-icon",
							},
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
								h("th", { className: "status-col" }, I18n.t("modals.tasks.statusHeader")),
								h("th", { className: "priority-col" }, I18n.t("modals.tasks.priorityHeader")),
								h("th", { className: "due-date-col" }, I18n.t("modals.tasks.dueDateHeader")),
								h("th", { className: "duration-col" }, I18n.t("modals.tasks.durationHeader")),
								h("th", { className: "actions-col" }, I18n.t("modals.tasks.actionsHeader"))
							)
						),
						h(
							"tbody",
							{},
							...sortedArchivedTasks.flatMap((task) => [
								h(
									"tr",
									{ key: `${task.id}-header` },
									h("td", {}, getTaskStatusText(task.status)),
									h("td", {}, I18n.t(`modals.tasks.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)),
									h("td", {}, task.dueDate ? formatDate(task.dueDate) : "—"),
									h("td", {}, task.duration || "—"),
									h(
										"td",
										{ className: "tasks-table-actions" },
										h("button", {
											className: "action-btn archive-btn icon-btn-transparent",
											title: I18n.t("modals.tasks.unarchiveTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">unarchive</span>',
											onclick: () => archiveTask(task, job),
										})
									)
								),
								h(
									"tr",
									{ key: `${task.id}-text`, className: "task-text-row" },
									h("td", { colspan: 5 }, task.text)
								),
							])
						)
					)
				)
			: null,

		// Add task form
		h(
			"div",
			{ className: "add-task-row" },
			h("h4", { className: "add-task-title" }, I18n.t("modals.tasks.addSection")),
			h(
				"form",
				{
					className: "add-task-form",
					onsubmit: (e) => {
						e.preventDefault();
						handleAddTask();
					}
				},
				h(
					"div",
					{ className: "task-form-grid" },
					h(
						"select",
						{
							className: "add-task-status",
							title: I18n.t("modals.tasks.statusHeader"),
						},
						h("option", { value: "todo" }, I18n.t("modals.tasks.statusTodo")),
						h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress")),
						h("option", { value: "done" }, I18n.t("modals.tasks.statusDone"))
					),
					h(
						"select",
						{
							className: "add-task-priority",
							title: I18n.t("modals.tasks.priorityHeader"),
						},
						h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow")),
						h("option", { value: "medium", selected: true }, I18n.t("modals.tasks.priorityMedium")),
						h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh"))
					),
					h("input", {
						type: "date",
						className: "add-task-due-date",
						title: I18n.t("modals.tasks.dueDateHeader"),
					}),
					h(
						"select",
						{
							className: "add-task-duration",
							title: I18n.t("modals.tasks.durationHeader"),
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

// Open unified tasks modal
const openTasksModal = (job) => {
	const modal = TasksModal({
		job,
		onClose: closeModal,
	});
	document.body.appendChild(modal);
};

// Alias for backward compatibility
const openAddTaskModal = openTasksModal;

// Make task components and functions available globally
// Use TasksBoard modal for task editing
const openTaskEditModal = (task, job) => {
	if (typeof TasksBoard !== "undefined" && TasksBoard.openTaskEditModal) {
		TasksBoard.openTaskEditModal(task);
	}
};

window.TasksCount = TasksCount;
window.TaskItem = TaskItem;
window.TasksModal = TasksModal;
window.openTasksModal = openTasksModal;
window.openAddTaskModal = openAddTaskModal;
window.enableTaskEditing = enableTaskEditing;
window.saveTaskEdits = saveTaskEdits;
window.cancelTaskEdits = cancelTaskEdits;
window.refreshTasksModal = refreshTasksModal;
window.createTasksContent = createTasksContent;
window.openTaskEditModal = openTaskEditModal;
