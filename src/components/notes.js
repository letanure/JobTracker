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
		onclick: count > 0 ? onClick : null,
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
				archiveBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">${newArchiveStatus ? "unarchive" : "archive"}</span>`;
			}
		}
		
		// Update interface
		updateStats();
	};
	
	const handleEdit = () => {
		const noteTextElement = document.querySelector(`[data-note-id="${note.id}"] .note-text`);
		if (!noteTextElement) return;
		
		const currentText = note.text;
		const textarea = h("textarea", {
			className: "note-edit-textarea",
			style: { 
				width: "100%", 
				minHeight: "60px", 
				padding: "8px", 
				border: "1px solid var(--border-color)", 
				borderRadius: "4px",
				fontFamily: "inherit",
				fontSize: "inherit",
				resize: "vertical"
			},
			textContent: currentText
		});
		
		const saveBtn = h("button", {
			className: "action-btn edit-btn",
			style: { marginRight: "8px", marginTop: "8px", padding: "4px 8px", fontSize: "12px" },
			textContent: "Save",
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
				updateStats();
			}
		});
		
		const cancelBtn = h("button", {
			className: "action-btn cancel-btn",
			style: { marginTop: "8px", padding: "4px 8px", fontSize: "12px" },
			textContent: "Cancel",
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
			"data-note-id": note.id,
			style: isArchived ? { opacity: "0.6", filter: "grayscale(0.5)" } : {}
		},
		h(
			"div",
			{ 
				className: "note-header",
				style: { 
					display: "flex", 
					justifyContent: "space-between", 
					alignItems: "center",
					marginBottom: "8px",
					fontSize: "12px",
					color: "var(--text-light)"
				}
			},
			h(
				"div",
				{ style: { display: "flex", gap: "12px", alignItems: "center" } },
				h("span", { className: "note-phase" }, getPhaseText(note.phase)),
				h("span", { className: "note-date" }, formatDate(note.date))
			),
			h(
				"div",
				{ className: "note-actions", style: { display: "flex", gap: "4px" } },
				h("button", {
					className: "action-btn edit-note-btn",
					title: "Edit note",
					style: { 
						padding: "4px", 
						fontSize: "14px",
						background: "transparent",
						border: "none",
						cursor: "pointer",
						color: "var(--text-light)",
						borderRadius: "3px"
					},
					innerHTML: '<span class="material-symbols-outlined" style="font-size: 14px;">edit</span>',
					onclick: handleEdit
				}),
				h("button", {
					className: "action-btn archive-btn",
					title: isArchived ? "Unarchive note" : "Archive note",
					style: { 
						padding: "4px", 
						fontSize: "14px",
						background: "transparent",
						border: "none",
						cursor: "pointer",
						color: "var(--text-light)",
						borderRadius: "3px"
					},
					innerHTML: `<span class="material-symbols-outlined" style="font-size: 14px;">${isArchived ? "unarchive" : "archive"}</span>`,
					onclick: handleArchiveToggle
				})
			)
		),
		h("div", { 
			className: "note-text",
			style: {
				fontSize: "14px",
				lineHeight: "1.5",
				whiteSpace: "pre-wrap",
				color: "var(--text-color)"
			}
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
		updateStats();
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
				// Active notes section
				...(sortedActiveNotes.length > 0
					? [
						h("h4", { 
							style: { 
								marginBottom: "12px", 
								color: "var(--text-color)", 
								fontSize: "14px",
								borderBottom: "1px solid var(--border-color)",
								paddingBottom: "8px"
							} 
						}, "Active Notes"),
						...sortedActiveNotes.map((note) => NoteItem({ note, job }))
					]
					: [
							h(
								"p",
								{
									style: {
										textAlign: "center",
										color: "var(--text-light)",
										marginBottom: "20px",
									},
								},
								"No notes yet. Add your first note below.",
							),
						]),
				// Archived notes section
				...(sortedArchivedNotes.length > 0
					? [
						h("h4", { 
							style: { 
								marginTop: "24px",
								marginBottom: "12px", 
								color: "var(--text-light)", 
								fontSize: "14px",
								borderBottom: "1px solid var(--border-color)",
								paddingBottom: "8px",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px"
							},
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
							h('span', { className: 'material-symbols-outlined', id: 'archived-notes-icon', style: { fontSize: '16px' } }, 'expand_less'),
							`Archived Notes (${sortedArchivedNotes.length})`
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
					h("h4", { className: "add-note-title" }, "Add New Note"),
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
							` Phase: ${getPhaseText(job.currentPhase)}`,
						),
					),
					h("textarea", {
						className: "add-note-textarea",
						placeholder: "Enter your note here...",
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