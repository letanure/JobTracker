// ============================================================================
// PORTUGUESE TRANSLATIONS
// ============================================================================

const PT_TRANSLATIONS = {
	app: {
		title: "JobTracker"
	},
	buttons: {
		addApplication: "+ Adicionar Candidatura"
	},
	tabs: {
		jobs: "Empregos",
		applications: "Quadro de Candidaturas"
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
			location: "Localização",
			notes: "Notas",
			tasks: "Tarefas",
			actions: "Ações"
		},
		filters: {
			allPriorities: "Todas as Prioridades",
			allPhases: "Todas as Fases"
		},
		placeholders: {
			company: "Nome da Empresa",
			position: "Cargo",
			contactPerson: "Nome do Contato",
			contactEmail: "Email do Contato",
			salaryRange: "Faixa Salarial",
			location: "Localização",
			sourceUrl: "URL da Vaga"
		}
	},
	priorities: {
		high: "Alta",
		medium: "Média",
		low: "Baixa"
	},
	phases: {
		wishlist: "Lista de Desejos",
		applied: "Candidatura Enviada",
		interview: "Entrevista",
		offer: "Oferta",
		rejected_withdrawn: "Rejeitado / Retirado"
	},
	substeps: {
		none: "Nenhuma subetapa",
		application_review: "Análise da Candidatura",
		initial_screening: "Triagem Inicial",
		hr_phone_screen: "Triagem por Telefone - RH",
		recruiter_call: "Ligação do Recrutador",
		phone_screening: "Triagem por Telefone",
		technical_phone_screen: "Triagem Técnica por Telefone",
		coding_challenge: "Desafio de Programação",
		take_home_assignment: "Tarefa para Casa",
		technical_interview: "Entrevista Técnica",
		system_design_interview: "Entrevista de Design de Sistema",
		behavioral_interview: "Entrevista Comportamental",
		team_interview: "Entrevista com a Equipe",
		hiring_manager_interview: "Entrevista com Gerente de Contratação",
		panel_interview: "Entrevista em Painel",
		final_round: "Etapa Final",
		reference_check: "Verificação de Referências",
		background_check: "Verificação de Antecedentes",
		offer_discussion: "Discussão da Oferta",
		salary_negotiation: "Negociação Salarial"
	},
	stats: {
		totalApplications: "Total de Candidaturas",
		active: "Ativas",
		interviews: "Entrevistas",
		offers: "Ofertas",
		rejections: "Rejeições"
	},
	messages: {
		welcome: "Bem-vindo ao JobTracker!\n\nGostaria de ver 2 exemplos de candidaturas para entender como o rastreador funciona?\n\nClique OK para adicionar exemplos, ou Cancelar para começar com um rastreador vazio.",
		confirmDelete: "Tem certeza de que deseja excluir a candidatura para {position} na {company}?"
	},
	demo: {
		contactPerson1: "Sarah Chen",
		contactPerson2: "Mike Rodriguez",
		notes1: "Ótimo encaixe cultural. Preciso pesquisar sua arquitetura de microsserviços.",
		notes2: "Startup em estágio inicial. Alto potencial de crescimento, mas arriscado."
	},
	seo: {
		title: "JobTracker - Rastreador Local Gratuito | Sem Login, Sem Rastreamento, Dados Privados",
		description: "Rastreador de candidaturas 100% gratuito que funciona localmente no seu navegador. Sem login necessário, sem rastreamento de dados, sem servidores. Seus dados de busca de emprego ficam completamente privados no seu dispositivo.",
		keywords: "rastreador gratuito de empregos, rastreador local de candidaturas, busca de emprego privada, rastreador sem login, rastreador offline de empregos, candidaturas com privacidade, gestão de carreira sem rastreamento, busca de emprego local",
		author: "Equipe JobTracker",
		ogTitle: "JobTracker - Rastreador Local Gratuito (Sem Login Necessário)",
		ogDescription: "Acompanhe candidaturas de forma privada no seu navegador. 100% gratuito, sem login, sem rastreamento, seus dados nunca saem do seu dispositivo.",
		twitterTitle: "JobTracker - Rastreador Privado de Candidaturas",
		twitterDescription: "Rastreador local gratuito com total privacidade. Sem login, sem rastreamento, seus dados de busca de emprego ficam no seu dispositivo."
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
			addButton: "Adicionar Nota"
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
			priorityHigh: "Alta"
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
			validation: {
				nameRequired: "Nome é obrigatório",
				emailRequired: "Email é obrigatório"
			}
		},
		common: {
			save: "Salvar",
			cancel: "Cancelar",
			close: "Fechar"
		}
	},
	forms: {
		saveChangesTitle: "Salvar alterações",
		cancelEditingTitle: "Cancelar edição",
		noDueDate: "Sem data de vencimento",
		placeholderNameEmail: "Nome\nEmail"
	},
	footer: {
		madeWith: "Feito com",
		by: "por"
	}
};