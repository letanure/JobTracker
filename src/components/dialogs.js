// ============================================================================
// CUSTOM DIALOG SYSTEM
// ============================================================================

const CustomDialogs = {
	// Store active dialog reference
	activeDialog: null,

	// Show custom alert dialog
	alert: (message, title = null) => {
		return new Promise((resolve) => {
			const modal = CustomDialogs.createModal({
				title: title || I18n.t("modals.dialogs.alert") || "Alert",
				message,
				buttons: [
					{
						text: I18n.t("modals.common.ok") || "OK",
						className: "btn-primary",
						onClick: () => {
							CustomDialogs.closeDialog();
							resolve(true);
						},
					},
				],
				type: "alert",
			});

			CustomDialogs.showDialog(modal);
		});
	},

	// Show custom confirm dialog
	confirm: (message, options = {}) => {
		return new Promise((resolve) => {
			const {
				title = null,
				confirmText = I18n.t("modals.common.ok") || "OK",
				cancelText = I18n.t("modals.common.cancel") || "Cancel",
				focusConfirm = false,
			} = options;

			const modal = CustomDialogs.createModal({
				title: title || I18n.t("modals.dialogs.confirm") || "Confirm",
				message,
				buttons: [
					{
						text: cancelText,
						className: focusConfirm ? "btn-secondary" : "btn-primary",
						onClick: () => {
							CustomDialogs.closeDialog();
							resolve(false);
						},
					},
					{
						text: confirmText,
						className: focusConfirm ? "btn-primary" : "btn-secondary",
						onClick: () => {
							CustomDialogs.closeDialog();
							resolve(true);
						},
					},
				],
				type: "confirm",
				focusConfirm,
			});

			CustomDialogs.showDialog(modal, focusConfirm);
		});
	},

	// Show custom prompt dialog
	prompt: (message, defaultValue = "", title = null) => {
		return new Promise((resolve) => {
			let inputValue = defaultValue;

			const modal = CustomDialogs.createModal({
				title: title || I18n.t("modals.dialogs.prompt") || "Input Required",
				message,
				input: {
					type: "text",
					value: defaultValue,
					placeholder: message,
					onChange: (value) => {
						inputValue = value;
					},
				},
				buttons: [
					{
						text: I18n.t("modals.common.cancel") || "Cancel",
						className: "btn-secondary",
						onClick: () => {
							CustomDialogs.closeDialog();
							resolve(null);
						},
					},
					{
						text: I18n.t("modals.common.ok") || "OK",
						className: "btn-primary",
						onClick: () => {
							CustomDialogs.closeDialog();
							resolve(inputValue);
						},
					},
				],
				type: "prompt",
			});

			CustomDialogs.showDialog(modal);
		});
	},

	// Create modal structure
	createModal: ({ title, message, buttons, input, type, focusConfirm = false }) => {
		const modal = h(
			"div",
			{
				className: "modal-overlay custom-dialog",
				onclick: (e) => {
					if (e.target.className.includes("modal-overlay")) {
						// Don't auto-close on backdrop click for dialogs
						// User must explicitly choose an option
					}
				},
			},
			h(
				"div",
				{
					className: `modal custom-dialog-modal dialog-${type}`,
					onclick: (e) => e.stopPropagation(),
				},
				// Header
				h(
					"div",
					{ className: "modal-header" },
					h("h3", { className: "modal-title" }, title)
					// No close button - force user to choose an option
				),

				// Body
				h(
					"div",
					{ className: "modal-body custom-dialog-body" },
					h("div", { className: "dialog-message" }, message),

					// Input field for prompt
					input
						? h(
								"div",
								{ className: "dialog-input-container" },
								h("input", {
									type: input.type,
									value: input.value,
									placeholder: input.placeholder,
									className: "dialog-input",
									oninput: (e) => input.onChange(e.target.value),
									onkeydown: (e) => {
										if (e.key === "Enter") {
											// Trigger the primary button (last button)
											const primaryBtn = modal.querySelector(".btn-primary");
											if (primaryBtn) primaryBtn.click();
										}
										if (e.key === "Escape") {
											// Trigger the secondary button (first button)
											const secondaryBtn = modal.querySelector(".btn-secondary");
											if (secondaryBtn) secondaryBtn.click();
										}
									},
								})
							)
						: null
				),

				// Footer with buttons
				h(
					"div",
					{ className: "modal-footer dialog-footer" },
					...buttons.map((button) =>
						h(
							"button",
							{
								className: `btn-subtle ${button.className}`,
								onclick: button.onClick,
							},
							button.text
						)
					)
				)
			)
		);

		return modal;
	},

	// Show dialog
	showDialog: (modal, focusConfirm = false) => {
		// Close any existing dialog
		CustomDialogs.closeDialog();

		// Optimize rendering to reduce flickering
		modal.style.opacity = "0";
		modal.style.transform = "translate(-50%, -60%) scale(0.95)";

		CustomDialogs.activeDialog = modal;
		document.body.appendChild(modal);

		// Force browser to calculate layout before showing
		modal.offsetHeight;

		// Trigger the animation
		requestAnimationFrame(() => {
			modal.style.opacity = "";
			modal.style.transform = "";

			// Focus handling after animation starts
			setTimeout(() => {
				const input = modal.querySelector(".dialog-input");
				if (input) {
					input.focus();
				} else if (focusConfirm) {
					// Focus the confirm button (primary in this case)
					const confirmBtn = modal.querySelector(".btn-primary");
					if (confirmBtn) confirmBtn.focus();
				} else {
					// Focus the first button (usually cancel)
					const firstBtn = modal.querySelector(".action-btn");
					if (firstBtn) firstBtn.focus();
				}
			}, 50);
		});

		// Add keyboard event listener for ESC key
		const handleKeydown = (e) => {
			if (e.key === "Escape") {
				// Trigger cancel/close button
				const cancelBtn = modal.querySelector(".btn-secondary");
				if (cancelBtn) {
					cancelBtn.click();
				} else {
					// If no cancel button, trigger the primary button
					const primaryBtn = modal.querySelector(".btn-primary");
					if (primaryBtn) primaryBtn.click();
				}
			}
		};

		document.addEventListener("keydown", handleKeydown);
		modal.dataset.keydownHandler = "true";
	},

	// Close active dialog
	closeDialog: () => {
		if (CustomDialogs.activeDialog) {
			// Remove keyboard event listener
			if (CustomDialogs.activeDialog.dataset.keydownHandler) {
				document.removeEventListener("keydown", CustomDialogs.handleKeydown);
			}

			if (CustomDialogs.activeDialog.parentNode) {
				CustomDialogs.activeDialog.parentNode.removeChild(CustomDialogs.activeDialog);
			}
			CustomDialogs.activeDialog = null;
		}
	},
};

// Helper for simple confirm dialogs with custom buttons
CustomDialogs.confirmCustom = (
	message,
	confirmText,
	cancelText,
	focusConfirm = false,
	title = null
) => {
	return CustomDialogs.confirm(message, {
		title,
		confirmText,
		cancelText,
		focusConfirm,
	});
};

// Override native dialogs globally
window.customAlert = CustomDialogs.alert;
window.customConfirm = CustomDialogs.confirm;
window.customConfirmCustom = CustomDialogs.confirmCustom;
window.customPrompt = CustomDialogs.prompt;

// For testing - you can restore native dialogs with these
window.nativeAlert = window.alert;
window.nativeConfirm = window.confirm;
window.nativePrompt = window.prompt;

// Replace native dialogs
window.alert = CustomDialogs.alert;
window.confirm = CustomDialogs.confirm;
window.prompt = CustomDialogs.prompt;
