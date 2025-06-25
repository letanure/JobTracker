// ============================================================================
// CONTACTS SYSTEM COMPONENTS
// ============================================================================

// Contacts count display component
const ContactsCount = ({ contacts = [], onClick }) => {
	const activeContacts = contacts.filter((contact) => !contact.archived);
	const count = activeContacts.length;
	const className = count === 0 ? "contacts-count zero" : "contacts-count";

	return h('span', {
		className,
		onclick: onClick, // Always allow clicks to open modal
		textContent: count.toString(),
		title: `${count} contact${count !== 1 ? "s" : ""}${contacts.length !== count ? ` (${contacts.length - count} archived)` : ""}`});
};

// Individual contact item component
const ContactItem = ({ contact, job }) => {
	const isArchived = contact.archived || false;

	const handleArchiveToggle = () => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const contactIndex = jobsData[jobIndex].contacts.findIndex((c) => c.id === contact.id);
		if (contactIndex === -1) return;

		jobsData[jobIndex].contacts[contactIndex].archived = !isArchived;
		saveToLocalStorage();

		// Update the contact element in place
		const contactElement = document.querySelector(`[data-contact-id="${contact.id}"]`);
		if (contactElement) {
			const newArchiveStatus = !isArchived;
			contactElement.style.opacity = newArchiveStatus ? "0.6" : "1";
			contactElement.style.filter = newArchiveStatus ? "grayscale(0.5)" : "none";
			contactElement.className = `contact-item ${newArchiveStatus ? "archived" : ""}`;

			// Update archive button
			const archiveBtn = contactElement.querySelector(".archive-btn");
			if (archiveBtn) {
				archiveBtn.innerHTML = `<span class="material-symbols-outlined icon-14">${newArchiveStatus ? "unarchive" : "archive"}</span>`;
			}
		}

		// Update interface
		refreshInterface();
	};

	const handleEdit = () => {
		const contactInfoElement = document.querySelector(
			`[data-contact-id="${contact.id}"] .contact-info`
		);
		if (!contactInfoElement) return;

		// Create form fields
		const nameInput = h('input.contact-edit-input', {type: "text",
			value: contact.name || "",
			placeholder: "Name"});

		const emailInput = h('input.contact-edit-input', {type: "email",
			value: contact.email || "",
			placeholder: "Email"});

		const phoneInput = h('input.contact-edit-input', {type: "tel",
			value: contact.phone || "",
			placeholder: "Phone"});

		const companyInput = h('input.contact-edit-input', {type: "text",
			value: contact.company || "",
			placeholder: "Company"});

		const saveBtn = h('button.action-btn.edit-btn.edit-save-btn', {
			textContent: I18n.t("modals.common.save"),
			onclick: () => {
				const newName = nameInput.value.trim();
				const newEmail = emailInput.value.trim();
				const newPhone = phoneInput.value.trim();
				const newCompany = companyInput.value.trim();

				if (!newName && !newEmail && !newPhone) return;

				const jobIndex = jobsData.findIndex((j) => j.id === job.id);
				if (jobIndex === -1) return;

				const contactIndex = jobsData[jobIndex].contacts.findIndex((c) => c.id === contact.id);
				if (contactIndex === -1) return;

				jobsData[jobIndex].contacts[contactIndex].name = newName;
				jobsData[jobIndex].contacts[contactIndex].email = newEmail;
				jobsData[jobIndex].contacts[contactIndex].phone = newPhone;
				jobsData[jobIndex].contacts[contactIndex].company = newCompany;
				saveToLocalStorage();

				// Update in place - replace form with new data
				contactInfoElement.innerHTML = "";
				contactInfoElement.appendChild(
					createContactDisplay(jobsData[jobIndex].contacts[contactIndex])
				);

				// Update interface
				refreshInterface();
			}});

		const cancelBtn = h('button.action-btn.cancel-btn.edit-cancel-btn', {
			textContent: I18n.t("modals.common.cancel"),
			onclick: () => {
				// Cancel editing - restore original display
				contactInfoElement.innerHTML = "";
				contactInfoElement.appendChild(createContactDisplay(contact));
			}});

		const form = h('div.contact-edit-form',
			h('div.contact-form-row', nameInput, emailInput),
			h('div.contact-form-row', phoneInput, companyInput),
			h('div.contact-form-actions', saveBtn, cancelBtn)
		);

		contactInfoElement.innerHTML = "";
		contactInfoElement.appendChild(form);
		nameInput.focus();
	};

	const createContactDisplay = (contact) => {
		return h('div.contact-display',
			contact.name ? h('div.contact-name', contact.name) : null,
			contact.email
				? h('div.contact-email',
						h('a.contact-link', { href: `mailto:${contact.email}` }, contact.email)
					)
				: null,
			contact.phone
				? h('div.contact-phone',
						h('a.contact-link', { href: `tel:${contact.phone}` }, contact.phone)
					)
				: null,
			contact.company ? h('div.contact-company', contact.company) : null
		);
	};

	return h('div',
		{
			className: `contact-item ${isArchived ? "archived" : ""}`,
			"data-contact-id": contact.id},
		h('div.contact-header',
			h('div.modal-header-content',
				h('span.contact-date', formatDate(contact.date))
			),
			h('div.contact-actions.modal-actions-row',
				h('button.action-btn.edit-contact-btn', {
					title: I18n.t("modals.contacts.editTitle"),
					innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
					onclick: handleEdit}),
				h('button.action-btn.archive-btn', {
					title: isArchived
						? I18n.t("modals.contacts.unarchiveTitle")
						: I18n.t("modals.contacts.archiveTitle"),
					innerHTML: `<span class="material-symbols-outlined icon-14">${isArchived ? "unarchive" : "archive"}</span>`,
					onclick: handleArchiveToggle})
			)
		),
		h('div.contact-info',
			createContactDisplay(contact)
		)
	);
};

// Unified modal component for viewing and adding contacts
const ContactsModal = ({ job, onClose }) => {
	const contacts = job.contacts || [];
	const activeContacts = contacts.filter((contact) => !contact.archived);
	const archivedContacts = contacts.filter((contact) => contact.archived);
	const sortedActiveContacts = [...activeContacts].sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);
	const sortedArchivedContacts = [...archivedContacts].sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);

	const handleAddContact = () => {
		const nameInput = document.querySelector(".add-contact-name");
		const emailInput = document.querySelector(".add-contact-email");
		const phoneInput = document.querySelector(".add-contact-phone");
		const companyInput = document.querySelector(".add-contact-company");

		const name = nameInput.value.trim();
		const email = emailInput.value.trim();
		const phone = phoneInput.value.trim();
		const company = companyInput.value.trim();

		if (!name) {
			showValidationError(nameInput, "Name is required for a contact");
			return;
		}

		if (email && !email.includes("@")) {
			showValidationError(emailInput, "Please enter a valid email address");
			return;
		}

		const newContact = {
			id: Date.now(),
			date: new Date().toISOString(),
			name: name,
			email: email,
			phone: phone,
			company: company};

		// Add contact to job data
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		if (!jobsData[jobIndex].contacts) {
			jobsData[jobIndex].contacts = [];
		}

		jobsData[jobIndex].contacts.push(newContact);
		saveToLocalStorage();

		// Update the job object for this modal
		job.contacts = jobsData[jobIndex].contacts;

		// Refresh the table without flicker
		refreshContactsModal(job);

		// Update the contacts count in the table (refresh interface for count update)
		refreshInterface();
	};

	const handleArchiveContact = (contact) => {
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		const contactIndex = jobsData[jobIndex].contacts.findIndex((c) => c.id === contact.id);
		if (contactIndex === -1) return;

		jobsData[jobIndex].contacts[contactIndex].archived = !contact.archived;

		saveToLocalStorage();

		// Refresh the table without flicker
		refreshContactsModal(job);

		// Update interface
		refreshInterface();
	};


	const refreshContactsModal = (job) => {
		const modalBody = document.querySelector(".modal-body");
		if (!modalBody) return;

		// Get updated data
		const jobIndex = jobsData.findIndex((j) => j.id === job.id);
		if (jobIndex === -1) return;

		job.contacts = jobsData[jobIndex].contacts || [];
		const contacts = job.contacts;
		const activeContacts = contacts.filter((contact) => !contact.archived);
		const archivedContacts = contacts.filter((contact) => contact.archived);
		const sortedActiveContacts = [...activeContacts].sort(
			(a, b) => new Date(a.date) - new Date(b.date)
		);
		const sortedArchivedContacts = [...archivedContacts].sort(
			(a, b) => new Date(a.date) - new Date(b.date)
		);

		// Recreate modal body content
		modalBody.innerHTML = "";
		modalBody.appendChild(createContactsContent(job, sortedActiveContacts, sortedArchivedContacts));
	};

	const createContactsContent = (job, sortedActiveContacts, sortedArchivedContacts) => {
		return h('div.contacts-table-container',
			// Active contacts table
			sortedActiveContacts.length > 0
				? h('table.contacts-table',
						h('thead',
							h('tr',
								h('th', I18n.t("modals.contacts.placeholderName")),
								h('th', I18n.t("modals.contacts.placeholderEmail")),
								h('th', I18n.t("modals.contacts.placeholderPhone")),
								h('th', I18n.t("modals.contacts.placeholderCompany")),
								h('th', "Actions")
							)
						),
						h('tbody',
							...sortedActiveContacts.map((contact) =>
								h('tr',
									{ key: contact.id, "data-contact-id": contact.id },
									h('td.contact-name-cell', contact.name || "—"),
									h('td.contact-email-cell',
										contact.email
											? h('a.contact-link', {href: `mailto:${contact.email}`},
													contact.email
												)
											: "—"
									),
									h('td.contact-phone-cell',
										contact.phone
											? h('a.contact-link', {href: `tel:${contact.phone}`},
													contact.phone
												)
											: "—"
									),
									h('td.contact-company-cell', contact.company || "—"),
									h('td.contacts-table-actions',
										h('button.action-btn.edit-contact-btn', {
											title: I18n.t("modals.contacts.editTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
											onclick: () => enableContactEditing(contact, job)}),
										h('button.action-btn.archive-btn', {
											title: I18n.t("modals.contacts.archiveTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">archive</span>',
											onclick: () => handleArchiveContact(contact)})
									)
								)
							)
						)
					)
				: h('p.modal-empty-message', I18n.t("modals.contacts.emptyState")),

			// Archived contacts section
			sortedArchivedContacts.length > 0
				? h('div.archived-contacts-section',
						h('h4.contacts-archived-header', {
								onclick: () => {
									const archivedTable = document.getElementById("archived-contacts-table");
									const expandIcon = document.getElementById("archived-contacts-icon");
									if (archivedTable.style.display === "none") {
										archivedTable.style.display = "table";
										expandIcon.textContent = "expand_less";
									} else {
										archivedTable.style.display = "none";
										expandIcon.textContent = "expand_more";
									}
								}},
							h('span.material-symbols-outlined.expand-icon', {
									id: "archived-contacts-icon"},
								"expand_more"
							),
							I18n.t("modals.contacts.archivedSection", { count: sortedArchivedContacts.length })
						),
						h('table.contacts-table.archived', {id: "archived-contacts-table",
								className: "hidden"},
							h('thead',
								h('tr',
									h('th', I18n.t("modals.contacts.placeholderName")),
									h('th', I18n.t("modals.contacts.placeholderEmail")),
									h('th', I18n.t("modals.contacts.placeholderPhone")),
									h('th', I18n.t("modals.contacts.placeholderCompany")),
									h('th', "Actions")
								)
							),
							h('tbody',
								...sortedArchivedContacts.map((contact) =>
									h('tr',
										{ key: contact.id },
										h('td', contact.name || "—"),
										h('td',
											contact.email
												? h('a.contact-link', {href: `mailto:${contact.email}`},
														contact.email
													)
												: "—"
										),
										h('td',
											contact.phone
												? h('a.contact-link', {href: `tel:${contact.phone}`},
														contact.phone
													)
												: "—"
										),
										h('td', contact.company || "—"),
										h('td.contacts-table-actions',
											h('button.action-btn.archive-btn', {
												title: I18n.t("modals.contacts.unarchiveTitle"),
												innerHTML:
													'<span class="material-symbols-outlined icon-14">unarchive</span>',
												onclick: () => handleArchiveContact(contact)})
										)
									)
								)
							)
						)
					)
				: null,

			// Add contact form (like a new table row)
			h('div.add-contact-row',
				h('h4.add-contact-title', I18n.t("modals.contacts.addSection")),
				h('form.add-contact-form', {
						onsubmit: (e) => {
							e.preventDefault();
							const modal = e.target.closest(".modal");
							if (!modal) return;

							const nameInput = modal.querySelector(".add-contact-name");
							const emailInput = modal.querySelector(".add-contact-email");
							const phoneInput = modal.querySelector(".add-contact-phone");
							const companyInput = modal.querySelector(".add-contact-company");

							const name = nameInput.value.trim();
							const email = emailInput.value.trim();
							const phone = phoneInput.value.trim();
							const company = companyInput.value.trim();

							if (!name) {
								showValidationError(nameInput, I18n.t("modals.contacts.validation.nameRequired"));
								return;
							}

							const newContact = {
								id: Date.now(),
								date: new Date().toISOString(),
								name,
								email,
								phone,
								company,
								isActive: true,
								lastContactDate: null,
								notes: ""};

							if (!job.contacts) job.contacts = [];
							job.contacts.push(newContact);

							// Clear inputs
							nameInput.value = "";
							emailInput.value = "";
							phoneInput.value = "";
							companyInput.value = "";

							// Focus back to the first field (name input)
							setTimeout(() => {
								const newNameInput = modal.querySelector(".add-contact-name");
								if (newNameInput) newNameInput.focus();
							}, 100);

							// Save and refresh
							saveToLocalStorage();
							refreshContactsModal(job);
							refreshInterface();
						}},
					h('div.contact-form-row',
						h('input.add-contact-name', {type: "text",
							placeholder: I18n.t("modals.contacts.placeholderName"),
							onkeydown: (e) => {
								if (e.key === "Enter" && e.ctrlKey) {
									e.preventDefault();
									e.target.closest("form").dispatchEvent(new Event("submit"));}
							}}),
						h('input.add-contact-email', {type: "email",
							placeholder: I18n.t("modals.contacts.placeholderEmail"),
							onkeydown: (e) => {
								if (e.key === "Enter" && e.ctrlKey) {
									e.preventDefault();
									e.target.closest("form").dispatchEvent(new Event("submit"));}
							}}),
						h('input.add-contact-phone', {type: "tel",
							placeholder: I18n.t("modals.contacts.placeholderPhone"),
							onkeydown: (e) => {
								if (e.key === "Enter" && e.ctrlKey) {
									e.preventDefault();
									e.target.closest("form").dispatchEvent(new Event("submit"));}
							}}),
						h('input.add-contact-company', {type: "text",
							placeholder: I18n.t("modals.contacts.placeholderCompany"),
							onkeydown: (e) => {
								if (e.key === "Enter" && e.ctrlKey) {
									e.preventDefault();
									e.target.closest("form").dispatchEvent(new Event("submit"));}
							}})
					),
					h('div.add-contact-form-actions',
						h('button.action-btn.primary-btn', {type: "submit"},
							I18n.t("modals.contacts.addButton")
						)
					)
				)
			)
		);
	};


	return h('div.modal-overlay', {
			onclick: (e) => e.target === e.currentTarget && onClose()},
		h('div.modal.contacts-modal',
			h('div.modal-header',
				h('h3.modal-title',
					I18n.t("modals.contacts.title", { position: job.position, company: job.company })
				),
				h('button.modal-close', { onclick: onClose }, "×")
			),
			h('div.modal-body',
				createContactsContent(job, sortedActiveContacts, sortedArchivedContacts)
			)
		)
	);
};

// ============================================================================
// CONTACTS MANAGEMENT FUNCTIONS
// ============================================================================

// Simple contact editing system
const enableContactEditing = (contact, job) => {
	const contactRow = document.querySelector(`[data-contact-id="${contact.id}"]`);
	if (!contactRow) return;

	// Store original values for cancel
	contactRow._originalContact = { ...contact };

	// Replace display with simple inline inputs
	contactRow.innerHTML = `
		<td class="contact-name-cell">
			<input type="text" value="${contact.name || ""}" class="contact-edit-input" data-field="name" placeholder="${I18n.t("modals.contacts.placeholderName")}">
		</td>
		<td class="contact-email-cell">
			<input type="email" value="${contact.email || ""}" class="contact-edit-input" data-field="email" placeholder="${I18n.t("modals.contacts.placeholderEmail")}">
		</td>
		<td class="contact-phone-cell">
			<input type="tel" value="${contact.phone || ""}" class="contact-edit-input" data-field="phone" placeholder="${I18n.t("modals.contacts.placeholderPhone")}">
		</td>
		<td class="contact-company-cell">
			<input type="text" value="${contact.company || ""}" class="contact-edit-input" data-field="company" placeholder="${I18n.t("modals.contacts.placeholderCompany")}">
		</td>
		<td class="contacts-table-actions">
			<button class="action-btn save-contact-btn " title="${I18n.t("modals.common.save")}">
				<span class="material-symbols-outlined icon-14">check</span>
			</button>
			<button class="action-btn cancel-contact-btn " title="${I18n.t("modals.common.cancel")}">
				<span class="material-symbols-outlined icon-14">close</span>
			</button>
		</td>
	`;

	// Add event listeners
	const saveBtn = contactRow.querySelector(".save-contact-btn");
	const cancelBtn = contactRow.querySelector(".cancel-contact-btn");

	saveBtn.onclick = () => saveContactEdits(contact, job);
	cancelBtn.onclick = () => cancelContactEdits(contact, job);

	// Focus first input
	const firstInput = contactRow.querySelector('input[data-field="name"]');
	if (firstInput) {
		firstInput.focus();
		firstInput.select();
	}
};

const saveContactEdits = (contact, job) => {
	const contactRow = document.querySelector(`[data-contact-id="${contact.id}"]`);
	if (!contactRow) return;

	// Get all values directly from inputs
	const inputs = contactRow.querySelectorAll(".contact-edit-input");
	const newData = {};

	inputs.forEach((input) => {
		newData[input.dataset.field] = input.value.trim();
	});

	console.log("Saving contact with data:", newData);

	// Validation
	if (!newData.name) {
		alert("Name is required");
		return;
	}

	if (newData.email && !newData.email.includes("@")) {
		alert("Please enter a valid email");
		return;
	}

	// Update data
	const jobIndex = jobsData.findIndex((j) => j.id === job.id);
	const contactIndex = jobsData[jobIndex].contacts.findIndex((c) => c.id === contact.id);

	jobsData[jobIndex].contacts[contactIndex].name = newData.name;
	jobsData[jobIndex].contacts[contactIndex].email = newData.email;
	jobsData[jobIndex].contacts[contactIndex].phone = newData.phone;
	jobsData[jobIndex].contacts[contactIndex].company = newData.company;

	// Save and refresh modal
	saveToLocalStorage();
	refreshContactsModal(job);
	refreshInterface();
};

const cancelContactEdits = (contact, job) => {
	refreshContactsModal(job);
};

// Refresh contacts modal content
const refreshContactsModal = (job) => {
	const modalBody = document.querySelector(".modal-body");
	if (!modalBody) return;

	// Get updated data
	const jobIndex = jobsData.findIndex((j) => j.id === job.id);
	if (jobIndex === -1) return;

	job.contacts = jobsData[jobIndex].contacts || [];
	const contacts = job.contacts;
	const activeContacts = contacts.filter((contact) => !contact.archived);
	const archivedContacts = contacts.filter((contact) => contact.archived);
	const sortedActiveContacts = [...activeContacts].sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);
	const sortedArchivedContacts = [...archivedContacts].sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);

	// Recreate modal body content
	modalBody.innerHTML = "";
	modalBody.appendChild(createContactsContent(job, sortedActiveContacts, sortedArchivedContacts));
};

// Create contacts content for modal (extracted to fix scope issue)
const createContactsContent = (job, sortedActiveContacts, sortedArchivedContacts) => {
	return h('div.contacts-table-container',
		// Active contacts table
		sortedActiveContacts.length > 0
			? h('table.contacts-table',
					h('thead',
						h('tr',
							h('th', I18n.t("modals.contacts.placeholderName")),
							h('th', I18n.t("modals.contacts.placeholderEmail")),
							h('th', I18n.t("modals.contacts.placeholderPhone")),
							h('th', I18n.t("modals.contacts.placeholderCompany")),
							h('th', "Actions")
						)
					),
					h('tbody',
						...sortedActiveContacts.map((contact) =>
							h('tr',
								{ key: contact.id, "data-contact-id": contact.id },
								h('td.contact-name-cell', contact.name || "—"),
								h('td.contact-email-cell',
									contact.email
										? h('a.contact-link', {href: `mailto:${contact.email}`},
												contact.email
											)
										: "—"
								),
								h('td.contact-phone-cell',
									contact.phone
										? h('a.contact-link', {href: `tel:${contact.phone}`},
												contact.phone
											)
										: "—"
								),
								h('td.contact-company-cell', contact.company || "—"),
								h('td.contacts-table-actions',
									h('button.action-btn.edit-contact-btn', {
										title: I18n.t("modals.contacts.editTitle"),
										innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
										onclick: () => enableContactEditing(contact, job)}),
									h('button.action-btn.archive-btn', {
										title: I18n.t("modals.contacts.archiveTitle"),
										innerHTML: '<span class="material-symbols-outlined icon-14">archive</span>',
										onclick: () => handleArchiveContact(contact)})
								)
							)
						)
					)
				)
			: h('p.modal-empty-message', I18n.t("modals.contacts.emptyState")),

		// Archived contacts section
		sortedArchivedContacts.length > 0
			? h('div.archived-contacts-section',
					h('h4.contacts-archived-header', {
							onclick: () => {
								const archivedTable = document.getElementById("archived-contacts-table");
								const expandIcon = document.getElementById("archived-contacts-icon");
								if (archivedTable.style.display === "none") {
									archivedTable.style.display = "table";
									expandIcon.textContent = "expand_less";
								} else {
									archivedTable.style.display = "none";
									expandIcon.textContent = "expand_more";
								}
							}},
						h('span.material-symbols-outlined.expand-icon', {
								id: "archived-contacts-icon"},
							"expand_more"
						),
						I18n.t("modals.contacts.archivedSection", { count: sortedArchivedContacts.length })
					),
					h('table.contacts-table.archived', {id: "archived-contacts-table",
							className: "hidden"},
						h('thead',
							h('tr',
								h('th', I18n.t("modals.contacts.placeholderName")),
								h('th', I18n.t("modals.contacts.placeholderEmail")),
								h('th', I18n.t("modals.contacts.placeholderPhone")),
								h('th', I18n.t("modals.contacts.placeholderCompany")),
								h('th', "Actions")
							)
						),
						h('tbody',
							...sortedArchivedContacts.map((contact) =>
								h('tr',
									{ key: contact.id },
									h('td', contact.name || "—"),
									h('td',
										contact.email
											? h('a.contact-link', {href: `mailto:${contact.email}`},
													contact.email
												)
											: "—"
									),
									h('td',
										contact.phone
											? h('a.contact-link', {href: `tel:${contact.phone}`},
													contact.phone
												)
											: "—"
									),
									h('td', contact.company || "—"),
									h('td.contacts-table-actions',
										h('button.action-btn.archive-btn', {
											title: I18n.t("modals.contacts.unarchiveTitle"),
											innerHTML: '<span class="material-symbols-outlined icon-14">unarchive</span>',
											onclick: () => handleArchiveContact(contact)})
									)
								)
							)
						)
					)
				)
			: null,

		// Add contact form (like a new table row)
		h('div.add-contact-row',
			h('h4.add-contact-title', I18n.t("modals.contacts.addSection")),
			h('form.add-contact-form', {
					onsubmit: (e) => {
						e.preventDefault();
						const modal = e.target.closest(".modal");
						if (!modal) return;

						const nameInput = modal.querySelector(".add-contact-name");
						const emailInput = modal.querySelector(".add-contact-email");
						const phoneInput = modal.querySelector(".add-contact-phone");
						const companyInput = modal.querySelector(".add-contact-company");

						const name = nameInput.value.trim();
						const email = emailInput.value.trim();
						const phone = phoneInput.value.trim();
						const company = companyInput.value.trim();

						if (!name) {
							showValidationError(nameInput, I18n.t("modals.contacts.validation.nameRequired"));
							return;
						}

						const newContact = {
							id: Date.now(),
							date: new Date().toISOString(),
							name,
							email,
							phone,
							company,
							isActive: true,
							lastContactDate: null,
							notes: ""};

						if (!job.contacts) job.contacts = [];
						job.contacts.push(newContact);

						// Clear inputs
						nameInput.value = "";
						emailInput.value = "";
						phoneInput.value = "";
						companyInput.value = "";

						// Focus back to the first field (name input)
						setTimeout(() => {
							const newNameInput = modal.querySelector(".add-contact-name");
							if (newNameInput) newNameInput.focus();
						}, 100);

						// Save and refresh
						saveToLocalStorage();
						refreshContactsModal(job);
						refreshInterface();
					}},
				h('div.contact-form-row',
					h('input.add-contact-name', {type: "text",
						placeholder: I18n.t("modals.contacts.placeholderName"),
						onkeydown: (e) => {
							if (e.key === "Enter" && e.ctrlKey) {
								e.preventDefault();
								e.target.closest("form").dispatchEvent(new Event("submit"));}
						}}),
					h('input.add-contact-email', {type: "email",
						placeholder: I18n.t("modals.contacts.placeholderEmail"),
						onkeydown: (e) => {
							if (e.key === "Enter" && e.ctrlKey) {
								e.preventDefault();
								e.target.closest("form").dispatchEvent(new Event("submit"));}
						}}),
					h('input.add-contact-phone', {type: "tel",
						placeholder: I18n.t("modals.contacts.placeholderPhone"),
						onkeydown: (e) => {
							if (e.key === "Enter" && e.ctrlKey) {
								e.preventDefault();
								e.target.closest("form").dispatchEvent(new Event("submit"));}
						}}),
					h('input.add-contact-company', {type: "text",
						placeholder: I18n.t("modals.contacts.placeholderCompany"),
						onkeydown: (e) => {
							if (e.key === "Enter" && e.ctrlKey) {
								e.preventDefault();
								e.target.closest("form").dispatchEvent(new Event("submit"));}
						}})
				),
				h('div.add-contact-form-actions',
					h('button.action-btn.primary-btn', {type: "submit"},
						I18n.t("modals.contacts.addButton")
					)
				)
			)
		)
	);
};

// Update contact row display after editing
const updateContactRowDisplay = (contactRow, contact, job) => {
	// Remove editing state
	contactRow.dataset.editing = "false";

	// Update each cell with new values
	const nameCell = contactRow.querySelector(".contact-name-cell");
	nameCell.innerHTML = "";
	nameCell.textContent = contact.name || "—";

	const emailCell = contactRow.querySelector(".contact-email-cell");
	emailCell.innerHTML = "";
	if (contact.email) {
		const emailLink = document.createElement("a");
		emailLink.href = `mailto:${contact.email}`;
		emailLink.className = "contact-link";
		emailLink.textContent = contact.email;
		emailCell.appendChild(emailLink);
	} else {
		emailCell.textContent = "—";
	}

	const phoneCell = contactRow.querySelector(".contact-phone-cell");
	phoneCell.innerHTML = "";
	if (contact.phone) {
		const phoneLink = document.createElement("a");
		phoneLink.href = `tel:${contact.phone}`;
		phoneLink.className = "contact-link";
		phoneLink.textContent = contact.phone;
		phoneCell.appendChild(phoneLink);
	} else {
		phoneCell.textContent = "—";
	}

	const companyCell = contactRow.querySelector(".contact-company-cell");
	companyCell.innerHTML = "";
	companyCell.textContent = contact.company || "—";

	// Restore action buttons
	const actionsCell = contactRow.querySelector(".contacts-table-actions");
	actionsCell.innerHTML = "";

	// Add edit button
	const editBtn = document.createElement("button");
	editBtn.className = "action-btn edit-contact-btn ";
	editBtn.title = I18n.t("modals.contacts.editTitle");
	editBtn.innerHTML = '<span class="material-symbols-outlined icon-14">edit</span>';
	editBtn.onclick = () => enableContactEditing(contact, job);
	actionsCell.appendChild(editBtn);

	// Add archive button
	const archiveBtn = document.createElement("button");
	archiveBtn.className = "action-btn archive-btn ";
	archiveBtn.title = I18n.t("modals.contacts.archiveTitle");
	archiveBtn.innerHTML = '<span class="material-symbols-outlined icon-14">archive</span>';
	archiveBtn.onclick = () => handleArchiveContact(contact);
	actionsCell.appendChild(archiveBtn);
};

// Open unified contacts modal (for both viewing and adding contacts)
const openContactsModal = (job) => {
	const modal = ContactsModal({
		job,
		onClose: closeModal});

	document.body.appendChild(modal);

	// Scroll to bottom to show the add contact form
	setTimeout(() => {
		const modalBody = modal.querySelector(".modal-body");
		if (modalBody) {
			modalBody.scrollTop = modalBody.scrollHeight;
		}
	}, 50);
};

// Legacy sync function removed - contactPerson and contactEmail fields are deprecated

// Get the latest contact for display in table
const getLatestContact = (contacts = []) => {
	const activeContacts = contacts.filter((contact) => !contact.archived);
	if (activeContacts.length === 0) return null;

	// Sort by date and get the most recent
	const sorted = [...activeContacts].sort(
		(a, b) => new Date(b.date || b.id) - new Date(a.date || a.id)
	);
	return sorted[0];
};

// Format contact for table display
const formatContactForTable = (contact) => {
	if (!contact) return I18n.t("modals.contacts.noContacts");

	const parts = [];
	if (contact.name) parts.push(contact.name);
	if (contact.email) parts.push(contact.email);

	return parts.join("<br>") || I18n.t("modals.contacts.defaultContact");
};

// Global archive contact function
const archiveContact = (contact, job) => {
	const jobIndex = jobsData.findIndex((j) => j.id === job.id);
	if (jobIndex === -1) return;

	const contactIndex = jobsData[jobIndex].contacts.findIndex((c) => c.id === contact.id);
	if (contactIndex === -1) return;

	// Store archived section state before refresh
	const archivedTable = document.getElementById("archived-contacts-table");
	const wasExpanded = archivedTable && archivedTable.style.display === "table";

	jobsData[jobIndex].contacts[contactIndex].archived = !contact.archived;
	saveToLocalStorage();

	// Refresh modal without flicker
	refreshContactsModal(job);

	// Restore archived section state after refresh
	if (wasExpanded) {
		setTimeout(() => {
			const newArchivedTable = document.getElementById("archived-contacts-table");
			const expandIcon = document.getElementById("archived-contacts-icon");
			if (newArchivedTable) {
				newArchivedTable.style.display = "table";
				if (expandIcon) expandIcon.textContent = "expand_less";
			}
		}, 0);
	}

	// Update interface
	refreshInterface();
};

// Global function to handle archive contact (for backward compatibility)
const handleArchiveContact = (contact, job) => archiveContact(contact, job);

// Make contact components and functions available globally for Vite
window.ContactsCount = ContactsCount;
window.ContactItem = ContactItem;
window.ContactsModal = ContactsModal;
window.openContactsModal = openContactsModal;
window.enableContactEditing = enableContactEditing;
window.saveContactEdits = saveContactEdits;
window.cancelContactEdits = cancelContactEdits;
window.refreshContactsModal = refreshContactsModal;
window.createContactsContent = createContactsContent;
window.updateContactRowDisplay = updateContactRowDisplay;
window.getLatestContact = getLatestContact;
window.formatContactForTable = formatContactForTable;
window.archiveContact = archiveContact;
window.handleArchiveContact = handleArchiveContact;
