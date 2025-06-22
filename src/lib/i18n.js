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

	// Get language from URL parameter
	getLanguageFromURL: () => {
		const urlParams = new URLSearchParams(window.location.search);
		const langParam = urlParams.get("lang");
		return langParam && I18n.translations[langParam] ? langParam : null;
	},

	// Set language in URL parameter
	setLanguageInURL: (lang) => {
		const url = new URL(window.location);
		if (lang && lang !== "en") {
			url.searchParams.set("lang", lang);
		} else {
			url.searchParams.delete("lang");
		}
		window.history.replaceState({}, "", url);
	},

	// Set current language
	setLanguage: (lang) => {
		if (I18n.translations[lang]) {
			I18n.currentLanguage = lang;
			I18n.setLanguageInURL(lang);
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
		// Priority: URL parameter > saved language > browser language > default (en)
		const urlLang = I18n.getLanguageFromURL();
		const savedData = DataStore.load();
		const savedLanguage = savedData?.language;

		I18n.currentLanguage = urlLang || savedLanguage || I18n.detectLanguage();

		// Update URL to reflect current language
		I18n.setLanguageInURL(I18n.currentLanguage);
	},
};

// Translation constants
I18n.translations = {
	en: {
		app: {
			title: "JobTracker",
		},
		buttons: {
			addApplication: "+ Add Application",
		},
		table: {
			headers: {
				priority: "Priority",
				company: "Company",
				position: "Position",
				currentPhase: "Stage",
				contactPerson: "Contact",
				salaryRange: "Salary Range",
				location: "Location",
				sourceUrl: "Source",
				notes: "Notes",
				tasks: "Tasks",
				actions: "Actions",
			},
			filters: {
				allPriorities: "All Priorities",
				allPhases: "All Phases",
			},
			placeholders: {
				company: "Company Name",
				position: "Position Title",
				contactPerson: "Contact Name",
				contactEmail: "Contact Email",
				salaryRange: "Salary Range",
				location: "Location",
				sourceUrl: "Job Posting URL",
			},
		},
		priorities: {
			high: "High",
			medium: "Medium",
			low: "Low",
		},
		phases: {
			// PHASES array values
			wishlist: "Wishlist",
			applied: "Applied",
			phone_screening: "Phone Screening",
			interview: "Interview",
			final_round: "Final Round",
			offer: "Offer",
			rejected: "Rejected",
			withdrawn: "Withdrawn",
			// Extended phase values
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
				"Welcome to JobTracker!\n\nWould you like to see 2 example job applications to understand how the tracker works?\n\nClick OK to add examples, or Cancel to start with an empty tracker.",
			confirmDelete:
				"Are you sure you want to delete the application for {position} at {company}?",
		},
		demo: {
			contactPerson1: "Sarah Chen",
			contactPerson2: "Mike Rodriguez",
			notes1:
				"Great culture fit. Need to research their microservices architecture.",
			notes2: "Early stage startup. High growth potential but risky.",
		},
		seo: {
			title:
				"JobTracker - Free Local Job Tracker | No Login, No Tracking, Your Data Stays Private",
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
				"Free local job tracker with complete privacy. No login, no tracking, your job search data stays on your device.",
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
				addButton: "Add Note",
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
				priorityHigh: "High",
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
			},
			common: {
				save: "Save",
				cancel: "Cancel",
				close: "Close",
			},
		},
		forms: {
			saveChangesTitle: "Save changes",
			cancelEditingTitle: "Cancel editing",
			noDueDate: "No due date",
			placeholderNameEmail: "Name\nEmail",
		},
		footer: {
			madeWith: "Made with",
			by: "by",
		},
	},
	pt: {
		app: {
			title: "JobTracker",
		},
		buttons: {
			addApplication: "+ Adicionar Candidatura",
		},
		table: {
			headers: {
				priority: "Prioridade",
				company: "Empresa",
				position: "Cargo",
				currentPhase: "Fase Atual",
				contactPerson: "Contato",
				salaryRange: "Salario",
				sourceUrl: "Link",
				source: "Fonte",
				location: "Localização",
				notes: "Notas",
				tasks: "Tarefas",
				actions: "Ações",
			},
			filters: {
				allPriorities: "Todas as Prioridades",
				allPhases: "Todas as Fases",
			},
			placeholders: {
				company: "Nome da Empresa",
				position: "Título do Cargo",
				contactPerson: "Nome do Contato",
				contactEmail: "Email do Contato",
				salaryRange: "Faixa Salarial",
				location: "Localização",
			},
		},
		priorities: {
			high: "Alta",
			medium: "Média",
			low: "Baixa",
		},
		phases: {
			// PHASES array values
			wishlist: "Lista de Desejos",
			applied: "Candidatura Enviada",
			phone_screening: "Triagem por Telefone",
			interview: "Entrevista",
			final_round: "Etapa Final",
			offer: "Oferta",
			rejected: "Rejeitado",
			withdrawn: "Retirado",
			// Extended phase values
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
				"Bem-vindo ao JobTracker!\n\nGostaria de ver 2 exemplos de candidaturas para entender como o rastreador funciona?\n\nClique OK para adicionar exemplos, ou Cancelar para começar com um rastreador vazio.",
			confirmDelete:
				"Tem certeza de que deseja excluir a candidatura para {position} na {company}?",
		},
		demo: {
			contactPerson1: "Sarah Chen",
			contactPerson2: "Mike Rodriguez",
			notes1:
				"Ótimo encaixe cultural. Preciso pesquisar sua arquitetura de microsserviços.",
			notes2:
				"Startup em estágio inicial. Alto potencial de crescimento, mas arriscado.",
		},
		seo: {
			title:
				"JobTracker - Rastreador Local Gratuito | Sem Login, Sem Rastreamento, Dados Privados",
			description:
				"Rastreador de candidaturas 100% gratuito que funciona localmente no seu navegador. Sem login necessário, sem rastreamento de dados, sem servidores. Seus dados de busca de emprego ficam completamente privados no seu dispositivo.",
			keywords:
				"rastreador gratuito de empregos, rastreador local de candidaturas, busca de emprego privada, rastreador sem login, rastreador offline de empregos, candidaturas com privacidade, gestão de carreira sem rastreamento, busca de emprego local",
			author: "Equipe JobTracker",
			ogTitle: "JobTracker - Rastreador Local Gratuito (Sem Login Necessário)",
			ogDescription:
				"Acompanhe candidaturas de forma privada no seu navegador. 100% gratuito, sem login, sem rastreamento, seus dados nunca saem do seu dispositivo.",
			twitterTitle: "JobTracker - Rastreador Privado de Candidaturas",
			twitterDescription:
				"Rastreador local gratuito com total privacidade. Sem login, sem rastreamento, seus dados de busca de emprego ficam no seu dispositivo.",
		},
		modals: {
			notes: {
				title: "Notas para {position} na {company}",
				activeSection: "Notas Ativas",
				archivedSection: "Notas Arquivadas ({count})",
				emptyState: "Sem notas ainda. Adicione sua primeira nota abaixo.",
				addSection: "Adicionar Nova Nota",
				phaseLabelPrefix: " Fase: ",
				placeholder: "Digite sua nota aqui...",
				editTitle: "Editar nota",
				archiveTitle: "Arquivar nota",
				unarchiveTitle: "Desarquivar nota",
				addButton: "Adicionar Nota",
			},
			tasks: {
				title: "Tarefas para {position} na {company}",
				activeSection: "Tarefas Ativas",
				archivedSection: "Tarefas Arquivadas ({count})",
				emptyState: "Sem tarefas ainda. Adicione sua primeira tarefa abaixo.",
				addSection: "Adicionar Nova Tarefa",
				placeholder: "Digite sua tarefa aqui...",
				editTitle: "Editar tarefa",
				archiveTitle: "Arquivar tarefa",
				unarchiveTitle: "Desarquivar tarefa",
				addButton: "Adicionar Tarefa",
				statusTodo: "A Fazer",
				statusInProgress: "Em Progresso",
				statusDone: "Concluída",
				priorityLow: "Baixa",
				priorityMedium: "Média",
				priorityHigh: "Alta",
			},
			contacts: {
				title: "Contatos para {position} na {company}",
				activeSection: "Contatos Ativos",
				archivedSection: "Contatos Arquivados ({count})",
				emptyState: "Sem contatos ainda. Adicione seu primeiro contato abaixo.",
				addSection: "Adicionar Novo Contato",
				editTitle: "Editar contato",
				archiveTitle: "Arquivar contato",
				unarchiveTitle: "Desarquivar contato",
				addButton: "Adicionar Contato",
				placeholderName: "Nome",
				placeholderEmail: "Email",
				placeholderPhone: "Telefone",
				placeholderCompany: "Empresa",
				noContacts: "Sem contatos",
				defaultContact: "Contato",
			},
			common: {
				save: "Salvar",
				cancel: "Cancelar",
				close: "Fechar",
			},
		},
		forms: {
			saveChangesTitle: "Salvar alterações",
			cancelEditingTitle: "Cancelar edição",
			noDueDate: "Sem data de vencimento",
			placeholderNameEmail: "Nome\nEmail",
		},
		footer: {
			madeWith: "Feito com",
			by: "por",
		},
	},
};
