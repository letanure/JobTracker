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
			title: "JobTracker",
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
				currentPhase: "Current Phase",
				contactPerson: "Contact Person",
				salaryRange: "Salary Range",
				location: "Location",
				notes: "Notes",
				tasks: "Tasks",
				actions: "Actions",
			},
			filters: {
				allPriorities: "All Priorities",
				allPhases: "All Phases",
				highPriority: "High Priority",
				mediumPriority: "Medium Priority",
				lowPriority: "Low Priority",
			},
			placeholders: {
				companyName: "Company Name",
				positionTitle: "Position Title",
				nameEmail: "Name & Email",
				salaryRange: "Salary Range",
				location: "Location",
				notes: "Notes",
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
		seo: {
			title: "JobTracker - Free Job Application Tracker & Manager",
			description: "Track your job applications, interviews, and career progress with JobTracker. A free, open-source tool to organize your job search with notes, tasks, and timeline tracking.",
			keywords: "job tracker, job application, job search, career management, interview tracker, application organizer, job hunting tool, career progress",
			author: "JobTracker Team",
			ogTitle: "JobTracker - Free Job Application Tracker",
			ogDescription: "Organize your job search with our free, easy-to-use job application tracker. Track applications, interviews, and tasks in one place.",
			twitterTitle: "JobTracker - Free Job Application Tracker",
			twitterDescription: "Free job application tracker to organize your job search. Track applications, interviews, and career progress.",
		},
	},
	pt: {
		app: {
			title: "JobTracker",
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
				currentPhase: "Fase Atual",
				contactPerson: "Pessoa de Contato",
				salaryRange: "Faixa Salarial",
				location: "Localização",
				notes: "Notas",
				tasks: "Tarefas",
				actions: "Ações",
			},
			filters: {
				allPriorities: "Todas as Prioridades",
				allPhases: "Todas as Fases",
				highPriority: "Prioridade Alta",
				mediumPriority: "Prioridade Média",
				lowPriority: "Prioridade Baixa",
			},
			placeholders: {
				companyName: "Nome da Empresa",
				positionTitle: "Título do Cargo",
				nameEmail: "Nome e Email",
				salaryRange: "Faixa Salarial",
				location: "Localização",
				notes: "Notas",
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
		seo: {
			title: "JobTracker - Rastreador Gratuito de Candidaturas de Emprego",
			description: "Acompanhe suas candidaturas de emprego, entrevistas e progresso na carreira com o JobTracker. Uma ferramenta gratuita e de código aberto para organizar sua busca por emprego com notas, tarefas e acompanhamento de cronograma.",
			keywords: "rastreador de empregos, candidatura de emprego, busca de emprego, gestão de carreira, rastreador de entrevistas, organizador de candidaturas, ferramenta de busca de emprego, progresso na carreira",
			author: "Equipe JobTracker",
			ogTitle: "JobTracker - Rastreador Gratuito de Candidaturas",
			ogDescription: "Organize sua busca por emprego com nosso rastreador de candidaturas gratuito e fácil de usar. Acompanhe candidaturas, entrevistas e tarefas em um só lugar.",
			twitterTitle: "JobTracker - Rastreador Gratuito de Candidaturas",
			twitterDescription: "Rastreador gratuito de candidaturas para organizar sua busca por emprego. Acompanhe candidaturas, entrevistas e progresso na carreira.",
		},
	},
};