import { z } from 'zod'
import { ExperienceSchema } from './Experience'
import { EducationSchema } from './Education'


export const ProfileSchema = z.object({
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  addressLine1: z.string().default(''),
  addressLine2: z.string().default(''),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  zipcode: z.string(),
  preferredName: z.string().default(''),
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
    addressLine1: '',
    addressLine2: '',
    linkedIn: '',
    website: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    firstName: '',
    lastName: '',
    preferredName: '',
    city: '',
    state: '',
    zipcode: '',
    country: ''
}
