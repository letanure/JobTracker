// ============================================================================
// TASK MODAL COMPONENT
// ============================================================================

// Simple task editing system (following notes pattern)
const enableTaskModalEditing = (task, job) => {
	// Find the task row by looking for the span with data-task-id
	const taskSpan = document.querySelector(`[data-task-id="${task.id}"]`);
	if (!taskSpan) return;
	
	const taskRow = taskSpan.closest("tr");
	if (!taskRow) return;

	// Replace the first row (status, priority, due date, duration, actions)
	taskRow.innerHTML = `
		<td class="task-status-cell">
			<select class="task-edit-input" data-field="status">
				<option value="todo" ${task.status === "todo" ? "selected" : ""}>${I18n.t("modals.tasks.statusTodo")}</option>
				<option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>${I18n.t("modals.tasks.statusInProgress")}</option>
				<option value="done" ${task.status === "done" ? "selected" : ""}>${I18n.t("modals.tasks.statusDone")}</option>
			</select>
		</td>
		<td class="task-priority-cell">
			<select class="task-edit-input" data-field="priority">
				<option value="low" ${task.priority === "low" ? "selected" : ""}>${I18n.t("modals.tasks.priorityLow")}</option>
				<option value="medium" ${task.priority === "medium" ? "selected" : ""}>${I18n.t("modals.tasks.priorityMedium")}</option>
				<option value="high" ${task.priority === "high" ? "selected" : ""}>${I18n.t("modals.tasks.priorityHigh")}</option>
			</select>
		</td>
		<td class="task-due-date-cell">
			<input type="datetime-local" class="task-edit-input" data-field="dueDate" value="${task.dueDate ? task.dueDate.slice(0, 16) : ""}" />
		</td>
		<td class="task-duration-cell">
			<select class="task-edit-input" data-field="duration">
				<option value="" ${!task.duration ? "selected" : ""}>—</option>
				<option value="15min" ${task.duration === "15min" ? "selected" : ""}>15 min</option>
				<option value="30min" ${task.duration === "30min" ? "selected" : ""}>30 min</option>
				<option value="1h" ${task.duration === "1h" ? "selected" : ""}>1h</option>
				<option value="1h30" ${task.duration === "1h30" ? "selected" : ""}>1:30</option>
				<option value="2h" ${task.duration === "2h" ? "selected" : ""}>2h</option>
				<option value="3h" ${task.duration === "3h" ? "selected" : ""}>3h</option>
			</select>
		</td>
		<td class="tasks-table-actions">
			<button class="action-btn save-task-btn" title="${I18n.t("modals.common.save")}">
				<span class="material-symbols-outlined icon-14">check</span>
			</button>
			<button class="action-btn cancel-task-btn" title="${I18n.t("modals.common.cancel")}">
				<span class="material-symbols-outlined icon-14">close</span>
			</button>
		</td>
	`;

	// Find and replace the task text row (next sibling)
	const taskTextRow = taskRow.nextElementSibling;
	if (taskTextRow?.classList.contains("task-text-row")) {
		taskTextRow.innerHTML = `
			<td colspan="5" class="task-text-cell">
				<textarea class="task-text-edit" rows="2" placeholder="${I18n.t("modals.tasks.placeholder")}">${task.text || ""}</textarea>
			</td>
		`;

		// Add Shift+Enter support for textarea
		const textarea = taskTextRow.querySelector(".task-text-edit");
		textarea.onkeydown = (e) => {
			if (e.key === "Enter" && e.shiftKey) {
				e.preventDefault();
				saveTaskEdits(task, job);
			}
		};
	}

	// Add event listeners to buttons
	const saveBtn = taskRow.querySelector(".save-task-btn");
	const cancelBtn = taskRow.querySelector(".cancel-task-btn");

	saveBtn.onclick = () => saveTaskEdits(task, job);
	cancelBtn.onclick = () => cancelTaskEdits(task, job);

	// Focus first input
	const firstInput = taskRow.querySelector(".task-edit-input");
	if (firstInput) firstInput.focus();
};

const saveTaskEdits = (task, job) => {
	// Find the row with the save button (since data-task-id is no longer there after editing)
	const saveBtn = document.querySelector(".save-task-btn");
	if (!saveBtn) return;
	
	const taskRow = saveBtn.closest("tr");
	if (!taskRow) return;

	// Get all input values
	const inputs = taskRow.querySelectorAll(".task-edit-input");
	const newData = {};

	inputs.forEach((input) => {
		newData[input.dataset.field] = input.value.trim();
	});

	// Get textarea value from task text row
	const taskTextRow = taskRow.nextElementSibling;
	const textarea = taskTextRow?.querySelector(".task-text-edit");
	if (textarea) {
		newData.text = textarea.value.trim();
	}

	// Validation
	if (!newData.text) {
		alert(I18n.t("modals.tasks.validation.taskRequired"));
		return;
	}

	// Update data
	const jobIndex = jobsData.findIndex((j) => j.id === job.id);
	const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);

	jobsData[jobIndex].tasks[taskIndex].status = newData.status;
	jobsData[jobIndex].tasks[taskIndex].priority = newData.priority;
	jobsData[jobIndex].tasks[taskIndex].dueDate = newData.dueDate ? new Date(newData.dueDate).toISOString() : null;
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

// Helper functions for task modal
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

// Create tasks content for modal
const createTasksContent = (job, sortedActiveTasks, sortedArchivedTasks) => {
	return h(
		"div",
		// Active tasks table
		sortedActiveTasks.length > 0
			? h(
					"div.tasks-table-container",
					h(
						"table.tasks-table",
						h(
							"thead",
							h(
								"tr",
								h("th", "Status"),
								h("th", "Priority"),
								h("th", "Due Date"),
								h("th", "Duration"),
								h("th", "Actions")
							)
						),
						h(
							"tbody",
							...sortedActiveTasks.flatMap((task) => [
								h(
									"tr.task-info-row",
									{ key: task.id },
									h(
										"td.task-status-cell",
										h(
											"span.task-status-display",
											{
												"data-task-id": task.id,
												"data-field": "status",
											},
											getTaskStatusText(task.status)
										)
									),
									h(
										"td.task-priority-cell",
										h(
											"span.task-priority-display",
											{
												"data-task-id": task.id,
												"data-field": "priority",
											},
											getPriorityText(task.priority)
										)
									),
									h(
										"td.task-due-date-cell",
										h(
											"span.task-due-date-display",
											{
												"data-task-id": task.id,
												"data-field": "dueDate",
											},
											task.dueDate ? formatDate(task.dueDate) : "—"
										)
									),
									h(
										"td.task-duration-cell",
										h(
											"span.task-duration-display",
											{
												"data-task-id": task.id,
												"data-field": "duration",
											},
											formatDuration(task.duration)
										)
									),
									h(
										"td.tasks-table-actions",
										h("button.action-btn.edit-task-btn", {
											title: I18n.t("modals.tasks.editTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
											onclick: () => enableTaskModalEditing(task, job),
										}),
										h("button.action-btn.archive-btn", {
											title: I18n.t("modals.tasks.archiveTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">archive</span>',
											onclick: () => archiveTask(task, job),
										})
									)
								),
								h(
									"tr",
									{ key: `${task.id}-text`, className: "task-text-row" },
									h("td.task-text-cell", { colspan: 5 }, task.text)
								),
							])
						)
					)
				)
			: h("p.modal-empty-message", I18n.t("modals.tasks.emptyState")),

		// Archived tasks section
		sortedArchivedTasks.length > 0
			? h(
					"div.archived-tasks-section",
					h(
						"h4.tasks-archived-header",
						{
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
							"span.material-symbols-outlined.expand-icon",
							{ id: "archived-tasks-icon" },
							"expand_more"
						),
						I18n.t("modals.tasks.archivedSection", { count: sortedArchivedTasks.length })
					),
					h(
						"table.tasks-table.archived",
						{ id: "archived-tasks-table", className: "hidden" },
						h(
							"thead",
							h(
								"tr",
								h("th", "Status"),
								h("th", "Priority"),
								h("th", "Task"),
								h("th", "Due Date"),
								h("th", "Actions")
							)
						),
						h(
							"tbody",
							...sortedArchivedTasks.map((task) =>
								h(
									"tr",
									{ key: task.id },
									h("td", getTaskStatusText(task.status)),
									h("td", getPriorityText(task.priority)),
									h("td.archived-task-text-cell", task.text),
									h("td", task.dueDate ? formatDate(task.dueDate) : "—"),
									h(
										"td.tasks-table-actions",
										h("button.action-btn.archive-btn", {
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
			"div.add-task-section",
			h("h4.add-task-title", I18n.t("modals.tasks.addSection")),
			h(
				"form.add-task-form",
				{
					onsubmit: (e) => {
						e.preventDefault();
						handleAddTask();
					},
				},
				h(
					"div.add-task-form-row",
					h(
						"div.add-task-field",
						h("label", I18n.t("modals.tasks.status")),
						h(
							"select.add-task-status",
							{
								value: "todo",
							},
							h("option", { value: "todo" }, I18n.t("modals.tasks.statusTodo")),
							h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress")),
							h("option", { value: "done" }, I18n.t("modals.tasks.statusDone"))
						)
					),
					h(
						"div.add-task-field",
						h("label", I18n.t("modals.tasks.priority")),
						h(
							"select.add-task-priority",
							{
								value: "medium",
							},
							h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow")),
							h("option", { value: "medium" }, I18n.t("modals.tasks.priorityMedium")),
							h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh"))
						)
					),
					h(
						"div.add-task-field",
						h("label", I18n.t("modals.tasks.dueDate")),
						h("input.add-task-due-date", {
							type: "datetime-local",
							placeholder: "Due date & time (optional)",
						})
					),
					h(
						"div.add-task-field",
						h("label", I18n.t("modals.tasks.duration")),
						h(
							"select.add-task-duration",
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
				h("textarea.add-task-textarea", {
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
					"div.add-task-form-actions",
					h("button.action-btn.primary-btn", { type: "submit" }, I18n.t("modals.tasks.addButton"))
				)
			)
		)
	);
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





	return h(
		"div.modal-overlay",
		{
			"data-job-id": job.id,
			onclick: (e) => e.target === e.currentTarget && onClose(),
		},
		h(
			"div.modal",
			h(
				"div.modal-header",
				h(
					"h3.modal-title",
					I18n.t("modals.tasks.title", { position: job.position, company: job.company })
				),
				h("button.modal-close", { onclick: onClose }, "×")
			),
			h("div.modal-body", createTasksContent(job, sortedActiveTasks, sortedArchivedTasks))
		)
	);
};

// Global task handling function  
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

	// Find the job from the modal
	const modalTitle = document.querySelector(".modal-title");
	if (!modalTitle) return;
	
	const currentModal = modalTitle.closest('.modal-overlay');
	const jobId = currentModal.dataset.jobId;
	const job = jobsData.find(j => j.id == jobId);
	if (!job) return;

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

	// Refresh modal without flicker
	refreshTasksModal(job);

	// Clear the form
	textarea.value = "";
	statusSelect.value = "todo";
	prioritySelect.value = "medium";
	dueDateInput.value = "";
	durationSelect.value = "";

	// Focus back to the textarea
	setTimeout(() => {
		const newTextarea = document.querySelector(".add-task-textarea");
		if (newTextarea) newTextarea.focus();
	}, 100);

	// Update interface
	refreshInterface();
};

// Make TasksModal available globally
window.TasksModal = TasksModal;
window.handleAddTask = handleAddTask;
window.enableTaskModalEditing = enableTaskModalEditing;
window.saveTaskEdits = saveTaskEdits;
window.cancelTaskEdits = cancelTaskEdits;
window.refreshTasksModal = refreshTasksModal;
window.createTasksContent = createTasksContent;
window.archiveTask = archiveTask;
