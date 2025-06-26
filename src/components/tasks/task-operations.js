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

// Make only non-conflicting functions available globally
// Note: createTasksContent, enableTaskEditing, saveTaskEdits, refreshTasksModal are handled by task-modal.js
window.openTasksModal = openTasksModal;
window.openAddTaskModal = openAddTaskModal;
window.openTaskEditModal = openTaskEditModal;
