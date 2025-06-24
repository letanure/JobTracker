// ============================================================================
// TASK OPERATIONS - Task management utilities and functions
// ============================================================================

// Simple task editing system
const enableTaskEditing = (task, job) => {
	const taskRow = document.querySelector(`[data-task-id="${task.id}"]`);
	if (!taskRow) return;

	// Replace entire row with editing structure
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
			<input type="date" class="task-edit-input" data-field="dueDate" value="${task.dueDate ? task.dueDate.split("T")[0] : ""}" />
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

	// Find the task text row (next sibling)
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
	const taskRow = document.querySelector(`[data-task-id="${task.id}"]`);
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
		alert("Task text is required");
		return;
	}

	// Update data
	const jobIndex = jobsData.findIndex((j) => j.id === job.id);
	const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);

	jobsData[jobIndex].tasks[taskIndex].status = newData.status;
	jobsData[jobIndex].tasks[taskIndex].priority = newData.priority;
	jobsData[jobIndex].tasks[taskIndex].dueDate = newData.dueDate
		? `${newData.dueDate}T23:59:59.999Z`
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
								h("th.status-col", I18n.t("modals.tasks.statusHeader")),
								h("th.priority-col", I18n.t("modals.tasks.priorityHeader")),
								h("th.due-date-col", I18n.t("modals.tasks.dueDateHeader")),
								h("th.duration-col", I18n.t("modals.tasks.durationHeader")),
								h("th.actions-col", I18n.t("modals.tasks.actionsHeader"))
							)
						),
						h(
							"tbody",
							...sortedActiveTasks.flatMap((task) => [
								// Task header row
								h(
									"tr",
									{ key: `${task.id}-header`, "data-task-id": task.id },
									h(
										"td.task-status-cell",
										h("span.task-status-display", getTaskStatusText(task.status))
									),
									h(
										"td.task-priority-cell",
										h(
											"span.task-priority-display",
											I18n.t(
												`modals.tasks.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`
											)
										)
									),
									h(
										"td.task-due-date-cell",
										h("span.task-due-date-display", task.dueDate ? formatDate(task.dueDate) : "—")
									),
									h("td.task-duration-cell", h("span.task-duration-display", task.duration || "—")),
									h(
										"td.tasks-table-actions",
										h("button.action-btn.edit-task-btn", {
											title: I18n.t("modals.tasks.editTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
											onclick: () => enableTaskEditing(task, job),
										}),
										h("button.action-btn.archive-btn", {
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
							{
								id: "archived-tasks-icon",
							},
							"expand_more"
						),
						I18n.t("modals.tasks.archivedSection", { count: sortedArchivedTasks.length })
					),
					h(
						"table.tasks-table.archived",
						{ id: "archived-tasks-table", style: "display: none" },
						h(
							"thead",
							h(
								"tr",
								h("th.status-col", I18n.t("modals.tasks.statusHeader")),
								h("th.priority-col", I18n.t("modals.tasks.priorityHeader")),
								h("th.due-date-col", I18n.t("modals.tasks.dueDateHeader")),
								h("th.duration-col", I18n.t("modals.tasks.durationHeader")),
								h("th.actions-col", I18n.t("modals.tasks.actionsHeader"))
							)
						),
						h(
							"tbody",
							...sortedArchivedTasks.flatMap((task) => [
								h(
									"tr",
									{ key: `${task.id}-header` },
									h("td", getTaskStatusText(task.status)),
									h(
										"td",
										I18n.t(
											`modals.tasks.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`
										)
									),
									h("td", task.dueDate ? formatDate(task.dueDate) : "—"),
									h("td", task.duration || "—"),
									h(
										"td.tasks-table-actions",
										h("button.action-btn.archive-btn", {
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
			"div.add-task-row",
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
					"div.task-form-grid",
					h(
						"select.add-task-status",
						{
							title: I18n.t("modals.tasks.statusHeader"),
						},
						h("option", { value: "todo" }, I18n.t("modals.tasks.statusTodo")),
						h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress")),
						h("option", { value: "done" }, I18n.t("modals.tasks.statusDone"))
					),
					h(
						"select.add-task-priority",
						{
							title: I18n.t("modals.tasks.priorityHeader"),
						},
						h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow")),
						h("option", { value: "medium", selected: true }, I18n.t("modals.tasks.priorityMedium")),
						h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh"))
					),
					h("input.add-task-due-date", {
						type: "date",
						title: I18n.t("modals.tasks.dueDateHeader"),
					}),
					h(
						"select.add-task-duration",
						{
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

// Use TasksBoard modal for task editing
const openTaskEditModal = (task, job) => {
	if (typeof TasksBoard !== "undefined" && TasksBoard.openTaskEditModal) {
		TasksBoard.openTaskEditModal(task);
	}
};

// Make all functions available globally
window.enableTaskEditing = enableTaskEditing;
window.saveTaskEdits = saveTaskEdits;
window.cancelTaskEdits = cancelTaskEdits;
window.refreshTasksModal = refreshTasksModal;
window.createTasksContent = createTasksContent;
window.openTasksModal = openTasksModal;
window.openAddTaskModal = openAddTaskModal;
window.openTaskEditModal = openTaskEditModal;
