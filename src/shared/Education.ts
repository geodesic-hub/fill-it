import { z } from 'zod'

export const EducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  field: z.string(),
  startYear: z.string(),
  endYear: z.string(),
})

export type Education = z.infer<typeof EducationSchema>

export const defaultEducation : Education = {
  school: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
}