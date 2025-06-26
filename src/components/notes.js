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
		title:
			I18n.t("modals.notes.titleFormat", {
				count,
				s: count !== 1 ? "s" : "",
				archived: notes.length - count,
			}) ||
			`${count} active note${count !== 1 ? "s" : ""}${notes.length !== count ? ` (${notes.length - count} archived)` : ""}`,
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
		const textarea = h("textarea.note-edit-textarea", {
			textContent: currentText,
		});

		const saveBtn = h("button.action-btn.edit-btn.edit-save-btn", {
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

		const cancelBtn = h("button.action-btn.cancel-btn.edit-cancel-btn", {
			textContent: I18n.t("modals.common.cancel"),
			onclick: () => {
				// Cancel editing - restore original text
				noteTextElement.innerHTML = "";
				noteTextElement.textContent = note.text;
			},
		});

		noteTextElement.innerHTML = "";
		noteTextElement.appendChild(textarea);
		noteTextElement.appendChild(h("div", saveBtn, cancelBtn));
		textarea.focus();
	};

	return h(
		"div",
		{
			className: `note-item ${isArchived ? "archived" : ""}`,
			"data-note-id": note.id,
		},
		h(
			"div.note-header",
			h(
				"div.modal-header-content",
				h("span.note-phase", getPhaseText(note.phase)),
				h("span.note-date", formatDate(note.date))
			),
			h(
				"div.note-actions modal-actions-row",
				h("button.action-btn.edit-note-btn", {
					title: I18n.t("modals.notes.editTitle"),
					innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
					onclick: handleEdit,
				}),
				h("button.action-btn.archive-btn", {
					title: isArchived
						? I18n.t("modals.notes.unarchiveTitle")
						: I18n.t("modals.notes.archiveTitle"),
					innerHTML: `<span class="material-symbols-outlined icon-14">${isArchived ? "unarchive" : "archive"}</span>`,
					onclick: handleArchiveToggle,
				})
			)
		),
		h("div.note-text", note.text)
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
					I18n.t("modals.notes.title", { position: job.position, company: job.company })
				),
				h("button.modal-close", { onclick: onClose }, "×")
			),
			h("div.modal-body", createNotesContent(job, sortedActiveNotes, sortedArchivedNotes))
		)
	);
};

// ============================================================================
// NOTES MANAGEMENT FUNCTIONS
// ============================================================================

// Simple note editing system
const enableNoteEditing = (note, job) => {
	const noteItem = document.querySelector(`[data-note-id="${note.id}"]`);
	if (!noteItem) return;

	// Replace the note item with editing structure
	noteItem.innerHTML = `
		<div class="note-header">
			<div class="note-date">${formatDate(note.date)}</div>
			<div class="note-phase">${note.phase ? I18n.t(`phases.${note.phase}`) : ""}</div>
			<div class="note-actions">
				<button class="action-btn save-note-btn" title="${I18n.t("modals.common.save")}">
					<span class="material-symbols-outlined icon-14">check</span>
				</button>
				<button class="action-btn cancel-note-btn" title="${I18n.t("modals.common.cancel")}">
					<span class="material-symbols-outlined icon-14">close</span>
				</button>
			</div>
		</div>
		<div class="note-text">
			<textarea class="note-edit-textarea" rows="3" placeholder="${I18n.t("modals.notes.placeholder")}">${note.text || ""}</textarea>
		</div>
	`;

	// Add event listeners
	const saveBtn = noteItem.querySelector(".save-note-btn");
	const cancelBtn = noteItem.querySelector(".cancel-note-btn");
	const textarea = noteItem.querySelector(".note-edit-textarea");

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
	const noteItem = document.querySelector(`[data-note-id="${note.id}"]`);
	if (!noteItem) return;

	const textarea = noteItem.querySelector(".note-edit-textarea");
	const newText = textarea.value.trim();

	if (!newText) {
		alert(I18n.t("modals.notes.validation.textRequired") || "Note text is required");
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

// Global note handling functions
const handleAddNote = () => {
	const textarea = document.querySelector(".add-note-textarea");
	const noteText = textarea.value.trim();

	if (!noteText) {
		// Show error message instead of alert
		showValidationError(
			textarea,
			I18n.t("modals.notes.validation.textRequired") || "Note text is required"
		);
		return;
	}

	// Find the job from the modal
	const modalTitle = document.querySelector(".modal-title");
	if (!modalTitle) return;

	// Extract job info from title or use a data attribute approach
	const currentModal = modalTitle.closest(".modal-overlay");
	const jobId = currentModal.dataset.jobId;
	const job = jobsData.find((j) => String(j.id) === String(jobId));
	if (!job) return;

	const newNote = {
		id: Date.now(),
		date: new Date().toISOString(),
		phase: job.currentPhase,
		text: noteText,
	};

	// Add note to job data
	const jobIndex = jobsData.findIndex((j) => String(j.id) === String(job.id));
	if (jobIndex === -1) return;

	if (!jobsData[jobIndex].notes) {
		jobsData[jobIndex].notes = [];
	}

	jobsData[jobIndex].notes.push(newNote);
	saveToLocalStorage();

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

	// Store archived section state before refresh
	const archivedList = document.getElementById("archived-notes-list");
	const wasExpanded = archivedList && archivedList.style.display === "block";

	jobsData[jobIndex].notes[noteIndex].archived = !note.archived;
	saveToLocalStorage();

	// Refresh modal without flicker
	refreshNotesModal(job);

	// Restore archived section state after refresh
	if (wasExpanded) {
		setTimeout(() => {
			const newArchivedList = document.getElementById("archived-notes-list");
			const expandIcon = document.getElementById("archived-notes-icon");
			if (newArchivedList) {
				newArchivedList.style.display = "block";
				if (expandIcon) expandIcon.textContent = "expand_less";
			}
		}, 0);
	}

	// Update interface
	refreshInterface();
};

// Create notes content for modal (extracted to global scope for reuse)
const createNotesContent = (job, sortedActiveNotes, sortedArchivedNotes) => {
	return h(
		"div",
		// Active notes list
		sortedActiveNotes.length > 0
			? h(
					"div.notes-list-container",
					...sortedActiveNotes.map((note) =>
						h(
							"div.note-item",
							{ key: note.id, "data-note-id": note.id },
							h(
								"div.note-header",
								h("div.note-date", formatDate(note.date)),
								h("div.note-phase", getPhaseText(note.phase)),
								h(
									"div.note-actions",
									h("button.action-btn.edit-note-btn", {
										title: I18n.t("modals.notes.editTitle"),
										innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
										onclick: () => enableNoteEditing(note, job),
									}),
									h("button.action-btn.archive-btn", {
										title: I18n.t("modals.notes.archiveTitle"),
										innerHTML: '<span class="material-symbols-outlined icon-14">archive</span>',
										onclick: () => archiveNote(note, job),
									})
								)
							),
							h("div.note-text", note.text)
						)
					)
				)
			: h("p.modal-empty-message", I18n.t("modals.notes.emptyState")),

		// Archived notes section
		sortedArchivedNotes.length > 0
			? h(
					"div.archived-notes-section",
					h(
						"h4.notes-archived-header",
						{
							onclick: () => {
								const archivedList = document.getElementById("archived-notes-list");
								const expandIcon = document.getElementById("archived-notes-icon");
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
							{
								id: "archived-notes-icon",
							},
							"expand_more"
						),
						I18n.t("modals.notes.archivedSection", { count: sortedArchivedNotes.length })
					),
					h(
						"div.notes-list-container.archived",
						{
							id: "archived-notes-list",
							style: "display: none;",
						},
						...sortedArchivedNotes.map((note) =>
							h(
								"div.note-item.archived",
								{ key: note.id },
								h(
									"div.note-header",
									h("div.note-date", formatDate(note.date)),
									h("div.note-phase", getPhaseText(note.phase)),
									h(
										"div.note-actions",
										h("button.action-btn.archive-btn", {
											title: I18n.t("modals.notes.unarchiveTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">unarchive</span>',
											onclick: () => archiveNote(note, job),
										})
									)
								),
								h("div.note-text", note.text)
							)
						)
					)
				)
			: null,

		// Add note form section
		h(
			"div.add-note-section",
			h("h4.add-note-title", I18n.t("modals.notes.addSection")),
			h(
				"form.add-note-form",
				{
					onsubmit: (e) => {
						e.preventDefault();
						handleAddNote();
					},
				},
				h("textarea.add-note-textarea", {
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
					"div.add-note-form-actions",
					h(
						"button.action-btn.primary-btn",
						{
							type: "submit",
						},
						I18n.t("modals.notes.addButton")
					)
				)
			)
		)
	);
};

// Make note components and functions available globally
window.NotesCount = NotesCount;
window.NoteItem = NoteItem;
window.NotesModal = NotesModal;
window.openNotesModal = openNotesModal;
window.openAddNoteModal = openAddNoteModal;
window.enableNoteEditing = enableNoteEditing;
window.saveNoteEdits = saveNoteEdits;
window.cancelNoteEdits = cancelNoteEdits;
window.handleAddNote = handleAddNote;
window.archiveNote = archiveNote;
window.createNotesContent = createNotesContent;
window.refreshNotesModal = refreshNotesModal;
