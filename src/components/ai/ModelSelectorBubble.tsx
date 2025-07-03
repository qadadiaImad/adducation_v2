'use client'

import { useState, useEffect } from 'react'
import { llmService } from '@/services/llmService'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export function ModelSelectorBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedKey = llmService.getApiKey()
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key')
      return
    }

    setIsLoading(true)
    try {
      llmService.setApiKey(apiKey.trim())
      toast.success('API key saved successfully!')
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to save API key')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveApiKey = () => {
    llmService.setApiKey('')
    setApiKey('')
    toast.success('API key removed')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenRouter API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-500"
                >
                  openrouter.ai
                </a>
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSaveApiKey}
                isLoading={isLoading}
                size="sm"
                className="flex-1"
              >
                Save
              </Button>
              {apiKey && (
                <Button
                  onClick={handleRemoveApiKey}
                  variant="outline"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>
    </div>
  )
}