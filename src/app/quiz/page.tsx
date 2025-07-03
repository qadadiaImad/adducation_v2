'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { llmService, QuizQuestion } from '@/services/llmService'
import { ApiKeyModal } from '@/components/ui/ApiKeyModal'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function QuizPage() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [questionCount, setQuestionCount] = useState(5)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleGenerateQuiz = async () => {
    if (!topic) {
      toast.error('Please enter a topic')
      return
    }

    // Check if API key is set
    const apiKey = llmService.getApiKey()
    if (!apiKey) {
      setIsApiKeyModalOpen(true)
      return
    }

    setIsGenerating(true)
    toast.loading('Generating quiz questions...')

    try {
      const response = await llmService.generateQuizQuestions({
        topic,
        difficulty,
        questionCount
      })

      if (response.success && response.data) {
        setQuestions(response.data)
        setSelectedAnswers(new Array(response.data.length).fill(-1))
        setCurrentQuestionIndex(0)
        setShowResults(false)
        toast.dismiss()
        toast.success('Quiz generated successfully!')
      } else {
        toast.dismiss()
        toast.error(response.error || 'Failed to generate quiz')
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast.dismiss()
      toast.error('An error occurred while generating the quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (optionIndex: number) => {
    if (showResults) return

    const newSelectedAnswers = [...selectedAnswers]
    newSelectedAnswers[currentQuestionIndex] = optionIndex
    setSelectedAnswers(newSelectedAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowExplanation(false)
    } else {
      setShowResults(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowExplanation(false)
    }
  }

  const calculateScore = () => {
    let correctCount = 0
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correctCount++
      }
    })
    return correctCount
  }

  const handleFinishQuiz = () => {
    setShowResults(true)
    setShowExplanation(false)
  }

  const resetQuiz = () => {
    setQuestions([])
    setSelectedAnswers([])
    setCurrentQuestionIndex(0)
    setShowResults(false)
    setShowExplanation(false)
    setTopic('')
  }

  // Render the quiz generation form
  const renderQuizForm = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-4">
          <span className="text-2xl text-white">❓</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generate a Quiz</h2>
          <p className="text-gray-600">Create personalized questions tailored to your learning goals</p>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-semibold text-gray-800 mb-2">
            📝 Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., JavaScript, React, Web Development)"
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm bg-gray-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-800 mb-2">
            🎯 Difficulty Level
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm bg-gray-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-200"
          >
            <option value="beginner">🌱 Beginner</option>
            <option value="intermediate">🌿 Intermediate</option>
            <option value="advanced">🌲 Advanced</option>
          </select>
        </div>

        <div>
          <label htmlFor="questionCount" className="block text-sm font-semibold text-gray-800 mb-2">
            🔢 Number of Questions
          </label>
          <select
            id="questionCount"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm bg-gray-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all duration-200"
          >
            <option value="3">3 Questions</option>
            <option value="5">5 Questions</option>
            <option value="10">10 Questions</option>
          </select>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Quiz...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">✨</span>
                Generate Quiz
              </div>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )

  // Render the loading state
  const renderLoading = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto py-8"
    >
      <div className="text-center mb-6">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-primary-500 mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Generating your quiz questions...</p>
      </div>
      
      {/* Question skeleton */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-gray-200"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )

  // Render the quiz questions
  const renderQuiz = () => {
    if (questions.length === 0) return null;
    
    if (showResults) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-200/50"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">🏆</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">Here's how you performed</p>
          </div>
          
          <div className="text-center py-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl mb-6">
            <div className="text-5xl font-bold text-primary-600 mb-2">
              {calculateScore()} / {questions.length}
            </div>
            <div className="text-xl text-primary-700 mb-2">
              Score: {Math.round((calculateScore() / questions.length) * 100)}%
            </div>
            <div className="text-sm text-primary-600">
              {calculateScore() === questions.length ? 'Perfect Score! 🎉' : 
               calculateScore() >= questions.length * 0.8 ? 'Great Job! 🚀' :
               calculateScore() >= questions.length * 0.6 ? 'Good Effort! 💪' : 'Keep Learning! 📚'}
            </div>
          </div>
          
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold">Question Review</h3>
            {questions.map((question, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-md ${
                  selectedAnswers[index] === question.correct_answer
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="font-medium">{index + 1}. {question.question}</div>
                <div className="mt-2 text-sm">
                  <span className="font-semibold">Your answer:</span> {question.options[selectedAnswers[index]]}
                </div>
                <div className="mt-1 text-sm">
                  <span className="font-semibold">Correct answer:</span> {question.options[question.correct_answer]}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold">Explanation:</span> {question.explanation}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <Button onClick={resetQuiz} className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              Create New Quiz
            </Button>
          </div>
        </motion.div>
      )
    }
    
    const currentQuestion = questions[currentQuestionIndex]
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-200/50"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">{currentQuestionIndex + 1}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <div className="text-sm text-gray-500">
                {topic} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Progress</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      
        <div className="mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
            <div className="text-xl font-semibold text-gray-900 leading-relaxed">
              {questions[currentQuestionIndex]?.question}
            </div>
          </div>
          
          <div className="space-y-4">
            {questions[currentQuestionIndex]?.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100 shadow-md'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold text-sm ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-900 font-medium">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
          >
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <h3 className="font-bold text-blue-900">Explanation</h3>
            </div>
            <p className="text-blue-800 leading-relaxed">{questions[currentQuestionIndex]?.explanation}</p>
          </motion.div>
        )}
        
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setShowExplanation(!showExplanation)}
              variant="outline"
              className="bg-white border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50 text-gray-700 hover:text-primary-700 font-medium px-6 py-2 rounded-xl transition-all duration-200"
            >
              <span className="mr-2">{showExplanation ? '🙈' : '💡'}</span>
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </Button>
          </motion.div>
          
          <div className="flex space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="mr-2">⬅️</span>
                Previous
              </Button>
            </motion.div>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleFinishQuiz}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <span className="mr-2">🏁</span>
                  Finish Quiz
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Next
                  <span className="ml-2">➡️</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={resetQuiz}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span className="mr-2">🔄</span>
              Generate New Quiz
            </Button>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-primary-600 to-primary-400 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI-Powered Quiz
        </motion.h1>
        <p className="text-gray-600 text-lg">Test your knowledge with AI-generated questions</p>

        {isGenerating ? (
          renderLoading()
        ) : questions.length > 0 ? (
          renderQuiz()
        ) : (
          renderQuizForm()
        )}
        
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      </div>
    </div>
  )
}
