'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { llmService } from '@/services/llmService'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useAuthStore } from '@/stores/authStore'
import { ApiKeyModal } from '@/components/ui/ApiKeyModal'
import toast from 'react-hot-toast'

export default function LearnPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)

  const { user } = useAuthStore()
  const { addXP, unlockAchievement } = useGamificationStore()

  const learningPaths = [
    {
      id: 'frontend',
      title: 'Frontend Development',
      description: 'Master modern web development with React, Vue, and Angular',
      skills: ['JavaScript', 'React', 'CSS', 'HTML'],
      duration: '12 weeks',
      level: 'Beginner to Advanced',
      color: 'bg-blue-500',
      icon: '🌐',
    },
    {
      id: 'backend',
      title: 'Backend Development',
      description: 'Build robust server-side applications and APIs',
      skills: ['Node.js', 'Python', 'SQL', 'MongoDB'],
      duration: '10 weeks',
      level: 'Intermediate',
      color: 'bg-green-500',
      icon: '⚙️',
    },
    {
      id: 'data-science',
      title: 'Data Science',
      description: 'Analyze data and build machine learning models',
      skills: ['Python', 'Pandas', 'Machine Learning', 'Statistics'],
      duration: '16 weeks',
      level: 'Intermediate to Advanced',
      color: 'bg-purple-500',
      icon: '📊',
    },
    {
      id: 'mobile',
      title: 'Mobile Development',
      description: 'Create cross-platform mobile apps',
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      duration: '8 weeks',
      level: 'Beginner to Intermediate',
      color: 'bg-orange-500',
      icon: '📱',
    },
  ]

  const quickLessons = [
    {
      title: 'Git Version Control Basics',
      duration: '15 min',
      type: 'Tutorial',
      difficulty: 'Beginner',
      xp: 25,
      icon: '📚',
    },
    {
      title: 'SQL Query Optimization',
      duration: '20 min',
      type: 'Practice',
      difficulty: 'Intermediate',
      xp: 40,
      icon: '🏋️',
    },
    {
      title: 'JavaScript ES6 Features',
      duration: '30 min',
      type: 'Course',
      difficulty: 'Intermediate',
      xp: 50,
      icon: '🎓',
    },
    {
      title: 'API Design Best Practices',
      duration: '25 min',
      type: 'Guide',
      difficulty: 'Advanced',
      xp: 60,
      icon: '📖',
    },
  ]

  const handleGenerateContent = async () => {
    console.log('Starting content generation...')
    setIsGenerating(true)
    setGeneratedContent(null)
    
    // Check if API key is set
    const apiKey = llmService.getApiKey()
    console.log('API Key status:', apiKey ? `Set (length: ${apiKey.length})` : 'Not set')
    
    if (!apiKey) {
      console.log('No API key found, showing modal')
      // Open the API key modal for the user to enter their OpenRouter API key
      toast.error('OpenRouter API key is required for content generation')
      setGeneratedContent({
        error: true,
        recommendations: [
          '⚠️ OpenRouter API key is required to generate content',
          'Enter your OpenRouter API key in the modal',
          'Get your key at openrouter.ai/keys'
        ]
      })
      setIsApiKeyModalOpen(true)
      setIsGenerating(false)
      return
    }
    
    console.log('API key is set, proceeding with content generation')

    try {
      console.log('Calling llmService.generateLearningContent with params:', {
        topic: 'Career Development for Job Seekers',
        userLevel: 'Intermediate',
        skills: user?.skills || [],
        goal: 'Prepare for job interviews and improve technical skills'
      })
      
      const result = await llmService.generateLearningContent({
        topic: 'Career Development for Job Seekers',
        userLevel: 'Intermediate',
        skills: user?.skills || [],
        goal: 'Prepare for job interviews and improve technical skills'
      })
      
      console.log('generateLearningContent result:', result)

      if (result.success) {
        console.log('Content generation successful, setting data:', result.data)
        setGeneratedContent(result.data)
        addXP(15, 'Generated personalized learning content')
        toast.success('Personalized content generated!')
      } else {
        console.error('Content generation failed with error:', result.error)
        toast.error(result.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Exception in handleGenerateContent:', error)
      toast.error('Error generating content')
    } finally {
      console.log('Content generation completed, setting isGenerating to false')
      setIsGenerating(false)
    }
  }

  const handleCompleteLesson = (lesson: any) => {
    addXP(lesson.xp, `Completed lesson: ${lesson.title}`)
    unlockAchievement('first_lesson')
    toast.success(`Lesson completed! +${lesson.xp} XP`)
  }

  return (
    <DashboardLayout>
      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
      />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Personalized learning paths for your career goals
          </p>
        </div>

        {/* AI Content Generation */}
        <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🤖 AI-Powered Learning</h2>
              <p className="opacity-90 mb-4">
                Get personalized learning content generated just for you
              </p>
              <div className="flex justify-center mt-8 space-x-4">
                <Button
                  onClick={handleGenerateContent}
                  isLoading={isGenerating}
                  className="px-6 py-2 text-base"
                >
                  {isGenerating ? 'Generating...' : 'Generate Content'}
                </Button>
                <Button
                  onClick={() => setIsApiKeyModalOpen(true)}
                  variant="outline"
                  className="px-6 py-2 text-base"
                >
                  Set API Key
                </Button>
              </div>
            </div>
            <div className="text-6xl opacity-20">🧠</div>
          </div>
        </div>

        {/* Generated Content */}
        {generatedContent && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🎯 Personalized Recommendations
            </h2>
            <div className="space-y-3">
              {generatedContent.recommendations?.map((rec: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-primary-500 font-bold">{index + 1}.</span>
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Paths */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Choose Your Learning Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <div
                key={path.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPath(path.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${path.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                    {path.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{path.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {path.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{path.duration}</span>
                      <span>{path.level}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Lessons */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Quick Lessons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLessons.map((lesson, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span>{lesson.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                      <p className="text-sm text-gray-600">
                        {lesson.type} • {lesson.duration} • {lesson.difficulty}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCompleteLesson(lesson)}
                  >
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}