// ============================================================================
// RESUME BUILDER COMPONENT
// ============================================================================

const ResumeBuilder = {
	// Initialize resume data structure
	data: {
		basics: {
			name: "",
			label: "",
			summary: "",
			email: "",
			phone: "",
			location: { city: "", country: "" },
			profiles: [],
			languages: [],
			personalStatement: ""
		},
		skills: [],
		experience: [],
		projects: [],
		portfolio: [],
		education: [],
		certifications: [],
		awards: [],
		volunteer: [],
		interests: []
	},

	// Track section collapsed states
	collapsedSections: {},

	// Toggle section collapse state
	toggleSection: (sectionId) => {
		ResumeBuilder.collapsedSections[sectionId] = !ResumeBuilder.collapsedSections[sectionId];
		const content = document.querySelector(`[data-section="${sectionId}"] .section-content`);
		const arrow = document.querySelector(`[data-section="${sectionId}"] .section-arrow`);
		
		if (content && arrow) {
			const isCollapsed = ResumeBuilder.collapsedSections[sectionId];
			content.classList.toggle('collapsed', isCollapsed);
			arrow.classList.toggle('collapsed', isCollapsed);
		}
	},

	// Calculate completion for basics section
	calculateBasicsCompletion: () => {
		const basics = ResumeBuilder.data.basics;
		const fields = ['name', 'label', 'email', 'phone'];
		const completed = fields.filter(field => basics[field] && basics[field].trim()).length;
		const locationComplete = (basics.location.city && basics.location.country) ? 1 : 0;
		const summaryComplete = basics.summary && basics.summary.trim() ? 1 : 0;
		const total = fields.length + 2; // +2 for location and summary
		return { completed: completed + locationComplete + summaryComplete, total };
	},

	// Calculate completion for array sections
	calculateArrayCompletion: (sectionName, requiredFields, customData = null) => {
		const data = customData || ResumeBuilder.data[sectionName];
		if (!data || data.length === 0) return { completed: 0, total: 0 };
		
		let completed = 0;
		data.forEach(item => {
			const itemCompleted = requiredFields.filter(field => {
				const value = field.includes('.') ? 
					field.split('.').reduce((obj, key) => obj && obj[key], item) : 
					item[field];
				return value && value.toString().trim();
			}).length;
			if (itemCompleted === requiredFields.length) completed++;
		});
		
		return { completed, total: data.length };
	},

	// Create collapsible section wrapper
	createCollapsibleSection: (sectionId, titleKey, content, completionData) => {
		// Initialize all sections as expanded (not collapsed)
		const isCollapsed = ResumeBuilder.collapsedSections[sectionId] || false;
		const completionText = completionData.total > 0 ? 
			`(${completionData.completed}/${completionData.total})` : 
			'(0/0)';
		
		return h('div.resume-section', {
			'data-section': sectionId
		},
			h('h3.resume-section-title', {
				onclick: () => ResumeBuilder.toggleSection(sectionId)
			},
				h('div.section-title-content',
					h('span', I18n.t(titleKey)),
					h('span.section-completion', completionText)
				),
				h('span.section-arrow', {
					className: isCollapsed ? 'collapsed' : ''
				}, h('span.material-symbols-outlined', 'keyboard_arrow_down'))
			),
			h('div.section-content', {
				className: isCollapsed ? 'collapsed' : ''
			}, ...content)
		);
	},

	// Create the resume builder interface
	create: () => {
		const container = h('div.resume-container',
			// Header
			h('div.tab-header',
				h('h2.tab-title', I18n.t("headers.resume")),
				h('div.resume-stats',
					h('button.btn-primary', {
						type: 'button',
						onclick: () => ResumeBuilder.save()
					}, I18n.t("resume.actions.save"))
				)
			),

			// Two-column layout: form + JSON preview
			h('div.resume-layout',
				// Left column: Form
				h('div.resume-form-column',
					ResumeBuilder.createBasicsSection(),
					ResumeBuilder.createProfilesSection(),
					ResumeBuilder.createLanguagesSection(),
					ResumeBuilder.createSkillsSection(),
					ResumeBuilder.createExperienceSection(),
					ResumeBuilder.createProjectsSection(),
					ResumeBuilder.createPortfolioSection(),
					ResumeBuilder.createEducationSection(),
					ResumeBuilder.createCertificationsSection(),
					ResumeBuilder.createAwardsSection(),
					ResumeBuilder.createVolunteerSection(),
					ResumeBuilder.createInterestsSection()
				),

				// Right column: JSON preview
				h('div.resume-json-column',
					h('div.json-header', 'Live JSON Preview'),
					h('pre.json-preview', {
						id: 'resume-json-preview'
					}, JSON.stringify(ResumeBuilder.data, null, 2))
				)
			)
		);

		return container;
	},

	// Update JSON preview
	updateJSON: () => {
		const preview = document.getElementById('resume-json-preview');
		if (preview) {
			preview.textContent = JSON.stringify(ResumeBuilder.data, null, 2);
		}
		ResumeBuilder.updateCompletionCounters();
	},

	// Update completion counters for all sections
	updateCompletionCounters: () => {
		const sections = [
			{ id: 'basics', completion: ResumeBuilder.calculateBasicsCompletion() },
			{ id: 'profiles', completion: ResumeBuilder.calculateArrayCompletion('profiles', ['type', 'url'], ResumeBuilder.data.basics.profiles) },
			{ id: 'languages', completion: ResumeBuilder.calculateArrayCompletion('languages', ['language', 'fluency'], ResumeBuilder.data.basics.languages) },
			{ id: 'skills', completion: ResumeBuilder.calculateArrayCompletion('skills', ['name']) },
			{ id: 'experience', completion: ResumeBuilder.calculateArrayCompletion('experience', ['position', 'company']) },
			{ id: 'projects', completion: ResumeBuilder.calculateArrayCompletion('projects', ['name', 'description']) },
			{ id: 'portfolio', completion: ResumeBuilder.calculateArrayCompletion('portfolio', ['title', 'url']) },
			{ id: 'education', completion: ResumeBuilder.calculateArrayCompletion('education', ['institution', 'degree']) },
			{ id: 'certifications', completion: ResumeBuilder.calculateArrayCompletion('certifications', ['name', 'issuer']) },
			{ id: 'awards', completion: ResumeBuilder.calculateArrayCompletion('awards', ['title', 'awarder']) },
			{ id: 'volunteer', completion: ResumeBuilder.calculateArrayCompletion('volunteer', ['organization', 'position']) },
			{ id: 'interests', completion: ResumeBuilder.calculateArrayCompletion('interests', ['name']) }
		];

		sections.forEach(section => {
			const completionElement = document.querySelector(`[data-section="${section.id}"] .section-completion`);
			if (completionElement) {
				const completionText = section.completion.total > 0 ? 
					`(${section.completion.completed}/${section.completion.total})` : 
					'(0/0)';
				completionElement.textContent = completionText;
			}
		});
	},

	// Create basics section
	createBasicsSection: () => {
		const completion = ResumeBuilder.calculateBasicsCompletion();
		const content = [
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.basics.name")),
					h('input[type="text"]', {
						value: ResumeBuilder.data.basics.name,
						oninput: (e) => {
							ResumeBuilder.data.basics.name = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.basics.label")),
					h('input[type="text"]', {
						value: ResumeBuilder.data.basics.label,
						oninput: (e) => {
							ResumeBuilder.data.basics.label = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				)
			),
			h('div.form-field',
				h('label', I18n.t("resume.basics.summary")),
				h('textarea', {
					rows: 2,
					value: ResumeBuilder.data.basics.summary,
					oninput: (e) => {
						ResumeBuilder.data.basics.summary = e.target.value;
						ResumeBuilder.updateJSON();
					}
				})
			),
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.basics.email")),
					h('input[type="email"]', {
						value: ResumeBuilder.data.basics.email,
						oninput: (e) => {
							ResumeBuilder.data.basics.email = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.basics.phone")),
					h('input[type="tel"]', {
						value: ResumeBuilder.data.basics.phone,
						oninput: (e) => {
							ResumeBuilder.data.basics.phone = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				)
			),
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.basics.city")),
					h('input[type="text"]', {
						value: ResumeBuilder.data.basics.location.city,
						oninput: (e) => {
							ResumeBuilder.data.basics.location.city = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.basics.country")),
					h('input[type="text"]', {
						value: ResumeBuilder.data.basics.location.country,
						oninput: (e) => {
							ResumeBuilder.data.basics.location.country = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				)
			),
			h('div.form-field',
				h('label', I18n.t("resume.basics.personalStatement")),
				h('textarea', {
					rows: 2,
					value: ResumeBuilder.data.basics.personalStatement,
					oninput: (e) => {
						ResumeBuilder.data.basics.personalStatement = e.target.value;
						ResumeBuilder.updateJSON();
					}
				})
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('basics', 'resume.basics.title', content, completion);
	},

	// Create profiles section
	createProfilesSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('profiles', ['type', 'url'], ResumeBuilder.data.basics.profiles);
		const profileItems = ResumeBuilder.data.basics.profiles.map((profile, index) => 
			ResumeBuilder.createProfileItem(profile, index)
		);
		
		const content = [
			h('div.dynamic-list', { id: 'profiles-list' },
				...profileItems
			),
			h('div.add-item-section',
				h('button.add-item-btn', {
					type: 'button',
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.addProfile();
					}
				}, h('span.material-symbols-outlined', 'add'), ' ', I18n.t("resume.profiles.addProfile"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('profiles', 'resume.profiles.title', content, completion);
	},

	// Create profile item
	createProfileItem: (profile, index) => {
		if (!profile || typeof profile !== 'object') {
			console.error('Invalid profile data:', profile, 'at index:', index);
			return h('div.dynamic-item', 'Error: Invalid profile data');
		}
		
		const isFirst = index === 0;
		return h('div.dynamic-item', {
			'data-index': index
		},
			h('div.form-grid-2',
				h('div.form-field',
					...(isFirst ? [h('label', I18n.t("resume.profiles.type"))] : []),
					h('select', {
						value: profile.type || 'linkedin',
						className: index === ResumeBuilder.data.basics.profiles.length - 1 ? 'focus-first' : '',
						onchange: (e) => {
							ResumeBuilder.data.basics.profiles[index].type = e.target.value;
							ResumeBuilder.updateJSON();
						}
					},
						h('option[value="linkedin"]', I18n.t("resume.profiles.platforms.linkedin")),
						h('option[value="github"]', I18n.t("resume.profiles.platforms.github")),
						h('option[value="twitter"]', I18n.t("resume.profiles.platforms.twitter")),
						h('option[value="website"]', I18n.t("resume.profiles.platforms.website")),
						h('option[value="other"]', I18n.t("resume.profiles.platforms.other"))
					)
				),
				h('div.form-field',
					...(isFirst ? [h('label', I18n.t("resume.profiles.url"))] : []),
					h('input[type="url"]', {
						value: profile.url || '',
						placeholder: isFirst ? '' : I18n.t("resume.profiles.url"),
						oninput: (e) => {
							ResumeBuilder.data.basics.profiles[index].url = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				)
			),
			h('button.btn-remove', {
				type: 'button',
				onclick: (e) => {
					e.preventDefault();
					ResumeBuilder.removeProfile(index);
				}
			}, h('span.material-symbols-outlined', 'close'))
		);
	},

	// Create languages section
	createLanguagesSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('languages', ['language', 'fluency'], ResumeBuilder.data.basics.languages);
		const content = [
			h('div.dynamic-list',
				...ResumeBuilder.data.basics.languages.map((lang, index) => 
					ResumeBuilder.createLanguageItem(lang, index)
				)
			),
			h('div.add-item-section',
				h('button.add-item-btn', {
					type: 'button',
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.addLanguage();
					}
				}, h('span.material-symbols-outlined', 'add'), ' ', I18n.t("resume.languages.addLanguage"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('languages', 'resume.languages.title', content, completion);
	},

	// Create language item
	createLanguageItem: (lang, index) => {
		const isFirst = index === 0;
		return h('div.dynamic-item', {
			'data-index': index
		},
			h('div.form-grid-2',
				h('div.form-field',
					...(isFirst ? [h('label', I18n.t("resume.languages.language"))] : []),
					h('input[type="text"]', {
						value: lang.language,
						placeholder: isFirst ? '' : I18n.t("resume.languages.language"),
						className: index === ResumeBuilder.data.basics.languages.length - 1 ? 'focus-first' : '',
						oninput: (e) => {
							ResumeBuilder.data.basics.languages[index].language = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				),
				h('div.form-field',
					...(isFirst ? [h('label', I18n.t("resume.languages.fluency"))] : []),
					h('select', {
						value: lang.fluency,
						onchange: (e) => {
							ResumeBuilder.data.basics.languages[index].fluency = e.target.value;
							ResumeBuilder.updateJSON();
						}
					},
						h('option[value="native"]', I18n.t("resume.languages.levels.native")),
						h('option[value="fluent"]', I18n.t("resume.languages.levels.fluent")),
						h('option[value="intermediate"]', I18n.t("resume.languages.levels.intermediate")),
						h('option[value="beginner"]', I18n.t("resume.languages.levels.beginner"))
					)
				)
			),
			h('button.btn-remove', {
				type: 'button',
				onclick: (e) => {
					e.preventDefault();
					ResumeBuilder.removeLanguage(index);
				}
			}, h('span.material-symbols-outlined', 'close'))
		);
	},

	// Create skills section
	createSkillsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('skills', ['name']);
		const content = [
			h('div.dynamic-list',
				...ResumeBuilder.data.skills.map((skill, index) => 
					ResumeBuilder.createSkillItem(skill, index)
				)
			),
			h('div.add-item-section',
				h('button.add-item-btn', {
					type: 'button',
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.addSkill();
					}
				}, h('span.material-symbols-outlined', 'add'), ' ', I18n.t("resume.skills.addSkill"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('skills', 'resume.skills.title', content, completion);
	},

	// Create skill item
	createSkillItem: (skill, index) => {
		return h('div.dynamic-item.skill-item',
			h('div.skill-header',
				h('div.form-field',
					h('label', I18n.t("resume.skills.name")),
					h('input[type="text"]', {
						value: skill.name,
						className: index === ResumeBuilder.data.skills.length - 1 ? 'focus-first' : '',
						oninput: (e) => {
							ResumeBuilder.data.skills[index].name = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				),
				h('button.btn-remove', {
					type: 'button',
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeSkill(index);
					}
				}, h('span.material-symbols-outlined', 'close'))
			),
			h('div.skills-keywords',
				h('label', I18n.t("resume.skills.keywords")),
				h('div.dynamic-list',
					...skill.keywords.map((keyword, keywordIndex) => 
						ResumeBuilder.createSkillKeywordItem(skill, index, keyword, keywordIndex)
					)
				),
				h('button.add-keyword-btn', {
					type: 'button',
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.addSkillKeyword(index);
					}
				}, h('span.material-symbols-outlined', 'add'))
			)
		);
	},

	// Create skill keyword item
	createSkillKeywordItem: (skill, skillIndex, keyword, keywordIndex) => {
		return h('div.keyword-item',
			h('input[type="text"]', {
				value: keyword,
				placeholder: 'Skill name',
				oninput: (e) => {
					ResumeBuilder.data.skills[skillIndex].keywords[keywordIndex] = e.target.value;
					ResumeBuilder.updateJSON();
				}
			}),
			h('button.btn-remove-keyword', {
				type: 'button',
				onclick: (e) => {
					e.preventDefault();
					ResumeBuilder.removeSkillKeyword(skillIndex, keywordIndex);
				}
			}, h('span.material-symbols-outlined', 'close'))
		);
	},

	// Create experience section
	createExperienceSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('experience', ['position', 'company']);
		const content = [
				h('div.dynamic-list', { id: 'experience-list' },
					...ResumeBuilder.data.experience.map((exp, index) => 
						ResumeBuilder.createExperienceItem(exp, index)
					)
				),
			h('div.add-item-section',
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addExperience()
				}, I18n.t("resume.experience.addExperience"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('experience', 'resume.experience.title', content, completion);
	},

	// Create experience item
	createExperienceItem: (exp, index) => {
		const isFirst = index === 0;
		return h('div.dynamic-item.experience-item',
			h('div.experience-header',
				h('div.form-grid-2',
					h('div.form-field',
						isFirst ? h('label', I18n.t("resume.experience.company")) : null,
						h('input[type="text"]', {
							value: exp.company,
							placeholder: isFirst ? '' : I18n.t("resume.experience.company"),
							className: index === ResumeBuilder.data.experience.length - 1 ? 'focus-first' : '',
							oninput: (e) => {
								ResumeBuilder.data.experience[index].company = e.target.value;
								ResumeBuilder.updateJSON();
							}
						})
					),
					h('div.form-field',
						isFirst ? h('label', I18n.t("resume.experience.position")) : null,
						h('input[type="text"]', {
							value: exp.position,
							placeholder: isFirst ? '' : I18n.t("resume.experience.position"),
							oninput: (e) => {
								ResumeBuilder.data.experience[index].position = e.target.value;
								ResumeBuilder.updateJSON();
							}
						})
					)
				),
				h('button.btn-remove', {
					type: 'button',
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeExperience(index);
					}
				}, h('span.material-symbols-outlined', 'close'))
			),
			h('div.form-grid-3',
				h('div.form-field',
					isFirst ? h('label', I18n.t("resume.experience.location")) : null,
					h('input[type="text"]', {
						value: exp.location,
						placeholder: isFirst ? '' : I18n.t("resume.experience.location"),
						oninput: (e) => {
							ResumeBuilder.data.experience[index].location = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				),
				h('div.form-field',
					isFirst ? h('label', I18n.t("resume.experience.startDate")) : null,
					h('input[type="month"]', {
						value: exp.startDate,
						oninput: (e) => {
							ResumeBuilder.data.experience[index].startDate = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				),
				h('div.form-field',
					isFirst ? h('label', I18n.t("resume.experience.endDate")) : null,
					h('input[type="month"]', {
						value: exp.endDate || '',
						oninput: (e) => {
							ResumeBuilder.data.experience[index].endDate = e.target.value;
							ResumeBuilder.updateJSON();
						}
					})
				)
			),
			isFirst ? h('div.form-field',
				h('label', I18n.t("resume.experience.summary")),
				h('textarea', {
					rows: 2,
					value: exp.summary,
					oninput: (e) => {
						ResumeBuilder.data.experience[index].summary = e.target.value;
						ResumeBuilder.updateJSON();
					}
				})
			) : h('textarea', {
				rows: 2,
				value: exp.summary,
				placeholder: I18n.t("resume.experience.summary"),
				oninput: (e) => {
					ResumeBuilder.data.experience[index].summary = e.target.value;
					ResumeBuilder.updateJSON();
				}
			}),
			isFirst ? h('div.form-field',
				h('label', I18n.t("resume.experience.highlights")),
				h('textarea', {
					rows: 2,
					value: exp.highlights.join('\n'),
					oninput: (e) => {
						ResumeBuilder.data.experience[index].highlights = e.target.value.split('\n').filter(h => h.trim());
						ResumeBuilder.updateJSON();
					}
				})
			) : h('textarea', {
				rows: 2,
				value: exp.highlights.join('\n'),
				placeholder: I18n.t("resume.experience.highlights"),
				oninput: (e) => {
					ResumeBuilder.data.experience[index].highlights = e.target.value.split('\n').filter(h => h.trim());
					ResumeBuilder.updateJSON();
				}
			})
		);
	},

	// Create projects section
	createProjectsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('projects', ['name', 'description']);
		const content = [
				h('div.dynamic-list', { id: 'projects-list' },
					...ResumeBuilder.data.projects.map((project, index) => 
						ResumeBuilder.createProjectItem(project, index)
					)
				),
			h('div.add-item-section',
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addProject()
				}, I18n.t("resume.projects.addProject"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('projects', 'resume.projects.title', content, completion);
	},

	// Create project item
	createProjectItem: (project, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.projects.name")),
					h('input[type="text"]', {
						value: project.name,
						oninput: (e) => ResumeBuilder.data.projects[index].name = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.projects.url")),
					h('input[type="url"]', {
						value: project.url || '',
						oninput: (e) => ResumeBuilder.data.projects[index].url = e.target.value
					})
				)
			),
			h('div.form-field',
				h('label', I18n.t("resume.projects.description")),
				h('textarea', {
					rows: 2,
					value: project.description,
					oninput: (e) => ResumeBuilder.data.projects[index].description = e.target.value
				})
			),
			h('div.form-field',
				h('label', I18n.t("resume.projects.tags")),
				h('input[type="text"]', {
					value: (project.tags || []).join(', '),
					oninput: (e) => ResumeBuilder.data.projects[index].tags = e.target.value.split(',').map(t => t.trim()).filter(t => t)
				})
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeProject(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create portfolio section
	createPortfolioSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('portfolio', ['title', 'url']);
		const content = [
				h('div.dynamic-list', { id: 'portfolio-list' },
					...ResumeBuilder.data.portfolio.map((item, index) => 
						ResumeBuilder.createPortfolioItem(item, index)
					)
				),
			h('div.add-item-section',
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addPortfolio()
				}, I18n.t("resume.portfolio.addPortfolio"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('portfolio', 'resume.portfolio.title', content, completion);
	},

	// Create portfolio item
	createPortfolioItem: (item, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.portfolio.type")),
					h('select', {
						value: item.type,
						onchange: (e) => ResumeBuilder.data.portfolio[index].type = e.target.value
					},
						h('option[value="case-study"]', I18n.t("resume.portfolio.types.case-study")),
						h('option[value="artwork"]', I18n.t("resume.portfolio.types.artwork")),
						h('option[value="website"]', I18n.t("resume.portfolio.types.website")),
						h('option[value="app"]', I18n.t("resume.portfolio.types.app")),
						h('option[value="other"]', I18n.t("resume.portfolio.types.other"))
					)
				),
				h('div.form-field',
					h('label', I18n.t("resume.portfolio.title_field")),
					h('input[type="text"]', {
						value: item.title,
						oninput: (e) => ResumeBuilder.data.portfolio[index].title = e.target.value
					})
				)
			),
			h('div.form-field',
				h('label', I18n.t("resume.portfolio.url")),
				h('input[type="url"]', {
					value: item.url,
					oninput: (e) => ResumeBuilder.data.portfolio[index].url = e.target.value
				})
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removePortfolio(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create education section
	createEducationSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('education', ['institution', 'degree']);
		const content = [
				h('div.dynamic-list', { id: 'education-list' },
					...ResumeBuilder.data.education.map((edu, index) => 
						ResumeBuilder.createEducationItem(edu, index)
					)
				),
			h('div.add-item-section',
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addEducation()
				}, I18n.t("resume.education.addEducation"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('education', 'resume.education.title', content, completion);
	},

	// Create education item
	createEducationItem: (edu, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.education.institution")),
					h('input[type="text"]', {
						value: edu.institution,
						oninput: (e) => ResumeBuilder.data.education[index].institution = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.education.area")),
					h('input[type="text"]', {
						value: edu.area,
						oninput: (e) => ResumeBuilder.data.education[index].area = e.target.value
					})
				)
			),
			h('div.form-field',
				h('label', I18n.t("resume.education.studyType")),
				h('input[type="text"]', {
					value: edu.studyType,
					oninput: (e) => ResumeBuilder.data.education[index].studyType = e.target.value
				})
			),
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.education.startDate")),
					h('input[type="month"]', {
						value: edu.startDate,
						oninput: (e) => ResumeBuilder.data.education[index].startDate = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.education.endDate")),
					h('input[type="month"]', {
						value: edu.endDate || '',
						oninput: (e) => ResumeBuilder.data.education[index].endDate = e.target.value
					})
				)
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeEducation(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create certifications section
	createCertificationsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('certifications', ['name', 'issuer']);
		const content = [
				h('div.dynamic-list', { id: 'certifications-list' },
					...ResumeBuilder.data.certifications.map((cert, index) => 
						ResumeBuilder.createCertificationItem(cert, index)
					)
				),
			h('div.add-item-section',
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addCertification()
				}, I18n.t("resume.certifications.addCertification"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('certifications', 'resume.certifications.title', content, completion);
	},

	// Create certification item
	createCertificationItem: (cert, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.certifications.type")),
					h('input[type="text"]', {
						value: cert.type,
						oninput: (e) => ResumeBuilder.data.certifications[index].type = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.certifications.name")),
					h('input[type="text"]', {
						value: cert.name,
						oninput: (e) => ResumeBuilder.data.certifications[index].name = e.target.value
					})
				)
			),
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.certifications.issuer")),
					h('input[type="text"]', {
						value: cert.issuer,
						oninput: (e) => ResumeBuilder.data.certifications[index].issuer = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.certifications.date")),
					h('input[type="month"]', {
						value: cert.date,
						oninput: (e) => ResumeBuilder.data.certifications[index].date = e.target.value
					})
				)
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeCertification(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create awards section
	createAwardsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('awards', ['title', 'awarder']);
		const content = [
				h('div.dynamic-list', { id: 'awards-list' },
					...ResumeBuilder.data.awards.map((award, index) => 
						ResumeBuilder.createAwardItem(award, index)
					)
				),
			h('div.add-item-section',
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addAward()
				}, I18n.t("resume.awards.addAward"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('awards', 'resume.awards.title', content, completion);
	},

	// Create award item
	createAwardItem: (award, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.awards.type")),
					h('input[type="text"]', {
						value: award.type,
						oninput: (e) => ResumeBuilder.data.awards[index].type = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.awards.title_field")),
					h('input[type="text"]', {
						value: award.title,
						oninput: (e) => ResumeBuilder.data.awards[index].title = e.target.value
					})
				)
			),
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.awards.issuer")),
					h('input[type="text"]', {
						value: award.issuer,
						oninput: (e) => ResumeBuilder.data.awards[index].issuer = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.awards.date")),
					h('input[type="month"]', {
						value: award.date,
						oninput: (e) => ResumeBuilder.data.awards[index].date = e.target.value
					})
				)
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeAward(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create volunteer section
	createVolunteerSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('volunteer', ['organization', 'position']);
		const content = [
				h('div.dynamic-list', { id: 'volunteer-list' },
					...ResumeBuilder.data.volunteer.map((vol, index) => 
						ResumeBuilder.createVolunteerItem(vol, index)
					)
				),
			h('div.add-item-section',
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addVolunteer()
				}, I18n.t("resume.volunteer.addVolunteer"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('volunteer', 'resume.volunteer.title', content, completion);
	},

	// Create volunteer item
	createVolunteerItem: (vol, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.volunteer.organization")),
					h('input[type="text"]', {
						value: vol.organization,
						oninput: (e) => ResumeBuilder.data.volunteer[index].organization = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.volunteer.role")),
					h('input[type="text"]', {
						value: vol.role,
						oninput: (e) => ResumeBuilder.data.volunteer[index].role = e.target.value
					})
				)
			),
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.volunteer.startDate")),
					h('input[type="month"]', {
						value: vol.startDate,
						oninput: (e) => ResumeBuilder.data.volunteer[index].startDate = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.volunteer.endDate")),
					h('input[type="month"]', {
						value: vol.endDate || '',
						oninput: (e) => ResumeBuilder.data.volunteer[index].endDate = e.target.value
					})
				)
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeVolunteer(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create interests section
	createInterestsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion('interests', ['name']);
		const content = [
				h('div.dynamic-list', { id: 'interests-list' },
					...ResumeBuilder.data.interests.map((interest, index) => 
						ResumeBuilder.createInterestItem(interest, index)
					)
				),
			h('div.add-item-section',
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addInterest()
				}, I18n.t("resume.interests.addInterest"))
			)
		];
		
		return ResumeBuilder.createCollapsibleSection('interests', 'resume.interests.title', content, completion);
	},

	// Create interest item
	createInterestItem: (interest, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.interests.type")),
					h('input[type="text"]', {
						value: interest.type,
						oninput: (e) => ResumeBuilder.data.interests[index].type = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.interests.value")),
					h('input[type="text"]', {
						value: interest.value,
						oninput: (e) => ResumeBuilder.data.interests[index].value = e.target.value
					})
				)
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeInterest(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Add/Remove methods for dynamic sections
	addProfile: () => {
		ResumeBuilder.data.basics.profiles.push({ type: "linkedin", url: "" });
		const newIndex = ResumeBuilder.data.basics.profiles.length - 1;
		ResumeBuilder.refresh();
		
		// Mark only the new item for animation and focus
		setTimeout(() => {
			const items = document.querySelectorAll('[data-section="profiles"] .dynamic-item');
			const newItem = items[newIndex];
			if (newItem) {
				newItem.classList.add('newly-added');
				// Remove animation class after animation completes
				setTimeout(() => {
					newItem.classList.remove('newly-added');
				}, 300);
			}
			
			// Focus on first field of new item
			const focusElement = document.querySelector('.focus-first');
			if (focusElement) {
				focusElement.focus();
				focusElement.classList.remove('focus-first');
			}
		}, 10);
	},

	removeProfile: (index) => {
		// Find the specific dynamic item and animate it out
		const items = document.querySelectorAll('[data-section="profiles"] .dynamic-item');
		const itemToRemove = items[index];
		
		if (itemToRemove) {
			itemToRemove.classList.add('removing');
			setTimeout(() => {
				ResumeBuilder.data.basics.profiles.splice(index, 1);
				ResumeBuilder.refresh();
			}, 200); // Match animation duration
		} else {
			// Fallback if item not found
			ResumeBuilder.data.basics.profiles.splice(index, 1);
			ResumeBuilder.refresh();
		}
	},

	addLanguage: () => {
		ResumeBuilder.data.basics.languages.push({ language: "", fluency: "intermediate" });
		const newIndex = ResumeBuilder.data.basics.languages.length - 1;
		ResumeBuilder.refresh();
		
		setTimeout(() => {
			const items = document.querySelectorAll('[data-section="languages"] .dynamic-item');
			const newItem = items[newIndex];
			if (newItem) {
				newItem.classList.add('newly-added');
				setTimeout(() => newItem.classList.remove('newly-added'), 300);
			}
			
			const focusElement = document.querySelector('.focus-first');
			if (focusElement) {
				focusElement.focus();
				focusElement.classList.remove('focus-first');
			}
		}, 10);
	},

	removeLanguage: (index) => {
		ResumeBuilder.data.basics.languages.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addSkill: () => {
		ResumeBuilder.data.skills.push({ name: "", keywords: [""] });
		ResumeBuilder.refresh();
		setTimeout(() => {
			const focusElement = document.querySelector('.focus-first');
			if (focusElement) {
				focusElement.focus();
				focusElement.classList.remove('focus-first');
			}
		}, 50);
	},

	removeSkill: (index) => {
		ResumeBuilder.data.skills.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addSkillKeyword: (skillIndex) => {
		ResumeBuilder.data.skills[skillIndex].keywords.push("");
		ResumeBuilder.refresh();
	},

	removeSkillKeyword: (skillIndex, keywordIndex) => {
		ResumeBuilder.data.skills[skillIndex].keywords.splice(keywordIndex, 1);
		ResumeBuilder.refresh();
	},

	addExperience: () => {
		ResumeBuilder.data.experience.push({
			company: "",
			position: "",
			location: "",
			startDate: "",
			endDate: "",
			summary: "",
			highlights: []
		});
		ResumeBuilder.refresh();
	},

	removeExperience: (index) => {
		ResumeBuilder.data.experience.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addProject: () => {
		ResumeBuilder.data.projects.push({
			name: "",
			description: "",
			url: "",
			tags: []
		});
		ResumeBuilder.refresh();
	},

	removeProject: (index) => {
		ResumeBuilder.data.projects.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addPortfolio: () => {
		ResumeBuilder.data.portfolio.push({
			type: "case-study",
			title: "",
			url: ""
		});
		ResumeBuilder.refresh();
	},

	removePortfolio: (index) => {
		ResumeBuilder.data.portfolio.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addEducation: () => {
		ResumeBuilder.data.education.push({
			institution: "",
			area: "",
			studyType: "",
			startDate: "",
			endDate: ""
		});
		ResumeBuilder.refresh();
	},

	removeEducation: (index) => {
		ResumeBuilder.data.education.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addCertification: () => {
		ResumeBuilder.data.certifications.push({
			type: "",
			name: "",
			issuer: "",
			date: ""
		});
		ResumeBuilder.refresh();
	},

	removeCertification: (index) => {
		ResumeBuilder.data.certifications.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addAward: () => {
		ResumeBuilder.data.awards.push({
			type: "",
			title: "",
			issuer: "",
			date: ""
		});
		ResumeBuilder.refresh();
	},

	removeAward: (index) => {
		ResumeBuilder.data.awards.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addVolunteer: () => {
		ResumeBuilder.data.volunteer.push({
			organization: "",
			role: "",
			startDate: "",
			endDate: ""
		});
		ResumeBuilder.refresh();
	},

	removeVolunteer: (index) => {
		ResumeBuilder.data.volunteer.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addInterest: () => {
		ResumeBuilder.data.interests.push({
			type: "",
			value: ""
		});
		ResumeBuilder.refresh();
	},

	removeInterest: (index) => {
		ResumeBuilder.data.interests.splice(index, 1);
		ResumeBuilder.refresh();
	},

	// Save to localStorage
	save: () => {
		ResumeStorage.save(ResumeBuilder.data);
		// Show success message or notification here
		console.log("Resume saved successfully");
	},

	// Load from localStorage
	load: () => {
		const saved = ResumeStorage.load();
		if (saved) {
			ResumeBuilder.data = saved;
			ResumeBuilder.refresh();
		}
	},

	// Export JSON
	exportJSON: () => {
		const dataStr = JSON.stringify(ResumeBuilder.data, null, 2);
		const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
		
		const exportFileDefaultName = 'resume.json';
		
		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	},

	// Import JSON
	importJSON: () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		
		input.onchange = (event) => {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const imported = JSON.parse(e.target.result);
						ResumeBuilder.data = imported;
						ResumeBuilder.save();
						ResumeBuilder.refresh();
						console.log("Resume imported successfully");
					} catch (error) {
						console.error("Error importing resume:", error);
						alert("Error importing resume. Please check the file format.");
					}
				};
				reader.readAsText(file);
			}
		};
		
		input.click();
	},

	// Refresh the interface
	refresh: () => {
		const container = document.querySelector('.tab-content[data-tab="resume"]');
		if (container) {
			// Store current collapsed states before refresh
			const currentCollapsedStates = {...ResumeBuilder.collapsedSections};
			
			container.innerHTML = '';
			const newContent = ResumeBuilder.create();
			container.appendChild(newContent);
			ResumeBuilder.updateJSON();
			
			// Restore collapsed states after refresh  
			setTimeout(() => {
				Object.keys(currentCollapsedStates).forEach(sectionId => {
					if (currentCollapsedStates[sectionId]) {
						const content = document.querySelector(`[data-section="${sectionId}"] .section-content`);
						const arrow = document.querySelector(`[data-section="${sectionId}"] .section-arrow`);
						if (content && arrow) {
							content.classList.add('collapsed');
							arrow.classList.add('collapsed');
						}
					}
				});
			}, 10);
		}
	},

	// Initialize resume tab
	init: () => {
		const container = document.querySelector('.tab-content[data-tab="resume"]');
		if (container) {
			// Load saved data
			ResumeBuilder.load();
			// Create and append the resume builder
			container.appendChild(ResumeBuilder.create());
		}
	}
};

// Resume storage utilities
const ResumeStorage = {
	STORAGE_KEY: 'jobtracker_resume',

	save: (data) => {
		try {
			localStorage.setItem(ResumeStorage.STORAGE_KEY, JSON.stringify(data));
			return true;
		} catch (error) {
			console.error('Error saving resume:', error);
			return false;
		}
	},

	load: () => {
		try {
			const data = localStorage.getItem(ResumeStorage.STORAGE_KEY);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error('Error loading resume:', error);
			return null;
		}
	},

	clear: () => {
		localStorage.removeItem(ResumeStorage.STORAGE_KEY);
	}
};

// Export to global scope
window.ResumeBuilder = ResumeBuilder;
window.ResumeStorage = ResumeStorage;