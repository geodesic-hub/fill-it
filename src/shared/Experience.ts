import { z } from 'zod'

export const ExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string(),
})

export type Experience = z.infer<typeof ExperienceSchema>
