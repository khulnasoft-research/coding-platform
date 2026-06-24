import { useEffect, useState } from 'react'

export function useLocalStorageValue(key: string) {
  const [value, setValue] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      const storedValue = localStorage.getItem(key)
      setValue(storedValue ?? '')
      setIsInitialized(true)
    }, 0)
    return () => clearTimeout(id)
  }, [key])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(key, value)
    }
  }, [key, value, isInitialized])

  return [value, setValue] as const
}
