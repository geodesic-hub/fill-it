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