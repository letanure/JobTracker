// ============================================================================
// SEED DATA - DEMO DATA FOR FIRST-TIME USERS
// ============================================================================

// Demo data for first-time users
const DEMO_DATA = [
	{
		id: 1,
		priority: "high",
		company: "TechCorp Inc",
		position: "Senior Software Engineer",
		appliedDate: "2025-06-15T10:00:00.000Z",
		currentPhase: "interview",
		currentSubstep: "technical_interview",
		completedSubsteps: ["phone_screening"],
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
		contacts: []
	},
	{
		id: 2,
		priority: "medium",
		company: "StartupXYZ",
		position: "Full Stack Developer",
		appliedDate: "2025-06-12T09:00:00.000Z",
		currentPhase: "applied",
		currentSubstep: "hr_phone_screen",
		completedSubsteps: ["application_review"],
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
		contacts: []
	},
];

// Helper function to get demo data with translations
const getDemoData = () => {
	return DEMO_DATA.map((job) => ({
		...job,
		contactPerson: job.contactPerson.startsWith("demo.")
			? I18n.t(job.contactPerson)
			: job.contactPerson,
		notes: job.notes.startsWith("demo.") ? [{
			id: Date.now() + Math.random(),
			date: job.appliedDate || new Date().toISOString(),
			phase: job.currentPhase || "applied",
			text: I18n.t(job.notes)
		}] : (Array.isArray(job.notes) ? job.notes : []),
	}));
};