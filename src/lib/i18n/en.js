// ============================================================================
// ENGLISH TRANSLATIONS
// ============================================================================

const EN_TRANSLATIONS = {
	app: {
		title: "JobTracker"},
	buttons: {
		addApplication: "+ Add Application"},
	common: {
		viewJob: "View Job",
		chooseJob: "Choose a job..."},
	actions: {
		archive: "Archive job"},
	tabs: {
		dashboard: "Dashboard",
		jobs: "Jobs",
		applications: "Applications Board",
		tasks: "Tasks Board",
		calendar: "Calendar",
		contacts: "Contacts",
		resume: "Resume",
		profile: "Profile"},
	headers: {
		dashboard: "Dashboard",
		jobs: "Job Applications",
		applications: "Applications Board",
		tasks: "Tasks Board",
		calendar: "Calendar View",
		contacts: "All Contacts",
		resume: "Resume Builder"},
	kanban: {
		title: "Applications Board",
		totalJobs: "{count} total applications",
		editJob: "Edit Job",
		addJob: "Add Job",
		workflowConfig: "Workflow Configuration",
		workflowDescription: "Select and configure the steps for each phase of this job:"},
	table: {
		headers: {
			priority: "Priority",
			company: "Company",
			position: "Position",
			currentPhase: "Stage",
			substep: "Substep",
			salaryRange: "Salary Range",
			location: "Location",
			sourceUrl: "Source",
			contacts: "Contacts",
			notes: "Notes",
			tasks: "Tasks",
			actions: "Actions"},
		filters: {
			allPriorities: "All Priorities",
			allPhases: "All Phases"},
		placeholders: {
			company: "Company Name",
			position: "Position Title",

			salaryRange: "Salary Range",
			location: "Location",
			sourceUrl: "Job Posting URL"}},
	priorities: {
		high: "High",
		medium: "Medium",
		low: "Low"},
	phases: {
		wishlist: "Wishlist",
		applied: "Applied",
		interview: "Interview",
		offer: "Offer",
		rejected_withdrawn: "Rejected / Withdrawn"},
	substeps: {
		none: "No substep",
		wishlist: "Wishlist",
		applied: "Applied",
		interview: "Interview",
		offer: "Offer",
		rejected_withdrawn: "Rejected / Withdrawn",
		assess_job: "Assess Job",
		research_company: "Research Company",
		prepare_application: "Prepare Application",
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
		salary_negotiation: "Salary Negotiation",
		rejected: "Rejected",
		withdrawn: "Withdrawn"},
	stats: {
		totalApplications: "Total Applications",
		active: "Active",
		interviews: "Interviews",
		offers: "Offers",
		rejections: "Rejections"},
	messages: {
		welcome:
			"Welcome to JobTracker!\n\nWould you like to see 2 example job applications to understand how the tracker works?",
		welcomeConfirm: "Yes, add examples",
		welcomeCancel: "No, leave empty",
		confirmDelete: "Are you sure you want to delete the application for {position} at {company}?",
		confirmArchive: "Are you sure you want to archive the application for {position} at {company}?"},
	resume: {
		basics: {
			title: "Basic Information",
			name: "Full Name",
			label: "Professional Title",
			summary: "Professional Summary",
			email: "Email Address",
			phone: "Phone Number",
			city: "City",
			country: "Country",
			personalStatement: "Personal Statement",
			locationTitle: "Location"
		},
		profiles: {
			title: "Online Profiles",
			type: "Platform",
			url: "Profile URL",
			addProfile: "Add Profile",
			platforms: {
				linkedin: "LinkedIn",
				github: "GitHub",
				twitter: "Twitter",
				website: "Website",
				other: "Other"
			}
		},
		languages: {
			title: "Languages",
			language: "Language",
			fluency: "Fluency Level",
			addLanguage: "Add Language",
			levels: {
				native: "Native",
				fluent: "Fluent",
				intermediate: "Intermediate",
				beginner: "Beginner"
			}
		},
		skills: {
			title: "Skills",
			name: "Skill Category",
			keywords: "Skills",
			addSkill: "Add Skill Category"
		},
		experience: {
			title: "Work Experience",
			company: "Company",
			position: "Position",
			location: "Location",
			startDate: "Start Date",
			endDate: "End Date",
			current: "Current Position",
			summary: "Summary",
			highlights: "Key Achievements (one per line)",
			addExperience: "Add Experience"
		},
		projects: {
			title: "Projects",
			name: "Project Name",
			description: "Description",
			url: "Project URL",
			tags: "Technologies",
			addProject: "Add Project"
		},
		portfolio: {
			title: "Portfolio",
			type: "Type",
			title_field: "Title",
			url: "URL",
			addPortfolio: "Add Portfolio Item",
			types: {
				"case-study": "Case Study",
				artwork: "Artwork",
				website: "Website",
				app: "Application",
				other: "Other"
			}
		},
		education: {
			title: "Education",
			institution: "Institution",
			area: "Field of Study",
			studyType: "Degree/Certificate Type",
			startDate: "Start Date",
			endDate: "End Date",
			addEducation: "Add Education"
		},
		certifications: {
			title: "Certifications",
			type: "Type",
			name: "Certificate Name",
			issuer: "Organization",
			date: "Issue Date",
			addCertification: "Add Certification"
		},
		awards: {
			title: "Awards",
			type: "Award Type",
			title_field: "Award Title",
			issuer: "Awarding Body",
			date: "Award Date",
			addAward: "Add Award"
		},
		volunteer: {
			title: "Volunteer Experience",
			organization: "Organization",
			role: "Role",
			startDate: "Start Date",
			endDate: "End Date",
			addVolunteer: "Add Volunteer Experience"
		},
		interests: {
			title: "Interests",
			type: "Category",
			value: "Description",
			addInterest: "Add Interest"
		},
		actions: {
			export: "Export JSON",
			import: "Import JSON",
			clear: "Clear All",
			add: "Add",
			remove: "Remove"
		}
	},
	demo: {
		notes1: "Great culture fit. Need to research their microservices architecture.",
		notes2: "Early stage startup. High growth potential but risky."},
	seo: {
		title: "JobTracker - Free Local Job Tracker | No Login, No Tracking, Your Data Stays Private",
		description:
			"100% free job application tracker that works locally in your browser. No login required, no data tracking, no servers. Your job search data stays completely private on your device.",
		keywords:
			"free job tracker, local job application tracker, private job search, no login job tracker, offline job tracker, privacy-first job applications, no tracking career management, local storage job search",
		author: "JobTracker Team",
		ogTitle: "JobTracker - Free Local Job Tracker (No Login Required)",
		ogDescription:
			"Track job applications privately in your browser. 100% free, no login, no tracking, your data never leaves your device.",
		twitterTitle: "JobTracker - Private Job Application Tracker",
		twitterDescription:
			"Free local job tracker with complete privacy. No login, no tracking, your job search data stays on your device."},
	modals: {
		notes: {
			title: "Notes for {position} at {company}",
			activeSection: "Active Notes",
			archivedSection: "Archived Notes ({count})",
			emptyState: "No notes yet. Add your first note below.",
			addSection: "Add New Note",
			placeholder: "Enter your note here...",
			editTitle: "Edit note",
			archiveTitle: "Archive note",
			unarchiveTitle: "Unarchive note",
			addButton: "Add Note"},
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
			allJobs: "All Jobs",
			addTask: "Add Task",
			selectJob: "Select Job",
			chooseJob: "Choose a job...",
			taskDescription: "Task Description",
			taskPlaceholder: "Enter task description...",
			validation: {
				jobRequired: "Please select a job",
				taskRequired: "Please enter a task description"},
			daysOverdue: "{days} days overdue",
			dueToday: "Due today",
			dueTomorrow: "Due tomorrow",
			dueInDays: "Due in {days} days",
			status: "Status",
			priority: "Priority",
			dueDate: "Due Date",
			duration: "Duration",
			statusTodo: "To Do",
			statusInProgress: "In Progress",
			statusDone: "Done",
			priorityLow: "Low",
			priorityMedium: "Medium",
			priorityHigh: "High"},
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
				emailRequired: "Email is required"}},
		common: {
			save: "Save",
			cancel: "Cancel",
			close: "Close",
			delete: "Delete",
			ok: "OK",
			yes: "Yes",
			no: "No"},
		dialogs: {
			alert: "Alert",
			confirm: "Confirm",
			prompt: "Input Required"}},
	forms: {
		saveChangesTitle: "Save changes",
		cancelEditingTitle: "Cancel editing",
		noDueDate: "No due date",
		placeholderNameEmail: "Name\nEmail"},
	footer: {
		madeWith: "Made with",
		by: "by",
		foundBug: "Found a bug?"},
	calendar: {
		title: "Calendar View",
		today: "Today",
		month: "Month",
		week: "Week",
		day: "Day",
		previous: "Previous",
		next: "Next",
		noEvents: "No events scheduled",
		events: "events",
		applied: "Applied",
		task: "Task",
		interview: "Interview",
		followUp: "Follow-up",
		months: [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		],
		weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		weekdaysFull: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
	validation: {
		companyPositionRequired: "Company and position are required",
		currentStepRequired: "Current step is required"},
	contactsView: {
		title: "All Contacts",
		totalContacts: "{count} total contacts",
		emptyState: "No contacts found. Add contacts to your jobs to see them here.",
		nameHeader: "Name",
		emailHeader: "Email",
		phoneHeader: "Phone",
		roleHeader: "Role",
		companyHeader: "Company",
		jobHeader: "Position",
		actionsHeader: "Actions",
		namePlaceholder: "Contact name",
		emailPlaceholder: "email@example.com",
		phonePlaceholder: "+1 (555) 123-4567",
		rolePlaceholder: "Role/Title",
		addContact: "Add Contact",
		addContactTitle: "Add New Contact",
		selectJob: "Select a job...",
		noJobsAvailable: "No jobs available. Please create a job first.",
		deleteTitle: "Delete contact",
		deleteConfirmation: "Are you sure you want to delete {name}?",
		validation: {
			nameRequired: "Name is required",
			jobRequired: "Please select a job"}},
	dashboard: {
		stats: {
			title: "Overview",
			totalJobs: "Total Jobs",
			activeTasks: "Active Tasks",
			totalContacts: "Total Contacts",
			totalNotes: "Total Notes",
			activeApplications: "Active Applications",
			interviews: "Interviews",
			offers: "Offers",
			thisWeek: "This Week"},
		todayTasks: {
			title: "Today's Tasks",
			noTasks: "No tasks scheduled for today"},
		tomorrowTasks: {
			title: "Tomorrow's Tasks",
			noTasks: "No tasks scheduled for tomorrow"},
		recentActivity: {
			title: "Recent Activity",
			noActivity: "No recent activity"}}};
