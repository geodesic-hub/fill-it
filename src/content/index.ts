import type { Profile } from "../shared/Profile"
import type { Experience } from "../shared/Experience"
import type { Education } from "../shared/Education"

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

const experienceFieldTerms: Record<keyof Experience, string[]> = {
    company:         ['company', 'employer', 'organization'],
    title:           ['title', 'position', 'role', 'job title'],
    location:        ['location', 'city', 'where'],
    startDate:       ['start date', 'from'],
    endDate:         ['end date', 'to'],
    roleDescription: ['description', 'responsibilities', 'summary'],
}

const educationFieldTerms: Record<keyof Education, string[]> = {
    school:    ['school', 'university', 'college', 'institution'],
    degree:    ['degree', 'qualification'],
    field:     ['field of study', 'field', 'major', 'discipline', 'concentration'],
    startYear: ['from', 'start year', 'start date', 'attended from'],
    endYear:   ['to (actual', 'to (', 'graduation', 'completion', 'expected', 'end year', 'end date'],
}

// Equivalent degree forms grouped together. A saved value matching any term in a
// group is treated as matching all of them, so "Bachelor of Science" fills a
// "BS" dropdown and vice versa.
const degreeSynonyms: string[][] = [
    ['aa', 'associate of arts', 'associate arts'],
    ['as', 'associate of science', 'associate science'],
    ['ba', 'bachelor of arts'],
    ['bs', 'bsc', 'b.s.', 'bachelor of science'],
    ['bba', 'bachelor of business administration'],
    ['be', 'beng', 'bachelor of engineering'],
    ['btech', 'b.tech', 'bachelor of technology'],
    ['ma', 'master of arts'],
    ['ms', 'msc', 'm.s.', 'master of science'],
    ['mba', 'master of business administration'],
    ['mtech', 'm.tech', 'master of technology'],
    ['phd', 'ph.d', 'ph.d.', 'doctor of philosophy', 'doctorate'],
]

function expandAliases(value: string, groups: string[][]): string[] {
    const v = value.toLowerCase().trim()
    const aliases = new Set<string>([value])
    for (const group of groups) {
        if (group.includes(v)) group.forEach(term => aliases.add(term))
    }
    return Array.from(aliases)
}

type FillTarget = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

const fieldSelector = 'input:not([type="hidden"]), select, textarea'

function isFillTarget(el: unknown): el is FillTarget {
    return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement
}

function isVisible(el: FillTarget): boolean {
    return !(el instanceof HTMLInputElement && el.type === 'hidden') && !el.hidden && el.offsetParent !== null
}

function findElementForLabel(label: HTMLLabelElement): FillTarget | null {
    const control = label.control
    if (isFillTarget(control) && isVisible(control)) return control

    const next = label.nextElementSibling
    if (isFillTarget(next) && isVisible(next)) return next

    const insideNext = next?.querySelector<FillTarget>(fieldSelector)
    if (insideNext && isVisible(insideNext)) return insideNext

    const insideParent = label.parentElement?.querySelector<FillTarget>(fieldSelector)
    if (insideParent && isVisible(insideParent)) return insideParent

    return null
}

function findFieldElementsIn(root: ParentNode, terms: string[]): FillTarget[] {
    const results = new Set<FillTarget>()

    root.querySelectorAll<HTMLLabelElement>('label').forEach(label => {
        const text = label.textContent?.toLowerCase().trim() ?? ''
        const matches = terms.some(term => text.includes(term.toLowerCase()))
        if (!matches) return

        const el = findElementForLabel(label)
        if (el) results.add(el)
    })

    return Array.from(results)
}

function findFieldElements(terms: string[]): FillTarget[] {
    return findFieldElementsIn(document, terms)
}

// True if `root` contains a <label> whose text matches any term. Used to scope
// a repeating section — unlike findFieldElementsIn it doesn't require the field
// to be a native fillable element (Workday renders dropdowns as custom widgets).
function hasLabelMatching(root: ParentNode, terms: string[]): boolean {
    return Array.from(root.querySelectorAll('label')).some(label => {
        const text = label.textContent?.toLowerCase().trim() ?? ''
        return terms.some(term => text.includes(term.toLowerCase()))
    })
}

const nativeInputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
const nativeTextareaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set

// `candidates` are equivalent forms of the value to try (e.g. "Bachelor of
// Science" and "BS"). Exact matches win first so short codes like "BA" don't
// get swallowed by a substring of "MBA"; only longer forms allow substring.
function fillSelect(select: HTMLSelectElement, candidates: string[]) {
    const wanted = candidates.map(c => c.toLowerCase().trim()).filter(Boolean)
    if (wanted.length === 0) return

    const options = Array.from(select.options)
    const optText = (opt: HTMLOptionElement) => opt.text.toLowerCase().trim()
    const optVal = (opt: HTMLOptionElement) => opt.value.toLowerCase().trim()

    const exact = options.find(opt => wanted.some(w => optText(opt) === w || optVal(opt) === w))
    const fuzzy = exact ?? options.find(opt =>
        wanted.some(w => w.length >= 4 && (optText(opt).includes(w) || w.includes(optText(opt)))))

    if (!fuzzy) return
    select.value = fuzzy.value
    select.dispatchEvent(new Event('input',  { bubbles: true }))
    select.dispatchEvent(new Event('change', { bubbles: true }))
}

function fillInput(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const setter = input instanceof HTMLTextAreaElement ? nativeTextareaSetter : nativeInputSetter
    setter?.call(input, value)
    input.dispatchEvent(new Event('input',  { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
}

function fillElement(el: FillTarget, value: string, candidates: string[] = [value]) {
    if (el instanceof HTMLSelectElement) fillSelect(el, candidates)
    else fillInput(el, value)
}

function fillForm(profile: Profile) {
    for (const [field, terms] of Object.entries(fieldLabelTerms)) {
        const value = profile[field as FillableField] ?? ''
        findFieldElements(terms).forEach(el => fillElement(el, value))
    }
}

// --- Repeating sections (experience, education) ---

// Describes one kind of repeating entry so a single engine can fill it.
type SectionConfig<T> = {
    terms: Record<keyof T, string[]>  // field -> label terms used to fill it
    anchorTerms: string[]             // field that marks the start of a section
    secondaryTerms: string[]          // a second field used to scope the section
    addButtonPattern: RegExp          // matches the "Add another" button label
    // Optional per-field synonym groups for matching dropdown options.
    aliases?: Partial<Record<keyof T, string[][]>>
}

const experienceConfig: SectionConfig<Experience> = {
    terms: experienceFieldTerms,
    anchorTerms: experienceFieldTerms.company,
    secondaryTerms: experienceFieldTerms.title,
    addButtonPattern: /experience|position|employment|\bwork\b|\bjob\b|role/,
}

const educationConfig: SectionConfig<Education> = {
    terms: educationFieldTerms,
    anchorTerms: educationFieldTerms.school,
    // "Field of Study" is a reliable Workday <label>, even though its widget
    // isn't a native field; combine it with degree to scope the section.
    secondaryTerms: [...educationFieldTerms.degree, ...educationFieldTerms.field],
    addButtonPattern: /education|school|degree|university|college|qualification/,
    aliases: { degree: degreeSynonyms },
}

function isButtonVisible(el: HTMLElement): boolean {
    return !el.hidden && el.offsetParent !== null
}

// Smallest ancestor of an anchor field that also wraps a secondary field — the
// repeating unit for a single entry.
function sectionRootFor(el: HTMLElement, secondaryTerms: string[]): HTMLElement | null {
    let current = el.parentElement
    while (current && current !== document.body) {
        if (hasLabelMatching(current, secondaryTerms)) return current
        current = current.parentElement
    }
    return null
}

function findSections(config: SectionConfig<unknown>): HTMLElement[] {
    const sections: HTMLElement[] = []
    for (const anchorEl of findFieldElements(config.anchorTerms)) {
        const section = sectionRootFor(anchorEl, config.secondaryTerms)
        if (section && !sections.includes(section)) sections.push(section)
    }
    return sections
}

function findAddButton(pattern: RegExp): HTMLElement | null {
    const candidates = document.querySelectorAll<HTMLElement>('button, a, [role="button"]')
    for (const el of candidates) {
        if (!isButtonVisible(el)) continue
        const text = (el.textContent ?? '').toLowerCase()
        if (text.includes('add') && pattern.test(text)) return el
    }
    return null
}

// Click the "Add" button and wait for a new section to appear in the DOM.
function addSection(config: SectionConfig<unknown>, currentCount: number): Promise<boolean> {
    const addButton = findAddButton(config.addButtonPattern)
    if (!addButton) return Promise.resolve(false)

    return new Promise(resolve => {
        const observer = new MutationObserver(() => {
            if (findSections(config).length > currentCount) {
                observer.disconnect()
                clearTimeout(timer)
                resolve(true)
            }
        })
        observer.observe(document.body, { childList: true, subtree: true })

        const timer = setTimeout(() => {
            observer.disconnect()
            resolve(false)
        }, 2000)

        addButton.click()
    })
}

function fillSection<T>(section: ParentNode, config: SectionConfig<T>, item: T) {
    for (const field of Object.keys(config.terms) as (keyof T)[]) {
        const value = String(item[field] ?? '')
        if (!value) continue
        const groups = config.aliases?.[field]
        const candidates = groups ? expandAliases(value, groups) : [value]
        findFieldElementsIn(section, config.terms[field]).forEach(el => fillElement(el, value, candidates))
    }
}

async function fillRepeatingSections<T>(config: SectionConfig<T>, items: T[]) {
    for (let i = 0; i < items.length; i++) {
        let sections = findSections(config as SectionConfig<unknown>)

        // Not enough sections on the page — add one and wait for it to render.
        if (i >= sections.length) {
            const added = await addSection(config as SectionConfig<unknown>, sections.length)
            if (!added) break
            sections = findSections(config as SectionConfig<unknown>)
        }

        const section = sections[i]
        if (!section) break
        fillSection(section, config, items[i])
    }
}

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === 'fill') {
        fillForm(message.profile)
        if (Array.isArray(message.experience) && message.experience.length > 0) {
            void fillRepeatingSections(experienceConfig, message.experience as Experience[])
        }
        if (Array.isArray(message.education) && message.education.length > 0) {
            void fillRepeatingSections(educationConfig, message.education as Education[])
        }
    }
})
