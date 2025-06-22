// ============================================================================
// ENGLISH TRANSLATIONS
// ============================================================================

const EN_TRANSLATIONS = {
	app: {
		title: "JobTracker"
	},
	buttons: {
		addApplication: "+ Add Application"
	},
	tabs: {
		jobs: "Jobs",
		applications: "Applications Board"
	},
	kanban: {
		title: "Applications Board",
		totalJobs: "{count} total applications",
		editJob: "Edit Job"
	},
	table: {
		headers: {
			priority: "Priority",
			company: "Company",
			position: "Position",
			currentPhase: "Stage",
			substep: "Substep",
			contactPerson: "Contact",
			salaryRange: "Salary Range",
			location: "Location",
			sourceUrl: "Source",
			notes: "Notes",
			tasks: "Tasks",
			actions: "Actions"
		},
		filters: {
			allPriorities: "All Priorities",
			allPhases: "All Phases"
		},
		placeholders: {
			company: "Company Name",
			position: "Position Title",
			contactPerson: "Contact Name",
			contactEmail: "Contact Email",
			salaryRange: "Salary Range",
			location: "Location",
			sourceUrl: "Job Posting URL"
		}
	},
	priorities: {
		high: "High",
		medium: "Medium",
		low: "Low"
	},
	phases: {
		wishlist: "Wishlist",
		applied: "Applied",
		interview: "Interview",
		offer: "Offer",
		rejected_withdrawn: "Rejected / Withdrawn"
	},
	substeps: {
		none: "No substep",
		wishlist: "Wishlist",
		applied: "Applied",
		interview: "Interview",
		offer: "Offer",
		rejected_withdrawn: "Rejected / Withdrawn",
		application_review: "Application Review",
		initial_screening: "Initial Screening",
		hr_phone_screen: "HR Phone Screen",
		recruiter_call: "Recruiter Call",
		phone_screening: "Phone Screening",
		technical_phone_screen: "Technical Phone Screen",
		coding_challenge: "Coding Challenge",
		take_home_assignment: "Take-home Assignment",
		technical_interview: "Technical Interview",
		system_design_interview: "System Design Interview",
		behavioral_interview: "Behavioral Interview",
		team_interview: "Team Interview",
		hiring_manager_interview: "Hiring Manager Interview",
		panel_interview: "Panel Interview",
		final_round: "Final Round",
		reference_check: "Reference Check",
		background_check: "Background Check",
		offer_discussion: "Offer Discussion",
		salary_negotiation: "Salary Negotiation"
	},
	stats: {
		totalApplications: "Total Applications",
		active: "Active",
		interviews: "Interviews",
		offers: "Offers",
		rejections: "Rejections"
	},
	messages: {
		welcome: "Welcome to JobTracker!\n\nWould you like to see 2 example job applications to understand how the tracker works?\n\nClick OK to add examples, or Cancel to start with an empty tracker.",
		confirmDelete: "Are you sure you want to delete the application for {position} at {company}?"
	},
	demo: {
		contactPerson1: "Sarah Chen",
		contactPerson2: "Mike Rodriguez",
		notes1: "Great culture fit. Need to research their microservices architecture.",
		notes2: "Early stage startup. High growth potential but risky."
	},
	seo: {
		title: "JobTracker - Free Local Job Tracker | No Login, No Tracking, Your Data Stays Private",
		description: "100% free job application tracker that works locally in your browser. No login required, no data tracking, no servers. Your job search data stays completely private on your device.",
		keywords: "free job tracker, local job application tracker, private job search, no login job tracker, offline job tracker, privacy-first job applications, no tracking career management, local storage job search",
		author: "JobTracker Team",
		ogTitle: "JobTracker - Free Local Job Tracker (No Login Required)",
		ogDescription: "Track job applications privately in your browser. 100% free, no login, no tracking, your data never leaves your device.",
		twitterTitle: "JobTracker - Private Job Application Tracker",
		twitterDescription: "Free local job tracker with complete privacy. No login, no tracking, your job search data stays on your device."
	},
	modals: {
		notes: {
			title: "Notes for {position} at {company}",
			activeSection: "Active Notes",
			archivedSection: "Archived Notes ({count})",
			emptyState: "No notes yet. Add your first note below.",
			addSection: "Add New Note",
			phaseLabelPrefix: " Phase: ",
			placeholder: "Enter your note here...",
			editTitle: "Edit note",
			archiveTitle: "Archive note",
			unarchiveTitle: "Unarchive note",
			addButton: "Add Note"
		},
		tasks: {
			title: "Tasks for {position} at {company}",
			activeSection: "Active Tasks",
			archivedSection: "Archived Tasks ({count})",
			emptyState: "No tasks yet. Add your first task below.",
			addSection: "Add New Task",
			placeholder: "Enter your task here...",
			editTitle: "Edit task",
			archiveTitle: "Archive task",
			unarchiveTitle: "Unarchive task",
			addButton: "Add Task",
			statusTodo: "To Do",
			statusInProgress: "In Progress",
			statusDone: "Done",
			priorityLow: "Low",
			priorityMedium: "Medium",
			priorityHigh: "High"
		},
		contacts: {
			title: "Contacts for {position} at {company}",
			activeSection: "Active Contacts",
			archivedSection: "Archived Contacts ({count})",
			emptyState: "No contacts yet. Add your first contact below.",
			addSection: "Add New Contact",
			editTitle: "Edit contact",
			archiveTitle: "Archive contact",
			unarchiveTitle: "Unarchive contact",
			addButton: "Add Contact",
			placeholderName: "Name",
			placeholderEmail: "Email",
			placeholderPhone: "Phone",
			placeholderCompany: "Company",
			noContacts: "No contacts",
			defaultContact: "Contact",
			validation: {
				nameRequired: "Name is required",
				emailRequired: "Email is required"
			}
		},
		common: {
			save: "Save",
			cancel: "Cancel",
			close: "Close"
		}
	},
	forms: {
		saveChangesTitle: "Save changes",
		cancelEditingTitle: "Cancel editing",
		noDueDate: "No due date",
		placeholderNameEmail: "Name\nEmail"
	},
	footer: {
		madeWith: "Made with",
		by: "by"
	}
};