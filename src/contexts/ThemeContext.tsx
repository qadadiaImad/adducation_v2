'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  apiKey: string | null
  setApiKey: (key: string) => void
  showDebug: boolean
  toggleDebug: () => void
  llmName: string
}

const defaultContext: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => {},
  apiKey: null,
  setApiKey: () => {},
  showDebug: false,
  toggleDebug: () => {},
  llmName: 'Cascade'
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light')
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const llmName = 'Cascade'

  useEffect(() => {
    // Load theme from localStorage on initial render
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedApiKey = localStorage.getItem('apiKey')
    const savedShowDebug = localStorage.getItem('showDebug')
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
    
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
    
    if (savedShowDebug) {
      setShowDebug(savedShowDebug === 'true')
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme)
    
    // Force a repaint to ensure styles are applied properly
    const currentBackground = getComputedStyle(document.body).backgroundColor
    document.body.style.backgroundColor = 'transparent'
    setTimeout(() => {
      document.body.style.backgroundColor = currentBackground
    }, 1)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light'
      return newTheme
    })
  }

  const toggleDebug = () => {
    setShowDebug(prev => {
      const newValue = !prev
      localStorage.setItem('showDebug', String(newValue))
      return newValue
    })
  }

  const updateApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('apiKey', key)
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        apiKey, 
        setApiKey: updateApiKey, 
        showDebug, 
        toggleDebug,
        llmName
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
