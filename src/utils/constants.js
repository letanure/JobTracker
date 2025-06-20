// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
	dateFormat: "DD/MM/YY HH:MM", // Options: 'DD/MM/YY', 'MM/DD/YY', 'YYYY-MM-DD', 'DD/MM/YY HH:MM'
	showTimeInNotes: true, // Set to true to include time in notes
};

// ============================================================================
// CONSTANTS AND DATA
// ============================================================================

const PRIORITIES = ["high", "medium", "low"];

const PHASES = [
	"wishlist",
	"applied",
	"phone_screening",
	"interview",
	"final_round",
	"offer",
	"rejected",
	"withdrawn",
];

// Helper functions to get translated values
const getPriorityText = (priorityKey) => I18n.t(`priorities.${priorityKey}`);
const getPhaseText = (phaseKey) => I18n.t(`phases.${phaseKey}`);

// Demo data for first-time users
const DEMO_DATA = [
	{
		id: 1,
		priority: "high",
		company: "TechCorp Inc",
		position: "Senior Software Engineer",
		appliedDate: "2025-06-15T10:00:00.000Z",
		currentPhase: "interview",
		contactPerson: "demo.contactPerson1",
		contactEmail: "sarah@techcorp.com",
		salaryRange: "$120k - $150k",
		location: "San Francisco, CA",
		notes: "demo.notes1",
		tasks: [
			{
				id: "1",
				text: "Prepare system design presentation",
				status: "todo",
				priority: "high",
				createdAt: "2025-06-15T10:00:00.000Z",
				completedAt: null,
				dueDate: "2025-06-22T10:00:00.000Z",
			},
			{
				id: "2",
				text: "Review company tech stack",
				status: "done",
				priority: "medium",
				createdAt: "2025-06-14T09:00:00.000Z",
				completedAt: "2025-06-16T14:30:00.000Z",
				dueDate: null,
			},
		],
	},
	{
		id: 2,
		priority: "medium",
		company: "StartupXYZ",
		position: "Full Stack Developer",
		appliedDate: "2025-06-12T09:00:00.000Z",
		currentPhase: "phone_screening",
		contactPerson: "demo.contactPerson2",
		contactEmail: "hiring@startupxyz.com",
		salaryRange: "$90k - $110k + equity",
		location: "Remote",
		notes: "demo.notes2",
		tasks: [
			{
				id: "3",
				text: "Wait for callback",
				status: "in-progress",
				priority: "medium",
				createdAt: "2025-06-12T15:00:00.000Z",
				completedAt: null,
				dueDate: "2025-06-20T17:00:00.000Z",
			},
		],
	},
];

// Helper function to get demo data with translations
const getDemoData = () => {
	return DEMO_DATA.map((job) => ({
		...job,
		contactPerson: job.contactPerson.startsWith("demo.")
			? I18n.t(job.contactPerson)
			: job.contactPerson,
		notes: job.notes.startsWith("demo.") ? I18n.t(job.notes) : job.notes,
	}));
};

// Global state variables
let jobsData = [];
let originalData = [];