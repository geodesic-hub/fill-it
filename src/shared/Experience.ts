import { z } from 'zod'

export const ExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  roleDescription: z.string(),
})

export type Experience = z.infer<typeof ExperienceSchema>

export const defaultExperience: Experience = {
company: '',
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  roleDescription: '',
}
