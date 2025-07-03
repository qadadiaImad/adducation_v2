import { UserProgress } from '@/stores/gamificationStore'

interface LearningStreakProps {
  userProgress: UserProgress | null
}

export function LearningStreak({ userProgress }: LearningStreakProps) {
  if (!userProgress) return null

  const currentStreak = userProgress.currentStreak
  const longestStreak = userProgress.longestStreak
  const lastActivity = new Date(userProgress.lastActivityDate)
  const now = new Date()
  const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

  const isStreakAtRisk = daysSinceActivity > 0

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Learning Streak</h3>
            <p className="text-sm text-gray-600">Keep the momentum going!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">{longestStreak}</div>
          <div className="text-sm text-gray-600">Best Streak</div>
        </div>
      </div>

      {isStreakAtRisk ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-orange-500">⚠️</span>
            <p className="text-sm text-orange-700 font-medium">
              Your streak is at risk! Complete a lesson today to maintain it.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✅</span>
            <p className="text-sm text-green-700 font-medium">
              Great job! Keep up your learning momentum.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}