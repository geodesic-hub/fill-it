import { defaultEducation, EducationSchema, type Education } from "./Education";
import { defaultExperience, ExperienceSchema, type Experience } from "./Experience";
import { defaultProfile, ProfileSchema, type Profile } from "./Profile";


export async function saveProfile(profile: Profile): Promise<void> {
    await chrome.storage.sync.set({ profile });
}

export async function loadProfile(): Promise<Profile> {
    const result = await chrome.storage.sync.get('profile');

    if (!result.profile) return defaultProfile;

    const parsed = ProfileSchema.safeParse(result.profile);

    return parsed.success ? parsed.data : defaultProfile;
}

export async function saveExperience(experience: Experience[]): Promise<void> {
    await chrome.storage.sync.set({ experience });
}

export async function loadExperience(): Promise<Experience[]> {
    const result = await chrome.storage.sync.get('experience');

    if (!result.experience) return [];

    const parsed = ExperienceSchema.array().safeParse(result.experience);

    return parsed.success ? parsed.data : [];
}

export async function saveEducation(education: Education[]): Promise<void> {
    await chrome.storage.sync.set({ education });
}

export async function loadEducation(): Promise<Education[]> {
    const result = await chrome.storage.sync.get('education');

    if (!result.education) return [];

    const parsed = EducationSchema.array().safeParse(result.education);

    return parsed.success ? parsed.data : [defaultEducation];
}