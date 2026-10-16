import { useCallback, useState } from 'react'

const KEY = 'leftoverlift.favorites'

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Saved listings, kept on this device only. */
export function useFavorites() {
  const [ids, setIds] = useState(read)

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* storage can be unavailable (private mode); the heart still works for this visit */
      }
      return next
    })
  }, [])

  return { ids, has: (id) => ids.includes(id), toggle }
}
