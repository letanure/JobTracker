// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
	dateFormat: "DD/MM/YY HH:MM", // Options: 'DD/MM/YY', 'MM/DD/YY', 'YYYY-MM-DD', 'DD/MM/YY HH:MM'
	showTimeInNotes: true, // Set to true to include time in notes
	// Language configuration
	languages: [
		{ code: "en", name: "English", flag: "🇺🇸" },
		{ code: "pt", name: "Português", flag: "🇧🇷" },
	],
	// Default tab to show on application load
	defaultTab: "dashboard",
};

// ============================================================================
// CONSTANTS AND DATA
// ============================================================================

const PRIORITIES = ["high", "medium", "low"];

// Task statuses for task management
const TASK_STATUSES = ["todo", "in-progress", "done"];

// Basic phases for main workflow
const PHASES = ["wishlist", "applied", "interview", "offer", "rejected_withdrawn"];

// Sub-steps that can be used within phases
const PHASE_SUBSTEPS = {
	wishlist: ["assess_job", "research_company", "prepare_application"],
	applied: ["application_review", "initial_screening", "hr_phone_screen", "recruiter_call"],
	interview: [
		"phone_screening",
		"technical_phone_screen",
		"coding_challenge",
		"take_home_assignment",
		"technical_interview",
		"system_design_interview",
		"behavioral_interview",
		"team_interview",
		"hiring_manager_interview",
		"panel_interview",
		"final_round",
	],
	offer: ["reference_check", "background_check", "offer_discussion", "salary_negotiation"],
	rejected_withdrawn: ["rejected", "withdrawn"],
};

// Default substeps that are pre-selected when creating a new job
const DEFAULT_SELECTED_SUBSTEPS = {
	wishlist: ["assess_job"],
	applied: ["application_review", "hr_phone_screen"],
	interview: ["technical_interview", "behavioral_interview"],
	offer: ["offer_discussion", "salary_negotiation"],
	rejected_withdrawn: [],
};

// Helper functions to get translated values
const getPriorityText = (priorityKey) => {
	if (!priorityKey) return "";
	return I18n.t(`priorities.${priorityKey}`);
};
const getPhaseText = (phaseKey) => {
	if (!phaseKey) return "";
	return I18n.t(`phases.${phaseKey}`);
};
const getSubstepText = (substepKey) => {
	if (!substepKey) return "";
	return I18n.t(`substeps.${substepKey}`);
};

// Helper function to get all substeps for a phase
const getSubstepsForPhase = (phaseKey) => PHASE_SUBSTEPS[phaseKey] || [];

// Global state variables
// biome-ignore lint/style/useConst: global jobs data
let jobsData = [];
// biome-ignore lint/style/useConst: global original data
let originalData = [];
