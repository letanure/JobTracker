// ============================================================================
// RESUME UTILITY FUNCTIONS
// ============================================================================

const ResumeUtils = {
	// Get formatted country options for select
	getCountryOptions: () => {
		return ResumeData.getCountryCodes()
			.map((code) => ({
				value: code,
				label: new Intl.DisplayNames(["en"], { type: "region" }).of(code),
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	},

	// Get formatted language options for select
	getLanguageOptions: () => {
		return ResumeData.getLanguageCodes()
			.map((code) => ({
				value: code,
				label: new Intl.DisplayNames(["en"], { type: "language" }).of(code),
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	},

	// Format skill group name for display
	formatSkillGroupName: (groupName) => {
		return groupName.charAt(0).toUpperCase() + groupName.slice(1);
	},

	// Calculate completion percentage for basics section
	calculateBasicsCompletion: (data) => {
		const basics = data.basics || {};
		const requiredFields = ["name", "label", "email", "summary"];
		const completed = requiredFields.filter(
			(field) => basics[field] && basics[field].trim().length > 0
		).length;
		return Math.round((completed / requiredFields.length) * 100);
	},

	// Calculate completion percentage for array sections
	calculateArrayCompletion: (sectionName, requiredFields, data, customData = null) => {
		const sectionData = customData || data[sectionName] || [];
		if (sectionData.length === 0) return 0;

		const totalItems = sectionData.length;
		let completedItems = 0;

		sectionData.forEach((item) => {
			const completed = requiredFields.filter((field) => {
				const value = field.includes(".")
					? field.split(".").reduce((obj, key) => obj?.[key], item)
					: item[field];
				return value && value.toString().trim().length > 0;
			}).length;

			if (completed >= Math.ceil(requiredFields.length * 0.7)) {
				completedItems++;
			}
		});

		return Math.round((completedItems / totalItems) * 100);
	},

	// Generate unique ID for resume items
	generateId: () => {
		return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	},

	// Validate email format
	isValidEmail: (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	},

	// Validate phone number format (basic)
	isValidPhone: (phone) => {
		const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
		return phoneRegex.test(phone);
	},

	// Validate URL format
	isValidUrl: (url) => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	},

	// Format date for display
	formatDate: (dateStr) => {
		if (!dateStr) return "";
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
		});
	},

	// Calculate years of experience
	calculateExperience: (experience) => {
		if (!experience || experience.length === 0) return 0;

		let totalMonths = 0;
		experience.forEach((job) => {
			if (job.startDate) {
				const start = new Date(job.startDate);
				const end = job.endDate ? new Date(job.endDate) : new Date();
				const months =
					(end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
				totalMonths += Math.max(0, months);
			}
		});

		return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
	},
};

// Export to global scope
window.ResumeUtils = ResumeUtils;
