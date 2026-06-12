import { useCallback, useState } from "react"

// useState that also tracks whether the value changed since it was last marked
// clean. The returned `set` works exactly like a normal state setter but flags
// the value dirty; `markClean` updates the value and clears the flag (use it on
// load and after saving).
export function useDirtyState<T>(initial: T) {
    const [value, setValue] = useState<T>(initial)
    const [dirty, setDirty] = useState(false)

    const set = useCallback((next: React.SetStateAction<T>) => {
        setValue(next)
        setDirty(true)
    }, [])

    const markClean = useCallback((next: T) => {
        setValue(next)
        setDirty(false)
    }, [])

    return [value, set, dirty, markClean] as const
}
