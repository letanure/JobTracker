// ============================================================================
// NOTES SYSTEM COMPONENTS
// ============================================================================

// Notes count display component
const NotesCount = ({ notes = [], onClick }) => {
	const activeNotes = notes.filter((note) => !note.archived);
	const count = activeNotes.length;
	const className = count === 0 ? "notes-count zero" : "notes-count";

	return h("span", {
		className,
		onclick: onClick, // Always allow clicks to open modal
		textContent: count.toString(),
		title: `${count} active note${count !== 1 ? "s" : ""}${notes.length !== count ? ` (${notes.length - count} archived)` : ""}`,
	});
};

// Individual note item component
const NoteItem = ({ note, job }) => {
	const isArchived = note.archived || false;

	const handleArchiveToggle = () => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const noteIndex = jobsData[jobIndex].notes.findIndex((n) => n.id === note.id);
		if (noteIndex === -1) return;

		jobsData[jobIndex].notes[noteIndex].archived = !isArchived;
		saveToLocalStorage();

		// Update the note element in place
		const noteElement = document.querySelector(`[data-note-id="${note.id}"]`);
		if (noteElement) {
			const newArchiveStatus = !isArchived;
			noteElement.style.opacity = newArchiveStatus ? "0.6" : "1";
			noteElement.style.filter = newArchiveStatus ? "grayscale(0.5)" : "none";
			noteElement.className = `note-item ${newArchiveStatus ? "archived" : ""}`;

			// Update archive button
			const archiveBtn = noteElement.querySelector(".archive-btn");
			if (archiveBtn) {
				archiveBtn.innerHTML = `<span class="material-symbols-outlined icon-14">${newArchiveStatus ? "unarchive" : "archive"}</span>`;
			}
		}

		// Update interface
		refreshInterface();
	};

	const handleEdit = () => {
		const noteTextElement = document.querySelector(`[data-note-id="${note.id}"] .note-text`);
		if (!noteTextElement) return;

		const currentText = note.text;
		const textarea = h("textarea", {
			className: "note-edit-textarea",
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

				const noteIndex = jobsData[jobIndex].notes.findIndex((n) => n.id === note.id);
				if (noteIndex === -1) return;

				jobsData[jobIndex].notes[noteIndex].text = newText;
				saveToLocalStorage();

				// Update in place - replace textarea with new text
				noteTextElement.innerHTML = "";
				noteTextElement.textContent = newText;

				// Update interface
				refreshInterface();
			},
		});

		const cancelBtn = h("button", {
			className: "action-btn cancel-btn edit-cancel-btn",
			textContent: I18n.t("modals.common.cancel"),
			onclick: () => {
				// Cancel editing - restore original text
				noteTextElement.innerHTML = "";
				noteTextElement.textContent = note.text;
			},
		});

		noteTextElement.innerHTML = "";
		noteTextElement.appendChild(textarea);
		noteTextElement.appendChild(h("div", {}, saveBtn, cancelBtn));
		textarea.focus();
	};

	return h(
		"div",
		{
			className: `note-item ${isArchived ? "archived" : ""}`,
			"data-note-id": note.id,
		},
		h(
			"div",
			{
				className: "note-header",
			},
			h(
				"div",
				{ className: "modal-header-content" },
				h("span", { className: "note-phase" }, getPhaseText(note.phase)),
				h("span", { className: "note-date" }, formatDate(note.date))
			),
			h(
				"div",
				{ className: "note-actions modal-actions-row" },
				h("button", {
					className: "action-btn edit-note-btn ",
					title: I18n.t("modals.notes.editTitle"),
					innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
					onclick: handleEdit,
				}),
				h("button", {
					className: "action-btn archive-btn ",
					title: isArchived
						? I18n.t("modals.notes.unarchiveTitle")
						: I18n.t("modals.notes.archiveTitle"),
					innerHTML: `<span class="material-symbols-outlined icon-14">${isArchived ? "unarchive" : "archive"}</span>`,
					onclick: handleArchiveToggle,
				})
			)
		),
		h(
			"div",
			{
				className: "note-text",
			},
			note.text
		)
	);
};

// Unified modal component for viewing and adding notes
const NotesModal = ({ job, onClose }) => {
	const notes = job.notes || [];
	const activeNotes = notes.filter((note) => !note.archived);
	const archivedNotes = notes.filter((note) => note.archived);
	const sortedActiveNotes = [...activeNotes].sort((a, b) => new Date(a.date) - new Date(b.date));
	const sortedArchivedNotes = [...archivedNotes].sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);

	const handleAddNote = () => {
		const textarea = document.querySelector(".add-note-textarea");
		const noteText = textarea.value.trim();

		if (!noteText) {
			// Show error message instead of alert
			showValidationError(textarea, "Note text is required");
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

		// Refresh modal without flicker
		refreshNotesModal(job);

		// Clear the textarea
		textarea.value = "";

		// Focus back to the textarea
		setTimeout(() => {
			const newTextarea = document.querySelector(".add-note-textarea");
			if (newTextarea) newTextarea.focus();
		}, 100);

		// Update the notes count in the table (refresh interface for count update)
		refreshInterface();
	};

	const archiveNote = (note, job) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const noteIndex = jobsData[jobIndex].notes.findIndex((n) => n.id === note.id);
		if (noteIndex === -1) return;

		jobsData[jobIndex].notes[noteIndex].archived = !note.archived;
		saveToLocalStorage();

		// Refresh modal without flicker
		refreshNotesModal(job);

		// Update interface
		refreshInterface();
	};

	const refreshNotesModal = (job) => {
		const modalBody = document.querySelector(".modal-body");
		if (!modalBody) return;

		// Get updated data
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		job.notes = jobsData[jobIndex].notes || [];
		const notes = job.notes;
		const activeNotes = notes.filter((note) => !note.archived);
		const archivedNotes = notes.filter((note) => note.archived);
		const sortedActiveNotes = [...activeNotes].sort((a, b) => new Date(a.date) - new Date(b.date));
		const sortedArchivedNotes = [...archivedNotes].sort(
			(a, b) => new Date(a.date) - new Date(b.date)
		);

		// Recreate modal body content
		modalBody.innerHTML = "";
		modalBody.appendChild(createNotesContent(job, sortedActiveNotes, sortedArchivedNotes));
	};

	const createNotesContent = (job, sortedActiveNotes, sortedArchivedNotes) => {
		return h(
			"div",
			{},
			// Active notes table
			sortedActiveNotes.length > 0
				? h(
						"div",
						{ className: "notes-table-container" },
						h(
							"table",
							{ className: "notes-table" },
							h(
								"thead",
								{},
								h(
									"tr",
									{},
									h("th", {}, "Phase"),
									h("th", {}, "Date"),
									h("th", {}, "Note"),
									h("th", {}, "Actions")
								)
							),
							h(
								"tbody",
								{},
								...sortedActiveNotes.map((note) =>
									h(
										"tr",
										{ key: note.id, "data-note-id": note.id },
										h("td", { className: "note-phase-cell" }, getPhaseText(note.phase)),
										h("td", { className: "note-date-cell" }, formatDate(note.date)),
										h("td", { className: "note-text-cell" }, note.text),
										h(
											"td",
											{ className: "notes-table-actions" },
											h("button", {
												className: "action-btn edit-note-btn ",
												title: I18n.t("modals.notes.editTitle"),
												innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
												onclick: () => enableNoteEditing(note, job),
											}),
											h("button", {
												className: "action-btn archive-btn ",
												title: I18n.t("modals.notes.archiveTitle"),
												innerHTML: '<span class="material-symbols-outlined icon-14">archive</span>',
												onclick: () => archiveNote(note, job),
											})
										)
									)
								)
							)
						)
					)
				: h("p", { className: "modal-empty-message" }, I18n.t("modals.notes.emptyState")),

			// Archived notes section
			sortedArchivedNotes.length > 0
				? h(
						"div",
						{ className: "archived-notes-section" },
						h(
							"h4",
							{
								className: "notes-archived-header",
								onclick: () => {
									const archivedTable = document.getElementById("archived-notes-table");
									const expandIcon = document.getElementById("archived-notes-icon");
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
								{ className: "material-symbols-outlined expand-icon", id: "archived-notes-icon" },
								"expand_more"
							),
							I18n.t("modals.notes.archivedSection", { count: sortedArchivedNotes.length })
						),
						h(
							"table",
							{
								id: "archived-notes-table",
								className: "notes-table archived",
								style: "display: none",
							},
							h(
								"thead",
								{},
								h(
									"tr",
									{},
									h("th", {}, "Phase"),
									h("th", {}, "Date"),
									h("th", {}, "Note"),
									h("th", {}, "Actions")
								)
							),
							h(
								"tbody",
								{},
								...sortedArchivedNotes.map((note) =>
									h(
										"tr",
										{ key: note.id },
										h("td", {}, getPhaseText(note.phase)),
										h("td", {}, formatDate(note.date)),
										h("td", { className: "note-text-cell" }, note.text),
										h(
											"td",
											{ className: "notes-table-actions" },
											h("button", {
												className: "action-btn archive-btn ",
												title: I18n.t("modals.notes.unarchiveTitle"),
												innerHTML:
													'<span class="material-symbols-outlined icon-14">unarchive</span>',
												onclick: () => archiveNote(note, job),
											})
										)
									)
								)
							)
						)
					)
				: null,

			// Add note form section
			h(
				"div",
				{ className: "add-note-section" },
				h("h4", { className: "add-note-title" }, I18n.t("modals.notes.addSection")),
				h(
					"form",
					{
						className: "add-note-form",
						onsubmit: (e) => {
							e.preventDefault();
							handleAddNote();
						},
					},
					h("textarea", {
						className: "add-note-textarea",
						placeholder: I18n.t("modals.notes.placeholder"),
						rows: 2,
						onkeydown: (e) => {
							if (e.key === "Enter" && e.shiftKey) {
								e.preventDefault();
								handleAddNote();
							}
						},
					}),
					h(
						"div",
						{ className: "add-note-form-actions" },
						h(
							"button",
							{
								type: "submit",
								className: "action-btn primary-btn",
							},
							I18n.t("modals.notes.addButton")
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
					I18n.t("modals.notes.title", { position: job.position, company: job.company })
				),
				h("button", { className: "modal-close", onclick: onClose }, "×")
			),
			h(
				"div",
				{ className: "modal-body" },
				createNotesContent(job, sortedActiveNotes, sortedArchivedNotes)
			)
		)
	);
};

// ============================================================================
// NOTES MANAGEMENT FUNCTIONS
// ============================================================================

// Simple note editing system
const enableNoteEditing = (note, job) => {
	const noteRow = document.querySelector(`[data-note-id="${note.id}"]`);
	if (!noteRow) return;

	// Replace entire row with editing structure
	noteRow.innerHTML = `
		<td class="note-date-cell">${formatDate(note.date)}</td>
		<td class="note-phase-cell">${I18n.t(`phases.${note.phase}`)}</td>
		<td class="note-text-cell">
			<textarea class="note-edit-textarea" rows="2" placeholder="${I18n.t("modals.notes.placeholder")}">${note.text || ""}</textarea>
		</td>
		<td class="notes-table-actions">
			<button class="action-btn save-note-btn " title="${I18n.t("modals.common.save")}">
				<span class="material-symbols-outlined icon-14">check</span>
			</button>
			<button class="action-btn cancel-note-btn " title="${I18n.t("modals.common.cancel")}">
				<span class="material-symbols-outlined icon-14">close</span>
			</button>
		</td>
	`;

	// Add event listeners
	const saveBtn = noteRow.querySelector(".save-note-btn");
	const cancelBtn = noteRow.querySelector(".cancel-note-btn");
	const textarea = noteRow.querySelector(".note-edit-textarea");

	saveBtn.onclick = () => saveNoteEdits(note, job);
	cancelBtn.onclick = () => cancelNoteEdits(note, job);

	// Add Shift+Enter support
	textarea.onkeydown = (e) => {
		if (e.key === "Enter" && e.shiftKey) {
			e.preventDefault();
			saveNoteEdits(note, job);
		}
	};

	// Focus textarea
	textarea.focus();
	textarea.select();
};

const saveNoteEdits = (note, job) => {
	const noteRow = document.querySelector(`[data-note-id="${note.id}"]`);
	if (!noteRow) return;

	const textarea = noteRow.querySelector(".note-edit-textarea");
	const newText = textarea.value.trim();

	if (!newText) {
		alert("Note text is required");
		return;
	}

	// Update data
	const jobIndex = jobsData.findIndex((j) => j.id === job.id);
	const noteIndex = jobsData[jobIndex].notes.findIndex((n) => n.id === note.id);

	jobsData[jobIndex].notes[noteIndex].text = newText;

	// Save and refresh in place (no flicker!)
	saveToLocalStorage();
	refreshNotesModal(job);
	refreshInterface();
};

const cancelNoteEdits = (note, job) => {
	// Refresh modal to restore original content (no flicker!)
	refreshNotesModal(job);
};

// Create notes content for modal
const createNotesContent = (job, sortedActiveNotes, sortedArchivedNotes) => {
	return h(
		"div",
		{},
		// Active notes table
		sortedActiveNotes.length > 0
			? h(
					"div",
					{ className: "notes-table-container" },
					h(
						"table",
						{ className: "notes-table" },
						h(
							"thead",
							{},
							h(
								"tr",
								{},
								h("th", {}, "Phase"),
								h("th", {}, "Date"),
								h("th", {}, "Note"),
								h("th", {}, "Actions")
							)
						),
						h(
							"tbody",
							{},
							...sortedActiveNotes.map((note) =>
								h(
									"tr",
									{ key: note.id, "data-note-id": note.id },
									h("td", { className: "note-phase-cell" }, getPhaseText(note.phase)),
									h("td", { className: "note-date-cell" }, formatDate(note.date)),
									h("td", { className: "note-text-cell" }, note.text),
									h(
										"td",
										{ className: "notes-table-actions" },
										h("button", {
											className: "action-btn edit-note-btn ",
											title: I18n.t("modals.notes.editTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
											onclick: () => enableNoteEditing(note, job),
										}),
										h("button", {
											className: "action-btn archive-btn ",
											title: I18n.t("modals.notes.archiveTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">archive</span>',
											onclick: () => archiveNote(note, job),
										})
									)
								)
							)
						)
					)
				)
			: h("p", { className: "modal-empty-message" }, I18n.t("modals.notes.emptyState")),

		// Archived notes section
		sortedArchivedNotes.length > 0
			? h(
					"div",
					{ className: "archived-notes-section" },
					h(
						"h4",
						{
							className: "notes-archived-header",
							onclick: () => {
								const archivedTable = document.getElementById("archived-notes-table");
								const expandIcon = document.getElementById("archived-notes-icon");
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
								id: "archived-notes-icon",
							},
							"expand_more"
						),
						I18n.t("modals.notes.archivedSection", { count: sortedArchivedNotes.length })
					),
					h(
						"table",
						{
							id: "archived-notes-table",
							className: "notes-table archived",
							style: "display: none",
						},
						h(
							"thead",
							{},
							h(
								"tr",
								{},
								h("th", {}, "Phase"),
								h("th", {}, "Date"),
								h("th", {}, "Note"),
								h("th", {}, "Actions")
							)
						),
						h(
							"tbody",
							{},
							...sortedArchivedNotes.map((note) =>
								h(
									"tr",
									{ key: note.id },
									h("td", {}, getPhaseText(note.phase)),
									h("td", {}, formatDate(note.date)),
									h("td", {}, note.text),
									h(
										"td",
										{ className: "notes-table-actions" },
										h("button", {
											className: "action-btn archive-btn ",
											title: I18n.t("modals.notes.unarchiveTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">unarchive</span>',
											onclick: () => archiveNote(note, job),
										})
									)
								)
							)
						)
					)
				)
			: null,

		// Add note form
		h(
			"div",
			{ className: "add-note-row" },
			h("h4", { className: "add-note-title" }, I18n.t("modals.notes.addSection")),
			h(
				"form",
				{
					className: "add-note-form",
					onsubmit: (e) => {
						e.preventDefault();
						handleAddNote();
					},
				},
				h("textarea", {
					className: "add-note-textarea",
					placeholder: I18n.t("modals.notes.placeholder"),
					rows: 2,
					onkeydown: (e) => {
						if (e.key === "Enter" && e.shiftKey) {
							e.preventDefault();
							handleAddNote();
						}
					},
				}),
				h(
					"div",
					{ className: "add-note-form-actions" },
					h(
						"button",
						{
							type: "submit",
							className: "action-btn primary-btn",
						},
						I18n.t("modals.notes.addButton")
					)
				)
			)
		)
	);
};

// Refresh notes modal content
const refreshNotesModal = (job) => {
	const modalBody = document.querySelector(".modal-body");
	if (!modalBody) return;

	// Get updated data
	const jobIndex = jobsData.findIndex((j) => j.id === job.id);
	if (jobIndex === -1) return;

	job.notes = jobsData[jobIndex].notes || [];
	const notes = job.notes;
	const activeNotes = notes.filter((note) => !note.archived);
	const archivedNotes = notes.filter((note) => note.archived);
	const sortedActiveNotes = [...activeNotes].sort((a, b) => new Date(a.date) - new Date(b.date));
	const sortedArchivedNotes = [...archivedNotes].sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);

	// Recreate modal body content
	modalBody.innerHTML = "";
	modalBody.appendChild(createNotesContent(job, sortedActiveNotes, sortedArchivedNotes));
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
		const modalBody = modal.querySelector(".modal-body");
		if (modalBody) {
			modalBody.scrollTop = modalBody.scrollHeight;
		}
	}, 50);
};

// Alias for backward compatibility
const openAddNoteModal = openNotesModal;

// Make note components and functions available globally
window.NotesCount = NotesCount;
window.NoteItem = NoteItem;
window.NotesModal = NotesModal;
window.openNotesModal = openNotesModal;
window.openAddNoteModal = openAddNoteModal;
window.enableNoteEditing = enableNoteEditing;
window.saveNoteEdits = saveNoteEdits;
window.cancelNoteEdits = cancelNoteEdits;
window.createNotesContent = createNotesContent;
window.refreshNotesModal = refreshNotesModal;
