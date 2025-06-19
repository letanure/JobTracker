// ============================================================================
// MINI DOM UTILITY LIBRARY (jQuery-style)
// ============================================================================

// jQuery-style DOM wrapper class
class DOMElement {
	constructor(element) {
		this.element = element;
	}

	// Chainable text method
	text(content) {
		if (content === undefined) {
			return this.element.textContent;
		}
		this.element.textContent = content;
		return this;
	}

	// Chainable html method
	html(content) {
		if (content === undefined) {
			return this.element.innerHTML;
		}
		this.element.innerHTML = content;
		return this;
	}

	// Chainable show/hide methods
	show() {
		this.element.style.display = "block";
		return this;
	}

	hide() {
		this.element.style.display = "none";
		return this;
	}

	toggle() {
		const isVisible = this.element.style.display === "block";
		this.element.style.display = isVisible ? "none" : "block";
		return this;
	}

	// Chainable event method
	on(event, handler) {
		this.element.addEventListener(event, handler);
		return this;
	}

	// Chainable addClass/removeClass
	addClass(className) {
		this.element.classList.add(className);
		return this;
	}

	removeClass(className) {
		this.element.classList.remove(className);
		return this;
	}

	// Chainable attr method
	attr(name, value) {
		if (value === undefined) {
			return this.element.getAttribute(name);
		}
		this.element.setAttribute(name, value);
		return this;
	}

	// Chainable css method
	css(property, value) {
		if (typeof property === "object") {
			Object.assign(this.element.style, property);
		} else if (value === undefined) {
			return getComputedStyle(this.element)[property];
		} else {
			this.element.style[property] = value;
		}
		return this;
	}

	// Append child
	append(child) {
		if (typeof child === "string") {
			this.element.appendChild(document.createTextNode(child));
		} else {
			this.element.appendChild(child);
		}
		return this;
	}

	// Get the raw DOM element
	get() {
		return this.element;
	}
}

// Enhanced $ function with jQuery-style API
const $ = (selector) => {
	if (typeof selector === "string") {
		if (selector.startsWith("#")) {
			// ID selector
			const element = document.getElementById(selector.slice(1));
			return element ? new DOMElement(element) : null;
		} else {
			// CSS selector
			const element = document.querySelector(selector);
			return element ? new DOMElement(element) : null;
		}
	} else if (selector instanceof Element) {
		// Wrap existing element
		return new DOMElement(selector);
	}
	return null;
};

// Static methods for backwards compatibility and utility
Object.assign($, {
	// Get element by ID (returns raw element)
	id: (id) => document.getElementById(id),

	// Query selector (single element)
	qs: (selector) => document.querySelector(selector),

	// Query selector all (multiple elements)
	qsa: (selector) => document.querySelectorAll(selector),

	// Create element with optional class and text
	create: (tag, className, textContent) => {
		const element = document.createElement(tag);
		if (className) element.className = className;
		if (textContent) element.textContent = textContent;
		return element;
	},

	// Add event listener (static)
	on: (element, event, handler) => element.addEventListener(event, handler),

	// Set innerHTML (static)
	html: (element, html) => (element.innerHTML = html),

	// Set textContent (static)
	text: (element, text) => (element.textContent = text),

	// Show/hide element (static)
	show: (element) => (element.style.display = "block"),
	hide: (element) => (element.style.display = "none"),

	// Toggle display (static)
	toggle: (element) => {
		const isVisible = element.style.display === "block";
		element.style.display = isVisible ? "none" : "block";
	},
});

// ============================================================================
// MINI DATA PERSISTENCE LIBRARY
// ============================================================================

const DataStore = {
	// Storage key for job tracker data
	STORAGE_KEY: "jobTrackerData",

	// Save data to storage
	save: (data) => {
		try {
			localStorage.setItem(DataStore.STORAGE_KEY, JSON.stringify(data));
			return true;
		} catch (error) {
			console.error("Error saving data:", error);
			return false;
		}
	},

	// Load data from storage
	load: () => {
		try {
			const savedData = localStorage.getItem(DataStore.STORAGE_KEY);
			return savedData ? JSON.parse(savedData) : null;
		} catch (error) {
			console.error("Error loading data:", error);
			return null;
		}
	},

	// Check if data exists in storage
	exists: () => {
		return localStorage.getItem(DataStore.STORAGE_KEY) !== null;
	},

	// Clear all data from storage
	clear: () => {
		try {
			localStorage.removeItem(DataStore.STORAGE_KEY);
			return true;
		} catch (error) {
			console.error("Error clearing data:", error);
			return false;
		}
	},

	// Get storage size (in characters)
	getSize: () => {
		const data = localStorage.getItem(DataStore.STORAGE_KEY);
		return data ? data.length : 0;
	},

	// Export data as JSON string (for backup/export features)
	export: () => {
		const data = DataStore.load();
		return data ? JSON.stringify(data, null, 2) : null;
	},

	// Import data from JSON string (for restore/import features)
	import: (jsonString) => {
		try {
			const data = JSON.parse(jsonString);
			return DataStore.save(data);
		} catch (error) {
			console.error("Error importing data:", error);
			return false;
		}
	},
};

// ============================================================================
// REACT-LIKE COMPONENT LIBRARY
// ============================================================================

const Component = {
	// Create element with props and children
	createElement: (tag, props = {}, ...children) => {
		const element = document.createElement(tag);

		// Set attributes and properties
		for (const [key, value] of Object.entries(props)) {
			if (key === "className") {
				element.className = value;
			} else if (key === "textContent") {
				element.textContent = value;
			} else if (key === "innerHTML") {
				element.innerHTML = value;
			} else if (key === "onclick" && typeof value === "function") {
				// Handle onclick specifically
				element.onclick = value;
			} else if (key.startsWith("on") && typeof value === "function") {
				// Event handlers
				const eventName = key.slice(2).toLowerCase();
				element.addEventListener(eventName, value);
			} else if (key === "style" && typeof value === "object") {
				Object.assign(element.style, value);
			} else {
				element.setAttribute(key, value);
			}
		}

		// Append children
		for (const child of children) {
			if (child) {
				if (typeof child === "string") {
					element.appendChild(document.createTextNode(child));
				} else {
					element.appendChild(child);
				}
			}
		}

		return element;
	},

	// Fragment-like container
	Fragment: (...children) => {
		const fragment = document.createDocumentFragment();
		for (const child of children) {
			if (child) {
				if (typeof child === "string") {
					fragment.appendChild(document.createTextNode(child));
				} else {
					fragment.appendChild(child);
				}
			}
		}
		return fragment;
	},
};

// Shorthand for createElement
const h = Component.createElement;

// ============================================================================
// COMPONENT DEFINITIONS
// ============================================================================

// Priority cell component
const PriorityCell = ({ priority }) =>
	h(
		"td",
		{ className: "priority-cell" },
		h("span", { className: `priority priority-${priority.toLowerCase()}` }),
		getPriorityText(priority),
	);

// Status cell component
const StatusCell = ({ status }) =>
	h(
		"td",
		{},
		h(
			"span",
			{ className: `status status-${getStatusClass(status)}` },
			getStatusText(status),
		),
	);

// Actions cell component
const ActionsCell = ({ jobId, onEdit, onDelete, onNotes, onTasks }) =>
	h(
		"td",
		{ className: "actions-cell" },
		h(
			"button",
			{
				className: "action-btn notes-btn",
				onclick: () => onNotes(jobId),
			},
			h("span", { className: "material-symbols-outlined" }, "sticky_note_2"),
		),
		h(
			"button",
			{
				className: "action-btn tasks-btn",
				onclick: () => onTasks(jobId),
			},
			h("span", { className: "material-symbols-outlined" }, "task"),
		),
		h(
			"button",
			{
				className: "action-btn edit-btn",
				onclick: (event) => {
					// Make sure we get the button element, not the icon
					const button = event.target.closest("button");
					onEdit(button);
				},
			},
			h("span", { className: "material-symbols-outlined" }, "edit"),
		),
		h(
			"button",
			{
				className: "action-btn xdelete-btn",
				onclick: () => onDelete(jobId),
			},
			h("span", { className: "material-symbols-outlined" }, "delete"),
		),
	);

// Edit actions cell component
const EditActionsCell = ({ jobId, onSave, onCancel }) =>
	h(
		"td",
		{ className: "actions-cell" },
		h(
			"div",
			{ className: "actions-cell" },
			h(
				"button",
				{
					className: "action-btn edit-btn",
					onclick: () => onSave(jobId),
				},
				h("span", { className: "material-symbols-outlined" }, "save"),
			),
			h(
				"button",
				{
					className: "action-btn cancel-btn",
					onclick: onCancel,
				},
				h("span", { className: "material-symbols-outlined" }, "close"),
			),
		),
	);

// Input field component
const InputField = ({
	value = "",
	type = "text",
	className = "editable",
	placeholder = "",
	list = null,
}) => {
	const props = {
		className,
		type,
		value,
		placeholder,
	};
	if (list) props.list = list;
	return h("input", props);
};

// Textarea component
const TextareaField = ({
	value = "",
	className = "editable",
	placeholder = "",
	rows = null,
}) => {
	const props = {
		className,
		placeholder,
		textContent: value,
	};
	if (rows) props.rows = rows;
	return h("textarea", props);
};

// Contact textarea component
const ContactTextarea = ({ contactPerson = "", contactEmail = "" }) =>
	h("textarea", {
		className: "editable contact-textarea",
		placeholder: "Name\nEmail",
		textContent: `${contactPerson}\n${contactEmail}`,
	});

// ============================================================================
// NOTES SYSTEM COMPONENTS
// ============================================================================

// Notes count display component
const NotesCount = ({ notes = [], onClick }) => {
	const count = notes.length;
	const className = count === 0 ? "notes-count zero" : "notes-count";

	return h("span", {
		className,
		onclick: count > 0 ? onClick : null,
		textContent: count.toString(),
	});
};

// Individual note item component
const NoteItem = ({ note }) => {
	return h(
		"div",
		{ className: "note-item" },
		h(
			"div",
			{ className: "note-header" },
			h("span", { className: "note-date" }, formatDate(note.date)),
			h("span", { className: "note-phase" }, getPhaseText(note.phase)),
		),
		h("div", { className: "note-text" }, note.text),
	);
};

// Unified modal component for viewing and adding notes
const NotesModal = ({ job, onClose }) => {
	const notes = job.notes || [];
	const sortedNotes = [...notes].sort(
		(a, b) => new Date(a.date) - new Date(b.date),
	);

	const handleAddNote = () => {
		const textarea = document.querySelector('.add-note-textarea');
		const noteText = textarea.value.trim();

		if (!noteText) {
			textarea.focus();
			return;
		}

		const newNote = {
			id: Date.now(),
			date: new Date().toISOString(),
			phase: job.currentPhase,
			text: noteText,
		};

		// Add note to job data
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;
		
		if (!jobsData[jobIndex].notes) {
			jobsData[jobIndex].notes = [];
		}
		
		jobsData[jobIndex].notes.push(newNote);
		saveToLocalStorage();
		
		// Update the job object for this modal
		job.notes = jobsData[jobIndex].notes;
		
		// Add the new note to the existing modal without reopening
		const modalBody = document.querySelector('.modal-body');
		const addNoteSection = modalBody.querySelector('.add-note-section');
		
		// Create and insert the new note before the add note section
		const newNoteElement = NoteItem({ note: newNote });
		modalBody.insertBefore(newNoteElement, addNoteSection);
		
		// Clear the textarea
		textarea.value = '';
		
		// Update the notes count in the table (refresh interface for count update)
		updateStats();
		const tableRow = document.querySelector(`tr[data-job-id="${job.id}"]`);
		if (tableRow) {
			const notesCell = tableRow.querySelector('.notes');
			if (notesCell) {
				notesCell.innerHTML = '';
				notesCell.appendChild(NotesCount({ 
					notes: job.notes || [], 
					onClick: () => openNotesModal(job) 
				}));
			}
		}
		
		// Scroll to bottom to show the new note and keep form visible
		setTimeout(() => {
			modalBody.scrollTop = modalBody.scrollHeight;
		}, 100);
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
					`Notes for ${job.position} at ${job.company}`,
				),
				h("button", { className: "modal-close", onclick: onClose }, "×"),
			),
			h(
				"div",
				{ className: "modal-body" },
				// Existing notes list
				...(sortedNotes.length > 0
					? sortedNotes.map((note) => NoteItem({ note }))
					: [h(
							"p",
							{ style: { textAlign: "center", color: "var(--text-light)", marginBottom: "20px" } },
							"No notes yet. Add your first note below.",
						)]
				),
				// Add note form section
				h("div", { className: "add-note-section" },
					h("h4", { className: "add-note-title" }, "Add New Note"),
					h(
						"div",
						{ className: "note-form-info" },
						h(
							"span", 
							{},
							h("span", { className: "material-symbols-outlined" }, "assignment"),
							` Phase: ${getPhaseText(job.currentPhase)}`
						),
					),
					h("textarea", {
						className: "add-note-textarea",
						placeholder: "Enter your note here...",
						rows: 3,
						onkeydown: (e) => {
							if (e.key === 'Enter' && e.shiftKey) {
								e.preventDefault();
								handleAddNote();
							}
						}
					})
				)
			),
			h(
				"div",
				{ className: "modal-footer" },
				h(
					"button",
					{
						className: "action-btn edit-btn",
						onclick: handleAddNote
					},
					"Add Note",
				),
				h(
					"button",
					{ className: "action-btn cancel-btn", onclick: onClose },
					"Close",
				),
			),
		),
	);
};

// ============================================================================
// TASKS SYSTEM COMPONENTS
// ============================================================================

// Tasks count display component with colored counters
const TasksCount = ({ tasks = [], onClick }) => {
	const todoCount = tasks.filter(task => task.status === 'todo').length;
	const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
	const doneCount = tasks.filter(task => task.status === 'done').length;
	const totalCount = tasks.length;

	const className = totalCount === 0 ? "tasks-count zero" : "tasks-count";

	return h("span", {
		className,
		onclick: totalCount > 0 ? onClick : null,
	}, 
		h("span", { className: "task-count-todo" }, todoCount.toString()),
		h("span", { className: "task-count-separator" }, "/"),
		h("span", { className: "task-count-in-progress" }, inProgressCount.toString()),
		h("span", { className: "task-count-separator" }, "/"),
		h("span", { className: "task-count-done" }, doneCount.toString())
	);
};

// Individual task item component
const TaskItem = ({ task }) => {
	const statusColors = {
		'todo': 'var(--status-applied-bg)',
		'in-progress': 'var(--status-interview-bg)', 
		'done': 'var(--status-offer-bg)'
	};
	
	const priorityColors = {
		'low': 'var(--priority-low)',
		'medium': 'var(--priority-medium)',
		'high': 'var(--priority-high)'
	};

	return h(
		"div",
		{ className: "task-item" },
		h(
			"div",
			{ className: "task-header" },
			h("span", { className: "task-date" }, formatDate(task.createdAt)),
			h("span", { 
				className: "task-status",
				style: { background: statusColors[task.status] }
			}, task.status.replace('-', ' ')),
			h("span", { 
				className: "task-priority",
				style: { background: priorityColors[task.priority] }
			}, task.priority)
		),
		h("div", { className: "task-text" }, task.text),
		task.dueDate && h("div", { className: "task-due-date" }, `Due: ${formatDate(task.dueDate)}`),
		task.completedAt && h("div", { className: "task-completed-date" }, `Completed: ${formatDate(task.completedAt)}`)
	);
};

// Unified modal component for viewing and adding tasks
const TasksModal = ({ job, onClose }) => {
	const tasks = job.tasks || [];
	const sortedTasks = [...tasks].sort(
		(a, b) => new Date(a.createdAt) - new Date(b.createdAt),
	);

	const handleAddTask = () => {
		const textarea = document.querySelector('.add-task-textarea');
		const statusSelect = document.querySelector('.add-task-status');
		const prioritySelect = document.querySelector('.add-task-priority');
		const dueDateInput = document.querySelector('.add-task-due-date');
		
		const taskText = textarea.value.trim();
		const status = statusSelect.value;
		const priority = prioritySelect.value;
		const dueDate = dueDateInput.value || null;

		if (!taskText) {
			textarea.focus();
			return;
		}

		const newTask = {
			id: Date.now().toString(),
			text: taskText,
			status: status,
			priority: priority,
			createdAt: new Date().toISOString(),
			completedAt: status === 'done' ? new Date().toISOString() : null,
			dueDate: dueDate ? new Date(dueDate).toISOString() : null,
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
		
		// Add the new task to the existing modal without reopening
		const modalBody = document.querySelector('.modal-body');
		const addTaskSection = modalBody.querySelector('.add-task-section');
		
		// Create and insert the new task before the add task section
		const newTaskElement = TaskItem({ task: newTask });
		modalBody.insertBefore(newTaskElement, addTaskSection);
		
		// Clear the form
		textarea.value = '';
		statusSelect.value = 'todo';
		prioritySelect.value = 'medium';
		dueDateInput.value = '';
		
		// Update the tasks count in the table (refresh interface for count update)
		updateStats();
		const tableRow = document.querySelector(`tr[data-job-id="${job.id}"]`);
		if (tableRow) {
			const tasksCell = tableRow.querySelector('.tasks');
			if (tasksCell) {
				tasksCell.innerHTML = '';
				tasksCell.appendChild(TasksCount({ 
					tasks: job.tasks || [], 
					onClick: () => openTasksModal(job) 
				}));
			}
		}
		
		// Scroll to bottom to show the new task and keep form visible
		setTimeout(() => {
			modalBody.scrollTop = modalBody.scrollHeight;
		}, 100);
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
					`Tasks for ${job.position} at ${job.company}`,
				),
				h("button", { className: "modal-close", onclick: onClose }, "×"),
			),
			h(
				"div",
				{ className: "modal-body" },
				// Existing tasks list
				...(sortedTasks.length > 0
					? sortedTasks.map((task) => TaskItem({ task }))
					: [h(
							"p",
							{ style: { textAlign: "center", color: "var(--text-light)", marginBottom: "20px" } },
							"No tasks yet. Add your first task below.",
						)]
				),
				// Add task form section
				h("div", { className: "add-task-section" },
					h("h4", { className: "add-task-title" }, "Add New Task"),
					h(
						"div",
						{ className: "task-form-info" },
						h(
							"span", 
							{},
							h("span", { className: "material-symbols-outlined" }, "assignment"),
							` Phase: ${getPhaseText(job.currentPhase)}`
						),
					),
					h("textarea", {
						className: "add-task-textarea",
						placeholder: "Enter your task here...",
						rows: 3,
						onkeydown: (e) => {
							if (e.key === 'Enter' && e.shiftKey) {
								e.preventDefault();
								handleAddTask();
							}
						}
					}),
					h("div", { className: "task-form-controls" },
						h("div", { className: "task-control-group" },
							h("label", {}, "Status:"),
							h("select", { className: "add-task-status" },
								h("option", { value: "todo" }, "To Do"),
								h("option", { value: "in-progress" }, "In Progress"),
								h("option", { value: "done" }, "Done")
							)
						),
						h("div", { className: "task-control-group" },
							h("label", {}, "Priority:"),
							h("select", { className: "add-task-priority" },
								h("option", { value: "low" }, "Low"),
								h("option", { value: "medium", selected: true }, "Medium"),
								h("option", { value: "high" }, "High")
							)
						),
						h("div", { className: "task-control-group" },
							h("label", {}, "Due Date:"),
							h("input", { 
								type: "date",
								className: "add-task-due-date"
							})
						)
					)
				)
			),
			h(
				"div",
				{ className: "modal-footer" },
				h(
					"button",
					{
						className: "action-btn edit-btn",
						onclick: handleAddTask
					},
					"Add Task",
				),
				h(
					"button",
					{ className: "action-btn cancel-btn", onclick: onClose },
					"Close",
				),
			),
		),
	);
};


// ============================================================================
// NOTES MANAGEMENT FUNCTIONS
// ============================================================================

// Format date for display
const formatDate = (dateString) => {
	const date = new Date(dateString);
	
	// Use CONFIG.dateFormat to determine format
	switch (CONFIG.dateFormat) {
		case 'DD/MM/YY':
			return date.toLocaleDateString("en-GB", {
				year: "2-digit",
				month: "2-digit", 
				day: "2-digit"
			});
		case 'MM/DD/YY':
			return date.toLocaleDateString("en-US", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit"
			});
		case 'YYYY-MM-DD':
			return date.toISOString().split('T')[0];
		case 'DD/MM/YY HH:MM':
			return date.toLocaleDateString("en-GB", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit"
			}) + ' ' + date.toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			});
		default:
			// Default to DD/MM/YY format
			return date.toLocaleDateString("en-GB", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit"
			});
	}
};

// Add note to job
const addNoteToJob = (jobId, note) => {
	const jobIndex = jobsData.findIndex((job) => job.id === jobId);
	if (jobIndex === -1) return;

	if (!jobsData[jobIndex].notes) {
		jobsData[jobIndex].notes = [];
	}

	jobsData[jobIndex].notes.push(note);
	saveToLocalStorage();
	refreshInterface();
};

// Open unified notes modal (for both viewing and adding notes)
const openNotesModal = (job) => {
	const modal = NotesModal({
		job,
		onClose: closeModal,
	});

	document.body.appendChild(modal);
	
	// Scroll to bottom to show the add note form
	setTimeout(() => {
		const modalBody = modal.querySelector('.modal-body');
		if (modalBody) {
			modalBody.scrollTop = modalBody.scrollHeight;
		}
	}, 50);
};

// Alias for backward compatibility
const openAddNoteModal = openNotesModal;

// ============================================================================
// TASKS MANAGEMENT FUNCTIONS
// ============================================================================

// Open unified tasks modal (for both viewing and adding tasks)
const openTasksModal = (job) => {
	const modal = TasksModal({
		job,
		onClose: closeModal,
	});

	document.body.appendChild(modal);
	
	// Scroll to bottom to show the add task form
	setTimeout(() => {
		const modalBody = modal.querySelector('.modal-body');
		if (modalBody) {
			modalBody.scrollTop = modalBody.scrollHeight;
		}
	}, 50);
};

// Alias for backward compatibility
const openAddTaskModal = openTasksModal;

// Close modal
const closeModal = () => {
	const modals = document.querySelectorAll(".modal-overlay");
	modals.forEach((modal) => modal.remove());
};

// Migrate old notes format (string) to new format (array of note objects)
const migrateNotesData = (jobs) => {
	return jobs.map((job) => {
		// If notes is a string, convert it to the new format
		if (typeof job.notes === "string" && job.notes.trim() !== "") {
			return {
				...job,
				notes: [
					{
						id: Date.now(),
						date: job.appliedDate || new Date().toISOString().split("T")[0],
						phase: job.currentPhase || "applicationReview",
						text: job.notes,
					},
				],
			};
		}
		// If notes is already an array or empty, keep as is
		if (Array.isArray(job.notes)) {
			return job;
		}
		// If notes is undefined or empty string, set to empty array
		return {
			...job,
			notes: [],
		};
	});
};

// Migrate old task format and create tasks array for jobs that don't have it
const migrateTasksData = (jobs) => {
	return jobs.map((job) => {
		// If job has nextTask or dueDate, migrate them to tasks array
		if ((job.nextTask && job.nextTask.trim() !== "") || job.dueDate) {
			const existingTasks = Array.isArray(job.tasks) ? job.tasks : [];
			
			// Only add migration task if there's actual content and no tasks exist yet
			if (existingTasks.length === 0 && (job.nextTask && job.nextTask.trim() !== "")) {
				const migrationTask = {
					id: Date.now().toString(),
					text: job.nextTask,
					status: 'todo',
					priority: 'medium',
					createdAt: job.appliedDate || new Date().toISOString(),
					completedAt: null,
					dueDate: job.dueDate ? new Date(job.dueDate).toISOString() : null,
				};
				
				return {
					...job,
					tasks: [migrationTask],
				};
			}
		}
		
		// If tasks is already an array, keep as is
		if (Array.isArray(job.tasks)) {
			return job;
		}
		
		// If tasks is undefined, set to empty array
		return {
			...job,
			tasks: [],
		};
	});
};

// Job row component
const JobRow = ({ job, onEdit, onDelete }) => {
	const row = h(
		"tr",
		{ "data-job-id": job.id },
		PriorityCell({ priority: job.priority }),
		h("td", { className: "company-name" }, job.company),
		h("td", { className: "position-name" }, job.position),
		h("td", { className: "date" }, formatDate(job.appliedDate)),
		StatusCell({ status: job.status }),
		h("td", { className: "current-phase" }, getPhaseText(job.currentPhase)),
		h("td", {
			className: "contact",
			innerHTML: `${job.contactPerson}<br>${job.contactEmail}`,
		}),
		h("td", { className: "salary" }, job.salaryRange),
		h("td", {}, job.location),
		h(
			"td",
			{ className: "notes" },
			NotesCount({
				notes: job.notes || [],
				onClick: () => openNotesModal(job),
			}),
		),
		h(
			"td",
			{ className: "tasks" },
			TasksCount({
				tasks: job.tasks || [],
				onClick: () => openTasksModal(job),
			}),
		),
		ActionsCell({
			jobId: job.id,
			onEdit: (button) => onEdit(button),
			onDelete: onDelete,
			onNotes: (jobId) => {
				const jobToOpen = jobsData.find((j) => j.id === jobId);
				if (jobToOpen) openAddNoteModal(jobToOpen);
			},
			onTasks: (jobId) => {
				const jobToOpen = jobsData.find((j) => j.id === jobId);
				if (jobToOpen) openAddTaskModal(jobToOpen);
			},
		}),
	);

	// Add double-click event listener
	row.addEventListener("dblclick", (event) => {
		if (!event.target.closest(".actions-cell")) {
			const editButton = row.querySelector(".edit-btn");
			if (editButton) {
				onEdit(editButton);
			}
		}
	});

	return row;
};

// ============================================================================
// MINI I18N LIBRARY
// ============================================================================

const I18n = {
	// Current language
	currentLanguage: "en",

	// Language detection from browser
	detectLanguage: () => {
		const browserLang = navigator.language || navigator.userLanguage;
		const langCode = browserLang.split("-")[0];
		return I18n.translations[langCode] ? langCode : "en";
	},

	// Set current language
	setLanguage: (lang) => {
		if (I18n.translations[lang]) {
			I18n.currentLanguage = lang;
			DataStore.save({ ...DataStore.load(), language: lang });
			return true;
		}
		return false;
	},

	// Get translated text
	t: (key, params = {}) => {
		const keys = key.split(".");
		let translation = I18n.translations[I18n.currentLanguage];

		for (const k of keys) {
			translation = translation?.[k];
		}

		if (!translation) {
			console.warn(
				`Translation missing for key: ${key} in language: ${I18n.currentLanguage}`,
			);
			return key;
		}

		// Replace parameters in translation
		return translation.replace(/\{(\w+)\}/g, (match, param) => {
			return params[param] !== undefined ? params[param] : match;
		});
	},

	// Get available languages
	getLanguages: () => Object.keys(I18n.translations),

	// Initialize language from storage or browser
	init: () => {
		const savedData = DataStore.load();
		const savedLanguage = savedData?.language;
		I18n.currentLanguage = savedLanguage || I18n.detectLanguage();
	},
};

// Translation constants
I18n.translations = {
	en: {
		app: {
			title: "JobTracker",
		},
		buttons: {
			addApplication: "+ Add Application",
			save: "Save",
			edit: "Edit",
			delete: "Delete",
			cancel: "Cancel",
		},
		table: {
			headers: {
				priority: "Priority",
				company: "Company",
				position: "Position",
				appliedDate: "Applied Date",
				status: "Status",
				currentPhase: "Current Phase",
				contactPerson: "Contact Person",
				salaryRange: "Salary Range",
				location: "Location",
				notes: "Notes",
				tasks: "Tasks",
				actions: "Actions",
			},
			filters: {
				allPriorities: "All Priorities",
				allStatuses: "All Statuses",
				allPhases: "All Phases",
				highPriority: "High Priority",
				mediumPriority: "Medium Priority",
				lowPriority: "Low Priority",
			},
			placeholders: {
				companyName: "Company Name",
				positionTitle: "Position Title",
				nameEmail: "Name & Email",
				salaryRange: "Salary Range",
				location: "Location",
				notes: "Notes",
			},
		},
		statuses: {
			wishlist: "Wishlist",
			applied: "Applied",
			phoneScreening: "Phone Screening",
			interview: "Interview",
			finalRound: "Final Round",
			offer: "Offer",
			rejected: "Rejected",
			withdrawn: "Withdrawn",
		},
		priorities: {
			high: "High",
			medium: "Medium",
			low: "Low",
		},
		phases: {
			applicationReview: "Application Review",
			initialScreening: "Initial Screening",
			hrPhoneScreen: "HR Phone Screen",
			recruiterCall: "Recruiter Call",
			technicalPhoneScreen: "Technical Phone Screen",
			codingChallenge: "Coding Challenge",
			takeHomeAssignment: "Take-home Assignment",
			technicalInterview: "Technical Interview",
			systemDesignInterview: "System Design Interview",
			behavioralInterview: "Behavioral Interview",
			teamInterview: "Team Interview",
			hiringManagerInterview: "Hiring Manager Interview",
			panelInterview: "Panel Interview",
			finalRound: "Final Round",
			referenceCheck: "Reference Check",
			backgroundCheck: "Background Check",
			offerDiscussion: "Offer Discussion",
			salaryNegotiation: "Salary Negotiation",
		},
		stats: {
			totalApplications: "Total Applications",
			active: "Active",
			interviews: "Interviews",
			offers: "Offers",
			rejections: "Rejections",
		},
		messages: {
			welcome:
				"Welcome to JobTracker!\n\nWould you like to see 2 example job applications to understand how the tracker works?\n\nClick OK to add examples, or Cancel to start with an empty tracker.",
			errorLoading:
				"There was an error loading your data.\n\nWould you like to start with 2 example job applications?",
			confirmDelete:
				"Are you sure you want to delete the application for {position} at {company}?",
		},
		demo: {
			nextTask1: "Prepare system design",
			nextTask2: "Wait for callback",
			contactPerson1: "Sarah Chen",
			contactPerson2: "Mike Rodriguez",
			notes1:
				"Great culture fit. Need to research their microservices architecture.",
			notes2: "Early stage startup. High growth potential but risky.",
		},
	},
	pt: {
		app: {
			title: "JobTracker",
		},
		buttons: {
			addApplication: "+ Adicionar Candidatura",
			save: "Salvar",
			edit: "Editar",
			delete: "Excluir",
			cancel: "Cancelar",
		},
		table: {
			headers: {
				priority: "Prioridade",
				company: "Empresa",
				position: "Cargo",
				appliedDate: "Data da Candidatura",
				status: "Status",
				currentPhase: "Fase Atual",
				contactPerson: "Pessoa de Contato",
				salaryRange: "Faixa Salarial",
				location: "Localização",
				notes: "Notas",
				tasks: "Tarefas",
				actions: "Ações",
			},
			filters: {
				allPriorities: "Todas as Prioridades",
				allStatuses: "Todos os Status",
				allPhases: "Todas as Fases",
				highPriority: "Prioridade Alta",
				mediumPriority: "Prioridade Média",
				lowPriority: "Prioridade Baixa",
			},
			placeholders: {
				companyName: "Nome da Empresa",
				positionTitle: "Título do Cargo",
				nameEmail: "Nome e Email",
				salaryRange: "Faixa Salarial",
				location: "Localização",
				notes: "Notas",
			},
		},
		statuses: {
			wishlist: "Lista de Desejos",
			applied: "Candidatura Enviada",
			phoneScreening: "Triagem por Telefone",
			interview: "Entrevista",
			finalRound: "Etapa Final",
			offer: "Oferta",
			rejected: "Rejeitado",
			withdrawn: "Retirado",
		},
		priorities: {
			high: "Alta",
			medium: "Média",
			low: "Baixa",
		},
		phases: {
			applicationReview: "Análise da Candidatura",
			initialScreening: "Triagem Inicial",
			hrPhoneScreen: "Triagem por Telefone - RH",
			recruiterCall: "Ligação do Recrutador",
			technicalPhoneScreen: "Triagem Técnica por Telefone",
			codingChallenge: "Desafio de Programação",
			takeHomeAssignment: "Tarefa para Casa",
			technicalInterview: "Entrevista Técnica",
			systemDesignInterview: "Entrevista de Design de Sistema",
			behavioralInterview: "Entrevista Comportamental",
			teamInterview: "Entrevista com a Equipe",
			hiringManagerInterview: "Entrevista com Gerente de Contratação",
			panelInterview: "Entrevista em Painel",
			finalRound: "Etapa Final",
			referenceCheck: "Verificação de Referências",
			backgroundCheck: "Verificação de Antecedentes",
			offerDiscussion: "Discussão da Oferta",
			salaryNegotiation: "Negociação Salarial",
		},
		stats: {
			totalApplications: "Total de Candidaturas",
			active: "Ativas",
			interviews: "Entrevistas",
			offers: "Ofertas",
			rejections: "Rejeições",
		},
		messages: {
			welcome:
				"Bem-vindo ao JobTracker!\n\nGostaria de ver 2 exemplos de candidaturas para entender como o rastreador funciona?\n\nClique OK para adicionar exemplos, ou Cancelar para começar com um rastreador vazio.",
			errorLoading:
				"Houve um erro ao carregar seus dados.\n\nGostaria de começar com 2 exemplos de candidaturas?",
			confirmDelete:
				"Tem certeza de que deseja excluir a candidatura para {position} na {company}?",
		},
		demo: {
			nextTask1: "Preparar design de sistema",
			nextTask2: "Aguardar retorno",
			contactPerson1: "Sarah Chen",
			contactPerson2: "Mike Rodriguez",
			notes1:
				"Ótimo encaixe cultural. Preciso pesquisar sua arquitetura de microsserviços.",
			notes2:
				"Startup em estágio inicial. Alto potencial de crescimento, mas arriscado.",
		},
	},
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
	dateFormat: 'DD/MM/YY HH:MM', // Options: 'DD/MM/YY', 'MM/DD/YY', 'YYYY-MM-DD', 'DD/MM/YY HH:MM'
	showTimeInNotes: true, // Set to true to include time in notes
};

// ============================================================================
// CONSTANTS AND DATA
// ============================================================================

const STATUSES = [
	"wishlist",
	"applied",
	"phoneScreening",
	"interview",
	"finalRound",
	"offer",
	"rejected",
	"withdrawn",
];

const PRIORITIES = ["high", "medium", "low"];

const PHASES = [
	"applicationReview",
	"initialScreening",
	"hrPhoneScreen",
	"recruiterCall",
	"technicalPhoneScreen",
	"codingChallenge",
	"takeHomeAssignment",
	"technicalInterview",
	"systemDesignInterview",
	"behavioralInterview",
	"teamInterview",
	"hiringManagerInterview",
	"panelInterview",
	"finalRound",
	"referenceCheck",
	"backgroundCheck",
	"offerDiscussion",
	"salaryNegotiation",
];

// Helper functions to get translated values
const getStatusText = (statusKey) => I18n.t(`statuses.${statusKey}`);
const getPriorityText = (priorityKey) => I18n.t(`priorities.${priorityKey}`);
const getPhaseText = (phaseKey) => I18n.t(`phases.${phaseKey}`);

// Demo data for first-time users
const DEMO_DATA = [
	{
		id: 1,
		priority: "high",
		company: "TechCorp Inc",
		position: "Senior Software Engineer",
		appliedDate: "2025-06-15T10:00:00.000Z",
		status: "interview",
		currentPhase: "technicalInterview",
		contactPerson: "demo.contactPerson1",
		contactEmail: "sarah@techcorp.com",
		salaryRange: "$120k - $150k",
		location: "San Francisco, CA",
		notes: "demo.notes1",
		tasks: [
			{
				id: "1",
				text: "Prepare system design presentation",
				status: "todo",
				priority: "high",
				createdAt: "2025-06-15T10:00:00.000Z",
				completedAt: null,
				dueDate: "2025-06-22T10:00:00.000Z"
			},
			{
				id: "2", 
				text: "Review company tech stack",
				status: "done",
				priority: "medium",
				createdAt: "2025-06-14T09:00:00.000Z",
				completedAt: "2025-06-16T14:30:00.000Z",
				dueDate: null
			}
		]
	},
	{
		id: 2,
		priority: "medium",
		company: "StartupXYZ",
		position: "Full Stack Developer",
		appliedDate: "2025-06-12T09:00:00.000Z",
		status: "phoneScreening",
		currentPhase: "hrPhoneScreen",
		contactPerson: "demo.contactPerson2",
		contactEmail: "hiring@startupxyz.com",
		salaryRange: "$90k - $110k + equity",
		location: "Remote",
		notes: "demo.notes2",
		tasks: [
			{
				id: "3",
				text: "Wait for callback",
				status: "in-progress", 
				priority: "medium",
				createdAt: "2025-06-12T15:00:00.000Z",
				completedAt: null,
				dueDate: "2025-06-20T17:00:00.000Z"
			}
		]
	},
];

// Helper function to get demo data with translations
const getDemoData = () => {
	return DEMO_DATA.map((job) => ({
		...job,
		contactPerson: job.contactPerson.startsWith("demo.")
			? I18n.t(job.contactPerson)
			: job.contactPerson,
		notes: job.notes.startsWith("demo.") ? I18n.t(job.notes) : job.notes,
	}));
};

let jobsData = [];
let originalData = [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getStatusClass(status) {
	return status.toLowerCase().replace(/\s+/g, "_");
}

function getUniqueValues(array, property) {
	return [...new Set(array.map((item) => item[property]))];
}

function createElement(tag, className, textContent) {
	return $.create(tag, className, textContent);
}

function createOption(value, text, selected = false) {
	const option = createElement("option");
	option.value = value;
	option.textContent = text;
	if (selected) option.selected = true;
	return option;
}

function updateStaticTexts() {
	// Update page title and header
	$("#pageTitle").text(I18n.t("app.title"));
	$("#appTitle").text(I18n.t("app.title"));

	// Update button
	$("#addAppBtn").text(I18n.t("buttons.addApplication"));

	// Update table headers
	$("#priorityHeader").text(I18n.t("table.headers.priority"));
	$("#companyHeader").text(I18n.t("table.headers.company"));
	$("#positionHeader").text(I18n.t("table.headers.position"));
	$("#appliedDateHeader").text(I18n.t("table.headers.appliedDate"));
	$("#statusHeader").text(I18n.t("table.headers.status"));
	$("#currentPhaseHeader").text(I18n.t("table.headers.currentPhase"));
	$("#contactPersonHeader").text(I18n.t("table.headers.contactPerson"));
	$("#salaryRangeHeader").text(I18n.t("table.headers.salaryRange"));
	$("#locationHeader").text(I18n.t("table.headers.location"));
	$("#notesHeader").text(I18n.t("table.headers.notes"));
	$("#tasksHeader").text(I18n.t("table.headers.tasks"));
	$("#actionsHeader").text(I18n.t("table.headers.actions"));

	// Update stats labels
	$("#totalAppsLabel").text(I18n.t("stats.totalApplications"));
	$("#activeAppsLabel").text(I18n.t("stats.active"));
	$("#interviewsLabel").text(I18n.t("stats.interviews"));
	$("#offersLabel").text(I18n.t("stats.offers"));
	$("#rejectionsLabel").text(I18n.t("stats.rejections"));
}

function refreshInterface() {
	updateStaticTexts();
	populateTable(jobsData);
	generateHeaderFilters();
	generateDataLists();
	updateStats();
}

// ============================================================================
// SELECT COMPONENT CREATORS
// ============================================================================

function createStatusSelect(
	selectedValue = "",
	includeEmpty = true,
	className = "filter-select",
	onChange = null,
) {
	const select = createElement("select", className);

	if (includeEmpty) {
		select.appendChild(createOption("", I18n.t("table.filters.allStatuses")));
	}

	for (const status of STATUSES) {
		select.appendChild(
			createOption(status, getStatusText(status), status === selectedValue),
		);
	}

	if (onChange) {
		select.onchange = onChange;
	}

	return select;
}

function createPrioritySelect(
	selectedValue = "",
	includeEmpty = true,
	className = "filter-select",
	onChange = null,
) {
	const select = createElement("select", className);

	if (includeEmpty) {
		select.appendChild(createOption("", I18n.t("table.filters.allPriorities")));
	}

	for (const priority of PRIORITIES) {
		const text = includeEmpty
			? I18n.t(`table.filters.${priority}Priority`)
			: getPriorityText(priority);
		select.appendChild(
			createOption(priority, text, priority === selectedValue),
		);
	}

	if (onChange) {
		select.onchange = onChange;
	}

	return select;
}

function createPhaseSelect(
	selectedValue = "",
	includeEmpty = true,
	className = "filter-select",
	onChange = null,
) {
	const select = createElement("select", className);

	if (includeEmpty) {
		select.appendChild(createOption("", I18n.t("table.filters.allPhases")));
	}

	for (const phase of PHASES) {
		select.appendChild(
			createOption(phase, getPhaseText(phase), phase === selectedValue),
		);
	}

	if (onChange) {
		select.onchange = onChange;
	}

	return select;
}

// ============================================================================
// DATA PERSISTENCE
// ============================================================================

function saveToLocalStorage() {
	DataStore.save(jobsData);
}

function loadJobsData() {
	// Initialize i18n first
	I18n.init();

	try {
		const savedData = DataStore.load();
		let shouldShowDemo = false;

		if (savedData) {
			jobsData = savedData;
			// Migrate old notes format to new format
			jobsData = migrateNotesData(jobsData);
			// Migrate old task format to new format
			jobsData = migrateTasksData(jobsData);
			if (jobsData.length === 0) {
				shouldShowDemo = true;
			}
		} else {
			shouldShowDemo = true;
			jobsData = [];
		}

		if (shouldShowDemo) {
			const userWantsDemoData = confirm(I18n.t("messages.welcome"));

			if (userWantsDemoData) {
				jobsData = getDemoData();
				saveToLocalStorage();
			}
		}

		refreshInterface();
		initializeData();
	} catch (error) {
		console.error("Error loading jobs data:", error);
		const userWantsDemoData = confirm(I18n.t("messages.errorLoading"));

		jobsData = userWantsDemoData ? getDemoData() : [];
		saveToLocalStorage();
		refreshInterface();
		initializeData();
	}
}

// ============================================================================
// DATALIST GENERATORS
// ============================================================================

function createOrUpdateDatalist(id, values) {
	let datalist = $("#" + id);
	if (!datalist) {
		datalist = $(createElement("datalist"));
		datalist.attr("id", id);
		document.body.appendChild(datalist.get());
	}

	datalist.html("");
	for (const value of values) {
		datalist.get().appendChild(createOption(value));
	}
}

function generateDataLists() {
	const existingCompanies = getUniqueValues(jobsData, "company");
	const existingPositions = getUniqueValues(jobsData, "position");
	const existingLocations = getUniqueValues(jobsData, "location");

	createOrUpdateDatalist("companiesDatalist", existingCompanies);
	createOrUpdateDatalist("positionsDatalist", existingPositions);
	createOrUpdateDatalist("locationsDatalist", existingLocations);
}

// ============================================================================
// DROPDOWN FILTER GENERATORS
// ============================================================================

function createDropdownOption(text, clickHandler) {
	const option = createElement("div", "dropdown-option", text);
	option.onclick = clickHandler;
	return option;
}

function generateDropdown(
	dropdownId,
	values,
	filterFunction,
	allLabel,
	textMapper = null,
) {
	const dropdown = $("#" + dropdownId);
	dropdown.html("");

	// Add "All" option
	dropdown.append(
		createDropdownOption(allLabel, () => {
			filterFunction("");
			closeDropdown(dropdownId);
		}),
	);

	// Add value options
	for (const value of values) {
		const displayText = textMapper ? textMapper(value) : value;
		dropdown.append(
			createDropdownOption(displayText, () => {
				filterFunction(value);
				closeDropdown(dropdownId);
			}),
		);
	}
}

function generateHeaderFilters() {
	const existingPriorities = getUniqueValues(jobsData, "priority");
	const existingStatuses = getUniqueValues(jobsData, "status");
	const existingPhases = getUniqueValues(jobsData, "currentPhase");

	generateDropdown(
		"priorityDropdown",
		existingPriorities,
		filterByPriority,
		I18n.t("table.filters.allPriorities"),
		getPriorityText,
	);
	generateDropdown(
		"statusDropdown",
		existingStatuses,
		filterByStatus,
		I18n.t("table.filters.allStatuses"),
		getStatusText,
	);
	generateDropdown(
		"phaseDropdown",
		existingPhases,
		filterByPhase,
		I18n.t("table.filters.allPhases"),
		getPhaseText,
	);
}

// ============================================================================
// DROPDOWN UI CONTROLS
// ============================================================================

function toggleDropdown(dropdownId) {
	const dropdown = $("#" + dropdownId);
	const isVisible = dropdown.css("display") === "block";

	// Close all dropdowns first
	for (const d of $.qsa(".filter-dropdown")) {
		$.hide(d);
	}

	// Toggle the clicked dropdown
	dropdown.css("display", isVisible ? "none" : "block");
}

function closeDropdown(dropdownId) {
	$("#" + dropdownId).hide();
}

// ============================================================================
// TABLE MANAGEMENT
// ============================================================================

function populateTable(jobs) {
	const tbody = $("#jobTableBody");
	tbody.html("");

	for (const job of jobs) {
		const jobRow = JobRow({
			job,
			onEdit: (button) => editRow(button),
			onDelete: deleteJob,
		});
		tbody.append(jobRow);
	}
}

function initializeData() {
	const rows = $.qsa("#jobTableBody tr");
	originalData = Array.from(rows).map((row) => row.innerHTML);
	updateStats();
}

// ============================================================================
// ROW OPERATIONS
// ============================================================================

function addRow() {
	const tbody = $("#jobTableBody").get();
	const newRow = tbody.insertRow(0);

	// Create and configure cells
	const cells = {
		priority: newRow.insertCell(),
		company: newRow.insertCell(),
		position: newRow.insertCell(),
		appliedDate: newRow.insertCell(),
		status: newRow.insertCell(),
		currentPhase: newRow.insertCell(),
		contact: newRow.insertCell(),
		salary: newRow.insertCell(),
		location: newRow.insertCell(),
		notes: newRow.insertCell(),
		tasks: newRow.insertCell(),
		actions: newRow.insertCell(),
	};

	// Add CSS classes
	cells.priority.className = "priority-cell";
	cells.company.className = "company-name";
	cells.appliedDate.className = "date";
	cells.contact.className = "contact";
	cells.salary.className = "salary";
	cells.notes.className = "notes";
	cells.tasks.className = "tasks";

	// Add form controls
	cells.priority.appendChild(createPrioritySelect("medium", false, "editable"));
	cells.status.appendChild(createStatusSelect("wishlist", false, "editable"));
	cells.currentPhase.appendChild(
		createPhaseSelect("applicationReview", false, "editable"),
	);

	// Add input fields using components
	cells.company.appendChild(
		InputField({
			placeholder: I18n.t("table.placeholders.companyName"),
			list: "companiesDatalist",
		}),
	);

	cells.position.appendChild(
		InputField({
			placeholder: I18n.t("table.placeholders.positionTitle"),
			list: "positionsDatalist",
		}),
	);

	cells.appliedDate.appendChild(
		InputField({
			type: "date",
			value: new Date().toISOString().split("T")[0],
		}),
	);

	cells.contact.appendChild(
		TextareaField({
			placeholder: I18n.t("table.placeholders.nameEmail"),
			className: "editable contact-textarea",
		}),
	);

	cells.salary.appendChild(
		InputField({
			placeholder: I18n.t("table.placeholders.salaryRange"),
		}),
	);

	cells.location.appendChild(
		InputField({
			placeholder: I18n.t("table.placeholders.location"),
			list: "locationsDatalist",
		}),
	);

	// Notes column shows count (0 for new rows)
	cells.notes.appendChild(NotesCount({ notes: [], onClick: null }));

	// Tasks column shows count (0 for new rows)
	cells.tasks.appendChild(TasksCount({ tasks: [], onClick: null }));

	// Add save button
	const saveButton = h(
		"button",
		{
			className: "action-btn edit-btn",
			onclick: () => saveRow(cells.actions.querySelector("button")),
		},
		h("span", { className: "material-symbols-outlined" }, "save"),
	);
	cells.actions.appendChild(saveButton);

	updateStats();
}

function getJobIdFromRow(row) {
	const jobId = row.getAttribute("data-job-id");
	return jobId ? Number.parseInt(jobId) : null;
}

function editRow(button) {
	const row = button.closest("tr");
	const cells = row.cells;
	const jobId = getJobIdFromRow(row);
	const job = jobsData.find((j) => j.id === jobId);

	if (!job) return;

	// Store original content for cancel functionality
	row.dataset.originalContent = row.innerHTML;

	// Convert row to editable form
	$(cells[0]).html("");
	cells[0].appendChild(
		h(
			"div",
			{ className: "priority-cell" },
			createPrioritySelect(job.priority, false, "editable"),
		),
	);

	$(cells[1]).html("");
	cells[1].appendChild(
		InputField({
			value: job.company,
			list: "companiesDatalist",
		}),
	);

	$(cells[2]).html("");
	cells[2].appendChild(
		InputField({
			value: job.position,
			list: "positionsDatalist",
		}),
	);

	$(cells[3]).html("");
	cells[3].appendChild(
		InputField({
			value: new Date(job.appliedDate).toISOString().split("T")[0],
			type: "date",
		}),
	);

	$(cells[4]).html("");
	cells[4].appendChild(createStatusSelect(job.status, false, "editable"));

	$(cells[5]).html("");
	cells[5].appendChild(createPhaseSelect(job.currentPhase, false, "editable"));

	$(cells[6]).html("");
	cells[6].appendChild(
		ContactTextarea({
			contactPerson: job.contactPerson,
			contactEmail: job.contactEmail,
		}),
	);

	$(cells[7]).html("");
	cells[7].appendChild(InputField({ value: job.salaryRange }));

	$(cells[8]).html("");
	cells[8].appendChild(
		InputField({
			value: job.location,
			list: "locationsDatalist",
		}),
	);

	$(cells[9]).html("");
	// Notes column shows count and is clickable to view/add notes
	cells[9].appendChild(
		NotesCount({
			notes: job.notes || [],
			onClick: () => openNotesModal(job),
		}),
	);

	$(cells[10]).html("");
	// Tasks column shows count and is clickable to view/add tasks
	cells[10].appendChild(
		TasksCount({
			tasks: job.tasks || [],
			onClick: () => openTasksModal(job),
		}),
	);

	$(cells[11]).html("");
	cells[11].appendChild(
		EditActionsCell({
			jobId: jobId,
			onSave: (id) => saveEditedRow(cells[11].querySelector("button"), id),
			onCancel: () => cancelEdit(cells[11].querySelector(".cancel-btn")),
		}),
	);
}

function extractFormData(cells) {
	const contactText = cells[6].querySelector("textarea").value;
	const contactLines = contactText.split("\n");

	return {
		priority: cells[0].querySelector("select").value,
		company: cells[1].querySelector("input").value,
		position: cells[2].querySelector("input").value,
		appliedDate: new Date(cells[3].querySelector("input").value).toISOString(),
		status: cells[4].querySelector("select").value,
		currentPhase: cells[5].querySelector("select").value,
		contactPerson: contactLines[0] || "",
		contactEmail: contactLines[1] || "",
		salaryRange: cells[7].querySelector("input").value,
		location: cells[8].querySelector("input").value,
		// Notes and tasks are handled separately through their respective systems
		notes: [],
		tasks: [],
	};
}

function saveRow(button) {
	const row = button.closest("tr");
	const cells = row.cells;
	const formData = extractFormData(cells);

	const newJob = {
		id: Date.now(),
		...formData,
	};

	jobsData.unshift(newJob);
	saveToLocalStorage();
	refreshInterface();
}

function saveEditedRow(button, jobId) {
	const row = button.closest("tr");
	const cells = row.cells;
	const jobIndex = jobsData.findIndex((job) => job.id === jobId);

	if (jobIndex === -1) return;

	const formData = extractFormData(cells);
	jobsData[jobIndex] = { ...jobsData[jobIndex], ...formData };

	saveToLocalStorage();
	refreshInterface();
}

function cancelEdit(button) {
	const row = button.closest("tr");

	if (row.dataset.originalContent) {
		row.innerHTML = row.dataset.originalContent;
		delete row.dataset.originalContent;
	}
}

function deleteJob(jobId) {
	const jobToDelete = jobsData.find((job) => job.id === jobId);
	if (!jobToDelete) return;

	const confirmed = confirm(
		I18n.t("messages.confirmDelete", {
			position: jobToDelete.position,
			company: jobToDelete.company,
		}),
	);

	if (confirmed) {
		jobsData = jobsData.filter((job) => job.id !== jobId);
		saveToLocalStorage();
		refreshInterface();
	}
}

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================

function filterByStatus(status) {
	const filteredJobs = status
		? jobsData.filter((job) => job.status === status)
		: jobsData;
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

function filterByPriority(priority) {
	const filteredJobs = priority
		? jobsData.filter((job) => job.priority === priority)
		: jobsData;
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

function filterByPhase(phase) {
	const filteredJobs = phase
		? jobsData.filter((job) => job.currentPhase === phase)
		: jobsData;
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

// ============================================================================
// STATISTICS
// ============================================================================

function updateStats(filteredJobs = null) {
	const jobs = filteredJobs || jobsData;
	let total = jobs.length;
	let active = 0;
	let interviews = 0;
	let offers = 0;
	let rejections = 0;

	for (const job of jobs) {
		const status = job.status;
		if (status !== "Rejected" && status !== "Withdrawn") active++;
		if (status.includes("Interview") || status === "Final Round") interviews++;
		if (status === "Offer") offers++;
		if (status === "Rejected") rejections++;
	}

	$("#totalApps").text(total);
	$("#activeApps").text(active);
	$("#interviews").text(interviews);
	$("#offers").text(offers);
	$("#rejections").text(rejections);
}

// ============================================================================
// EVENT LISTENERS AND INITIALIZATION
// ============================================================================

// Close dropdowns when clicking outside
$.on(document, "click", (event) => {
	if (!event.target.closest(".header-with-filter")) {
		for (const dropdown of $.qsa(".filter-dropdown")) {
			$.hide(dropdown);
		}
	}
});

// Cancel edit and close modals on ESC key press
$.on(document, "keydown", (event) => {
	if (event.key === "Escape") {
		// First check if there are any open modals
		const openModal = document.querySelector(".modal-overlay");
		if (openModal) {
			closeModal();
			return;
		}

		// Then check for editing rows
		const editingRow = $.qs("tr[data-original-content]");
		if (editingRow) {
			// Find the cancel button in the row and trigger cancel
			const cancelButton = editingRow.querySelector(".cancel-btn");
			if (cancelButton) {
				cancelEdit(cancelButton);
			}
		}
	}
});

// Initialize on page load
$.on(document, "DOMContentLoaded", loadJobsData);
