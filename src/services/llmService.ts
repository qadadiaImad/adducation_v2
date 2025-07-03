interface LLMResponse {
  success: boolean
  data?: any
  error?: string
}

export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length?: number
  pricing?: {
    prompt: number | string
    completion: number | string
  }
  isFree?: boolean
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

class LLMService {
  private apiKey: string | null = null
  private baseUrl: string
  private selectedModel: string = 'anthropic/claude-3-sonnet-20240229'
  
  // Use the environment variable for the base URL if available

  constructor() {
    // Initialize baseUrl from environment variables
    if (typeof window !== 'undefined') {
      // Client-side
      this.baseUrl = process.env.NEXT_PUBLIC_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
      console.log('Using OpenRouter base URL:', this.baseUrl)
      
      // Try to get API key from localStorage first
      this.apiKey = localStorage.getItem('openrouter_api_key')
      
      // If not found in localStorage, use the environment variable
      if (!this.apiKey) { 
        this.apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''
      }
    } else {
      // Server-side
      this.baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
      
      // Server-side, use environment variable
      this.apiKey = process.env.OPENROUTER_API_KEY || ''
    }
    
    console.log('LLMService initialized with baseUrl:', this.baseUrl)
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
    if (typeof window !== 'undefined') {
      localStorage.setItem('openrouter_api_key', apiKey)
    }
  }

  getApiKey(): string | null {
    return this.apiKey
  }
  
  setSelectedModel(modelId: string) {
    this.selectedModel = modelId
    if (typeof window !== 'undefined') {
      localStorage.setItem('openrouter_selected_model', modelId)
    }
  }
  
  getSelectedModel(): string {
    if (typeof window !== 'undefined') {
      const storedModel = localStorage.getItem('openrouter_selected_model')
      if (storedModel) {
        this.selectedModel = storedModel
      }
    }
    return this.selectedModel
  }
  
  async getAvailableModels(): Promise<OpenRouterModel[]> {
    if (!this.apiKey) {
      console.error('API key not set when fetching models')
      return []
    }
    
    try {
      console.log('Fetching available models from OpenRouter')
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        console.error('Failed to fetch models:', response.status)
        return []
      }
      
      const data = await response.json()
      
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((model: any) => {
          // Check if the model is free based on pricing
          const pricing = model.pricing || {}
          let promptPrice = 0
          
          if (pricing.prompt) {
            if (typeof pricing.prompt === 'number') {
              promptPrice = pricing.prompt
            } else if (typeof pricing.prompt === 'string') {
              try {
                promptPrice = parseFloat(pricing.prompt)
              } catch (e) {
                console.error('Error parsing prompt price:', pricing.prompt)
              }
            }
          }
          
          const isFree = model.id.includes('free') || promptPrice === 0
          
          return {
            id: model.id,
            name: model.name || model.id,
            description: model.description,
            context_length: model.context_length,
            pricing: model.pricing,
            isFree
          }
        })
      }
      
      return []
    } catch (error) {
      console.error('Error fetching models:', error)
      return []
    }
  }
  
  async getModel(modelId: string): Promise<{ success: boolean; data?: OpenRouterModel; error?: string }> {
    try {
      // If no specific model ID is provided, use the selected model
      const id = modelId || this.getSelectedModel()
      
      // For now, just return success since we're not validating against available models
      // In a more complete implementation, we would fetch models and validate
      return { 
        success: true, 
        data: { 
          id, 
          name: id.split('/').pop() || id 
        } 
      }
    } catch (error) {
      console.error('Error getting model:', error)
      return { success: false, error: 'Failed to get model' }
    }
  }
  
  async generateQuizQuestions({
    topic,
    difficulty,
    questionCount
  }: {
    topic: string
    difficulty: string
    questionCount: number
  }): Promise<LLMResponse> {
    if (!this.apiKey) {
      console.error('API key not set when generating quiz questions')
      return { success: false, error: 'API key not set' }
    }
    
    try {
      console.log(`Generating ${questionCount} quiz questions about ${topic} at ${difficulty} level`)
      
      const prompt = `
        Generate ${questionCount} multiple-choice quiz questions about ${topic} at ${difficulty} level.
        
        Return ONLY valid JSON in this exact format:
        {
          "questions": [
            {
              "question": "Question text here",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct_answer": 0,
              "explanation": "Why this answer is correct"
            }
          ]
        }
        
        Make questions relevant for job seekers and career development.
      `
      
      const modelId = this.getSelectedModel()
      console.log('Using model:', modelId)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://adducation.com',
          'X-Title': 'Adducation Learning Platform',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'system',
              content: 'You are an expert educator creating quiz questions for job seekers.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response from OpenRouter API:', errorText)
        return { success: false, error: `API error: ${response.status} ${errorText}` }
      }
      
      const data = await response.json()
      console.log('Quiz generation response:', data)
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content
        console.log('Raw content from API:', content)
        
        // Parse the JSON from the response
        try {
          // First try to parse the entire content as JSON
          try {
             const parsed = JSON.parse(content)
            
            if (parsed.questions && Array.isArray(parsed.questions)) {
              console.log('Successfully parsed questions directly:', parsed.questions)
              return { 
                success: true, 
                data: parsed.questions 
              }
            }
          } catch (directParseError) {
            console.log('Direct JSON parsing failed, trying to extract JSON')
            
            // If direct parsing fails, try to extract JSON with regex
            let jsonMatch = content.match(/\{[\s\S]*?"questions"[\s\S]*?\}\s*\}/i)
            if (!jsonMatch) {
              // Fallback to a more lenient pattern
              jsonMatch = content.match(/\{[\s\S]*?\}/i) || ['{"questions":[]}']          
            }
            
            if (jsonMatch) {
              console.log('Found JSON match:', jsonMatch[0])
              try {
                const parsed = JSON.parse(jsonMatch[0])
                
                if (parsed.questions && Array.isArray(parsed.questions)) {
                  console.log('Successfully parsed questions:', parsed.questions)
                  return { 
                    success: true, 
                    data: parsed.questions 
                  }
                }
              } catch (innerError) {
                console.error('Error parsing matched JSON:', innerError)
              }
            }
            
            // If the regex approach failed, try a more lenient approach
            // Look for the start of the JSON structure with questions array
            const jsonStart = content.indexOf('{')
            
            // Try to find a complete JSON structure by balancing braces
            if (jsonStart !== -1) {
              let openBraces = 0
              let jsonEnd = -1
              
              for (let i = jsonStart; i < content.length; i++) {
                if (content[i] === '{') openBraces++
                if (content[i] === '}') {
                  openBraces--
                  if (openBraces === 0) {
                    jsonEnd = i
                    break
                  }
                }
              }
              
              if (jsonEnd > jsonStart) {
                const jsonStr = content.substring(jsonStart, jsonEnd + 1)
              console.log('Extracted JSON string:', jsonStr)
              
              try {
                const parsed = JSON.parse(jsonStr)
                
                if (parsed.questions && Array.isArray(parsed.questions)) {
                  console.log('Successfully parsed questions with second method:', parsed.questions)
                  return { 
                    success: true, 
                    data: parsed.questions 
                  }
                }
              } catch (innerError) {
                console.error('Error parsing extracted JSON:', innerError)
              }
            }
            
            // If all parsing attempts fail, try to manually extract questions
            console.log('Attempting manual question extraction')
            
            // Look for question patterns in the text
            const questions = []
            const questionBlocks = content.split(/\d+\.\s/).filter(block => block.trim().length > 0)
            
            for (const block of questionBlocks) {
              try {
                // Extract question text
                const questionMatch = block.match(/^([^\n]+)/)
                if (!questionMatch) continue
                
                const question = questionMatch[1].trim()
                
                // Extract options
                const options = []
                const optionMatches = block.matchAll(/[A-D]\)\s*([^\n]+)/g)
                for (const match of optionMatches) {
                  options.push(match[1].trim())
                }
                
                if (options.length < 2) continue
                
                // Try to find correct answer
                let correct_answer = 0
                const correctMatch = block.match(/correct\s*answer[^A-D]*([A-D])/i)
                if (correctMatch) {
                  const letter = correctMatch[1]
                  correct_answer = letter.charCodeAt(0) - 'A'.charCodeAt(0)
                }
                
                // Try to find explanation
                let explanation = ''
                const explanationMatch = block.match(/explanation[^\n]*:\s*([^\n]+)/i)
                if (explanationMatch) {
                  explanation = explanationMatch[1].trim()
                }
                
                questions.push({
                  question,
                  options,
                  correct_answer,
                  explanation: explanation || 'No explanation provided'
                })
              } catch (e) {
                console.error('Error processing question block:', e)
              }
            }
            
            if (questions.length > 0) {
              console.log('Manually extracted questions:', questions)
              return {
                success: true,
                data: questions
              }
            }
            
            return { success: false, error: 'Failed to parse quiz questions from response' }
          }}}
          catch (parseError) {
            console.error('Error parsing quiz response:', parseError)
            return { success: false, error: 'Failed to parse quiz response' }
          }
        }
        
        return { success: false, error: 'Invalid response from API' }
      } catch (error) {
        console.error('Error generating quiz questions:', error)
        return { success: false, error: 'Failed to generate quiz questions' }
      }
    }



  async generateInterviewQuestion(params: {
    jobRole: string,
    difficulty: string,
    skills: string[]
  }): Promise<LLMResponse> {
    if (!this.apiKey) {
      return { success: false, error: 'API key not set' }
    }
    
    try {
      const prompt = `Generate a ${params.difficulty} level interview question for a ${params.jobRole} position focusing on these skills: ${params.skills.join(', ')}. Make it realistic and commonly asked.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Adducation Learning Platform',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku-20240307',
          messages: [
            {
              role: 'system',
              content: 'You are an expert interviewer helping job seekers practice for interviews.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
        }),
      });

      const data = await response.json()
      
      if (data.choices && data.choices[0]) {
        return {
          success: true,
          data: data.choices[0].message.content
        }
      }

      return { success: false, error: 'No response generated' }
    } catch (error) {
      return { success: false, error: 'Failed to generate question' }
    }
  }

  async evaluateInterviewResponse(params: {
    question: string
    response: string
    jobRole: string
    modelId: string
  }): Promise<LLMResponse> {
    if (!this.apiKey) {
      return { success: false, error: 'API key not set' }
    }

    try {
      const model = await this.getModel(params.modelId)
      if (!model.success) {
        return { success: false, error: 'Model not found' }
      }

      const prompt = `Evaluate this interview response for a ${params.jobRole} position:

Question: ${params.question}
Response: ${params.response}

Provide feedback in JSON format:
{
  "score": [1-10],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "overall_feedback": "detailed feedback"
}`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Adducation Learning Platform',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku-20240307',
          messages: [
            {
              role: 'system',
              content: 'You are an expert interviewer providing constructive feedback. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
        }),
      })

      const data = await response.json()
      
      if (data.choices && data.choices[0]) {
        try {
          const content = data.choices[0].message.content
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const evaluation = JSON.parse(jsonMatch[0])
            return { success: true, data: evaluation }
          }
        } catch (parseError) {
          // Fallback response
          return {
            success: true,
            data: {
              score: 7,
              strengths: ['Response provided'],
              improvements: ['Could be more detailed'],
              overall_feedback: data.choices[0].message.content
            }
          }
        }
      }

      return { success: false, error: 'No evaluation generated' }
    } catch (error) {
      return { success: false, error: 'Failed to evaluate response' }
    }
  }

  async generateLearningContent(params: {
    topic: string
    userLevel: string
    skills: string[]
    goal: string
  }): Promise<LLMResponse> {
    console.log('Generating learning content with params:', params)
    console.log('API Key status:', this.apiKey ? 'Set (length: ' + this.apiKey.length + ')' : 'Not set')
    
    if (!this.apiKey) {
      console.error('API key not set in generateLearningContent')
      return { success: false, error: 'API key not set' }
    }

    try {
      const prompt = `Create personalized learning recommendations for: ${params.goal}

User Profile:
- Level: ${params.userLevel}
- Skills: ${params.skills.join(', ')}
- Topic: ${params.topic}

Provide 5-8 specific, actionable recommendations in JSON format:
{
  "recommendations": [
    "Take an online course on [specific skill]",
    "Practice [specific skill] by building projects",
    "Join [specific community] for networking"
  ]
}`

      console.log('Making API request to OpenRouter with URL:', `${this.baseUrl}/chat/completions`)
      console.log('Request headers:', {
        'Authorization': 'Bearer [HIDDEN]',
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Adducation Learning Platform'
      })
      
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Adducation Learning Platform',
          },
          body: JSON.stringify({
            model: this.getSelectedModel(),
            messages: [
              {
                role: 'system',
                content: 'You are an expert educator creating personalized learning content. Always respond with valid JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
          }),
        })
        
        console.log('OpenRouter API response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('OpenRouter API error:', response.status, errorText)
          return { success: false, error: `API error: ${response.status} - ${errorText}` }
        }
        
        const data = await response.json()
        console.log('OpenRouter API response data:', data)
        
        if (data.choices && data.choices[0]) {
          try {
            const content = data.choices[0].message.content
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const recommendations = JSON.parse(jsonMatch[0])
              return { success: true, data: recommendations }
            }
          } catch (parseError) {
            console.error('Error parsing JSON response:', parseError)
            // Fallback response
            return {
              success: true,
              data: {
                recommendations: [
                  'Focus on building practical projects',
                  'Join relevant online communities',
                  'Practice coding challenges daily',
                  'Read industry blogs and documentation',
                  'Attend virtual meetups and webinars'
                ]
              }
            }
          }
        }
        
        return { success: false, error: 'No content generated' }
      } catch (error) {
        console.error('Error in generateLearningContent:', error)
        return { success: false, error: 'Failed to generate content' }
      }
    } catch (error) {
      console.error('Outer error in generateLearningContent:', error)
      return { success: false, error: 'Failed to generate content' }
    }
  }
}

export const llmService = new LLMService()