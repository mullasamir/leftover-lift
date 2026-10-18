import { useEffect, useState } from 'react'

export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

/**
 * Runs `load` whenever `deps` change and tracks loading, the result and any error.
 * `reload()` fetches again; `setData` lets a screen update its rows in place after an action.
 */
export function useFetch(load, deps) {
  const [state, setState] = useState({ phase: 'loading', data: null, error: null })
  const [key, setKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, phase: 'loading' }))
    load()
      .then((data) => !cancelled && setState({ phase: 'ready', data, error: null }))
      .catch((error) => !cancelled && setState({ phase: 'error', data: null, error }))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, key])

  return {
    ...state,
    reload: () => setKey((k) => k + 1),
    setData: (update) => setState((s) => ({ ...s, data: typeof update === 'function' ? update(s.data) : update })),
  }
}
