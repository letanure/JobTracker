// ============================================================================
// MINI DOM UTILITY LIBRARY (jQuery-style)
// ============================================================================

// jQuery-style DOM wrapper class
class DOMElement {
	constructor(element) {
		this.element = element;
	}

	// Chainable text method
	text(content) {
		if (content === undefined) {
			return this.element.textContent;
		}
		this.element.textContent = content;
		return this;
	}

	// Chainable html method
	html(content) {
		if (content === undefined) {
			return this.element.innerHTML;
		}
		this.element.innerHTML = content;
		return this;
	}

	// Chainable show/hide methods
	show() {
		this.element.style.display = "block";
		return this;
	}

	hide() {
		this.element.style.display = "none";
		return this;
	}

	toggle() {
		const isVisible = this.element.style.display === "block";
		this.element.style.display = isVisible ? "none" : "block";
		return this;
	}

	// Chainable event method
	on(event, handler) {
		this.element.addEventListener(event, handler);
		return this;
	}

	// Chainable addClass/removeClass
	addClass(className) {
		this.element.classList.add(className);
		return this;
	}

	removeClass(className) {
		this.element.classList.remove(className);
		return this;
	}

	// Chainable attr method
	attr(name, value) {
		if (value === undefined) {
			return this.element.getAttribute(name);
		}
		this.element.setAttribute(name, value);
		return this;
	}

	// Chainable css method
	css(property, value) {
		if (typeof property === 'object') {
			Object.assign(this.element.style, property);
		} else if (value === undefined) {
			return getComputedStyle(this.element)[property];
		} else {
			this.element.style[property] = value;
		}
		return this;
	}

	// Append child
	append(child) {
		if (typeof child === 'string') {
			this.element.appendChild(document.createTextNode(child));
		} else {
			this.element.appendChild(child);
		}
		return this;
	}

	// Get the raw DOM element
	get() {
		return this.element;
	}
}

// Enhanced $ function with jQuery-style API
const $ = (selector) => {
	if (typeof selector === 'string') {
		if (selector.startsWith('#')) {
			// ID selector
			const element = document.getElementById(selector.slice(1));
			return element ? new DOMElement(element) : null;
		} else {
			// CSS selector
			const element = document.querySelector(selector);
			return element ? new DOMElement(element) : null;
		}
	} else if (selector instanceof Element) {
		// Wrap existing element
		return new DOMElement(selector);
	}
	return null;
};

// Static methods for backwards compatibility and utility
Object.assign($, {
	// Get element by ID (returns raw element)
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

	// Add event listener (static)
	on: (element, event, handler) => element.addEventListener(event, handler),

	// Set innerHTML (static)
	html: (element, html) => (element.innerHTML = html),

	// Set textContent (static)
	text: (element, text) => (element.textContent = text),

	// Show/hide element (static)
	show: (element) => (element.style.display = "block"),
	hide: (element) => (element.style.display = "none"),

	// Toggle display (static)
	toggle: (element) => {
		const isVisible = element.style.display === "block";
		element.style.display = isVisible ? "none" : "block";
	},
});

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
// REACT-LIKE COMPONENT LIBRARY
// ============================================================================

const Component = {
	// Create element with props and children
	createElement: (tag, props = {}, ...children) => {
		const element = document.createElement(tag);

		// Set attributes and properties
		for (const [key, value] of Object.entries(props)) {
			if (key === "className") {
				element.className = value;
			} else if (key === "textContent") {
				element.textContent = value;
			} else if (key === "innerHTML") {
				element.innerHTML = value;
			} else if (key === "onclick" && typeof value === "function") {
				// Handle onclick specifically
				element.onclick = value;
			} else if (key.startsWith("on") && typeof value === "function") {
				// Event handlers
				const eventName = key.slice(2).toLowerCase();
				element.addEventListener(eventName, value);
			} else if (key === "style" && typeof value === "object") {
				Object.assign(element.style, value);
			} else {
				element.setAttribute(key, value);
			}
		}

		// Append children
		for (const child of children) {
			if (child) {
				if (typeof child === "string") {
					element.appendChild(document.createTextNode(child));
				} else {
					element.appendChild(child);
				}
			}
		}

		return element;
	},

	// Fragment-like container
	Fragment: (...children) => {
		const fragment = document.createDocumentFragment();
		for (const child of children) {
			if (child) {
				if (typeof child === "string") {
					fragment.appendChild(document.createTextNode(child));
				} else {
					fragment.appendChild(child);
				}
			}
		}
		return fragment;
	},
};

// Shorthand for createElement
const h = Component.createElement;

// ============================================================================
// COMPONENT DEFINITIONS
// ============================================================================

// Priority cell component
const PriorityCell = ({ priority }) =>
	h(
		"td",
		{ className: "priority-cell" },
		h("span", { className: `priority priority-${priority.toLowerCase()}` }),
		getPriorityText(priority),
	);

// Status cell component
const StatusCell = ({ status }) =>
	h(
		"td",
		{},
		h(
			"span",
			{ className: `status status-${getStatusClass(status)}` },
			getStatusText(status),
		),
	);

// Actions cell component
const ActionsCell = ({ jobId, onEdit, onDelete }) =>
	h(
		"td",
		{ className: "actions-cell" },
		h(
			"button",
			{
				className: "action-btn edit-btn",
				onclick: (event) => {
					// Make sure we get the button element, not the icon
					const button = event.target.closest("button");
					onEdit(button);
				},
			},
			h("span", { className: "material-symbols-outlined" }, "edit"),
		),
		h(
			"button",
			{
				className: "action-btn delete-btn",
				onclick: () => onDelete(jobId),
			},
			h("span", { className: "material-symbols-outlined" }, "delete"),
		),
	);

// Edit actions cell component
const EditActionsCell = ({ jobId, onSave, onCancel }) =>
	h(
		"td",
		{ className: "actions-cell" },
		h(
			"div",
			{ className: "actions-cell" },
			h(
				"button",
				{
					className: "action-btn edit-btn",
					onclick: () => onSave(jobId),
				},
				h("span", { className: "material-symbols-outlined" }, "save"),
			),
			h(
				"button",
				{
					className: "action-btn cancel-btn",
					onclick: onCancel,
				},
				h("span", { className: "material-symbols-outlined" }, "close"),
			),
		),
	);

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

// Textarea component
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

// Contact textarea component
const ContactTextarea = ({ contactPerson = "", contactEmail = "" }) =>
	h("textarea", {
		className: "editable contact-textarea",
		placeholder: "Name\nEmail",
		textContent: `${contactPerson}\n${contactEmail}`,
	});

// Job row component
const JobRow = ({ job, onEdit, onDelete }) => {
	const row = h(
		"tr",
		{ "data-job-id": job.id },
		PriorityCell({ priority: job.priority }),
		h("td", { className: "company-name" }, job.company),
		h("td", {}, job.position),
		h("td", { className: "date" }, job.appliedDate),
		StatusCell({ status: job.status }),
		h("td", {}, getPhaseText(job.currentPhase)),
		h("td", {}, h("span", { className: "next-task" }, job.nextTask)),
		h("td", { className: "date" }, job.dueDate),
		h("td", {
			className: "contact",
			innerHTML: `${job.contactPerson}<br>${job.contactEmail}`,
		}),
		h("td", { className: "salary" }, job.salaryRange),
		h("td", {}, job.location),
		h("td", { className: "notes" }, job.notes),
		ActionsCell({
			jobId: job.id,
			onEdit: (button) => onEdit(button),
			onDelete: onDelete,
		}),
	);

	// Add double-click event listener
	row.addEventListener("dblclick", (event) => {
		if (!event.target.closest(".actions-cell")) {
			const editButton = row.querySelector(".edit-btn");
			if (editButton) {
				onEdit(editButton);
			}
		}
	});

	return row;
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
			wishlist: "Wishlist",
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
			wishlist: "Lista de Desejos",
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
	"wishlist",
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
	$("#pageTitle").text(I18n.t("app.title"));
	$("#appTitle").text(I18n.t("app.title"));

	// Update button
	$("#addAppBtn").text(I18n.t("buttons.addApplication"));

	// Update table headers
	$("#priorityHeader").text(I18n.t("table.headers.priority"));
	$("#companyHeader").text(I18n.t("table.headers.company"));
	$("#positionHeader").text(I18n.t("table.headers.position"));
	$("#appliedDateHeader").text(I18n.t("table.headers.appliedDate"));
	$("#statusHeader").text(I18n.t("table.headers.status"));
	$("#currentPhaseHeader").text(I18n.t("table.headers.currentPhase"));
	$("#nextTaskHeader").text(I18n.t("table.headers.nextTask"));
	$("#dueDateHeader").text(I18n.t("table.headers.dueDate"));
	$("#contactPersonHeader").text(I18n.t("table.headers.contactPerson"));
	$("#salaryRangeHeader").text(I18n.t("table.headers.salaryRange"));
	$("#locationHeader").text(I18n.t("table.headers.location"));
	$("#notesHeader").text(I18n.t("table.headers.notes"));
	$("#actionsHeader").text(I18n.t("table.headers.actions"));

	// Update stats labels
	$("#totalAppsLabel").text(I18n.t("stats.totalApplications"));
	$("#activeAppsLabel").text(I18n.t("stats.active"));
	$("#interviewsLabel").text(I18n.t("stats.interviews"));
	$("#offersLabel").text(I18n.t("stats.offers"));
	$("#rejectionsLabel").text(I18n.t("stats.rejections"));
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
	let datalist = $('#' + id);
	if (!datalist) {
		datalist = $(createElement("datalist"));
		datalist.attr('id', id);
		document.body.appendChild(datalist.get());
	}

	datalist.html("");
	for (const value of values) {
		datalist.get().appendChild(createOption(value));
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
	const dropdown = $('#' + dropdownId);
	dropdown.html("");

	// Add "All" option
	dropdown.append(
		createDropdownOption(allLabel, () => {
			filterFunction("");
			closeDropdown(dropdownId);
		}),
	);

	// Add value options
	for (const value of values) {
		const displayText = textMapper ? textMapper(value) : value;
		dropdown.append(
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
	const dropdown = $('#' + dropdownId);
	const isVisible = dropdown.css('display') === "block";

	// Close all dropdowns first
	for (const d of $.qsa(".filter-dropdown")) {
		$.hide(d);
	}

	// Toggle the clicked dropdown
	dropdown.css('display', isVisible ? "none" : "block");
}

function closeDropdown(dropdownId) {
	$('#' + dropdownId).hide();
}

// ============================================================================
// TABLE MANAGEMENT
// ============================================================================

function populateTable(jobs) {
	const tbody = $('#jobTableBody');
	tbody.html("");

	for (const job of jobs) {
		const jobRow = JobRow({
			job,
			onEdit: (button) => editRow(button),
			onDelete: deleteJob,
		});
		tbody.append(jobRow);
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
	const tbody = $('#jobTableBody').get();
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
	cells.status.appendChild(createStatusSelect("wishlist", false, "editable"));
	cells.currentPhase.appendChild(
		createPhaseSelect("applicationReview", false, "editable"),
	);

	// Add input fields using components
	cells.company.appendChild(
		InputField({
			placeholder: I18n.t("table.placeholders.companyName"),
			list: "companiesDatalist",
		}),
	);

	cells.position.appendChild(
		InputField({
			placeholder: I18n.t("table.placeholders.positionTitle"),
			list: "positionsDatalist",
		}),
	);

	cells.appliedDate.appendChild(
		InputField({
			type: "date",
			value: new Date().toISOString().split("T")[0],
		}),
	);

	cells.nextTask.appendChild(
		InputField({
			placeholder: I18n.t("table.placeholders.nextTask"),
		}),
	);

	cells.dueDate.appendChild(InputField({ type: "date" }));

	cells.contact.appendChild(
		TextareaField({
			placeholder: I18n.t("table.placeholders.nameEmail"),
			className: "editable contact-textarea",
		}),
	);

	cells.salary.appendChild(
		InputField({
			placeholder: I18n.t("table.placeholders.salaryRange"),
		}),
	);

	cells.location.appendChild(
		InputField({
			placeholder: I18n.t("table.placeholders.location"),
			list: "locationsDatalist",
		}),
	);

	cells.notes.appendChild(
		TextareaField({
			placeholder: I18n.t("table.placeholders.notes"),
			className: "editable notes-textarea",
		}),
	);

	// Add save button
	const saveButton = h(
		"button",
		{
			className: "action-btn edit-btn",
			onclick: () => saveRow(cells.actions.querySelector("button")),
		},
		h("span", { className: "material-symbols-outlined" }, "save"),
	);
	cells.actions.appendChild(saveButton);

	updateStats();
}

function getJobIdFromRow(row) {
	const jobId = row.getAttribute("data-job-id");
	return jobId ? Number.parseInt(jobId) : null;
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
	$(cells[0]).html("");
	cells[0].appendChild(
		h(
			"div",
			{ className: "priority-cell" },
			createPrioritySelect(job.priority, false, "editable"),
		),
	);

	$(cells[1]).html("");
	cells[1].appendChild(
		InputField({
			value: job.company,
			list: "companiesDatalist",
		}),
	);

	$(cells[2]).html("");
	cells[2].appendChild(
		InputField({
			value: job.position,
			list: "positionsDatalist",
		}),
	);

	$(cells[3]).html("");
	cells[3].appendChild(
		InputField({
			value: job.appliedDate,
			type: "date",
		}),
	);

	$(cells[4]).html("");
	cells[4].appendChild(createStatusSelect(job.status, false, "editable"));

	$(cells[5]).html("");
	cells[5].appendChild(createPhaseSelect(job.currentPhase, false, "editable"));

	$(cells[6]).html("");
	cells[6].appendChild(InputField({ value: job.nextTask }));

	$(cells[7]).html("");
	cells[7].appendChild(
		InputField({
			value: job.dueDate,
			type: "date",
		}),
	);

	$(cells[8]).html("");
	cells[8].appendChild(
		ContactTextarea({
			contactPerson: job.contactPerson,
			contactEmail: job.contactEmail,
		}),
	);

	$(cells[9]).html("");
	cells[9].appendChild(InputField({ value: job.salaryRange }));

	$(cells[10]).html("");
	cells[10].appendChild(
		InputField({
			value: job.location,
			list: "locationsDatalist",
		}),
	);

	$(cells[11]).html("");
	cells[11].appendChild(
		TextareaField({
			value: job.notes,
			className: "editable notes-textarea",
		}),
	);

	$(cells[12]).html("");
	cells[12].appendChild(
		EditActionsCell({
			jobId: jobId,
			onSave: (id) => saveEditedRow(cells[12].querySelector("button"), id),
			onCancel: () => cancelEdit(cells[12].querySelector(".cancel-btn")),
		}),
	);
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

	$("#totalApps").text(total);
	$("#activeApps").text(active);
	$("#interviews").text(interviews);
	$("#offers").text(offers);
	$("#rejections").text(rejections);
}

// ============================================================================
// EVENT LISTENERS AND INITIALIZATION
// ============================================================================

// Close dropdowns when clicking outside
$.on(document, "click", (event) => {
	if (!event.target.closest(".header-with-filter")) {
		for (const dropdown of $.qsa(".filter-dropdown")) {
			$.hide(dropdown);
		}
	}
});

// Cancel edit on ESC key press
$.on(document, "keydown", (event) => {
	if (event.key === "Escape") {
		// Find any row currently in edit mode (has originalContent stored)
		const editingRow = $.qs("tr[data-original-content]");
		if (editingRow) {
			// Find the cancel button in the row and trigger cancel
			const cancelButton = editingRow.querySelector(".cancel-btn");
			if (cancelButton) {
				cancelEdit(cancelButton);
			}
		}
	}
});

// Initialize on page load
$.on(document, "DOMContentLoaded", loadJobsData);
