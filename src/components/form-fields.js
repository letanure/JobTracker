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
const TextareaField = ({
    value = "",
    className = "editable",
    placeholder = "",
    rows = null,
}) => {
    const props = {
        className,
        placeholder,
        textContent: value,
    };
    if (rows) props.rows = rows;
    return h("textarea", props);
};

// Contact textarea component (for contact person and email)
const ContactTextarea = ({ contactPerson = "", contactEmail = "" }) => {
    const contactText = [contactPerson, contactEmail].filter(Boolean).join("\n");
    return TextareaField({
        value: contactText,
        placeholder: I18n.t("forms.placeholderNameEmail"),
        className: "editable contact-textarea",
    });
};

// Priority select component
const createPrioritySelect = (selectedPriority = "medium", disabled = false, className = "") => {
    const props = {
        className: className
    };
    
    // Only add disabled property if it's actually true
    if (disabled === true) {
        props.disabled = true;
    }
    
    return h(
        "select",
        props,
        h("option", { 
            value: "high",
            selected: selectedPriority === "high"
        }, I18n.t("priorities.high")),
        h("option", { 
            value: "medium",
            selected: selectedPriority === "medium"
        }, I18n.t("priorities.medium")),
        h("option", { 
            value: "low",
            selected: selectedPriority === "low"
        }, I18n.t("priorities.low"))
    );
};

// Phase select component
const createPhaseSelect = (selectedPhase = "wishlist", disabled = false, className = "") => {
    const props = {
        className: className
    };
    
    // Only add disabled property if it's actually true
    if (disabled === true) {
        props.disabled = true;
    }
    
    return h(
        "select",
        props,
        h("option", { 
            value: "wishlist",
            selected: selectedPhase === "wishlist"
        }, I18n.t("phases.wishlist")),
        h("option", { 
            value: "applied",
            selected: selectedPhase === "applied"
        }, I18n.t("phases.applied")),
        h("option", { 
            value: "phone_screening",
            selected: selectedPhase === "phone_screening"
        }, I18n.t("phases.phone_screening")),
        h("option", { 
            value: "interview",
            selected: selectedPhase === "interview"
        }, I18n.t("phases.interview")),
        h("option", { 
            value: "final_round",
            selected: selectedPhase === "final_round"
        }, I18n.t("phases.final_round")),
        h("option", { 
            value: "offer",
            selected: selectedPhase === "offer"
        }, I18n.t("phases.offer")),
        h("option", { 
            value: "rejected",
            selected: selectedPhase === "rejected"
        }, I18n.t("phases.rejected")),
        h("option", { 
            value: "withdrawn",
            selected: selectedPhase === "withdrawn"
        }, I18n.t("phases.withdrawn"))
    );
};

// Edit actions cell component
const EditActionsCell = ({ jobId, onSave, onCancel }) => {
    return h(
        "div",
        { className: "edit-actions" },
        h(
            "button",
            {
                className: "action-btn edit-btn",
                onclick: (e) => onSave(e.target.closest('button')),
                title: I18n.t("forms.saveChangesTitle")
            },
            h("span", { className: "material-symbols-outlined" }, "save")
        ),
        h(
            "button",
            {
                className: "action-btn cancel-btn",
                onclick: (e) => onCancel(e.target.closest('button')),
                title: I18n.t("forms.cancelEditingTitle")
            },
            h("span", { className: "material-symbols-outlined" }, "close")
        )
    );
};

// Make form field components available globally for Vite
window.InputField = InputField;
window.TextareaField = TextareaField;
window.ContactTextarea = ContactTextarea;
window.createPrioritySelect = createPrioritySelect;
window.createPhaseSelect = createPhaseSelect;
window.EditActionsCell = EditActionsCell;