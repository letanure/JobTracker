// ============================================================================
// TASKS SYSTEM COMPONENTS
// ============================================================================

// Tasks count display component with colored counters
const TasksCount = ({ tasks = [], onClick }) => {
	const activeTasks = tasks.filter(task => !task.archived);
	const todoCount = activeTasks.filter((task) => task.status === "todo").length;
	const inProgressCount = activeTasks.filter(
		(task) => task.status === "in-progress",
	).length;
	const doneCount = activeTasks.filter((task) => task.status === "done").length;
	const totalActiveCount = activeTasks.length;
	const archivedCount = tasks.length - totalActiveCount;

	const className = totalActiveCount === 0 ? "tasks-count zero" : "tasks-count";

	return h(
		"span",
		{
			className,
			onclick: onClick, // Always allow clicks to open modal
			title: `${totalActiveCount} active task${totalActiveCount !== 1 ? 's' : ''} (${todoCount} todo, ${inProgressCount} in progress, ${doneCount} done)${archivedCount > 0 ? ` + ${archivedCount} archived` : ''}`
		},
		h("span", { className: "task-count-todo" }, todoCount.toString()),
		h("span", { className: "task-count-separator" }, "/"),
		h(
			"span",
			{ className: "task-count-in-progress" },
			inProgressCount.toString(),
		),
		h("span", { className: "task-count-separator" }, "/"),
		h("span", { className: "task-count-done" }, doneCount.toString()),
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
			taskElement.className = `task-item ${newArchiveStatus ? 'archived' : ''}`;
			
			// Update archive button
			const archiveBtn = taskElement.querySelector('.archive-btn');
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
			textContent: currentText
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
			}
		});
		
		const cancelBtn = h("button", {
			className: "action-btn cancel-btn edit-cancel-btn",
			textContent: I18n.t("modals.common.cancel"),
			onclick: () => {
				// Cancel editing - restore original text
				taskTextElement.innerHTML = "";
				taskTextElement.textContent = task.text;
			}
		});
		
		taskTextElement.innerHTML = "";
		taskTextElement.appendChild(textarea);
		taskTextElement.appendChild(h("div", {}, saveBtn, cancelBtn));
		textarea.focus();
	};
	
	return h(
		"div",
		{ 
			className: `task-item ${isArchived ? 'archived' : ''}`,
			"data-task-id": task.id
		},
		h(
			"div",
			{ 
				className: "task-header task-header-layout"
			},
			h(
				"div",
				{ className: "task-controls-row" },
				h("select", {
					className: "task-status inline-select",
					value: task.status,
					onchange: (e) => handleStatusChange(e.target.value)
				}, 
					h("option", { value: "todo" }, I18n.t("modals.tasks.statusTodo")),
					h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress")),
					h("option", { value: "done" }, I18n.t("modals.tasks.statusDone"))
				),
				h("select", {
					className: "task-priority inline-select",
					value: task.priority,
					onchange: (e) => handlePriorityChange(e.target.value)
				}, 
					h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow")),
					h("option", { value: "medium" }, I18n.t("modals.tasks.priorityMedium")),
					h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh"))
				),
				h("input", {
					type: "date",
					className: "task-due-date inline-input",
					value: task.dueDate ? task.dueDate.split('T')[0] : "",
					onchange: (e) => handleDueDateChange(e.target.value ? e.target.value + 'T00:00:00.000Z' : null)
				})
			),
			h(
				"div",
				{ className: "task-actions modal-actions-row" },
				h("button", {
					className: "action-btn edit-task-btn icon-btn-transparent",
					title: I18n.t("modals.tasks.editTitle"),
					innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
					onclick: handleEdit
				}),
				h("button", {
					className: "action-btn archive-btn icon-btn-transparent",
					title: isArchived ? I18n.t("modals.tasks.unarchiveTitle") : I18n.t("modals.tasks.archiveTitle"),
					innerHTML: `<span class="material-symbols-outlined icon-14">${isArchived ? "unarchive" : "archive"}</span>`,
					onclick: handleArchiveToggle
				})
			)
		),
		h("div", { 
			className: "task-text"
		}, task.text),
	);
};

// Unified modal component for viewing and adding tasks
const TasksModal = ({ job, onClose }) => {
	const tasks = job.tasks || [];
	const activeTasks = tasks.filter(task => !task.archived);
	const archivedTasks = tasks.filter(task => task.archived);
	const sortedActiveTasks = [...activeTasks].sort(
		(a, b) => new Date(a.createdDate || a.date) - new Date(b.createdDate || b.date),
	);
	const sortedArchivedTasks = [...archivedTasks].sort(
		(a, b) => new Date(a.createdDate || a.date) - new Date(b.createdDate || b.date),
	);

	const handleAddTask = () => {
		const textarea = document.querySelector(".add-task-textarea");
		const taskText = textarea.value.trim();

		if (!taskText) {
			// Show error message instead of alert
			showValidationError(textarea, "Task text is required");
			return;
		}

		const newTask = {
			id: Date.now(),
			createdDate: new Date().toISOString(),
			text: taskText,
			status: "todo",
			priority: "medium",
			dueDate: null
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

		// Clear the textarea
		textarea.value = "";

		// Update the tasks count in the table (refresh interface for count update)
		refreshInterface();
	};

	const editTaskInline = (task, job) => {
		const cell = event.target.closest('tr').querySelector('.task-text-cell');
		const currentText = task.text;
		
		// Create textarea element
		const textarea = h("textarea", {
			value: currentText,
			className: "inline-edit-textarea",
			onblur: () => saveTaskText(task, job, textarea.value, cell),
			onkeydown: (e) => {
				if (e.key === "Enter" && e.ctrlKey) {
					e.preventDefault();
					saveTaskText(task, job, textarea.value, cell);
				} else if (e.key === "Escape") {
					e.preventDefault();
					restoreTaskCell(task, cell);
				}
			}
		});
		
		// Replace cell content with textarea
		cell.innerHTML = "";
		cell.appendChild(textarea);
		textarea.focus();
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

	const restoreTaskCell = (task, cell) => {
		cell.innerHTML = "";
		cell.textContent = task.text;
	};

	const archiveTask = (task, job) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;
		
		const taskIndex = jobsData[jobIndex].tasks.findIndex((t) => t.id === task.id);
		if (taskIndex === -1) return;
		
		jobsData[jobIndex].tasks[taskIndex].archived = !task.archived;
		saveToLocalStorage();
		
		// Refresh modal without flicker
		refreshTasksModal(job);
		
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
		const activeTasks = tasks.filter(task => !task.archived);
		const archivedTasks = tasks.filter(task => task.archived);
		const sortedActiveTasks = [...activeTasks].sort((a, b) => new Date(a.createdDate || a.date) - new Date(b.createdDate || b.date));
		const sortedArchivedTasks = [...archivedTasks].sort((a, b) => new Date(a.createdDate || a.date) - new Date(b.createdDate || b.date));
		
		// Recreate modal body content
		modalBody.innerHTML = "";
		modalBody.appendChild(createTasksContent(job, sortedActiveTasks, sortedArchivedTasks));
	};

	const createTasksContent = (job, sortedActiveTasks, sortedArchivedTasks) => {
		return h("div", {},
			// Active tasks table
			sortedActiveTasks.length > 0 ? h("div", { className: "tasks-table-container" },
				h("table", { className: "tasks-table" },
					h("thead", {},
						h("tr", {},
							h("th", {}, "Status"),
							h("th", {}, "Priority"),
							h("th", {}, "Due Date"),
							h("th", {}, "Actions")
						)
					),
					h("tbody", {},
						...sortedActiveTasks.flatMap((task) => [
							h("tr", { key: task.id, className: "task-info-row" },
								h("td", {},
									h("select", {
										className: "task-status-select",
										value: task.status,
										onchange: (e) => updateTaskStatus(task, job, e.target.value)
									}, 
										h("option", { value: "todo" }, I18n.t("modals.tasks.statusTodo")),
										h("option", { value: "in-progress" }, I18n.t("modals.tasks.statusInProgress")),
										h("option", { value: "done" }, I18n.t("modals.tasks.statusDone"))
									)
								),
								h("td", {},
									h("select", {
										className: "task-priority-select",
										value: task.priority,
										onchange: (e) => updateTaskPriority(task, job, e.target.value)
									}, 
										h("option", { value: "low" }, I18n.t("modals.tasks.priorityLow")),
										h("option", { value: "medium" }, I18n.t("modals.tasks.priorityMedium")),
										h("option", { value: "high" }, I18n.t("modals.tasks.priorityHigh"))
									)
								),
								h("td", {}, task.dueDate ? formatDate(task.dueDate) : "—"),
								h("td", { className: "tasks-table-actions" },
									h("button", {
										className: "action-btn edit-task-btn icon-btn-transparent",
										title: I18n.t("modals.tasks.editTitle"),
										innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
										onclick: () => editTaskInline(task, job)
									}),
									h("button", {
										className: "action-btn archive-btn icon-btn-transparent",
										title: I18n.t("modals.tasks.archiveTitle"),
										innerHTML: '<span class="material-symbols-outlined icon-14">archive</span>',
										onclick: () => archiveTask(task, job)
									})
								)
							),
							h("tr", { key: `${task.id}-text`, className: "task-text-row" },
								h("td", { 
									colspan: 4,
									className: "task-text-cell"
								}, task.text)
							)
						])
					)
				)
			) : h("p", { className: "modal-empty-message" }, I18n.t("modals.tasks.emptyState")),
			
			// Archived tasks section
			sortedArchivedTasks.length > 0 ? h("div", { className: "archived-tasks-section" },
				h("h4", { 
					className: "tasks-archived-header",
					onclick: () => {
						const archivedTable = document.getElementById('archived-tasks-table');
						const expandIcon = document.getElementById('archived-tasks-icon');
						if (archivedTable.style.display === 'none') {
							archivedTable.style.display = 'table';
							expandIcon.textContent = 'expand_less';
						} else {
							archivedTable.style.display = 'none';
							expandIcon.textContent = 'expand_more';
						}
					}
				}, 
					h('span', { className: 'material-symbols-outlined expand-icon', id: 'archived-tasks-icon' }, 'expand_more'),
					I18n.t("modals.tasks.archivedSection", { count: sortedArchivedTasks.length })
				),
				h("table", { 
					id: "archived-tasks-table",
					className: "tasks-table archived",
					style: "display: none"
				},
					h("thead", {},
						h("tr", {},
							h("th", {}, "Status"),
							h("th", {}, "Priority"),
							h("th", {}, "Task"),
							h("th", {}, "Due Date"),
							h("th", {}, "Actions")
						)
					),
					h("tbody", {},
						...sortedArchivedTasks.map((task) => 
							h("tr", { key: task.id },
								h("td", {}, getTaskStatusText(task.status)),
								h("td", {}, getPriorityText(task.priority)),
								h("td", { className: "task-text-cell" }, task.text),
								h("td", {}, task.dueDate ? formatDate(task.dueDate) : "—"),
								h("td", { className: "tasks-table-actions" },
									h("button", {
										className: "action-btn archive-btn icon-btn-transparent",
										title: I18n.t("modals.tasks.unarchiveTitle"),
										innerHTML: '<span class="material-symbols-outlined icon-14">unarchive</span>',
										onclick: () => archiveTask(task, job)
									})
								)
							)
						)
					)
				)
			) : null,
			
			// Add task form section
			h("div", { className: "add-task-section" },
				h("h4", { className: "add-task-title" }, I18n.t("modals.tasks.addSection")),
				h("textarea", {
					className: "add-task-textarea",
					placeholder: I18n.t("modals.tasks.placeholder"),
					rows: 2,
					onkeydown: (e) => {
						if (e.key === "Enter" && e.shiftKey) {
							e.preventDefault();
							handleAddTask();
						}
					}
				})
			)
		);
	};

	const showValidationError = (element, message) => {
		// Remove existing error
		const existingError = element.parentNode.querySelector('.validation-error');
		if (existingError) {
			existingError.remove();
		}
		
		// Add error message
		const errorElement = h("div", { 
			className: "validation-error" 
		}, message);
		
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
					I18n.t("modals.tasks.title", { position: job.position, company: job.company }),
				),
				h("button", { className: "modal-close", onclick: onClose }, "×"),
			),
			h(
				"div",
				{ className: "modal-body" },
				createTasksContent(job, sortedActiveTasks, sortedArchivedTasks)
			),
			h(
				"div",
				{ className: "modal-footer" },
				h(
					"button",
					{
						className: "action-btn primary-btn",
						onclick: handleAddTask,
					},
					I18n.t("modals.tasks.addButton"),
				),
			),
		),
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