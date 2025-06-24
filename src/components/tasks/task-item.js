// ============================================================================
// TASK ITEM COMPONENT
// ============================================================================

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
		// Use TasksBoard modal for task editing instead of inline editing
		if (typeof TasksBoard !== "undefined" && TasksBoard.openTaskEditModal) {
			TasksBoard.openTaskEditModal(task);
		}
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
					className: "action-btn edit-task-btn ",
					title: I18n.t("modals.tasks.editTitle"),
					innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
					onclick: handleEdit,
				}),
				h("button", {
					className: "action-btn archive-btn ",
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

// Make TaskItem available globally
window.TaskItem = TaskItem;
