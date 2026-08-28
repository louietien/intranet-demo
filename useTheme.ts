'use client'
import { useState, useEffect } from 'react'

export function useTheme() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(localStorage.getItem('intra-theme') === 'dark')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('intra-theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark(d => !d) }
}
