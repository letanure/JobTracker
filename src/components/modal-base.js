// ============================================================================
// MODAL BASE COMPONENT - REUSABLE MODAL PATTERNS
// ============================================================================

const ModalBase = {
	/**
	 * Create a standard modal with consistent structure
	 * @param {Object} options - Modal configuration
	 * @param {string} options.title - Modal title
	 * @param {HTMLElement|string} options.content - Modal body content
	 * @param {Function} options.onClose - Close handler function
	 * @param {string} [options.className] - Additional CSS class for modal
	 * @param {string} [options.overlayClassName] - Additional CSS class for overlay
	 * @param {boolean} [options.closeOnBackdrop=true] - Close modal when clicking backdrop
	 * @param {boolean} [options.showCloseButton=true] - Show X close button
	 * @param {Object} [options.data] - Data attributes for modal
	 * @returns {HTMLElement} The modal overlay element
	 */
	create: ({
		title,
		content,
		onClose,
		className = "",
		overlayClassName = "",
		closeOnBackdrop = true,
		showCloseButton = true,
		data = {},
	}) => {
		// Create close handler
		const handleClose = () => {
			if (typeof onClose === "function") {
				onClose();
			} else {
				// Default close behavior - remove modal from DOM
				const modal = document.querySelector(".modal-overlay");
				if (modal) modal.remove();
			}
		};

		// Create backdrop click handler
		const handleBackdropClick = (e) => {
			if (closeOnBackdrop && e.target === e.currentTarget) {
				handleClose();
			}
		};

		// Build data attributes
		const dataAttributes = {};
		Object.keys(data).forEach((key) => {
			dataAttributes[`data-${key}`] = data[key];
		});

		// Create modal structure
		const modal = h(
			`div.modal-overlay${overlayClassName ? `.${overlayClassName}` : ""}`,
			{
				onclick: handleBackdropClick,
				...dataAttributes,
			},
			h(
				`div.modal${className ? `.${className}` : ""}`,
				// Header
				h(
					"div.modal-header",
					h("h3.modal-title", title),
					showCloseButton ? h("button.modal-close", { onclick: handleClose }, "×") : ""
				),
				// Body
				h("div.modal-body", content)
			)
		);

		return modal;
	},

	/**
	 * Create and show a modal
	 * @param {Object} options - Same as create() options
	 * @returns {HTMLElement} The created modal element
	 */
	show: (options) => {
		const modal = ModalBase.create(options);
		document.body.appendChild(modal);
		return modal;
	},

	/**
	 * Create a confirmation dialog modal
	 * @param {Object} options - Dialog configuration
	 * @param {string} options.title - Dialog title
	 * @param {string} options.message - Dialog message
	 * @param {Function} options.onConfirm - Confirm button handler
	 * @param {Function} [options.onCancel] - Cancel button handler
	 * @param {string} [options.confirmText] - Confirm button text
	 * @param {string} [options.cancelText] - Cancel button text
	 * @param {string} [options.type='info'] - Dialog type (info, warning, error, success)
	 * @returns {HTMLElement} The modal element
	 */
	confirm: ({
		title,
		message,
		onConfirm,
		onCancel,
		confirmText = "Confirm",
		cancelText = "Cancel",
		type = "info",
	}) => {
		const handleConfirm = () => {
			if (typeof onConfirm === "function") {
				onConfirm();
			}
			// Close modal
			const modal = document.querySelector(".modal-overlay.confirm-dialog");
			if (modal) modal.remove();
		};

		const handleCancel = () => {
			if (typeof onCancel === "function") {
				onCancel();
			}
			// Close modal
			const modal = document.querySelector(".modal-overlay.confirm-dialog");
			if (modal) modal.remove();
		};

		const content = h(
			"div.confirm-dialog-content",
			h("div.confirm-message", message),
			h(
				"div.confirm-actions",
				h("button.action-btn.cancel-btn", { onclick: handleCancel }, cancelText),
				h(`button.action-btn.confirm-btn.btn-${type}`, { onclick: handleConfirm }, confirmText)
			)
		);

		return ModalBase.show({
			title,
			content,
			className: "confirm-dialog-modal",
			overlayClassName: "confirm-dialog",
			closeOnBackdrop: false, // Force user to choose an action
			showCloseButton: false,
		});
	},

	/**
	 * Create a form modal
	 * @param {Object} options - Form modal configuration
	 * @param {string} options.title - Modal title
	 * @param {HTMLElement} options.form - Form element
	 * @param {Function} options.onSubmit - Form submit handler
	 * @param {Function} [options.onCancel] - Cancel handler
	 * @param {string} [options.submitText] - Submit button text
	 * @param {string} [options.cancelText] - Cancel button text
	 * @returns {HTMLElement} The modal element
	 */
	form: ({ title, form, onSubmit, onCancel, submitText = "Save", cancelText = "Cancel" }) => {
		const handleSubmit = (e) => {
			e.preventDefault();
			if (typeof onSubmit === "function") {
				onSubmit(e);
			}
		};

		const handleCancel = () => {
			if (typeof onCancel === "function") {
				onCancel();
			} else {
				// Default cancel - close modal
				const modal = document.querySelector(".modal-overlay");
				if (modal) modal.remove();
			}
		};

		// Add form actions to the form
		const formActions = h(
			"div.form-actions",
			h("button.action-btn.cancel-btn", { type: "button", onclick: handleCancel }, cancelText),
			h("button.action-btn.primary-btn", { type: "submit" }, submitText)
		);

		// Clone form and add submit handler
		const formWithActions = h("form", { onsubmit: handleSubmit }, form, formActions);

		return ModalBase.show({
			title,
			content: formWithActions,
			className: "form-modal",
			onClose: handleCancel,
		});
	},

	/**
	 * Close all modals
	 */
	closeAll: () => {
		const modals = document.querySelectorAll(".modal-overlay");
		modals.forEach((modal) => modal.remove());
	},

	/**
	 * Close modal by class name
	 * @param {string} className - Class name to target
	 */
	close: (className) => {
		const modal = document.querySelector(`.modal-overlay${className ? `.${className}` : ""}`);
		if (modal) modal.remove();
	},
};

// Export to global scope
window.ModalBase = ModalBase;
