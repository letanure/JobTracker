// ============================================================================
// FORM FIELD COMPONENTS FOR INLINE EDITING
// ============================================================================

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

// Textarea field component
const TextareaField = ({ value = "", className = "editable", placeholder = "", rows = null }) => {
	const props = {
		className,
		placeholder,
		textContent: value,
	};
	if (rows) props.rows = rows;
	return h("textarea", props);
};

// Priority select component
const createPrioritySelect = (selectedPriority = "medium", disabled = false, className = "") => {
	const props = {
		className,
	};

	// Only add disabled property if it's actually true
	if (disabled === true) {
		props.disabled = true;
	}

	return h(
		"select",
		props,
		h(
			"option",
			{
				value: "high",
				selected: selectedPriority === "high",
			},
			I18n.t("priorities.high")
		),
		h(
			"option",
			{
				value: "medium",
				selected: selectedPriority === "medium",
			},
			I18n.t("priorities.medium")
		),
		h(
			"option",
			{
				value: "low",
				selected: selectedPriority === "low",
			},
			I18n.t("priorities.low")
		)
	);
};

// Phase select component
const createPhaseSelect = (selectedPhase = "wishlist", disabled = false, className = "") => {
	const props = {
		className,
	};

	// Only add disabled property if it's actually true
	if (disabled === true) {
		props.disabled = true;
	}

	return h(
		"select",
		props,
		h(
			"option",
			{
				value: "wishlist",
				selected: selectedPhase === "wishlist",
			},
			I18n.t("phases.wishlist")
		),
		h(
			"option",
			{
				value: "applied",
				selected: selectedPhase === "applied",
			},
			I18n.t("phases.applied")
		),
		h(
			"option",
			{
				value: "interview",
				selected: selectedPhase === "interview",
			},
			I18n.t("phases.interview")
		),
		h(
			"option",
			{
				value: "offer",
				selected: selectedPhase === "offer",
			},
			I18n.t("phases.offer")
		),
		h(
			"option",
			{
				value: "rejected_withdrawn",
				selected: selectedPhase === "rejected_withdrawn",
			},
			I18n.t("phases.rejected_withdrawn")
		)
	);
};

// Edit actions cell component
const EditActionsCell = ({ jobId, onSave, onCancel }) => {
	return h(
		"div.edit-actions",
		h(
			"button.action-btn.edit-btn",
			{
				onclick: (e) => onSave(e.target.closest("button")),
				title: I18n.t("forms.saveChangesTitle"),
			},
			h("span.material-symbols-outlined", "save")
		),
		h(
			"button.action-btn.cancel-btn",
			{
				onclick: (e) => onCancel(e.target.closest("button")),
				title: I18n.t("forms.cancelEditingTitle"),
			},
			h("span.material-symbols-outlined", "close")
		)
	);
};

// Make form field components available globally for Vite
window.InputField = InputField;
window.TextareaField = TextareaField;
window.createPrioritySelect = createPrioritySelect;
window.createPhaseSelect = createPhaseSelect;
window.EditActionsCell = EditActionsCell;
