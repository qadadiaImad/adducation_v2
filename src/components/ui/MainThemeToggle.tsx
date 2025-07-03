'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export function MainThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <>
            <SunIcon className="h-5 w-5 text-yellow-400" />
            <span className="font-medium text-sm">Light Mode</span>
          </>
        ) : (
          <>
            <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="font-medium text-sm">Dark Mode</span>
          </>
        )}
      </button>
    </div>
  )
}
