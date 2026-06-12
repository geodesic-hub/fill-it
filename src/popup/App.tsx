import { useEffect, useRef, useState } from "react"
import { Country, State } from 'country-state-city'
import { loadActiveTab, loadEducation, loadExperience, loadProfile, saveActiveTab, saveEducation, saveExperience, saveProfile, type ActiveTab } from "../shared/Storage"
import { defaultProfile, type Profile } from "../shared/Profile";
import { defaultEducation, type Education } from "../shared/Education";
import { defaultExperience, type Experience } from "../shared/Experience";
import { useAccordion } from "./useAccordion";
import { useDirtyState } from "./useDirtyState";

type Tab = ActiveTab

function App() {
    // Each value tracks its own unsaved-changes flag so we can remind the user
    // to save. `set*` flags dirty automatically; `clean*` clears it on save/load.
    const [profile, setProfile, dirtyProfile, cleanProfile] = useDirtyState<Profile>(defaultProfile)
    const [education, setEducation, dirtyEducation, cleanEducation] = useDirtyState<Education[]>([])
    const [experience, setExperience, dirtyExperience, cleanExperience] = useDirtyState<Experience[]>([])
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const [toast, setToast] = useState<string | null>(null)
    const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

    const expAccordion = useAccordion()
    const eduAccordion = useAccordion()

    function showToast(message: string): void {
        setToast(message)
        clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 2000)
    }

    function selectTab(tab: Tab): void {
        setActiveTab(tab)
        void saveActiveTab(tab)
    }

    useEffect(() => {
        async function load() {
            const storedProfile = await loadProfile();
            const storedEducation = await loadEducation();
            const storedExperience = await loadExperience();
            const storedTab = await loadActiveTab();
            cleanProfile(storedProfile)
            cleanExperience(storedExperience.length === 0 ? [defaultExperience] : storedExperience)
            cleanEducation(storedEducation.length === 0 ? [defaultEducation] : storedEducation)
            setActiveTab(storedTab)
        }
        load();
    }, [cleanProfile, cleanExperience, cleanEducation])

    const dirty: Record<Tab, boolean> = {
        profile: dirtyProfile,
        experience: dirtyExperience,
        education: dirtyEducation,
    }

    function onFillIt(): void {
        chrome.tabs.query({ active: true, currentWindow: true },
            (tabs) => { chrome.tabs.sendMessage(tabs[0].id!, { action: 'fill', profile, experience, education }) })
        showToast('Filling form on the active tab…')
    }

    const tabClass = (tab: Tab) =>
        `px-4 py-2 text-sm font-medium border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`

    return (
        <div className="w-96 p-4 font-sans">
            <img src="/icons/icon-128.png" alt="Fill It" className="h-8 w-8 rounded mb-2" />

            {toast && (
                <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 rounded bg-green-100 border border-green-300 text-green-800 px-3 py-2 text-sm shadow-md">
                    {toast}
                </div>
            )}

            <div className="flex border-b mb-4">
                <button type="button" className={tabClass('profile')} onClick={() => selectTab('profile')}>Profile{dirty.profile && <span className="text-amber-500"> •</span>}</button>
                <button type="button" className={tabClass('experience')} onClick={() => selectTab('experience')}>Experience{dirty.experience && <span className="text-amber-500"> •</span>}</button>
                <button type="button" className={tabClass('education')} onClick={() => selectTab('education')}>Education{dirty.education && <span className="text-amber-500"> •</span>}</button>
            </div>

            {dirty[activeTab] && (
                <div className="mb-3 rounded bg-amber-50 border border-amber-300 text-amber-800 px-3 py-2 text-xs">
                    You have unsaved changes — don’t forget to <span className="font-medium">Save</span>.
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.fullName}
                        onChange={(e) => { setProfile({ ...profile, fullName: e.target.value }) }}
                    />
                    <input
                        type="text"
                        placeholder="First Name"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.firstName}
                        onChange={(e) => { setProfile({ ...profile, firstName: e.target.value }) }}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.lastName}
                        onChange={(e) => { setProfile({ ...profile, lastName: e.target.value }) }}
                    />
                    <input
                        type="text"
                        placeholder="Preferred Name"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.preferredName}
                        onChange={(e) => { setProfile({ ...profile, preferredName: e.target.value }) }}
                    />
                    <select
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.country}
                        onChange={(e) => { setProfile({ ...profile, country: e.target.value, state: '', city: '' }) }}
                    >
                        <option value="">Select Country</option>
                        {Country.getAllCountries().map(c => (
                            <option key={c.isoCode} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    <select
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.state}
                        onChange={(e) => { setProfile({ ...profile, state: e.target.value, city: '' }) }}
                    >
                        <option value="">Select State</option>
                        {State.getStatesOfCountry(
                            Country.getAllCountries().find(c => c.name === profile.country)?.isoCode ?? ''
                        ).map(s => (
                            <option key={s.isoCode} value={s.name}>{s.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="City"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.city}
                        onChange={(e) => { setProfile({ ...profile, city: e.target.value }) }}
                    />
                    <input
                        type="text"
                        placeholder="Zipcode"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.zipcode}
                        onChange={(e) => { setProfile({ ...profile, zipcode: e.target.value }) }}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.email}
                        onChange={(e) => { setProfile({ ...profile, email: e.target.value }) }}
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.phone}
                        onChange={(e) => { setProfile({ ...profile, phone: e.target.value }) }}
                    />
                    <input
                        type="text"
                        placeholder="Address Line 1"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.addressLine1}
                        onChange={(e) => { setProfile({ ...profile, addressLine1: e.target.value }) }}
                    />
                    <input
                        type="text"
                        placeholder="Address Line 2"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.addressLine2}
                        onChange={(e) => { setProfile({ ...profile, addressLine2: e.target.value }) }}
                    />
                    <input
                        type="url"
                        placeholder="LinkedIn URL"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.linkedIn ?? ""}
                        onChange={(e) => { setProfile({ ...profile, linkedIn: e.target.value }) }}
                    />
                    <input
                        type="url"
                        placeholder="Website URL"
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={profile.website ?? ""}
                        onChange={(e) => { setProfile({ ...profile, website: e.target.value }) }}
                    />
                    <textarea
                        placeholder="Summary"
                        rows={3}
                        className="border rounded px-3 py-2 text-sm w-full resize-none"
                        value={profile.summary}
                        onChange={(e) => { setProfile({ ...profile, summary: e.target.value }) }}
                    />
                    <button
                        type="button"
                        className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
                        onClick={() => { saveProfile(profile); cleanProfile(profile); showToast('Profile saved') }}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
                        onClick={onFillIt}
                    >
                        Fill
                    </button>
                </div>
            )}

            {activeTab === 'experience' && (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <button type="button" className="border rounded px-3 py-1 text-sm font-medium text-gray-600" onClick={expAccordion.expandAll}>Expand all</button>
                        <button type="button" className="border rounded px-3 py-1 text-sm font-medium text-gray-600" onClick={expAccordion.collapseAll}>Collapse all</button>
                    </div>
                    <div ref={expAccordion.listRef} className="flex flex-col gap-2">
                        {experience.map((exp, i) => (
                            <details key={i} onToggle={expAccordion.onToggle} className="border rounded">
                                <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
                                    Experience {i + 1}{exp.company ? ` — ${exp.company}` : ''}
                                </summary>
                                <div className="flex flex-col gap-2 p-3 pt-0">
                                    <input type="text" placeholder="Company" className="border rounded px-3 py-2 text-sm w-full"
                                        value={exp.company}
                                        onChange={(e) => { const updated = [...experience]; updated[i] = { ...updated[i], company: e.target.value }; setExperience(updated) }} />
                                    <input type="text" placeholder="Title" className="border rounded px-3 py-2 text-sm w-full"
                                        value={exp.title}
                                        onChange={(e) => { const updated = [...experience]; updated[i] = { ...updated[i], title: e.target.value }; setExperience(updated) }} />
                                    <input type="text" placeholder="Start Date" className="border rounded px-3 py-2 text-sm w-full"
                                        value={exp.startDate}
                                        onChange={(e) => { const updated = [...experience]; updated[i] = { ...updated[i], startDate: e.target.value }; setExperience(updated) }} />
                                    <input type="text" placeholder="End Date (leave blank if current)" className="border rounded px-3 py-2 text-sm w-full"
                                        value={exp.endDate ?? ''}
                                        onChange={(e) => { const updated = [...experience]; updated[i] = { ...updated[i], endDate: e.target.value }; setExperience(updated) }} />
                                    <textarea placeholder="Description" rows={3} className="border rounded px-3 py-2 text-sm w-full resize-none"
                                        value={exp.roleDescription}
                                        onChange={(e) => { const updated = [...experience]; updated[i] = { ...updated[i], roleDescription: e.target.value }; setExperience(updated) }} />
                                    <button type="button" className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium" onClick={() => { saveExperience(experience); cleanExperience(experience); showToast('Experience saved') }}>Save</button>
                                    <button type="button" className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium" onClick={onFillIt}>Fill</button>
                                    <button type="button" className="text-red-500 text-sm" onClick={() => { const updated = experience.filter((_, idx) => idx !== i); saveExperience(updated); cleanExperience(updated) }}>Remove</button>
                                </div>
                            </details>
                        ))}
                        <button type="button" className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
                            onClick={() => setExperience([...experience, { ...defaultExperience }])}>
                            Add Experience
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'education' && (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <button type="button" className="border rounded px-3 py-1 text-sm font-medium text-gray-600" onClick={eduAccordion.expandAll}>Expand all</button>
                        <button type="button" className="border rounded px-3 py-1 text-sm font-medium text-gray-600" onClick={eduAccordion.collapseAll}>Collapse all</button>
                    </div>
                    <div ref={eduAccordion.listRef} className="flex flex-col gap-2">
                        {education.map((edu, i) => (
                            <details key={i} onToggle={eduAccordion.onToggle} className="border rounded">
                                <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
                                    Education {i + 1}{edu.school ? ` — ${edu.school}` : ''}
                                </summary>
                                <div className="flex flex-col gap-2 p-3 pt-0">
                                    <input type="text" placeholder="School" className="border rounded px-3 py-2 text-sm w-full"
                                        value={edu.school}
                                        onChange={(e) => { const updated = [...education]; updated[i] = { ...updated[i], school: e.target.value }; setEducation(updated) }} />
                                    <input type="text" placeholder="Degree" className="border rounded px-3 py-2 text-sm w-full"
                                        value={edu.degree}
                                        onChange={(e) => { const updated = [...education]; updated[i] = { ...updated[i], degree: e.target.value }; setEducation(updated) }} />
                                    <input type="text" placeholder="Field of Study" className="border rounded px-3 py-2 text-sm w-full"
                                        value={edu.field}
                                        onChange={(e) => { const updated = [...education]; updated[i] = { ...updated[i], field: e.target.value }; setEducation(updated) }} />
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="From (YYYY)" className="border rounded px-3 py-2 text-sm w-full"
                                            value={edu.startYear}
                                            onChange={(e) => { const updated = [...education]; updated[i] = { ...updated[i], startYear: e.target.value }; setEducation(updated) }} />
                                        <input type="text" placeholder="To (YYYY)" className="border rounded px-3 py-2 text-sm w-full"
                                            value={edu.endYear}
                                            onChange={(e) => { const updated = [...education]; updated[i] = { ...updated[i], endYear: e.target.value }; setEducation(updated) }} />
                                    </div>
                                    <button type="button" className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium" onClick={() => { saveEducation(education); cleanEducation(education); showToast('Education saved') }}>Save</button>
                                    <button type="button" className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium" onClick={onFillIt}>Fill</button>
                                    <button type="button" className="text-red-500 text-sm" onClick={() => { const updated = education.filter((_, idx) => idx !== i); saveEducation(updated); cleanEducation(updated) }}>Remove</button>
                                </div>
                            </details>
                        ))}
                        <button type="button" className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
                            onClick={() => setEducation([...education, { ...defaultEducation }])}>
                            Add Education
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
