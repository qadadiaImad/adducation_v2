'use client'

import { useState, useEffect } from 'react'
import { Button } from './Button'
import { useTheme } from '@/contexts/ThemeContext'
import { SunIcon, MoonIcon, KeyIcon } from '@heroicons/react/24/outline'

interface LogEntry {
  message: string
  timestamp: string
  type: 'log' | 'error' | 'warn' | 'info'
}

export function DebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const { theme, toggleTheme, apiKey, setApiKey, llmName } = useTheme()

  useEffect(() => {
    // Load API key from context
    if (apiKey) {
      setApiKeyInput(apiKey)
    }
    
    // Store original console methods
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    const originalInfo = console.info

    // Override console methods to capture logs
    console.log = (...args) => {
      originalLog(...args)
      addLogEntry('log', args)
    }

    console.error = (...args) => {
      originalError(...args)
      addLogEntry('error', args)
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addLogEntry('warn', args)
    }

    console.info = (...args) => {
      originalInfo(...args)
      addLogEntry('info', args)
    }

    // Restore original methods on cleanup
    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      console.info = originalInfo
    }
  }, [])

  const addLogEntry = (type: 'log' | 'error' | 'warn' | 'info', args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')
    
    setLogs(prevLogs => [
      {
        message,
        timestamp: new Date().toISOString().split('T')[1].split('.')[0],
        type
      },
      ...prevLogs.slice(0, 99) // Keep last 100 logs
    ])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const handleApiKeySubmit = () => {
    setApiKey(apiKeyInput)
    setShowApiKey(false)
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
          <span className="text-xs text-gray-600 dark:text-gray-300">{llmName}</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <>
                <SunIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-xs">Light Mode</span>
              </>
            ) : (
              <>
                <MoonIcon className="h-5 w-5 text-gray-600" />
                <span className="text-xs">Dark Mode</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Set API Key"
          >
            <KeyIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {showApiKey && (
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md w-64">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleApiKeySubmit();
            }} className="flex flex-col gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter API Key"
                className="text-xs p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button type="submit" size="sm" variant="primary" className="text-xs">
                Save API Key
              </Button>
            </form>
          </div>
        )}
        
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          className="opacity-70 hover:opacity-100"
        >
          Show Logs
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 h-1/3 bg-gray-900 text-white z-50 overflow-auto p-4 rounded-t-lg shadow-lg">
      <div className="flex justify-between items-center mb-2 sticky top-0 bg-gray-900 pb-2 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <h3 className="font-bold">Debug Logs</h3>
          <span className="text-xs text-gray-400">{llmName}</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <>
                <SunIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-xs">Light Mode</span>
              </>
            ) : (
              <>
                <MoonIcon className="h-5 w-5 text-gray-400" />
                <span className="text-xs">Dark Mode</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Set API Key"
          >
            <KeyIcon className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="space-x-2">
          <Button onClick={clearLogs} size="sm" variant="primary">
            Clear
          </Button>
          <Button onClick={() => setIsVisible(false)} size="sm" variant="outline">
            Hide
          </Button>
        </div>
      </div>
      
      {showApiKey && (
        <div className="mb-2 p-2 bg-gray-800 rounded">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleApiKeySubmit();
          }} className="flex gap-2 items-center">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter API Key"
              className="text-xs p-1 border rounded flex-1 bg-gray-700 border-gray-600 text-white"
            />
            <Button type="submit" size="sm" variant="primary" className="text-xs">
              Save
            </Button>
          </form>
        </div>
      )}
      
      <div className="space-y-1 text-xs font-mono">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`p-1 border-l-4 ${
              log.type === 'error' ? 'border-red-500 bg-red-900/20' : 
              log.type === 'warn' ? 'border-yellow-500 bg-yellow-900/20' :
              log.type === 'info' ? 'border-blue-500 bg-blue-900/20' :
              'border-gray-500 bg-gray-800/20'
            }`}
          >
            <span className="text-gray-400 mr-2">[{log.timestamp}]</span>
            <span className="whitespace-pre-wrap">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
