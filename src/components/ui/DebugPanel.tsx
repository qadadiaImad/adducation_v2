'use client'

import { useState, useEffect } from 'react'
import { Button } from './Button'

interface LogEntry {
  message: string
  timestamp: string
  type: 'log' | 'error' | 'warn' | 'info'
}

export function DebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
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

  if (!isVisible) {
    return (
      <Button 
        onClick={() => setIsVisible(true)}
        variant="outline"
        className="fixed bottom-4 right-4 z-50 opacity-70 hover:opacity-100"
      >
        Show Logs
      </Button>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 h-1/3 bg-gray-900 text-white z-50 overflow-auto p-4 rounded-t-lg shadow-lg">
      <div className="flex justify-between items-center mb-2 sticky top-0 bg-gray-900 pb-2 border-b border-gray-700">
        <h3 className="font-bold">Debug Logs</h3>
        <div className="space-x-2">
          <Button onClick={clearLogs} size="sm" variant="primary">
            Clear
          </Button>
          <Button onClick={() => setIsVisible(false)} size="sm" variant="outline">
            Hide
          </Button>
        </div>
      </div>
      
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
