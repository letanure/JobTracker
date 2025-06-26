// ============================================================================
// FORM VALIDATION UTILITIES - SHARED VALIDATION LOGIC
// ============================================================================

const FormValidation = {
	/**
	 * Validate that a field is not empty
	 * @param {string} value - Field value
	 * @param {string} fieldName - Field name for error message
	 * @returns {Object} Validation result with isValid and errorMessage
	 */
	required: (value, fieldName = "Field") => {
		const trimmedValue = typeof value === "string" ? value.trim() : value;
		const isValid = trimmedValue && trimmedValue.length > 0;

		return {
			isValid,
			errorMessage: isValid
				? null
				: I18n.t("validation.required", { field: fieldName }) || `${fieldName} is required`,
		};
	},

	/**
	 * Validate email format
	 * @param {string} email - Email address
	 * @returns {Object} Validation result
	 */
	email: (email) => {
		if (!email || email.trim() === "") {
			return { isValid: true, errorMessage: null }; // Empty is valid (use required() if needed)
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const isValid = emailRegex.test(email.trim());

		return {
			isValid,
			errorMessage: isValid
				? null
				: I18n.t("validation.emailInvalid") || "Please enter a valid email address",
		};
	},

	/**
	 * Validate phone number format (basic)
	 * @param {string} phone - Phone number
	 * @returns {Object} Validation result
	 */
	phone: (phone) => {
		if (!phone || phone.trim() === "") {
			return { isValid: true, errorMessage: null }; // Empty is valid
		}

		const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
		const isValid = phoneRegex.test(phone.trim());

		return {
			isValid,
			errorMessage: isValid
				? null
				: I18n.t("validation.phoneInvalid") || "Please enter a valid phone number",
		};
	},

	/**
	 * Validate URL format
	 * @param {string} url - URL
	 * @returns {Object} Validation result
	 */
	url: (url) => {
		if (!url || url.trim() === "") {
			return { isValid: true, errorMessage: null }; // Empty is valid
		}

		try {
			new URL(url.trim());
			return { isValid: true, errorMessage: null };
		} catch {
			return {
				isValid: false,
				errorMessage: I18n.t("validation.urlInvalid") || "Please enter a valid URL",
			};
		}
	},

	/**
	 * Validate minimum length
	 * @param {string} value - Field value
	 * @param {number} minLength - Minimum length required
	 * @param {string} fieldName - Field name for error message
	 * @returns {Object} Validation result
	 */
	minLength: (value, minLength, fieldName = "Field") => {
		const trimmedValue = typeof value === "string" ? value.trim() : value;
		const isValid = !trimmedValue || trimmedValue.length >= minLength;

		return {
			isValid,
			errorMessage: isValid
				? null
				: I18n.t("validation.minLength", { field: fieldName, min: minLength }) ||
					`${fieldName} must be at least ${minLength} characters`,
		};
	},

	/**
	 * Validate maximum length
	 * @param {string} value - Field value
	 * @param {number} maxLength - Maximum length allowed
	 * @param {string} fieldName - Field name for error message
	 * @returns {Object} Validation result
	 */
	maxLength: (value, maxLength, fieldName = "Field") => {
		const trimmedValue = typeof value === "string" ? value.trim() : value;
		const isValid = !trimmedValue || trimmedValue.length <= maxLength;

		return {
			isValid,
			errorMessage: isValid
				? null
				: I18n.t("validation.maxLength", { field: fieldName, max: maxLength }) ||
					`${fieldName} must be no more than ${maxLength} characters`,
		};
	},

	/**
	 * Validate that a select field has a value
	 * @param {string} value - Selected value
	 * @param {string} fieldName - Field name for error message
	 * @returns {Object} Validation result
	 */
	selected: (value, fieldName = "Selection") => {
		const isValid = value && value !== "" && value !== "null" && value !== "undefined";

		return {
			isValid,
			errorMessage: isValid
				? null
				: I18n.t("validation.selectRequired", { field: fieldName.toLowerCase() }) ||
					`Please select a ${fieldName.toLowerCase()}`,
		};
	},

	/**
	 * Validate date format and logic
	 * @param {string} dateString - Date string
	 * @param {string} fieldName - Field name for error message
	 * @returns {Object} Validation result
	 */
	date: (dateString, fieldName = "Date") => {
		if (!dateString || dateString.trim() === "") {
			return { isValid: true, errorMessage: null }; // Empty is valid
		}

		const date = new Date(dateString);
		const isValid = !Number.isNaN(date.getTime());

		return {
			isValid,
			errorMessage: isValid
				? null
				: I18n.t("validation.enterValid", { field: fieldName.toLowerCase() }) ||
					`Please enter a valid ${fieldName.toLowerCase()}`,
		};
	},

	/**
	 * Validate that a date is in the future
	 * @param {string} dateString - Date string
	 * @param {string} fieldName - Field name for error message
	 * @returns {Object} Validation result
	 */
	futureDate: (dateString, fieldName = "Date") => {
		const dateValidation = FormValidation.date(dateString, fieldName);
		if (!dateValidation.isValid) {
			return dateValidation;
		}

		if (!dateString || dateString.trim() === "") {
			return { isValid: true, errorMessage: null }; // Empty is valid
		}

		const date = new Date(dateString);
		const now = new Date();
		const isValid = date >= now;

		return {
			isValid,
			errorMessage: isValid
				? null
				: I18n.t("validation.futureDateRequired", { field: fieldName }) ||
					`${fieldName} must be in the future`,
		};
	},

	/**
	 * Validate multiple fields at once
	 * @param {Object} fieldValidations - Object where keys are field names and values are validation results
	 * @returns {Object} Combined validation result
	 */
	validateFields: (fieldValidations) => {
		const errors = {};
		let isValid = true;

		Object.keys(fieldValidations).forEach((fieldName) => {
			const validation = fieldValidations[fieldName];
			if (!validation.isValid) {
				errors[fieldName] = validation.errorMessage;
				isValid = false;
			}
		});

		return {
			isValid,
			errors,
			firstError: isValid ? null : Object.values(errors)[0],
		};
	},

	/**
	 * Get trimmed value from form field
	 * @param {HTMLElement|string} fieldOrValue - Form field element or value
	 * @returns {string} Trimmed value
	 */
	getTrimmedValue: (fieldOrValue) => {
		if (typeof fieldOrValue === "string") {
			return fieldOrValue.trim();
		}

		if (fieldOrValue && fieldOrValue.value !== undefined) {
			return fieldOrValue.value.trim();
		}

		return "";
	},

	/**
	 * Show validation error on a form field
	 * @param {HTMLElement} field - Form field element
	 * @param {string} message - Error message
	 */
	showFieldError: (field, message) => {
		// Remove existing error
		FormValidation.clearFieldError(field);

		// Add error class to field
		field.classList.add("validation-error");

		// Create and add error message element
		const errorElement = document.createElement("div");
		errorElement.className = "validation-error-message";
		errorElement.textContent = message;

		// Insert error message after the field
		field.parentNode.insertBefore(errorElement, field.nextSibling);

		// Focus the field
		field.focus();
	},

	/**
	 * Clear validation error from a form field
	 * @param {HTMLElement} field - Form field element
	 */
	clearFieldError: (field) => {
		// Remove error class
		field.classList.remove("validation-error");

		// Remove error message
		const errorMessage = field.parentNode.querySelector(".validation-error-message");
		if (errorMessage) {
			errorMessage.remove();
		}
	},

	/**
	 * Clear all validation errors in a form
	 * @param {HTMLElement} form - Form element
	 */
	clearFormErrors: (form) => {
		// Remove error classes
		const fieldsWithErrors = form.querySelectorAll(".validation-error");
		fieldsWithErrors.forEach((field) => field.classList.remove("validation-error"));

		// Remove error messages
		const errorMessages = form.querySelectorAll(".validation-error-message");
		errorMessages.forEach((message) => message.remove());
	},

	/**
	 * Validate a complete form using validation rules
	 * @param {HTMLElement} form - Form element
	 * @param {Object} rules - Validation rules object
	 * @returns {Object} Validation result
	 */
	validateForm: (form, rules) => {
		// Clear existing errors
		FormValidation.clearFormErrors(form);

		const fieldValidations = {};
		let firstErrorField = null;

		Object.keys(rules).forEach((fieldName) => {
			const field = form.querySelector(`[name="${fieldName}"]`);
			if (!field) return;

			const value = FormValidation.getTrimmedValue(field);
			const fieldRules = Array.isArray(rules[fieldName]) ? rules[fieldName] : [rules[fieldName]];

			// Run all validations for this field
			for (const rule of fieldRules) {
				const validation = rule(value);
				if (!validation.isValid) {
					fieldValidations[fieldName] = validation;

					// Show error on field
					FormValidation.showFieldError(field, validation.errorMessage);

					// Remember first error field for focus
					if (!firstErrorField) {
						firstErrorField = field;
					}

					break; // Stop at first error for this field
				}
			}
		});

		const result = FormValidation.validateFields(fieldValidations);

		// Focus first error field
		if (!result.isValid && firstErrorField) {
			firstErrorField.focus();
		}

		return result;
	},
};

// Common validation rule factories
const ValidationRules = {
	/**
	 * Create a required field rule
	 * @param {string} fieldName - Field display name
	 * @returns {Function} Validation function
	 */
	required: (fieldName) => (value) => FormValidation.required(value, fieldName),

	/**
	 * Create an email validation rule
	 * @returns {Function} Validation function
	 */
	email: () => (value) => FormValidation.email(value),

	/**
	 * Create a phone validation rule
	 * @returns {Function} Validation function
	 */
	phone: () => (value) => FormValidation.phone(value),

	/**
	 * Create a URL validation rule
	 * @returns {Function} Validation function
	 */
	url: () => (value) => FormValidation.url(value),

	/**
	 * Create a minimum length rule
	 * @param {number} minLength - Minimum length
	 * @param {string} fieldName - Field display name
	 * @returns {Function} Validation function
	 */
	minLength: (minLength, fieldName) => (value) =>
		FormValidation.minLength(value, minLength, fieldName),

	/**
	 * Create a maximum length rule
	 * @param {number} maxLength - Maximum length
	 * @param {string} fieldName - Field display name
	 * @returns {Function} Validation function
	 */
	maxLength: (maxLength, fieldName) => (value) =>
		FormValidation.maxLength(value, maxLength, fieldName),

	/**
	 * Create a selection required rule
	 * @param {string} fieldName - Field display name
	 * @returns {Function} Validation function
	 */
	selected: (fieldName) => (value) => FormValidation.selected(value, fieldName),
};

// Export to global scope
window.FormValidation = FormValidation;
window.ValidationRules = ValidationRules;
