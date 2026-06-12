import { useRef } from "react"

// Single-open accordion built on native <details>/<summary>. `open` stays
// uncontrolled — we only reach into the DOM for expand/collapse all.
export function useAccordion() {
    // Container of the <details> elements this accordion manages.
    const listRef = useRef<HTMLDivElement>(null)
    // The `toggle` event fires asynchronously, so a synchronous flag would
    // already be reset by the time handlers run. Instead we count the opens
    // we triggered programmatically and let each toggle decrement it.
    const pendingProgrammaticOpens = useRef(0)

    function details(): HTMLDetailsElement[] {
        return Array.from(listRef.current?.querySelectorAll('details') ?? [])
    }

    // Opening one panel closes the rest. Toggles caused by "Expand all" are
    // skipped via the counter so they don't close each other.
    function onToggle(e: React.SyntheticEvent<HTMLDetailsElement>): void {
        const opened = e.currentTarget
        if (!opened.open) return
        if (pendingProgrammaticOpens.current > 0) {
            pendingProgrammaticOpens.current -= 1
            return
        }
        details().forEach(d => { if (d !== opened) d.open = false })
    }

    function expandAll(): void {
        const closed = details().filter(d => !d.open)
        pendingProgrammaticOpens.current += closed.length
        closed.forEach(d => { d.open = true })
    }

    function collapseAll(): void {
        details().forEach(d => { d.open = false })
    }

    return { listRef, onToggle, expandAll, collapseAll }
}
