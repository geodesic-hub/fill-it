import type { Profile } from "../shared/Profile"

type FillableField = 'fullName' | 'firstName' | 'lastName' | 'email' | 'phone'
                  | 'location' | 'city' | 'state' | 'country' | 'zipcode'
                  | 'linkedIn' | 'website'

function buildSelectors(terms: string[], extras: string[] = []): string[] {
    return [
        ...terms.flatMap(term => [
            `input[name*="${term}" i]`,
            `input[id*="${term}" i]`,
            `input[placeholder*="${term}" i]`,
            `input[aria-label*="${term}" i]`,
        ]),
        ...extras
    ]
}

const fieldSelectors: Record<FillableField, string[]> = {
    fullName:  buildSelectors(['fullname', 'full-name', 'full_name'], ['input[autocomplete="name"]']),
    firstName: buildSelectors(['firstname', 'first-name', 'first_name', 'fname'], ['input[autocomplete="given-name"]']),
    lastName:  buildSelectors(['lastname', 'last-name', 'last_name', 'lname'], ['input[autocomplete="family-name"]']),
    email:     buildSelectors(['email'], ['input[type="email"]', 'input[autocomplete="email"]']),
    phone:     buildSelectors(['phone', 'mobile', 'tel'], ['input[type="tel"]', 'input[autocomplete="tel"]']),
    location:  buildSelectors(['location']),
    city:      buildSelectors(['city', 'town'], ['input[autocomplete="address-level2"]']),
    state:     buildSelectors(['state', 'province', 'region'], ['input[autocomplete="address-level1"]']),
    country:   buildSelectors(['country'], ['input[autocomplete="country-name"]']),
    zipcode:   buildSelectors(['zip', 'postal', 'postcode'], ['input[autocomplete="postal-code"]']),
    linkedIn:  buildSelectors(['linkedin']),
    website:   buildSelectors(['website', 'portfolio'], ['input[autocomplete="url"]']),
}

function findInput(selectors: string[]): HTMLInputElement | null {
    for (const selector of selectors) {
        const input = document.querySelector<HTMLInputElement>(selector)
        if (input) return input
    }
    return null
}

function fillForm(profile: Profile) {
    for (const [field, selectors] of Object.entries(fieldSelectors)) {
        const input = findInput(selectors)
        if (input) input.value = profile[field as FillableField] ?? ''
    }
}

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === 'fill') {
        fillForm(message.profile)
    }
})
