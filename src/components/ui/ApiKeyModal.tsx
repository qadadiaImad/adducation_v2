'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { Button } from './Button'
import { llmService, OpenRouterModel } from '@/services/llmService'
import toast from 'react-hot-toast'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [models, setModels] = useState<OpenRouterModel[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load existing API key if available
    const existingKey = llmService.getApiKey()
    if (existingKey) {
      setApiKey(existingKey)
      // Load selected model
      setSelectedModel(llmService.getSelectedModel())
      // Fetch available models
      fetchModels(existingKey)
    }
  }, [isOpen])
  
  const fetchModels = async (key: string) => {
    if (!key) return
    
    setIsLoading(true)
    try {
      // Set the API key temporarily to fetch models
      llmService.setApiKey(key)
      const availableModels = await llmService.getAvailableModels()
      console.log('Fetched models:', availableModels)
      setModels(availableModels)
      
      // If no model is selected yet, select the first one
      if (!selectedModel && availableModels.length > 0) {
        setSelectedModel(availableModels[0].id)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      toast.error('Failed to fetch available models')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key')
      return
    }

    // Save API key
    llmService.setApiKey(apiKey.trim())
    
    // Save selected model if one is chosen
    if (selectedModel) {
      llmService.setSelectedModel(selectedModel)
      console.log('Saved selected model:', selectedModel)
    }
    
    toast.success('API key and model preferences saved')
    onClose()
  }
  
  // Handle API key change and fetch models when key is entered
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value
    setApiKey(newKey)
    
    // If key is long enough, try to fetch models
    if (newKey.length > 20 && !isLoading && models.length === 0) {
      fetchModels(newKey)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Set OpenRouter API Key
          </Dialog.Title>

          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">
              To use AI-powered features like "Generate Content", you need to provide an OpenRouter API key.
            </p>
            
            <ol className="list-decimal list-inside text-sm text-gray-700 mb-4 space-y-1 pl-2">
              <li>Visit <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                openrouter.ai/keys
              </a></li>
              <li>Create an account or log in</li>
              <li>Create a new API key</li>
              <li>Copy and paste your API key below</li>
            </ol>
            
            <p className="text-xs text-gray-500 mb-4">
              Your API key is stored locally in your browser and is never sent to our servers.
            </p>

            <div className="mt-2">
              <input
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your OpenRouter API key"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            
            {isLoading && (
              <div className="mt-4 flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                <span className="ml-2 text-sm text-gray-600">Loading available models...</span>
              </div>
            )}
            
            {models.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.isFree ? '(Free)' : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose a model for content generation. Models with better capabilities may cost more credits.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save API Key
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
