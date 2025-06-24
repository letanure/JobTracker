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

	// Create the resume builder interface
	create: () => {
		const container = h('div.resume-container',
			// Header
			h('div.tab-header',
				h('h2.tab-title', I18n.t("headers.resume")),
				h('div.resume-actions',
					h('button.btn-secondary', {
						onclick: () => ResumeBuilder.exportJSON()
					}, I18n.t("resume.actions.export")),
					h('button.btn-secondary', {
						onclick: () => ResumeBuilder.importJSON()
					}, I18n.t("resume.actions.import")),
					h('button.btn-primary', {
						onclick: () => ResumeBuilder.save()
					}, I18n.t("resume.actions.save"))
				)
			),

			// Form container with sections
			h('div.resume-form',
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
			)
		);

		return container;
	},

	// Create basics section
	createBasicsSection: () => {
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.basics.title")),
			h('div.resume-section-content',
				h('div.form-grid-2',
					h('div.form-field',
						h('label', I18n.t("resume.basics.name")),
						h('input[type="text"]', {
							id: 'basics-name',
							value: ResumeBuilder.data.basics.name,
							oninput: (e) => ResumeBuilder.data.basics.name = e.target.value
						})
					),
					h('div.form-field',
						h('label', I18n.t("resume.basics.label")),
						h('input[type="text"]', {
							id: 'basics-label',
							value: ResumeBuilder.data.basics.label,
							oninput: (e) => ResumeBuilder.data.basics.label = e.target.value
						})
					)
				),
				h('div.form-field',
					h('label', I18n.t("resume.basics.summary")),
					h('textarea', {
						id: 'basics-summary',
						rows: 3,
						value: ResumeBuilder.data.basics.summary,
						oninput: (e) => ResumeBuilder.data.basics.summary = e.target.value
					})
				),
				h('div.form-grid-2',
					h('div.form-field',
						h('label', I18n.t("resume.basics.email")),
						h('input[type="email"]', {
							id: 'basics-email',
							value: ResumeBuilder.data.basics.email,
							oninput: (e) => ResumeBuilder.data.basics.email = e.target.value
						})
					),
					h('div.form-field',
						h('label', I18n.t("resume.basics.phone")),
						h('input[type="tel"]', {
							id: 'basics-phone',
							value: ResumeBuilder.data.basics.phone,
							oninput: (e) => ResumeBuilder.data.basics.phone = e.target.value
						})
					)
				),
				h('div.form-group',
					h('h4', I18n.t("resume.basics.locationTitle")),
					h('div.form-grid-2',
						h('div.form-field',
							h('label', I18n.t("resume.basics.city")),
							h('input[type="text"]', {
								id: 'basics-city',
								value: ResumeBuilder.data.basics.location.city,
								oninput: (e) => ResumeBuilder.data.basics.location.city = e.target.value
							})
						),
						h('div.form-field',
							h('label', I18n.t("resume.basics.country")),
							h('input[type="text"]', {
								id: 'basics-country',
								value: ResumeBuilder.data.basics.location.country,
								oninput: (e) => ResumeBuilder.data.basics.location.country = e.target.value
							})
						)
					)
				),
				h('div.form-field',
					h('label', I18n.t("resume.basics.personalStatement")),
					h('textarea', {
						id: 'basics-personal-statement',
						rows: 2,
						value: ResumeBuilder.data.basics.personalStatement,
						oninput: (e) => ResumeBuilder.data.basics.personalStatement = e.target.value
					})
				)
			)
		);
	},

	// Create profiles section
	createProfilesSection: () => {
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.profiles.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'profiles-list' },
					...ResumeBuilder.data.basics.profiles.map((profile, index) => 
						ResumeBuilder.createProfileItem(profile, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addProfile()
				}, I18n.t("resume.profiles.addProfile"))
			)
		);
	},

	// Create profile item
	createProfileItem: (profile, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.profiles.type")),
					h('select', {
						value: profile.type,
						onchange: (e) => ResumeBuilder.data.basics.profiles[index].type = e.target.value
					},
						h('option[value="linkedin"]', I18n.t("resume.profiles.platforms.linkedin")),
						h('option[value="github"]', I18n.t("resume.profiles.platforms.github")),
						h('option[value="twitter"]', I18n.t("resume.profiles.platforms.twitter")),
						h('option[value="website"]', I18n.t("resume.profiles.platforms.website")),
						h('option[value="other"]', I18n.t("resume.profiles.platforms.other"))
					)
				),
				h('div.form-field',
					h('label', I18n.t("resume.profiles.url")),
					h('input[type="url"]', {
						value: profile.url,
						oninput: (e) => ResumeBuilder.data.basics.profiles[index].url = e.target.value
					})
				)
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeProfile(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create languages section
	createLanguagesSection: () => {
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.languages.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'languages-list' },
					...ResumeBuilder.data.basics.languages.map((lang, index) => 
						ResumeBuilder.createLanguageItem(lang, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addLanguage()
				}, I18n.t("resume.languages.addLanguage"))
			)
		);
	},

	// Create language item
	createLanguageItem: (lang, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.languages.language")),
					h('input[type="text"]', {
						value: lang.language,
						oninput: (e) => ResumeBuilder.data.basics.languages[index].language = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.languages.fluency")),
					h('select', {
						value: lang.fluency,
						onchange: (e) => ResumeBuilder.data.basics.languages[index].fluency = e.target.value
					},
						h('option[value="native"]', I18n.t("resume.languages.levels.native")),
						h('option[value="fluent"]', I18n.t("resume.languages.levels.fluent")),
						h('option[value="intermediate"]', I18n.t("resume.languages.levels.intermediate")),
						h('option[value="beginner"]', I18n.t("resume.languages.levels.beginner"))
					)
				)
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeLanguage(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create skills section
	createSkillsSection: () => {
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.skills.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'skills-list' },
					...ResumeBuilder.data.skills.map((skill, index) => 
						ResumeBuilder.createSkillItem(skill, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addSkill()
				}, I18n.t("resume.skills.addSkill"))
			)
		);
	},

	// Create skill item
	createSkillItem: (skill, index) => {
		return h('div.dynamic-item',
			h('div.form-field',
				h('label', I18n.t("resume.skills.name")),
				h('input[type="text"]', {
					value: skill.name,
					oninput: (e) => ResumeBuilder.data.skills[index].name = e.target.value
				})
			),
			h('div.form-field',
				h('label', I18n.t("resume.skills.keywords")),
				h('textarea', {
					rows: 2,
					value: skill.keywords.join(', '),
					oninput: (e) => ResumeBuilder.data.skills[index].keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k)
				})
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeSkill(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create experience section
	createExperienceSection: () => {
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.experience.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'experience-list' },
					...ResumeBuilder.data.experience.map((exp, index) => 
						ResumeBuilder.createExperienceItem(exp, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addExperience()
				}, I18n.t("resume.experience.addExperience"))
			)
		);
	},

	// Create experience item
	createExperienceItem: (exp, index) => {
		return h('div.dynamic-item',
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.experience.company")),
					h('input[type="text"]', {
						value: exp.company,
						oninput: (e) => ResumeBuilder.data.experience[index].company = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.experience.position")),
					h('input[type="text"]', {
						value: exp.position,
						oninput: (e) => ResumeBuilder.data.experience[index].position = e.target.value
					})
				)
			),
			h('div.form-field',
				h('label', I18n.t("resume.experience.location")),
				h('input[type="text"]', {
					value: exp.location,
					oninput: (e) => ResumeBuilder.data.experience[index].location = e.target.value
				})
			),
			h('div.form-grid-2',
				h('div.form-field',
					h('label', I18n.t("resume.experience.startDate")),
					h('input[type="month"]', {
						value: exp.startDate,
						oninput: (e) => ResumeBuilder.data.experience[index].startDate = e.target.value
					})
				),
				h('div.form-field',
					h('label', I18n.t("resume.experience.endDate")),
					h('input[type="month"]', {
						value: exp.endDate || '',
						oninput: (e) => ResumeBuilder.data.experience[index].endDate = e.target.value
					})
				)
			),
			h('div.form-field',
				h('label', I18n.t("resume.experience.summary")),
				h('textarea', {
					rows: 2,
					value: exp.summary,
					oninput: (e) => ResumeBuilder.data.experience[index].summary = e.target.value
				})
			),
			h('div.form-field',
				h('label', I18n.t("resume.experience.highlights")),
				h('textarea', {
					rows: 3,
					value: exp.highlights.join('\n'),
					oninput: (e) => ResumeBuilder.data.experience[index].highlights = e.target.value.split('\n').filter(h => h.trim())
				})
			),
			h('button.btn-remove', {
				onclick: () => ResumeBuilder.removeExperience(index)
			}, I18n.t("resume.actions.remove"))
		);
	},

	// Create projects section
	createProjectsSection: () => {
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.projects.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'projects-list' },
					...ResumeBuilder.data.projects.map((project, index) => 
						ResumeBuilder.createProjectItem(project, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addProject()
				}, I18n.t("resume.projects.addProject"))
			)
		);
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
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.portfolio.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'portfolio-list' },
					...ResumeBuilder.data.portfolio.map((item, index) => 
						ResumeBuilder.createPortfolioItem(item, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addPortfolio()
				}, I18n.t("resume.portfolio.addPortfolio"))
			)
		);
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
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.education.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'education-list' },
					...ResumeBuilder.data.education.map((edu, index) => 
						ResumeBuilder.createEducationItem(edu, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addEducation()
				}, I18n.t("resume.education.addEducation"))
			)
		);
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
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.certifications.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'certifications-list' },
					...ResumeBuilder.data.certifications.map((cert, index) => 
						ResumeBuilder.createCertificationItem(cert, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addCertification()
				}, I18n.t("resume.certifications.addCertification"))
			)
		);
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
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.awards.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'awards-list' },
					...ResumeBuilder.data.awards.map((award, index) => 
						ResumeBuilder.createAwardItem(award, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addAward()
				}, I18n.t("resume.awards.addAward"))
			)
		);
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
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.volunteer.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'volunteer-list' },
					...ResumeBuilder.data.volunteer.map((vol, index) => 
						ResumeBuilder.createVolunteerItem(vol, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addVolunteer()
				}, I18n.t("resume.volunteer.addVolunteer"))
			)
		);
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
		return h('div.resume-section',
			h('h3.resume-section-title', I18n.t("resume.interests.title")),
			h('div.resume-section-content',
				h('div.dynamic-list', { id: 'interests-list' },
					...ResumeBuilder.data.interests.map((interest, index) => 
						ResumeBuilder.createInterestItem(interest, index)
					)
				),
				h('button.btn-secondary.add-item-btn', {
					onclick: () => ResumeBuilder.addInterest()
				}, I18n.t("resume.interests.addInterest"))
			)
		);
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
		ResumeBuilder.refresh();
	},

	removeProfile: (index) => {
		ResumeBuilder.data.basics.profiles.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addLanguage: () => {
		ResumeBuilder.data.basics.languages.push({ language: "", fluency: "intermediate" });
		ResumeBuilder.refresh();
	},

	removeLanguage: (index) => {
		ResumeBuilder.data.basics.languages.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addSkill: () => {
		ResumeBuilder.data.skills.push({ name: "", keywords: [] });
		ResumeBuilder.refresh();
	},

	removeSkill: (index) => {
		ResumeBuilder.data.skills.splice(index, 1);
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
			container.innerHTML = '';
			container.appendChild(ResumeBuilder.create());
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