'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { llmService } from '@/services/llmService'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export default function InterviewPage() {
  const [jobRole, setJobRole] = useState('')
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [userResponse, setUserResponse] = useState('')
  const [evaluation, setEvaluation] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const { user } = useAuthStore()
  const { addXP, unlockAchievement } = useGamificationStore()

  const jobRoles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Product Manager',
    'UX/UI Designer',
    'DevOps Engineer',
  ]

  const difficulties = ['Beginner', 'Intermediate', 'Advanced']

  const handleGenerateQuestion = async () => {
    if (!jobRole) {
      toast.error('Please select a job role')
      return
    }

    if (!llmService.getApiKey()) {
      toast.error('Please set your OpenRouter API key using the AI settings button')
      return
    }

    setIsGenerating(true)
    setEvaluation(null)
    setUserResponse('')

    try {
      const result = await llmService.generateInterviewQuestion({
        jobRole,
        difficulty,
        skills: user?.skills || []
      })

      if (result.success) {
        setCurrentQuestion(result.data)
        addXP(5, 'Generated interview question')
      } else {
        toast.error(result.error || 'Failed to generate question')
      }
    } catch (error) {
      toast.error('Error generating question')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitResponse = async () => {
    if (!userResponse.trim()) {
      toast.error('Please provide a response')
      return
    }

    setIsEvaluating(true)

    try {
      const result = await llmService.evaluateInterviewResponse({
        question: currentQuestion,
        response: userResponse,
        jobRole,
        modelId: llmService.getSelectedModel()
      })

      if (result.success) {
        setEvaluation(result.data)
        const score = result.data.score || 5
        const xpAmount = Math.max(score * 10, 25)
        addXP(xpAmount, `Interview practice (Score: ${score}/10)`)
        
        // Unlock first interview achievement
        unlockAchievement('first_interview')
        
        toast.success(`Response evaluated! +${xpAmount} XP`)
      } else {
        toast.error(result.error || 'Failed to evaluate response')
      }
    } catch (error) {
      toast.error('Error evaluating response')
    } finally {
      setIsEvaluating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Practice</h1>
          <p className="text-gray-600 mt-2">
            Practice with AI-generated interview questions tailored to your target role
          </p>
        </div>

        {/* Setup Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Role
              </label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="input-field"
              >
                <option value="">Select a job role</option>
                {jobRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-field"
              >
                {difficulties.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
          <Button
            onClick={handleGenerateQuestion}
            isLoading={isGenerating}
            className="w-full md:w-auto"
          >
            {isGenerating ? 'Generating Question...' : 'Generate Question'}
          </Button>
        </div>

        {/* Question Section */}
        {currentQuestion && (
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600">❓</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Interview Question</h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-gray-800 leading-relaxed">{currentQuestion}</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Your Response
              </label>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                rows={6}
                className="input-field resize-none"
                placeholder="Type your answer here..."
              />
              <Button
                onClick={handleSubmitResponse}
                isLoading={isEvaluating}
                disabled={!userResponse.trim()}
                variant="secondary"
              >
                {isEvaluating ? 'Evaluating...' : 'Submit Response'}
              </Button>
            </div>
          </div>
        )}

        {/* Evaluation Section */}
        {evaluation && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Evaluation Results</h2>
              <div className={`px-4 py-2 rounded-lg ${getScoreBg(evaluation.score)}`}>
                <span className={`text-lg font-bold ${getScoreColor(evaluation.score)}`}>
                  {evaluation.score}/10
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {evaluation.overall_feedback && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Overall Feedback</h3>
                  <p className="text-gray-700">{evaluation.overall_feedback}</p>
                </div>
              )}

              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {evaluation.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-orange-700 mb-2">Areas for Improvement</h3>
                  <ul className="space-y-1">
                    {evaluation.improvements.map((improvement: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-orange-500 mt-1">💡</span>
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p>• Use the STAR method (Situation, Task, Action, Result)</p>
              <p>• Be specific and provide concrete examples</p>
              <p>• Practice out loud to improve delivery</p>
            </div>
            <div className="space-y-2">
              <p>• Research the company and role beforehand</p>
              <p>• Prepare questions to ask the interviewer</p>
              <p>• Stay calm and take time to think</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}