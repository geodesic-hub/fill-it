import type { Profile } from "../shared/Profile"

type FillableField = 'fullName' | 'firstName' | 'lastName' | 'preferredName' | 'email' | 'phone'
                  | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'country' | 'zipcode'
                  | 'linkedIn' | 'website'

const fieldLabelTerms: Record<FillableField, string[]> = {
    fullName:      ['full name'],
    firstName:     ['first name', 'given name', 'legal first name'],
    lastName:      ['last name', 'family name', 'legal last name'],
    preferredName: ['preferred name', 'nickname', 'preferred first name'],
    email:         ['email'],
    phone:         ['phone', 'mobile', 'telephone'],
    addressLine1:  ['address line 1', 'address 1', 'street address'],
    addressLine2:  ['address line 2', 'address 2', 'apt', 'suite'],
    city:          ['city', 'town'],
    state:         ['state', 'province', 'region'],
    country:       ['country'],
    zipcode:       ['zip', 'postal', 'postcode'],
    linkedIn:      ['linkedin'],
    website:       ['website', 'portfolio'],
}

function isVisible(el: HTMLInputElement | HTMLSelectElement): boolean {
    return el.type !== 'hidden' && !el.hidden && el.offsetParent !== null
}

function findElementForLabel(label: HTMLLabelElement): HTMLInputElement | HTMLSelectElement | null {
    // 1. label.control covers for/id links and nested inputs natively
    const control = label.control
    if ((control instanceof HTMLInputElement || control instanceof HTMLSelectElement) && isVisible(control)) return control

    // 2. next sibling
    const next = label.nextElementSibling
    if ((next instanceof HTMLInputElement || next instanceof HTMLSelectElement) && isVisible(next)) return next

    // 3. input/select inside next sibling (label and input share a wrapper div)
    const insideNext = next?.querySelector<HTMLInputElement | HTMLSelectElement>('input:not([type="hidden"]), select')
    if (insideNext && isVisible(insideNext)) return insideNext

    // 4. input/select inside parent (label is sibling of input inside a container)
    const insideParent = label.parentElement?.querySelector<HTMLInputElement | HTMLSelectElement>('input:not([type="hidden"]), select')
    if (insideParent && isVisible(insideParent)) return insideParent

    return null
}

function findFieldElements(terms: string[]): (HTMLInputElement | HTMLSelectElement)[] {
    const results = new Set<HTMLInputElement | HTMLSelectElement>()

    document.querySelectorAll<HTMLLabelElement>('label').forEach(label => {
        const text = label.textContent?.toLowerCase().trim() ?? ''
        const matches = terms.some(term => text.includes(term.toLowerCase()))
        if (!matches) return

        const el = findElementForLabel(label)
        if (el) results.add(el)
    })

    return Array.from(results)
}

const nativeInputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set

function fillSelect(select: HTMLSelectElement, value: string) {
    select.value = value
    if (select.value === value) return

    const v = value.toLowerCase()
    const match = Array.from(select.options).find(opt => {
        const text = opt.text.toLowerCase()
        return text.includes(v) || v.includes(text) || opt.value.toLowerCase().includes(v)
    })
    if (match) select.value = match.value
}

function fillInput(input: HTMLInputElement, value: string) {
    nativeInputSetter?.call(input, value)
    input.dispatchEvent(new Event('input',  { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
}

function fillElement(el: HTMLInputElement | HTMLSelectElement, value: string) {
    if (el instanceof HTMLSelectElement) fillSelect(el, value)
    else fillInput(el, value)
}

function fillForm(profile: Profile) {
    for (const [field, terms] of Object.entries(fieldLabelTerms)) {
        const value = profile[field as FillableField] ?? ''
        findFieldElements(terms).forEach(el => fillElement(el, value))
    }
}

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === 'fill') {
        fillForm(message.profile)
    }
})
