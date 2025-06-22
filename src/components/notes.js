// ============================================================================
// NOTES SYSTEM COMPONENTS
// ============================================================================

// Notes count display component
const NotesCount = ({ notes = [], onClick }) => {
	const activeNotes = notes.filter(note => !note.archived);
	const count = activeNotes.length;
	const className = count === 0 ? "notes-count zero" : "notes-count";

	return h("span", {
		className,
		onclick: onClick, // Always allow clicks to open modal
		textContent: count.toString(),
		title: `${count} active note${count !== 1 ? 's' : ''}${notes.length !== count ? ` (${notes.length - count} archived)` : ''}`
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
			noteElement.className = `note-item ${newArchiveStatus ? 'archived' : ''}`;
			
			// Update archive button
			const archiveBtn = noteElement.querySelector('.archive-btn');
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
				
				const noteIndex = jobsData[jobIndex].notes.findIndex((n) => n.id === note.id);
				if (noteIndex === -1) return;
				
				jobsData[jobIndex].notes[noteIndex].text = newText;
				saveToLocalStorage();
				
				// Update in place - replace textarea with new text
				noteTextElement.innerHTML = "";
				noteTextElement.textContent = newText;
				
				// Update interface
				refreshInterface();
			}
		});
		
		const cancelBtn = h("button", {
			className: "action-btn cancel-btn edit-cancel-btn",
			textContent: I18n.t("modals.common.cancel"),
			onclick: () => {
				// Cancel editing - restore original text
				noteTextElement.innerHTML = "";
				noteTextElement.textContent = note.text;
			}
		});
		
		noteTextElement.innerHTML = "";
		noteTextElement.appendChild(textarea);
		noteTextElement.appendChild(h("div", {}, saveBtn, cancelBtn));
		textarea.focus();
	};
	
	return h(
		"div",
		{ 
			className: `note-item ${isArchived ? 'archived' : ''}`,
			"data-note-id": note.id
		},
		h(
			"div",
			{ 
				className: "note-header"
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
					className: "action-btn edit-note-btn icon-btn-transparent",
					title: I18n.t("modals.notes.editTitle"),
					innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
					onclick: handleEdit
				}),
				h("button", {
					className: "action-btn archive-btn icon-btn-transparent",
					title: isArchived ? I18n.t("modals.notes.unarchiveTitle") : I18n.t("modals.notes.archiveTitle"),
					innerHTML: `<span class="material-symbols-outlined icon-14">${isArchived ? "unarchive" : "archive"}</span>`,
					onclick: handleArchiveToggle
				})
			)
		),
		h("div", { 
			className: "note-text"
		}, note.text),
	);
};

// Unified modal component for viewing and adding notes
const NotesModal = ({ job, onClose }) => {
	const notes = job.notes || [];
	const activeNotes = notes.filter(note => !note.archived);
	const archivedNotes = notes.filter(note => note.archived);
	const sortedActiveNotes = [...activeNotes].sort(
		(a, b) => new Date(a.date) - new Date(b.date),
	);
	const sortedArchivedNotes = [...archivedNotes].sort(
		(a, b) => new Date(a.date) - new Date(b.date),
	);

	const handleAddNote = () => {
		const textarea = document.querySelector(".add-note-textarea");
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
		const modalBody = document.querySelector(".modal-body");
		const addNoteSection = modalBody.querySelector(".add-note-section");

		// Create and insert the new note before the add note section
		const newNoteElement = NoteItem({ note: newNote, job });
		modalBody.insertBefore(newNoteElement, addNoteSection);

		// Clear the textarea
		textarea.value = "";

		// Update the notes count in the table (refresh interface for count update)
		refreshInterface();
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
					I18n.t("modals.notes.title", { position: job.position, company: job.company }),
				),
				h("button", { className: "modal-close", onclick: onClose }, "×"),
			),
			h(
				"div",
				{ className: "modal-body" },
				// Active notes section
				...(sortedActiveNotes.length > 0
					? [
						h("h4", { 
							className: "modal-section-header"
						}, I18n.t("modals.notes.activeSection")),
						...sortedActiveNotes.map((note) => NoteItem({ note, job }))
					]
					: [
							h(
								"p",
								{
									className: "modal-empty-message"
								},
								I18n.t("modals.notes.emptyState"),
							),
						]),
				// Archived notes section
				...(sortedArchivedNotes.length > 0
					? [
						h("h4", { 
							className: "modal-archived-header",
							onclick: () => {
								const archivedSection = document.getElementById('archived-notes-content');
								const expandIcon = document.getElementById('archived-notes-icon');
								if (archivedSection.style.display === 'none') {
									archivedSection.style.display = 'block';
									expandIcon.textContent = 'expand_less';
								} else {
									archivedSection.style.display = 'none';
									expandIcon.textContent = 'expand_more';
								}
							}
						}, 
							h('span', { className: 'material-symbols-outlined expand-icon', id: 'archived-notes-icon' }, 'expand_less'),
							I18n.t("modals.notes.archivedSection", { count: sortedArchivedNotes.length })
						),
						h("div", { 
							id: "archived-notes-content"
						}, ...sortedArchivedNotes.map((note) => NoteItem({ note, job })))
					]
					: []),
				// Add note form section
				h(
					"div",
					{ className: "add-note-section" },
					h("h4", { className: "add-note-title" }, I18n.t("modals.notes.addSection")),
					h(
						"div",
						{ className: "note-form-info" },
						h(
							"span",
							{},
							h(
								"span",
								{ className: "material-symbols-outlined" },
								"assignment",
							),
							I18n.t("modals.notes.phaseLabelPrefix") + getPhaseText(job.currentPhase),
						),
					),
					h("textarea", {
						className: "add-note-textarea",
						placeholder: I18n.t("modals.notes.placeholder"),
						rows: 3,
						onkeydown: (e) => {
							if (e.key === "Enter" && e.shiftKey) {
								e.preventDefault();
								handleAddNote();
							}
						},
					}),
				),
			),
			h(
				"div",
				{ className: "modal-footer" },
				h(
					"button",
					{
						className: "action-btn edit-btn",
						onclick: handleAddNote,
					},
					I18n.t("modals.notes.addButton"),
				),
				h(
					"button",
					{ className: "action-btn cancel-btn", onclick: onClose },
					I18n.t("modals.common.close"),
				),
			),
		),
	);
};

// ============================================================================
// NOTES MANAGEMENT FUNCTIONS
// ============================================================================

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