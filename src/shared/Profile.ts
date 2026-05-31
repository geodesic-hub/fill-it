import { z } from 'zod'
import { ExperienceSchema } from './Experience'
import { EducationSchema } from './Education'


export const ProfileSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  location: z.string(),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
})

export type Profile = z.infer<typeof ProfileSchema>

export const defaultProfile: Profile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedIn: '',
  website: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
}
