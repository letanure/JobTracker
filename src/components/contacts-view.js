// ============================================================================
// CONTACTS VIEW COMPONENT
// ============================================================================

const ContactsView = {
	// Initialize contacts view
	init: () => {
		const contactsTab = document.querySelector('.tab-content[data-tab="contacts"]');

		if (contactsTab) {
			// Only clear and initialize if not already initialized
			if (!contactsTab.querySelector(".contacts-container")) {
				// Clear existing content
				contactsTab.innerHTML = "";

				// Create contacts container
				const container = ContactsView.create();
				contactsTab.appendChild(container);
			} else {
				// If already initialized, just update the view
				ContactsView.updateView();
			}
		}
	},

	// Create the main contacts structure
	create: () => {
		const container = h(
			"div.contacts-container",
			// Header
			h(
				"div.tab-header",
				h("h2.tab-title", I18n.t("contactsView.title")),
				h("div.contacts-stats", h("span.contacts-count", ContactsView.getTotalContactsText()))
			),

			// Contacts table
			h("div.contacts-table-container", ContactsView.renderContactsTable()),

			// Table actions
			h(
				"div.contacts-actions",
				h(
					"button.action-btn",
					{
						onclick: () => ContactsView.showAddContactModal(),
					},
					I18n.t("contactsView.addContact")
				)
			)
		);

		return container;
	},

	// Get all contacts from all jobs
	getAllContacts: () => {
		const allContacts = [];

		jobsData.forEach((job) => {
			if (job.contacts && job.contacts.length > 0) {
				job.contacts.forEach((contact) => {
					// Skip archived contacts
					if (!contact.archived) {
						allContacts.push({
							...contact,
							jobId: job.id,
							jobCompany: job.company,
							jobPosition: job.position,
						});
					}
				});
			}
		});

		// Sort by name
		return allContacts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
	},

	// Get total contacts count text
	getTotalContactsText: () => {
		const total = ContactsView.getAllContacts().length;
		return I18n.t("contactsView.totalContacts", { count: total });
	},

	// Render contacts table
	renderContactsTable: () => {
		const contacts = ContactsView.getAllContacts();

		if (contacts.length === 0) {
			return h(
				"div.contacts-empty",
				h("p.contacts-empty-message", I18n.t("contactsView.emptyState"))
			);
		}

		return h(
			"table.contacts-table",
			h(
				"thead",
				h(
					"tr",
					h("th", I18n.t("contactsView.nameHeader")),
					h("th", I18n.t("contactsView.emailHeader")),
					h("th", I18n.t("contactsView.phoneHeader")),
					h("th", I18n.t("contactsView.roleHeader")),
					h("th", I18n.t("contactsView.companyHeader")),
					h("th", I18n.t("contactsView.jobHeader")),
					h("th", I18n.t("contactsView.actionsHeader"))
				)
			),
			h("tbody", ...contacts.map((contact) => ContactsView.renderContactRow(contact)))
		);
	},

	// Render contact row
	renderContactRow: (contact) => {
		return h(
			"tr.contact-row",
			{
				"data-contact-id": contact.id,
				"data-job-id": contact.jobId,
			},
			h(
				"td.contact-cell.contact-name-cell",
				h("input.contact-field-input", {
					type: "text",
					value: contact.name || "",
					placeholder: I18n.t("contactsView.namePlaceholder"),
					onchange: (e) => ContactsView.updateContactField(contact, "name", e.target.value),
					onblur: (e) => ContactsView.validateAndSave(contact, "name", e.target.value),
				})
			),
			h(
				"td.contact-cell.contact-email-cell",
				h("input.contact-field-input", {
					type: "email",
					value: contact.email || "",
					placeholder: I18n.t("contactsView.emailPlaceholder"),
					onchange: (e) => ContactsView.updateContactField(contact, "email", e.target.value),
				})
			),
			h(
				"td.contact-cell.contact-phone-cell",
				h("input.contact-field-input", {
					type: "tel",
					value: contact.phone || "",
					placeholder: I18n.t("contactsView.phonePlaceholder"),
					onchange: (e) => ContactsView.updateContactField(contact, "phone", e.target.value),
				})
			),
			h(
				"td.contact-cell.contact-role-cell",
				h("input.contact-field-input", {
					type: "text",
					value: contact.role || "",
					placeholder: I18n.t("contactsView.rolePlaceholder"),
					onchange: (e) => ContactsView.updateContactField(contact, "role", e.target.value),
				})
			),
			h(
				"td.contact-cell.contact-company-cell",
				h("span.contact-company-display", contact.jobCompany)
			),
			h("td.contact-cell.contact-job-cell", h("span.contact-job-display", contact.jobPosition)),
			h(
				"td.contact-cell.contact-actions-cell",
				h("button.contact-view-job-btn.action-btn", {
					title: `View job: ${contact.jobPosition} at ${contact.jobCompany}`,
					onclick: () => {
						// Find the job and open edit modal
						const job = jobsData.find((j) => j.id === contact.jobId);
						if (job && window.KanbanBoard) {
							window.KanbanBoard.openJobEditModal(job);
						}
					},
					innerHTML: '<span class="material-symbols-outlined icon-14">work</span>',
				}),
				h("button.contact-delete-btn.action-btn.delete-btn", {
					title: I18n.t("contactsView.deleteTitle"),
					onclick: () => ContactsView.deleteContact(contact),
					innerHTML: '<span class="material-symbols-outlined icon-14">delete</span>',
				})
			)
		);
	},

	// Update contact field
	updateContactField: (contact, field, value) => {
		const jobIndex = jobsData.findIndex((j) => j.id === contact.jobId);
		if (jobIndex === -1) return;

		const contactIndex = jobsData[jobIndex].contacts.findIndex((c) => c.id === contact.id);
		if (contactIndex === -1) return;

		// Update the field
		jobsData[jobIndex].contacts[contactIndex][field] = value;

		// Save to localStorage
		saveToLocalStorage();

		// Update interface if needed
		if (typeof refreshInterface === "function") {
			refreshInterface();
		}
	},

	// Validate and save (for required fields)
	validateAndSave: (contact, field, value) => {
		if (field === "name" && !value.trim()) {
			// Show validation error
			ContactsView.showValidationError(
				contact,
				field,
				I18n.t("contactsView.validation.nameRequired")
			);
			return;
		}

		// Clear any existing validation errors
		ContactsView.clearValidationError(contact, field);
	},

	// Delete contact with confirmation
	deleteContact: async (contact) => {
		const confirmMessage = I18n.t("contactsView.deleteConfirmation", {
			name: contact.name || "this contact",
		});

		if (await confirm(confirmMessage)) {
			const jobIndex = jobsData.findIndex((j) => j.id === contact.jobId);
			if (jobIndex === -1) return;

			const contactIndex = jobsData[jobIndex].contacts.findIndex((c) => c.id === contact.id);
			if (contactIndex === -1) return;

			// Remove the contact
			jobsData[jobIndex].contacts.splice(contactIndex, 1);

			// Save to localStorage
			saveToLocalStorage();

			// Update the view
			ContactsView.updateView();

			// Update interface
			if (typeof refreshInterface === "function") {
				refreshInterface();
			}
		}
	},

	// Show validation error
	showValidationError: (contact, field, message) => {
		const contactRow = document.querySelector(
			`[data-contact-id="${contact.id}"][data-job-id="${contact.jobId}"]`
		);
		if (!contactRow) return;

		const fieldCell = contactRow.querySelector(`.contact-${field}-cell`);
		if (!fieldCell) return;

		// Remove existing error
		ContactsView.clearValidationError(contact, field);

		// Add error class and message
		fieldCell.classList.add("has-error");
		const errorElement = h("div.field-error", message);
		fieldCell.appendChild(errorElement);

		// Remove error after 3 seconds
		setTimeout(() => {
			ContactsView.clearValidationError(contact, field);
		}, 3000);
	},

	// Clear validation error
	clearValidationError: (contact, field) => {
		const contactRow = document.querySelector(
			`[data-contact-id="${contact.id}"][data-job-id="${contact.jobId}"]`
		);
		if (!contactRow) return;

		const fieldCell = contactRow.querySelector(`.contact-${field}-cell`);
		if (!fieldCell) return;

		fieldCell.classList.remove("has-error");
		const errorElement = fieldCell.querySelector(".field-error");
		if (errorElement) {
			errorElement.remove();
		}
	},

	// Show add contact modal
	showAddContactModal: async () => {
		// Get all jobs for the dropdown
		const jobOptions = jobsData.map((job) => ({
			id: job.id,
			text: `${job.company} - ${job.position}`,
		}));

		if (jobOptions.length === 0) {
			await alert(I18n.t("contactsView.noJobsAvailable"));
			return;
		}

		const modal = h(
			"div.modal-overlay",
			{
				onclick: (e) => {
					if (e.target.className === "modal-overlay") e.target.remove();
				},
			},
			h(
				"div.modal",
				h(
					"div.modal-header",
					h("h3.modal-title", I18n.t("contactsView.addContactTitle")),
					h(
						"button.modal-close",
						{
							onclick: (e) => e.target.closest(".modal-overlay").remove(),
						},
						"×"
					)
				),
				h(
					"div.modal-body",
					h(
						"div.add-contact-form",
						h(
							"div.contact-form-row",
							h(
								"div.contact-form-field",
								h("label", I18n.t("contactsView.nameHeader")),
								h("input.add-contact-name", {
									type: "text",
									placeholder: I18n.t("contactsView.namePlaceholder"),
								})
							),
							h(
								"div.contact-form-field",
								h("label", I18n.t("contactsView.emailHeader")),
								h("input.add-contact-email", {
									type: "email",
									placeholder: I18n.t("contactsView.emailPlaceholder"),
								})
							)
						),
						h(
							"div.contact-form-row",
							h(
								"div.contact-form-field",
								h("label", I18n.t("contactsView.phoneHeader")),
								h("input.add-contact-phone", {
									type: "tel",
									placeholder: I18n.t("contactsView.phonePlaceholder"),
								})
							),
							h(
								"div.contact-form-field",
								h("label", I18n.t("contactsView.roleHeader")),
								h("input.add-contact-role", {
									type: "text",
									placeholder: I18n.t("contactsView.rolePlaceholder"),
								})
							)
						),
						h(
							"div.contact-form-row",
							h(
								"div.contact-form-field.full-width",
								h("label", I18n.t("contactsView.jobHeader")),
								h(
									"select.add-contact-job",
									h("option", { value: "" }, I18n.t("contactsView.selectJob")),
									...jobOptions.map((job) => h("option", { value: job.id }, job.text))
								)
							)
						)
					)
				),
				h(
					"div.modal-footer",
					h(
						"button.btn-secondary",
						{
							onclick: (e) => e.target.closest(".modal-overlay").remove(),
						},
						I18n.t("modals.common.cancel")
					),
					h(
						"button.btn-primary",
						{
							onclick: () => ContactsView.addContact(),
						},
						I18n.t("contactsView.addContact")
					)
				)
			)
		);

		document.body.appendChild(modal);

		// Focus the name field
		setTimeout(() => {
			const nameInput = modal.querySelector(".add-contact-name");
			if (nameInput) nameInput.focus();
		}, 100);
	},

	// Add new contact
	addContact: async () => {
		const nameInput = document.querySelector(".add-contact-name");
		const emailInput = document.querySelector(".add-contact-email");
		const phoneInput = document.querySelector(".add-contact-phone");
		const roleInput = document.querySelector(".add-contact-role");
		const jobSelect = document.querySelector(".add-contact-job");

		const name = nameInput.value.trim();
		const email = emailInput.value.trim();
		const phone = phoneInput.value.trim();
		const role = roleInput.value.trim();
		const jobId = Number.parseInt(jobSelect.value);

		// Validation
		if (!name) {
			await alert(I18n.t("contactsView.validation.nameRequired"));
			nameInput.focus();
			return;
		}

		if (!jobId) {
			await alert(I18n.t("contactsView.validation.jobRequired"));
			jobSelect.focus();
			return;
		}

		// Find the job
		const jobIndex = jobsData.findIndex((j) => j.id === jobId);
		if (jobIndex === -1) return;

		// Create new contact
		const newContact = {
			id: Date.now().toString(),
			name: name,
			email: email || null,
			phone: phone || null,
			role: role || null,
			company: jobsData[jobIndex].company,
			createdAt: new Date().toISOString(),
			archived: false,
		};

		// Add to job
		if (!jobsData[jobIndex].contacts) {
			jobsData[jobIndex].contacts = [];
		}
		jobsData[jobIndex].contacts.push(newContact);

		// Save to localStorage
		saveToLocalStorage();

		// Close modal
		document.querySelector(".modal-overlay").remove();

		// Update view
		ContactsView.updateView();

		// Update interface
		if (typeof refreshInterface === "function") {
			refreshInterface();
		}
	},

	// Update contacts view
	updateView: () => {
		const tableContainer = document.querySelector(".contacts-table-container");
		if (tableContainer) {
			tableContainer.innerHTML = "";
			tableContainer.appendChild(ContactsView.renderContactsTable());
		}

		// Update contacts count
		const statsElement = document.querySelector(".contacts-count");
		if (statsElement) {
			statsElement.textContent = ContactsView.getTotalContactsText();
		}
	},
};

// Make ContactsView available globally
window.ContactsView = ContactsView;
