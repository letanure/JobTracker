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
        placeholder: "Name\nEmail",
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
        }, "High"),
        h("option", { 
            value: "medium",
            selected: selectedPriority === "medium"
        }, "Medium"),
        h("option", { 
            value: "low",
            selected: selectedPriority === "low"
        }, "Low")
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
        }, "Wishlist"),
        h("option", { 
            value: "applied",
            selected: selectedPhase === "applied"
        }, "Applied"),
        h("option", { 
            value: "phone_screening",
            selected: selectedPhase === "phone_screening"
        }, "Phone Screening"),
        h("option", { 
            value: "interview",
            selected: selectedPhase === "interview"
        }, "Interview"),
        h("option", { 
            value: "final_round",
            selected: selectedPhase === "final_round"
        }, "Final Round"),
        h("option", { 
            value: "offer",
            selected: selectedPhase === "offer"
        }, "Offer"),
        h("option", { 
            value: "rejected",
            selected: selectedPhase === "rejected"
        }, "Rejected"),
        h("option", { 
            value: "withdrawn",
            selected: selectedPhase === "withdrawn"
        }, "Withdrawn")
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
                title: "Save changes"
            },
            h("span", { className: "material-symbols-outlined" }, "save")
        ),
        h(
            "button",
            {
                className: "action-btn cancel-btn",
                onclick: (e) => onCancel(e.target.closest('button')),
                title: "Cancel editing"
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