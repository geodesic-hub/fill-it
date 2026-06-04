import { z } from 'zod'

export const EducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  field: z.string(),
  graduationYear: z.string(),
})

export type Education = z.infer<typeof EducationSchema>
 
export const defaultEducation : Education = {
  school: '',
  degree: '',
  field: '',
  graduationYear: '',
}