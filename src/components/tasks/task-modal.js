// ============================================================================
// TASK MODAL COMPONENT
// ============================================================================

// Simple task editing system (following notes pattern)
const enableTaskModalEditing = (task, job) => {
	const taskItem = document.querySelector(`[data-task-id="${task.id}"]`);
	if (!taskItem) return;

	// Replace the task item with editing structure
	taskItem.innerHTML = `
		<div class="task-header">
			<div class="task-status">
				<select class="task-edit-input" data-field="status">
					<option value="todo" ${task.status === "todo" ? "selected" : ""}>${I18n.t("modals.tasks.statusTodo")}</option>
					<option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>${I18n.t("modals.tasks.statusInProgress")}</option>
					<option value="done" ${task.status === "done" ? "selected" : ""}>${I18n.t("modals.tasks.statusDone")}</option>
				</select>
			</div>
			<div class="task-priority">
				<select class="task-edit-input" data-field="priority">
					<option value="low" ${task.priority === "low" ? "selected" : ""}>${I18n.t("modals.tasks.priorityLow")}</option>
					<option value="medium" ${task.priority === "medium" ? "selected" : ""}>${I18n.t("modals.tasks.priorityMedium")}</option>
					<option value="high" ${task.priority === "high" ? "selected" : ""}>${I18n.t("modals.tasks.priorityHigh")}</option>
				</select>
			</div>
			<div class="task-due-date">
				<input type="datetime-local" class="task-edit-input" data-field="dueDate" value="${task.dueDate ? task.dueDate.slice(0, 16) : ""}" />
			</div>
			<div class="task-duration">
				<select class="task-edit-input" data-field="duration">
					<option value="" ${!task.duration ? "selected" : ""}>—</option>
					<option value="15min" ${task.duration === "15min" ? "selected" : ""}>15 min</option>
					<option value="30min" ${task.duration === "30min" ? "selected" : ""}>30 min</option>
					<option value="1h" ${task.duration === "1h" ? "selected" : ""}>1h</option>
					<option value="1h30" ${task.duration === "1h30" ? "selected" : ""}>1:30</option>
					<option value="2h" ${task.duration === "2h" ? "selected" : ""}>2h</option>
					<option value="3h" ${task.duration === "3h" ? "selected" : ""}>3h</option>
				</select>
			</div>
			<div class="task-actions">
				<button class="action-btn save-task-btn" title="${I18n.t("modals.common.save")}">
					<span class="material-symbols-outlined icon-14">check</span>
				</button>
				<button class="action-btn cancel-task-btn" title="${I18n.t("modals.common.cancel")}">
					<span class="material-symbols-outlined icon-14">close</span>
				</button>
			</div>
		</div>
		<div class="task-text">
			<textarea class="task-text-edit" rows="3" placeholder="${I18n.t("modals.tasks.placeholder")}">${task.text || ""}</textarea>
		</div>
	`;

	// Add Shift+Enter support for textarea
	const textarea = taskItem.querySelector(".task-text-edit");
	if (textarea) {
		textarea.onkeydown = (e) => {
			if (e.key === "Enter" && e.shiftKey) {
				e.preventDefault();
				saveTaskEdits(task, job);
			}
		};
	}

	// Add event listeners to buttons
	const saveBtn = taskItem.querySelector(".save-task-btn");
	const cancelBtn = taskItem.querySelector(".cancel-task-btn");

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
	const jobIndex = jobsData.findIndex((j) => String(j.id) === String(job.id));
	const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => String(t.id) === String(task.id));

	jobsData[jobIndex].tasks[taskIndex].status = newData.status;
	jobsData[jobIndex].tasks[taskIndex].priority = newData.priority;
	jobsData[jobIndex].tasks[taskIndex].dueDate = newData.dueDate
		? new Date(newData.dueDate).toISOString()
		: null;
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
	const jobIndex = jobsData.findIndex((j) => String(j.id) === String(job.id));
	if (jobIndex === -1) return;

	const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => String(t.id) === String(task.id));
	if (taskIndex === -1) return;

	// Store archived section state before refresh
	const archivedList = document.getElementById("archived-tasks-list");
	const wasExpanded = archivedList && archivedList.style.display === "block";

	jobsData[jobIndex].tasks[taskIndex].archived = !task.archived;
	saveToLocalStorage();

	// Refresh modal without flicker
	refreshTasksModal(job);

	// Restore archived section state after refresh
	if (wasExpanded) {
		setTimeout(() => {
			const newArchivedList = document.getElementById("archived-tasks-list");
			const expandIcon = document.getElementById("archived-tasks-icon");
			if (newArchivedList) {
				newArchivedList.style.display = "block";
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
		// Active tasks list
		sortedActiveTasks.length > 0
			? h(
					"div.tasks-list-container",
					...sortedActiveTasks.map((task) =>
						h(
							"div.task-item",
							{ key: task.id, "data-task-id": task.id },
							h(
								"div.task-header",
								h(
									"div.task-status",
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
									"div.task-priority",
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
									"div.task-due-date",
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
									"div.task-duration",
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
									"div.task-actions",
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
							h("div.task-text", task.text)
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
								const archivedList = document.getElementById("archived-tasks-list");
								const expandIcon = document.getElementById("archived-tasks-icon");
								if (archivedList.style.display === "none") {
									archivedList.style.display = "block";
									expandIcon.textContent = "expand_less";
								} else {
									archivedList.style.display = "none";
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
						"div.tasks-list-container.archived",
						{ id: "archived-tasks-list", style: "display: none;" },
						...sortedArchivedTasks.map((task) =>
							h(
								"div.task-item.archived",
								{ key: task.id },
								h(
									"div.task-header",
									h("div.task-status", getTaskStatusText(task.status)),
									h("div.task-priority", getPriorityText(task.priority)),
									h("div.task-due-date", task.dueDate ? formatDate(task.dueDate) : "—"),
									h("div.task-duration", formatDuration(task.duration)),
									h(
										"div.task-actions",
										h("button.action-btn.archive-btn", {
											title: I18n.t("modals.tasks.unarchiveTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">unarchive</span>',
											onclick: () => archiveTask(task, job),
										})
									)
								),
								h("div.task-text", task.text)
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
	const jobIndex = jobsData.findIndex((j) => String(j.id) === String(job.id));
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
		const jobIndex = jobsData.findIndex((j) => String(j.id) === String(job.id));
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

	const currentModal = modalTitle.closest(".modal-overlay");
	const jobId = currentModal.dataset.jobId;
	const job = jobsData.find((j) => String(j.id) === String(jobId));
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
	const jobIndex = jobsData.findIndex((j) => String(j.id) === String(job.id));
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
