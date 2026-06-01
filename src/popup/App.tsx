import { useEffect, useState } from "react"
import { loadProfile, saveProfile } from "../shared/Storage"
import { defaultProfile, type Profile } from "../shared/Profile";

function App() {
    const [profile, setProfile] = useState<Profile>(defaultProfile)

    useEffect(() => {

        async function load() {
            const storedProfile = await loadProfile();
            setProfile(storedProfile)
        }
        load();
    }, [])

    function onFillIt() : void {
        chrome.tabs.query({ active: true, currentWindow: true },
             (tabs) => { chrome.tabs.sendMessage(tabs[0].id!, { action: 'fill', profile })
        })
    }
    return (
        <div className="w-96 p-4 font-sans">
            <h1 className="text-xl font-bold mb-4">Fill It</h1>

            <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); saveProfile(profile) }}>
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
                    placeholder="City"
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={profile.city}
                    onChange={(e) => { setProfile({ ...profile, city: e.target.value }) }}
                />
                <input
                    type="text"
                    placeholder="State"
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={profile.state}
                    onChange={(e) => { setProfile({ ...profile, state: e.target.value }) }}
                />
                <input
                    type="text"
                    placeholder="Country"
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={profile.country}
                    onChange={(e) => { setProfile({ ...profile, country: e.target.value }) }}
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
                    placeholder="Location (City, Country)"
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={profile.location}
                    onChange={(e) => { setProfile({ ...profile, location: e.target.value }) }}
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
                    type="submit"
                    className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
                >
                    Save Profile
                </button>
                <button
                    type="button"
                    className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
                    onClick={onFillIt}
                >
                    Fill It
                </button>
            </form>
        </div>
    )
}

export default App
