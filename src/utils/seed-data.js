// ============================================================================
// SEED DATA - DEMO DATA FOR FIRST-TIME USERS
// ============================================================================

// Helper function to generate dates relative to today
const getRelativeDate = (daysOffset, hour = 10, minute = 0) => {
	const today = new Date();
	const targetDate = new Date(today);
	targetDate.setDate(today.getDate() + daysOffset);
	targetDate.setHours(hour, minute, 0, 0);
	return targetDate.toISOString();
};

// Demo data for first-time users
const DEMO_DATA = [
	{
		id: 1,
		priority: "high",
		company: "TechCorp Inc",
		position: "Senior Software Engineer",
		appliedDate: getRelativeDate(-9), // Applied 9 days ago
		currentPhase: "interview",
		currentSubstep: "technical_interview",
		completedSubsteps: ["phone_screening"],
		selectedSubsteps: {
			applied: ["application_review", "hr_phone_screen"],
			interview: ["phone_screening", "coding_challenge", "technical_interview", "team_interview"],
			offer: ["offer_discussion", "salary_negotiation"]},
		salaryRange: "$120k - $150k",
		location: "San Francisco, CA",
		notes: "demo.notes1",
		sortOrder: 0, // Position within the interview phase
		tasks: [
			{
				id: "1",
				text: "Prepare system design presentation",
				status: "todo",
				priority: "high",
				createdAt: getRelativeDate(-9),
				completedAt: null,
				dueDate: getRelativeDate(1), // Due tomorrow
				duration: "2h",
				sortOrder: 0},
			{
				id: "2",
				text: "Review company tech stack",
				status: "done",
				priority: "medium",
				createdAt: getRelativeDate(-10, 9),
				completedAt: getRelativeDate(-8, 14, 30),
				dueDate: null,
				duration: "1h",
				sortOrder: 0},
			{
				id: "3",
				text: "Complete coding assessment",
				status: "todo",
				priority: "high",
				createdAt: getRelativeDate(-4),
				completedAt: null,
				dueDate: getRelativeDate(4, 23, 59), // Due in 4 days
				duration: "3h",
				sortOrder: 1},
			{
				id: "4",
				text: "Research team members on LinkedIn",
				status: "todo",
				priority: "low",
				createdAt: getRelativeDate(-3),
				completedAt: null,
				dueDate: getRelativeDate(8), // Due in 8 days
				duration: null,
				sortOrder: 2},
		],
		contacts: [
			{
				id: "1",
				name: "Sarah Johnson",
				email: "sarah.johnson@techcorp.com",
				phone: "+1 (555) 123-4567",
				company: "TechCorp Inc",
				role: "Technical Recruiter",
				createdAt: getRelativeDate(-9),
				archived: false},
			{
				id: "2",
				name: "Mike Chen",
				email: "mike.chen@techcorp.com",
				phone: "+1 (555) 234-5678",
				company: "TechCorp Inc",
				role: "Engineering Manager",
				createdAt: getRelativeDate(-8, 14),
				archived: false},
		]},
	{
		id: 2,
		priority: "medium",
		company: "StartupXYZ",
		position: "Full Stack Developer",
		appliedDate: "2025-06-12T09:00:00.000Z",
		currentPhase: "applied",
		currentSubstep: "hr_phone_screen",
		completedSubsteps: ["application_review"],
		selectedSubsteps: {
			applied: ["application_review", "hr_phone_screen", "recruiter_call"],
			interview: ["take_home_assignment", "technical_interview", "behavioral_interview"],
			offer: ["reference_check", "offer_discussion"]},
		salaryRange: "$90k - $110k + equity",
		location: "Remote",
		notes: "demo.notes2",
		sortOrder: 0, // Position within the applied phase
		tasks: [
			{
				id: "5",
				text: "Follow up on application",
				status: "in-progress",
				priority: "medium",
				createdAt: "2025-06-12T15:00:00.000Z",
				completedAt: null,
				dueDate: "2025-06-26T17:00:00.000Z",
				duration: "30min",
				sortOrder: 0},
			{
				id: "6",
				text: "Prepare portfolio projects showcase",
				status: "todo",
				priority: "high",
				createdAt: "2025-06-18T10:00:00.000Z",
				completedAt: null,
				dueDate: "2025-06-30T17:00:00.000Z",
				duration: "1h30",
				sortOrder: 0},
			{
				id: "7",
				text: "Write thank you note after interview",
				status: "todo",
				priority: "medium",
				createdAt: "2025-06-22T10:00:00.000Z",
				completedAt: null,
				dueDate: null,
				duration: "15min",
				sortOrder: 1},
			{
				id: "8",
				text: "Review equity compensation guide",
				status: "todo",
				priority: "low",
				createdAt: "2025-06-23T10:00:00.000Z",
				completedAt: null,
				dueDate: "2025-07-10T10:00:00.000Z",
				duration: null,
				sortOrder: 2},
		],
		contacts: [
			{
				id: "3",
				name: "Alex Rivera",
				email: "alex@startupxyz.com",
				phone: null,
				company: "StartupXYZ",
				role: "CTO",
				createdAt: "2025-06-12T09:00:00.000Z",
				archived: false},
		]},
];

// Helper function to get demo data with translations
const getDemoData = () => {
	return DEMO_DATA.map((job) => ({
		...job,

		notes: job.notes.startsWith('demo.')
			? [
					{
						id: Date.now() + Math.random(),
						date: job.appliedDate || new Date().toISOString(),
						phase: job.currentPhase || "applied",
						text: I18n.t(job.notes)},
				]
			: Array.isArray(job.notes)
				? job.notes
				: []}));
};
