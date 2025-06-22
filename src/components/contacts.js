// ============================================================================
// CONTACTS SYSTEM COMPONENTS
// ============================================================================

// Contacts count display component
const ContactsCount = ({ contacts = [], onClick }) => {
	const activeContacts = contacts.filter(contact => !contact.archived);
	const count = activeContacts.length;
	const className = count === 0 ? "contacts-count zero" : "contacts-count";

	return h("span", {
		className,
		onclick: count > 0 ? onClick : null,
		textContent: count.toString(),
		title: `${count} contact${count !== 1 ? 's' : ''}${contacts.length !== count ? ` (${contacts.length - count} archived)` : ''}`
	});
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
			contactElement.className = `contact-item ${newArchiveStatus ? 'archived' : ''}`;
			
			// Update archive button
			const archiveBtn = contactElement.querySelector('.archive-btn');
			if (archiveBtn) {
				archiveBtn.innerHTML = `<span class="material-symbols-outlined icon-14">${newArchiveStatus ? "unarchive" : "archive"}</span>`;
			}
		}
		
		// Update interface
		updateStats();
	};
	
	const handleEdit = () => {
		const contactInfoElement = document.querySelector(`[data-contact-id="${contact.id}"] .contact-info`);
		if (!contactInfoElement) return;
		
		// Create form fields
		const nameInput = h("input", {
			type: "text",
			className: "contact-edit-input",
			value: contact.name || "",
			placeholder: "Name"
		});
		
		const emailInput = h("input", {
			type: "email",
			className: "contact-edit-input",
			value: contact.email || "",
			placeholder: "Email"
		});
		
		const phoneInput = h("input", {
			type: "tel",
			className: "contact-edit-input",
			value: contact.phone || "",
			placeholder: "Phone"
		});
		
		const companyInput = h("input", {
			type: "text",
			className: "contact-edit-input",
			value: contact.company || "",
			placeholder: "Company"
		});
		
		const saveBtn = h("button", {
			className: "action-btn edit-btn edit-save-btn",
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
				contactInfoElement.appendChild(createContactDisplay(jobsData[jobIndex].contacts[contactIndex]));
				
				// Update interface
				updateStats();
			}
		});
		
		const cancelBtn = h("button", {
			className: "action-btn cancel-btn edit-cancel-btn",
			textContent: I18n.t("modals.common.cancel"),
			onclick: () => {
				// Cancel editing - restore original display
				contactInfoElement.innerHTML = "";
				contactInfoElement.appendChild(createContactDisplay(contact));
			}
		});
		
		const form = h("div", { className: "contact-edit-form" },
			h("div", { className: "contact-form-row" }, nameInput, emailInput),
			h("div", { className: "contact-form-row" }, phoneInput, companyInput),
			h("div", { className: "contact-form-actions" }, saveBtn, cancelBtn)
		);
		
		contactInfoElement.innerHTML = "";
		contactInfoElement.appendChild(form);
		nameInput.focus();
	};
	
	const createContactDisplay = (contact) => {
		return h("div", { className: "contact-display" },
			contact.name ? h("div", { className: "contact-name" }, contact.name) : null,
			contact.email ? h("div", { className: "contact-email" }, 
				h("a", { href: `mailto:${contact.email}`, className: "contact-link" }, contact.email)
			) : null,
			contact.phone ? h("div", { className: "contact-phone" }, 
				h("a", { href: `tel:${contact.phone}`, className: "contact-link" }, contact.phone)
			) : null,
			contact.company ? h("div", { className: "contact-company" }, contact.company) : null
		);
	};
	
	return h(
		"div",
		{ 
			className: `contact-item ${isArchived ? 'archived' : ''}`,
			"data-contact-id": contact.id
		},
		h(
			"div",
			{ 
				className: "contact-header"
			},
			h(
				"div",
				{ className: "modal-header-content" },
				h("span", { className: "contact-date" }, formatDate(contact.date))
			),
			h(
				"div",
				{ className: "contact-actions modal-actions-row" },
				h("button", {
					className: "action-btn edit-contact-btn icon-btn-transparent",
					title: I18n.t("modals.contacts.editTitle"),
					innerHTML: '<span class="material-symbols-outlined icon-14">edit</span>',
					onclick: handleEdit
				}),
				h("button", {
					className: "action-btn archive-btn icon-btn-transparent",
					title: isArchived ? I18n.t("modals.contacts.unarchiveTitle") : I18n.t("modals.contacts.archiveTitle"),
					innerHTML: `<span class="material-symbols-outlined icon-14">${isArchived ? "unarchive" : "archive"}</span>`,
					onclick: handleArchiveToggle
				})
			)
		),
		h("div", { 
			className: "contact-info"
		}, createContactDisplay(contact))
	);
};

// Unified modal component for viewing and adding contacts
const ContactsModal = ({ job, onClose }) => {
	const contacts = job.contacts || [];
	const activeContacts = contacts.filter(contact => !contact.archived);
	const archivedContacts = contacts.filter(contact => contact.archived);
	const sortedActiveContacts = [...activeContacts].sort(
		(a, b) => new Date(a.date) - new Date(b.date),
	);
	const sortedArchivedContacts = [...archivedContacts].sort(
		(a, b) => new Date(a.date) - new Date(b.date),
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

		if (!name && !email && !phone) {
			nameInput.focus();
			return;
		}

		const newContact = {
			id: Date.now(),
			date: new Date().toISOString(),
			name: name,
			email: email,
			phone: phone,
			company: company
		};

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

		// Add the new contact to the existing modal without reopening
		const modalBody = document.querySelector(".modal-body");
		const addContactSection = modalBody.querySelector(".add-contact-section");

		// Create and insert the new contact before the add contact section
		const newContactElement = ContactItem({ contact: newContact, job });
		modalBody.insertBefore(newContactElement, addContactSection);

		// Clear the inputs
		nameInput.value = "";
		emailInput.value = "";
		phoneInput.value = "";
		companyInput.value = "";

		// Update the contacts count in the table (refresh interface for count update)
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
					I18n.t("modals.contacts.title", { position: job.position, company: job.company }),
				),
				h("button", { className: "modal-close", onclick: onClose }, "×"),
			),
			h(
				"div",
				{ className: "modal-body" },
				// Active contacts section
				...(sortedActiveContacts.length > 0
					? [
						h("h4", { 
							className: "modal-section-header"
						}, I18n.t("modals.contacts.activeSection")),
						...sortedActiveContacts.map((contact) => ContactItem({ contact, job }))
					]
					: [
						h(
							"p",
							{
								className: "modal-empty-message"
							},
							I18n.t("modals.contacts.emptyState"),
						),
					]),
				// Archived contacts section
				...(sortedArchivedContacts.length > 0
					? [
						h("h4", { 
							className: "modal-archived-header",
							onclick: () => {
								const archivedSection = document.getElementById('archived-contacts-content');
								const expandIcon = document.getElementById('archived-contacts-icon');
								if (archivedSection.style.display === 'none') {
									archivedSection.style.display = 'block';
									expandIcon.textContent = 'expand_less';
								} else {
									archivedSection.style.display = 'none';
									expandIcon.textContent = 'expand_more';
								}
							}
						}, 
							h('span', { className: 'material-symbols-outlined expand-icon', id: 'archived-contacts-icon' }, 'expand_less'),
							I18n.t("modals.contacts.archivedSection", { count: sortedArchivedContacts.length })
						),
						h("div", { 
							id: "archived-contacts-content"
						}, ...sortedArchivedContacts.map((contact) => ContactItem({ contact, job })))
					]
					: []),
				// Add contact form section
				h(
					"div",
					{ className: "add-contact-section" },
					h("h4", { className: "add-contact-title" }, I18n.t("modals.contacts.addSection")),
					h("div", { className: "contact-form-grid" },
						h("input", {
							type: "text",
							className: "add-contact-name",
							placeholder: I18n.t("modals.contacts.placeholderName"),
						}),
						h("input", {
							type: "email",
							className: "add-contact-email",
							placeholder: I18n.t("modals.contacts.placeholderEmail"),
						}),
						h("input", {
							type: "tel",
							className: "add-contact-phone",
							placeholder: I18n.t("modals.contacts.placeholderPhone"),
						}),
						h("input", {
							type: "text",
							className: "add-contact-company",
							placeholder: I18n.t("modals.contacts.placeholderCompany"),
						})
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
						onclick: handleAddContact,
					},
					I18n.t("modals.contacts.addButton"),
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
// CONTACTS MANAGEMENT FUNCTIONS
// ============================================================================

// Open unified contacts modal (for both viewing and adding contacts)
const openContactsModal = (job) => {
	const modal = ContactsModal({
		job,
		onClose: closeModal,
	});

	document.body.appendChild(modal);

	// Scroll to bottom to show the add contact form
	setTimeout(() => {
		const modalBody = modal.querySelector(".modal-body");
		if (modalBody) {
			modalBody.scrollTop = modalBody.scrollHeight;
		}
	}, 50);
};

// Get the latest contact for display in table
const getLatestContact = (contacts = []) => {
	const activeContacts = contacts.filter(contact => !contact.archived);
	if (activeContacts.length === 0) return null;
	
	// Sort by date and get the most recent
	const sorted = [...activeContacts].sort((a, b) => new Date(b.date) - new Date(a.date));
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

// Make contact components and functions available globally for Vite
window.ContactsCount = ContactsCount;
window.ContactItem = ContactItem;
window.ContactsModal = ContactsModal;
window.openContactsModal = openContactsModal;
window.getLatestContact = getLatestContact;
window.formatContactForTable = formatContactForTable;