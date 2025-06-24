import { z } from "zod"

export const ResumeSchema = z.object({
  basics: z.object({
    name: z.string().describe("Full name"),
    label: z.string().describe("Professional title or role"),
    summary: z.string().describe("Short professional summary"),
    email: z.string().email().describe("Email address"),
    phone: z.string().describe("Phone number"),
    location: z.object({
      city: z.string().describe("City of residence"),
      country: z.string().describe("Country of residence")
    }),
    profiles: z
      .array(
        z.object({
          type: z.string().describe("Platform name (e.g. linkedin, github)"),
          url: z.string().url().describe("Link to profile")
        })
      )
      .describe("Online profiles"),
    languages: z
      .array(
        z.object({
          language: z.string().describe("Language name"),
          fluency: z.string().describe("Fluency level (e.g. native, intermediate)")
        })
      )
      .describe("Spoken or written languages"),
    personalStatement: z.string().optional().describe("Optional personal mission or summary")
  }),

  skills: z
    .array(
      z.object({
        name: z.string().describe("Skill group or category name"),
        keywords: z.array(z.string()).describe("List of skills or tools")
      })
    )
    .describe("Grouped skill areas"),

  experience: z
    .array(
      z.object({
        company: z.string().describe("Company name"),
        position: z.string().describe("Job title or role"),
        location: z.string().describe("Job location (or 'Remote')"),
        startDate: z.string().describe("Start date in YYYY-MM"),
        endDate: z.string().optional().describe("End date in YYYY-MM (optional if current)"),
        summary: z.string().describe("Short summary of responsibilities"),
        highlights: z.array(z.string()).describe("Achievements or key contributions")
      })
    )
    .describe("Work or freelance experience"),

  projects: z
    .array(
      z.object({
        name: z.string().describe("Project name"),
        description: z.string().describe("Project summary or goal"),
        url: z.string().url().optional().describe("Project link (if public)"),
        tags: z.array(z.string()).optional().describe("Keywords or technologies")
      })
    )
    .describe("Personal, freelance, or open-source projects"),

  portfolio: z
    .array(
      z.object({
        type: z.string().describe("Type of item (e.g. case-study, artwork)"),
        title: z.string().describe("Display title"),
        url: z.string().url().describe("Direct link to portfolio item")
      })
    )
    .optional()
    .describe("Visual or case study portfolio items"),

  education: z
    .array(
      z.object({
        institution: z.string().describe("School, university, or course provider"),
        area: z.string().describe("Field of study (e.g. Design, Engineering)"),
        studyType: z.string().describe("Degree type (e.g. BA, Bootcamp)"),
        startDate: z.string().describe("Start date in YYYY-MM"),
        endDate: z.string().optional().describe("End date in YYYY-MM")
      })
    )
    .describe("Formal or informal education"),

  certifications: z
    .array(
      z.object({
        type: z.string().describe("Certification or license type"),
        name: z.string().describe("Certificate title"),
        issuer: z.string().describe("Issuing organization"),
        date: z.string().describe("Issue date in YYYY-MM")
      })
    )
    .optional()
    .describe("Professional certifications or licenses"),

  awards: z
    .array(
      z.object({
        type: z.string().describe("Award type (e.g. industry, internal)"),
        title: z.string().describe("Award title"),
        issuer: z.string().describe("Awarding body"),
        date: z.string().describe("Award date in YYYY-MM")
      })
    )
    .optional()
    .describe("Recognitions or honors"),

  volunteer: z
    .array(
      z.object({
        organization: z.string().describe("Organization name"),
        role: z.string().describe("Volunteer role or activity"),
        startDate: z.string().describe("Start date in YYYY-MM"),
        endDate: z.string().optional().describe("End date in YYYY-MM")
      })
    )
    .optional()
    .describe("Volunteer or unpaid contributions"),

  interests: z
    .array(
      z.object({
        type: z.string().describe("Topic or theme"),
        value: z.string().describe("Interest description")
      })
    )
    .optional()
    .describe("Personal interests or passions")
})