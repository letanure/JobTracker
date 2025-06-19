// ============================================================================
// MINI DOM UTILITY LIBRARY (jQuery-style)
// ============================================================================

const $ = {
	// Get element by ID
	id: (id) => document.getElementById(id),

	// Query selector (single element)
	qs: (selector) => document.querySelector(selector),

	// Query selector all (multiple elements)
	qsa: (selector) => document.querySelectorAll(selector),

	// Create element with optional class and text
	create: (tag, className, textContent) => {
		const element = document.createElement(tag);
		if (className) element.className = className;
		if (textContent) element.textContent = textContent;
		return element;
	},

	// Add event listener
	on: (element, event, handler) => element.addEventListener(event, handler),

	// Set innerHTML
	html: (element, html) => (element.innerHTML = html),

	// Set textContent
	text: (element, text) => (element.textContent = text),

	// Show/hide element
	show: (element) => (element.style.display = "block"),
	hide: (element) => (element.style.display = "none"),

	// Toggle display
	toggle: (element) => {
		const isVisible = element.style.display === "block";
		element.style.display = isVisible ? "none" : "block";
	},
};

// ============================================================================
// MINI DATA PERSISTENCE LIBRARY
// ============================================================================

const DataStore = {
	// Storage key for job tracker data
	STORAGE_KEY: "jobTrackerData",

	// Save data to storage
	save: (data) => {
		try {
			localStorage.setItem(DataStore.STORAGE_KEY, JSON.stringify(data));
			return true;
		} catch (error) {
			console.error("Error saving data:", error);
			return false;
		}
	},

	// Load data from storage
	load: () => {
		try {
			const savedData = localStorage.getItem(DataStore.STORAGE_KEY);
			return savedData ? JSON.parse(savedData) : null;
		} catch (error) {
			console.error("Error loading data:", error);
			return null;
		}
	},

	// Check if data exists in storage
	exists: () => {
		return localStorage.getItem(DataStore.STORAGE_KEY) !== null;
	},

	// Clear all data from storage
	clear: () => {
		try {
			localStorage.removeItem(DataStore.STORAGE_KEY);
			return true;
		} catch (error) {
			console.error("Error clearing data:", error);
			return false;
		}
	},

	// Get storage size (in characters)
	getSize: () => {
		const data = localStorage.getItem(DataStore.STORAGE_KEY);
		return data ? data.length : 0;
	},

	// Export data as JSON string (for backup/export features)
	export: () => {
		const data = DataStore.load();
		return data ? JSON.stringify(data, null, 2) : null;
	},

	// Import data from JSON string (for restore/import features)
	import: (jsonString) => {
		try {
			const data = JSON.parse(jsonString);
			return DataStore.save(data);
		} catch (error) {
			console.error("Error importing data:", error);
			return false;
		}
	},
};

// ============================================================================
// MINI I18N LIBRARY
// ============================================================================

const I18n = {
	// Current language
	currentLanguage: "en",

	// Language detection from browser
	detectLanguage: () => {
		const browserLang = navigator.language || navigator.userLanguage;
		const langCode = browserLang.split("-")[0];
		return I18n.translations[langCode] ? langCode : "en";
	},

	// Set current language
	setLanguage: (lang) => {
		if (I18n.translations[lang]) {
			I18n.currentLanguage = lang;
			DataStore.save({ ...DataStore.load(), language: lang });
			return true;
		}
		return false;
	},

	// Get translated text
	t: (key, params = {}) => {
		const keys = key.split(".");
		let translation = I18n.translations[I18n.currentLanguage];

		for (const k of keys) {
			translation = translation?.[k];
		}

		if (!translation) {
			console.warn(
				`Translation missing for key: ${key} in language: ${I18n.currentLanguage}`,
			);
			return key;
		}

		// Replace parameters in translation
		return translation.replace(/\{(\w+)\}/g, (match, param) => {
			return params[param] !== undefined ? params[param] : match;
		});
	},

	// Get available languages
	getLanguages: () => Object.keys(I18n.translations),

	// Initialize language from storage or browser
	init: () => {
		const savedData = DataStore.load();
		const savedLanguage = savedData?.language;
		I18n.currentLanguage = savedLanguage || I18n.detectLanguage();
	},
};

// Translation constants
I18n.translations = {
	en: {
		app: {
			title: "Job Search Tracker",
		},
		buttons: {
			addApplication: "+ Add Application",
			save: "Save",
			edit: "Edit",
			delete: "Delete",
			cancel: "Cancel",
		},
		table: {
			headers: {
				priority: "Priority",
				company: "Company",
				position: "Position",
				appliedDate: "Applied Date",
				status: "Status",
				currentPhase: "Current Phase",
				nextTask: "Next Task",
				dueDate: "Due Date",
				contactPerson: "Contact Person",
				salaryRange: "Salary Range",
				location: "Location",
				notes: "Notes",
				actions: "Actions",
			},
			filters: {
				allPriorities: "All Priorities",
				allStatuses: "All Statuses",
				allPhases: "All Phases",
				highPriority: "High Priority",
				mediumPriority: "Medium Priority",
				lowPriority: "Low Priority",
			},
			placeholders: {
				companyName: "Company Name",
				positionTitle: "Position Title",
				nextTask: "Next Task",
				nameEmail: "Name & Email",
				salaryRange: "Salary Range",
				location: "Location",
				notes: "Notes",
			},
		},
		statuses: {
			applied: "Applied",
			phoneScreening: "Phone Screening",
			interview: "Interview",
			finalRound: "Final Round",
			offer: "Offer",
			rejected: "Rejected",
			withdrawn: "Withdrawn",
		},
		priorities: {
			high: "High",
			medium: "Medium",
			low: "Low",
		},
		phases: {
			applicationReview: "Application Review",
			initialScreening: "Initial Screening",
			hrPhoneScreen: "HR Phone Screen",
			recruiterCall: "Recruiter Call",
			technicalPhoneScreen: "Technical Phone Screen",
			codingChallenge: "Coding Challenge",
			takeHomeAssignment: "Take-home Assignment",
			technicalInterview: "Technical Interview",
			systemDesignInterview: "System Design Interview",
			behavioralInterview: "Behavioral Interview",
			teamInterview: "Team Interview",
			hiringManagerInterview: "Hiring Manager Interview",
			panelInterview: "Panel Interview",
			finalRound: "Final Round",
			referenceCheck: "Reference Check",
			backgroundCheck: "Background Check",
			offerDiscussion: "Offer Discussion",
			salaryNegotiation: "Salary Negotiation",
		},
		stats: {
			totalApplications: "Total Applications",
			active: "Active",
			interviews: "Interviews",
			offers: "Offers",
			rejections: "Rejections",
		},
		messages: {
			welcome:
				"Welcome to Job Search Tracker!\n\nWould you like to see 2 example job applications to understand how the tracker works?\n\nClick OK to add examples, or Cancel to start with an empty tracker.",
			errorLoading:
				"There was an error loading your data.\n\nWould you like to start with 2 example job applications?",
			confirmDelete:
				"Are you sure you want to delete the application for {position} at {company}?",
		},
		demo: {
			nextTask1: "Prepare system design",
			nextTask2: "Wait for callback",
			contactPerson1: "Sarah Chen",
			contactPerson2: "Mike Rodriguez",
			notes1:
				"Great culture fit. Need to research their microservices architecture.",
			notes2: "Early stage startup. High growth potential but risky.",
		},
	},
	pt: {
		app: {
			title: "Rastreador de Busca de Emprego",
		},
		buttons: {
			addApplication: "+ Adicionar Candidatura",
			save: "Salvar",
			edit: "Editar",
			delete: "Excluir",
			cancel: "Cancelar",
		},
		table: {
			headers: {
				priority: "Prioridade",
				company: "Empresa",
				position: "Cargo",
				appliedDate: "Data da Candidatura",
				status: "Status",
				currentPhase: "Fase Atual",
				nextTask: "Próxima Tarefa",
				dueDate: "Data Limite",
				contactPerson: "Pessoa de Contato",
				salaryRange: "Faixa Salarial",
				location: "Localização",
				notes: "Notas",
				actions: "Ações",
			},
			filters: {
				allPriorities: "Todas as Prioridades",
				allStatuses: "Todos os Status",
				allPhases: "Todas as Fases",
				highPriority: "Prioridade Alta",
				mediumPriority: "Prioridade Média",
				lowPriority: "Prioridade Baixa",
			},
			placeholders: {
				companyName: "Nome da Empresa",
				positionTitle: "Título do Cargo",
				nextTask: "Próxima Tarefa",
				nameEmail: "Nome e Email",
				salaryRange: "Faixa Salarial",
				location: "Localização",
				notes: "Notas",
			},
		},
		statuses: {
			applied: "Candidatura Enviada",
			phoneScreening: "Triagem por Telefone",
			interview: "Entrevista",
			finalRound: "Etapa Final",
			offer: "Oferta",
			rejected: "Rejeitado",
			withdrawn: "Retirado",
		},
		priorities: {
			high: "Alta",
			medium: "Média",
			low: "Baixa",
		},
		phases: {
			applicationReview: "Análise da Candidatura",
			initialScreening: "Triagem Inicial",
			hrPhoneScreen: "Triagem por Telefone - RH",
			recruiterCall: "Ligação do Recrutador",
			technicalPhoneScreen: "Triagem Técnica por Telefone",
			codingChallenge: "Desafio de Programação",
			takeHomeAssignment: "Tarefa para Casa",
			technicalInterview: "Entrevista Técnica",
			systemDesignInterview: "Entrevista de Design de Sistema",
			behavioralInterview: "Entrevista Comportamental",
			teamInterview: "Entrevista com a Equipe",
			hiringManagerInterview: "Entrevista com Gerente de Contratação",
			panelInterview: "Entrevista em Painel",
			finalRound: "Etapa Final",
			referenceCheck: "Verificação de Referências",
			backgroundCheck: "Verificação de Antecedentes",
			offerDiscussion: "Discussão da Oferta",
			salaryNegotiation: "Negociação Salarial",
		},
		stats: {
			totalApplications: "Total de Candidaturas",
			active: "Ativas",
			interviews: "Entrevistas",
			offers: "Ofertas",
			rejections: "Rejeições",
		},
		messages: {
			welcome:
				"Bem-vindo ao Rastreador de Busca de Emprego!\n\nGostaria de ver 2 exemplos de candidaturas para entender como o rastreador funciona?\n\nClique OK para adicionar exemplos, ou Cancelar para começar com um rastreador vazio.",
			errorLoading:
				"Houve um erro ao carregar seus dados.\n\nGostaria de começar com 2 exemplos de candidaturas?",
			confirmDelete:
				"Tem certeza de que deseja excluir a candidatura para {position} na {company}?",
		},
		demo: {
			nextTask1: "Preparar design de sistema",
			nextTask2: "Aguardar retorno",
			contactPerson1: "Sarah Chen",
			contactPerson2: "Mike Rodriguez",
			notes1:
				"Ótimo encaixe cultural. Preciso pesquisar sua arquitetura de microsserviços.",
			notes2:
				"Startup em estágio inicial. Alto potencial de crescimento, mas arriscado.",
		},
	},
};

// ============================================================================
// CONSTANTS AND DATA
// ============================================================================

const STATUSES = [
	"applied",
	"phoneScreening",
	"interview",
	"finalRound",
	"offer",
	"rejected",
	"withdrawn",
];

const PRIORITIES = ["high", "medium", "low"];

const PHASES = [
	"applicationReview",
	"initialScreening",
	"hrPhoneScreen",
	"recruiterCall",
	"technicalPhoneScreen",
	"codingChallenge",
	"takeHomeAssignment",
	"technicalInterview",
	"systemDesignInterview",
	"behavioralInterview",
	"teamInterview",
	"hiringManagerInterview",
	"panelInterview",
	"finalRound",
	"referenceCheck",
	"backgroundCheck",
	"offerDiscussion",
	"salaryNegotiation",
];

// Helper functions to get translated values
const getStatusText = (statusKey) => I18n.t(`statuses.${statusKey}`);
const getPriorityText = (priorityKey) => I18n.t(`priorities.${priorityKey}`);
const getPhaseText = (phaseKey) => I18n.t(`phases.${phaseKey}`);

// Demo data for first-time users
const DEMO_DATA = [
	{
		id: 1,
		priority: "high",
		company: "TechCorp Inc",
		position: "Senior Software Engineer",
		appliedDate: "2025-06-15",
		status: "interview",
		currentPhase: "technicalInterview",
		nextTask: "demo.nextTask1",
		dueDate: "2025-06-22",
		contactPerson: "demo.contactPerson1",
		contactEmail: "sarah@techcorp.com",
		salaryRange: "$120k - $150k",
		location: "San Francisco, CA",
		notes: "demo.notes1",
	},
	{
		id: 2,
		priority: "medium",
		company: "StartupXYZ",
		position: "Full Stack Developer",
		appliedDate: "2025-06-12",
		status: "phoneScreening",
		currentPhase: "hrPhoneScreen",
		nextTask: "demo.nextTask2",
		dueDate: "2025-06-20",
		contactPerson: "demo.contactPerson2",
		contactEmail: "hiring@startupxyz.com",
		salaryRange: "$90k - $110k + equity",
		location: "Remote",
		notes: "demo.notes2",
	},
];

// Helper function to get demo data with translations
const getDemoData = () => {
	return DEMO_DATA.map((job) => ({
		...job,
		nextTask: job.nextTask.startsWith("demo.")
			? I18n.t(job.nextTask)
			: job.nextTask,
		contactPerson: job.contactPerson.startsWith("demo.")
			? I18n.t(job.contactPerson)
			: job.contactPerson,
		notes: job.notes.startsWith("demo.") ? I18n.t(job.notes) : job.notes,
	}));
};

let jobsData = [];
let originalData = [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getStatusClass(status) {
	return status.toLowerCase().replace(/\s+/g, "_");
}

function getUniqueValues(array, property) {
	return [...new Set(array.map((item) => item[property]))];
}

function createElement(tag, className, textContent) {
	return $.create(tag, className, textContent);
}

function createOption(value, text, selected = false) {
	const option = createElement("option");
	option.value = value;
	option.textContent = text;
	if (selected) option.selected = true;
	return option;
}

function updateStaticTexts() {
	// Update page title and header
	$.text($.id("pageTitle"), I18n.t("app.title"));
	$.text($.id("appTitle"), I18n.t("app.title"));

	// Update button
	$.text($.id("addAppBtn"), I18n.t("buttons.addApplication"));

	// Update table headers
	$.text($.id("priorityHeader"), I18n.t("table.headers.priority"));
	$.text($.id("companyHeader"), I18n.t("table.headers.company"));
	$.text($.id("positionHeader"), I18n.t("table.headers.position"));
	$.text($.id("appliedDateHeader"), I18n.t("table.headers.appliedDate"));
	$.text($.id("statusHeader"), I18n.t("table.headers.status"));
	$.text($.id("currentPhaseHeader"), I18n.t("table.headers.currentPhase"));
	$.text($.id("nextTaskHeader"), I18n.t("table.headers.nextTask"));
	$.text($.id("dueDateHeader"), I18n.t("table.headers.dueDate"));
	$.text($.id("contactPersonHeader"), I18n.t("table.headers.contactPerson"));
	$.text($.id("salaryRangeHeader"), I18n.t("table.headers.salaryRange"));
	$.text($.id("locationHeader"), I18n.t("table.headers.location"));
	$.text($.id("notesHeader"), I18n.t("table.headers.notes"));
	$.text($.id("actionsHeader"), I18n.t("table.headers.actions"));

	// Update stats labels
	$.text($.id("totalAppsLabel"), I18n.t("stats.totalApplications"));
	$.text($.id("activeAppsLabel"), I18n.t("stats.active"));
	$.text($.id("interviewsLabel"), I18n.t("stats.interviews"));
	$.text($.id("offersLabel"), I18n.t("stats.offers"));
	$.text($.id("rejectionsLabel"), I18n.t("stats.rejections"));
}

function refreshInterface() {
	updateStaticTexts();
	populateTable(jobsData);
	generateHeaderFilters();
	generateDataLists();
	updateStats();
}

// ============================================================================
// SELECT COMPONENT CREATORS
// ============================================================================

function createStatusSelect(
	selectedValue = "",
	includeEmpty = true,
	className = "filter-select",
	onChange = null,
) {
	const select = createElement("select", className);

	if (includeEmpty) {
		select.appendChild(createOption("", I18n.t("table.filters.allStatuses")));
	}

	for (const status of STATUSES) {
		select.appendChild(
			createOption(status, getStatusText(status), status === selectedValue),
		);
	}

	if (onChange) {
		select.onchange = onChange;
	}

	return select;
}

function createPrioritySelect(
	selectedValue = "",
	includeEmpty = true,
	className = "filter-select",
	onChange = null,
) {
	const select = createElement("select", className);

	if (includeEmpty) {
		select.appendChild(createOption("", I18n.t("table.filters.allPriorities")));
	}

	for (const priority of PRIORITIES) {
		const text = includeEmpty
			? I18n.t(`table.filters.${priority}Priority`)
			: getPriorityText(priority);
		select.appendChild(
			createOption(priority, text, priority === selectedValue),
		);
	}

	if (onChange) {
		select.onchange = onChange;
	}

	return select;
}

function createPhaseSelect(
	selectedValue = "",
	includeEmpty = true,
	className = "filter-select",
	onChange = null,
) {
	const select = createElement("select", className);

	if (includeEmpty) {
		select.appendChild(createOption("", I18n.t("table.filters.allPhases")));
	}

	for (const phase of PHASES) {
		select.appendChild(
			createOption(phase, getPhaseText(phase), phase === selectedValue),
		);
	}

	if (onChange) {
		select.onchange = onChange;
	}

	return select;
}

// ============================================================================
// DATA PERSISTENCE
// ============================================================================

function saveToLocalStorage() {
	DataStore.save(jobsData);
}

function loadJobsData() {
	// Initialize i18n first
	I18n.init();

	try {
		const savedData = DataStore.load();
		let shouldShowDemo = false;

		if (savedData) {
			jobsData = savedData;
			if (jobsData.length === 0) {
				shouldShowDemo = true;
			}
		} else {
			shouldShowDemo = true;
			jobsData = [];
		}

		if (shouldShowDemo) {
			const userWantsDemoData = confirm(I18n.t("messages.welcome"));

			if (userWantsDemoData) {
				jobsData = getDemoData();
				saveToLocalStorage();
			}
		}

		refreshInterface();
		initializeData();
	} catch (error) {
		console.error("Error loading jobs data:", error);
		const userWantsDemoData = confirm(I18n.t("messages.errorLoading"));

		jobsData = userWantsDemoData ? getDemoData() : [];
		saveToLocalStorage();
		refreshInterface();
		initializeData();
	}
}

// ============================================================================
// DATALIST GENERATORS
// ============================================================================

function createOrUpdateDatalist(id, values) {
	let datalist = $.id(id);
	if (!datalist) {
		datalist = createElement("datalist");
		datalist.id = id;
		document.body.appendChild(datalist);
	}

	$.html(datalist, "");
	for (const value of values) {
		datalist.appendChild(createOption(value));
	}
}

function generateDataLists() {
	const existingCompanies = getUniqueValues(jobsData, "company");
	const existingPositions = getUniqueValues(jobsData, "position");
	const existingLocations = getUniqueValues(jobsData, "location");

	createOrUpdateDatalist("companiesDatalist", existingCompanies);
	createOrUpdateDatalist("positionsDatalist", existingPositions);
	createOrUpdateDatalist("locationsDatalist", existingLocations);
}

// ============================================================================
// DROPDOWN FILTER GENERATORS
// ============================================================================

function createDropdownOption(text, clickHandler) {
	const option = createElement("div", "dropdown-option", text);
	option.onclick = clickHandler;
	return option;
}

function generateDropdown(
	dropdownId,
	values,
	filterFunction,
	allLabel,
	textMapper = null,
) {
	const dropdown = $.id(dropdownId);
	$.html(dropdown, "");

	// Add "All" option
	dropdown.appendChild(
		createDropdownOption(allLabel, () => {
			filterFunction("");
			closeDropdown(dropdownId);
		}),
	);

	// Add value options
	for (const value of values) {
		const displayText = textMapper ? textMapper(value) : value;
		dropdown.appendChild(
			createDropdownOption(displayText, () => {
				filterFunction(value);
				closeDropdown(dropdownId);
			}),
		);
	}
}

function generateHeaderFilters() {
	const existingPriorities = getUniqueValues(jobsData, "priority");
	const existingStatuses = getUniqueValues(jobsData, "status");
	const existingPhases = getUniqueValues(jobsData, "currentPhase");

	generateDropdown(
		"priorityDropdown",
		existingPriorities,
		filterByPriority,
		I18n.t("table.filters.allPriorities"),
		getPriorityText,
	);
	generateDropdown(
		"statusDropdown",
		existingStatuses,
		filterByStatus,
		I18n.t("table.filters.allStatuses"),
		getStatusText,
	);
	generateDropdown(
		"phaseDropdown",
		existingPhases,
		filterByPhase,
		I18n.t("table.filters.allPhases"),
		getPhaseText,
	);
}

// ============================================================================
// DROPDOWN UI CONTROLS
// ============================================================================

function toggleDropdown(dropdownId) {
	const dropdown = $.id(dropdownId);
	const isVisible = dropdown.style.display === "block";

	// Close all dropdowns first
	for (const d of $.qsa(".filter-dropdown")) {
		$.hide(d);
	}

	// Toggle the clicked dropdown
	dropdown.style.display = isVisible ? "none" : "block";
}

function closeDropdown(dropdownId) {
	$.hide($.id(dropdownId));
}

// ============================================================================
// TABLE MANAGEMENT
// ============================================================================

function populateTable(jobs) {
	const tbody = $.id("jobTableBody");
	$.html(tbody, "");

	for (const job of jobs) {
		const row = tbody.insertRow();
		row.innerHTML = `
            <td class="priority-cell"><span class="priority priority-${job.priority.toLowerCase()}"></span>${getPriorityText(job.priority)}</td>
            <td class="company-name">${job.company}</td>
            <td>${job.position}</td>
            <td class="date">${job.appliedDate}</td>
            <td><span class="status status-${getStatusClass(job.status)}">${getStatusText(job.status)}</span></td>
            <td>${getPhaseText(job.currentPhase)}</td>
            <td><span class="next-task">${job.nextTask}</span></td>
            <td class="date">${job.dueDate}</td>
            <td class="contact">${job.contactPerson}<br>${job.contactEmail}</td>
            <td class="salary">${job.salaryRange}</td>
            <td>${job.location}</td>
            <td class="notes">${job.notes}</td>
            <td class="actions-cell">
                <button onclick="editRow(this)" class="action-btn edit-btn">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button onclick="deleteJob(${job.id})" class="action-btn delete-btn">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </td>
        `;

		// Add double-click event listener to the row
		$.on(row, "dblclick", function (event) {
			// Don't trigger edit if clicking on action buttons
			if (event.target.closest(".actions-cell")) {
				return;
			}

			// Find the edit button and trigger edit
			const editButton = this.querySelector(".edit-btn");
			if (editButton) {
				editRow(editButton);
			}
		});
	}
}

function initializeData() {
	const rows = $.qsa("#jobTableBody tr");
	originalData = Array.from(rows).map((row) => row.innerHTML);
	updateStats();
}

// ============================================================================
// ROW OPERATIONS
// ============================================================================

function addRow() {
	const tbody = $.id("jobTableBody");
	const newRow = tbody.insertRow(0);

	// Create and configure cells
	const cells = {
		priority: newRow.insertCell(),
		company: newRow.insertCell(),
		position: newRow.insertCell(),
		appliedDate: newRow.insertCell(),
		status: newRow.insertCell(),
		currentPhase: newRow.insertCell(),
		nextTask: newRow.insertCell(),
		dueDate: newRow.insertCell(),
		contact: newRow.insertCell(),
		salary: newRow.insertCell(),
		location: newRow.insertCell(),
		notes: newRow.insertCell(),
		actions: newRow.insertCell(),
	};

	// Add CSS classes
	cells.priority.className = "priority-cell";
	cells.company.className = "company-name";
	cells.appliedDate.className = "date";
	cells.dueDate.className = "date";
	cells.contact.className = "contact";
	cells.salary.className = "salary";
	cells.notes.className = "notes";

	// Add form controls
	cells.priority.appendChild(createPrioritySelect("medium", false, "editable"));
	cells.status.appendChild(createStatusSelect("applied", false, "editable"));
	cells.currentPhase.appendChild(
		createPhaseSelect("applicationReview", false, "editable"),
	);

	// Add input fields
	const inputFields = [
		{
			cell: cells.company,
			placeholder: I18n.t("table.placeholders.companyName"),
			list: "companiesDatalist",
		},
		{
			cell: cells.position,
			placeholder: I18n.t("table.placeholders.positionTitle"),
			list: "positionsDatalist",
		},
		{
			cell: cells.appliedDate,
			type: "date",
			value: new Date().toISOString().split("T")[0],
		},
		{
			cell: cells.nextTask,
			placeholder: I18n.t("table.placeholders.nextTask"),
		},
		{ cell: cells.dueDate, type: "date" },
		{
			cell: cells.contact,
			placeholder: I18n.t("table.placeholders.nameEmail"),
		},
		{
			cell: cells.salary,
			placeholder: I18n.t("table.placeholders.salaryRange"),
		},
		{
			cell: cells.location,
			placeholder: I18n.t("table.placeholders.location"),
			list: "locationsDatalist",
		},
		{ cell: cells.notes, placeholder: I18n.t("table.placeholders.notes") },
	];

	for (const field of inputFields) {
		const input = createElement("input", "editable");
		input.placeholder = field.placeholder || "";
		if (field.type) input.type = field.type;
		if (field.value) input.value = field.value;
		if (field.list) input.setAttribute("list", field.list);
		field.cell.appendChild(input);
	}

	// Add save button
	cells.actions.innerHTML =
		'<button onclick="saveRow(this)" class="action-btn edit-btn"><span class="material-symbols-outlined">save</span></button>';

	updateStats();
}

function getJobIdFromRow(row) {
	const deleteButton = row.querySelector('[onclick*="deleteJob"]');
	return deleteButton
		? parseInt(deleteButton.getAttribute("onclick").match(/\d+/)[0])
		: null;
}

function editRow(button) {
	const row = button.closest("tr");
	const cells = row.cells;
	const jobId = getJobIdFromRow(row);
	const job = jobsData.find((j) => j.id === jobId);

	if (!job) return;

	// Store original content for cancel functionality
	row.dataset.originalContent = row.innerHTML;

	// Convert row to editable form
	cells[0].innerHTML = `<div class="priority-cell">${createPrioritySelect(job.priority, false, "editable").outerHTML}</div>`;
	cells[1].innerHTML = `<input class="editable" value="${job.company}" list="companiesDatalist">`;
	cells[2].innerHTML = `<input class="editable" value="${job.position}" list="positionsDatalist">`;
	cells[3].innerHTML = `<input class="editable" type="date" value="${job.appliedDate}">`;
	cells[4].innerHTML = `${createStatusSelect(job.status, false, "editable").outerHTML}`;
	cells[5].innerHTML = `${createPhaseSelect(job.currentPhase, false, "editable").outerHTML}`;
	cells[6].innerHTML = `<input class="editable" value="${job.nextTask}">`;
	cells[7].innerHTML = `<input class="editable" type="date" value="${job.dueDate}">`;
	cells[8].innerHTML = `<textarea class="editable contact-textarea" placeholder="Name&#10;Email">${job.contactPerson}&#10;${job.contactEmail}</textarea>`;
	cells[9].innerHTML = `<input class="editable" value="${job.salaryRange}">`;
	cells[10].innerHTML = `<input class="editable" value="${job.location}" list="locationsDatalist">`;
	cells[11].innerHTML = `<textarea class="editable notes-textarea">${job.notes}</textarea>`;
	cells[12].innerHTML = `
		<div class="actions-cell">
			<button onclick="saveEditedRow(this, ${jobId})" class="action-btn edit-btn">
				<span class="material-symbols-outlined">save</span>
			</button>
			<button onclick="cancelEdit(this)" class="action-btn cancel-btn">
				<span class="material-symbols-outlined">close</span>
			</button>
		</div>
	`;
}

function extractFormData(cells) {
	const contactText = cells[8].querySelector("textarea").value;
	const contactLines = contactText.split("\n");

	return {
		priority: cells[0].querySelector("select").value,
		company: cells[1].querySelector("input").value,
		position: cells[2].querySelector("input").value,
		appliedDate: cells[3].querySelector("input").value,
		status: cells[4].querySelector("select").value,
		currentPhase: cells[5].querySelector("select").value,
		nextTask: cells[6].querySelector("input").value,
		dueDate: cells[7].querySelector("input").value,
		contactPerson: contactLines[0] || "",
		contactEmail: contactLines[1] || "",
		salaryRange: cells[9].querySelector("input").value,
		location: cells[10].querySelector("input").value,
		notes: cells[11].querySelector("textarea").value,
	};
}

function saveRow(button) {
	const row = button.closest("tr");
	const cells = row.cells;
	const formData = extractFormData(cells);

	const newJob = {
		id: Date.now(),
		...formData,
	};

	jobsData.unshift(newJob);
	saveToLocalStorage();
	refreshInterface();
}

function saveEditedRow(button, jobId) {
	const row = button.closest("tr");
	const cells = row.cells;
	const jobIndex = jobsData.findIndex((job) => job.id === jobId);

	if (jobIndex === -1) return;

	const formData = extractFormData(cells);
	jobsData[jobIndex] = { ...jobsData[jobIndex], ...formData };

	saveToLocalStorage();
	refreshInterface();
}

function cancelEdit(button) {
	const row = button.closest("tr");

	if (row.dataset.originalContent) {
		row.innerHTML = row.dataset.originalContent;
		delete row.dataset.originalContent;
	}
}

function deleteJob(jobId) {
	const jobToDelete = jobsData.find((job) => job.id === jobId);
	if (!jobToDelete) return;

	const confirmed = confirm(
		I18n.t("messages.confirmDelete", {
			position: jobToDelete.position,
			company: jobToDelete.company,
		}),
	);

	if (confirmed) {
		jobsData = jobsData.filter((job) => job.id !== jobId);
		saveToLocalStorage();
		refreshInterface();
	}
}

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================

function filterByStatus(status) {
	const filteredJobs = status
		? jobsData.filter((job) => job.status === status)
		: jobsData;
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

function filterByPriority(priority) {
	const filteredJobs = priority
		? jobsData.filter((job) => job.priority === priority)
		: jobsData;
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

function filterByPhase(phase) {
	const filteredJobs = phase
		? jobsData.filter((job) => job.currentPhase === phase)
		: jobsData;
	populateTable(filteredJobs);
	updateStats(filteredJobs);
}

// ============================================================================
// STATISTICS
// ============================================================================

function updateStats(filteredJobs = null) {
	const jobs = filteredJobs || jobsData;
	let total = jobs.length;
	let active = 0;
	let interviews = 0;
	let offers = 0;
	let rejections = 0;

	for (const job of jobs) {
		const status = job.status;
		if (status !== "Rejected" && status !== "Withdrawn") active++;
		if (status.includes("Interview") || status === "Final Round") interviews++;
		if (status === "Offer") offers++;
		if (status === "Rejected") rejections++;
	}

	$.text($.id("totalApps"), total);
	$.text($.id("activeApps"), active);
	$.text($.id("interviews"), interviews);
	$.text($.id("offers"), offers);
	$.text($.id("rejections"), rejections);
}

// ============================================================================
// EVENT LISTENERS AND INITIALIZATION
// ============================================================================

// Close dropdowns when clicking outside
$.on(document, "click", function (event) {
	if (!event.target.closest(".header-with-filter")) {
		for (const dropdown of $.qsa(".filter-dropdown")) {
			$.hide(dropdown);
		}
	}
});

// Initialize on page load
$.on(document, "DOMContentLoaded", loadJobsData);
