import { UserProgress } from '@/stores/gamificationStore'

interface ProgressCardProps {
  userProgress: UserProgress | null
}

export function ProgressCard({ userProgress }: ProgressCardProps) {
  if (!userProgress) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  const level = userProgress.currentLevel
  const totalXp = userProgress.totalXp
  const xpForCurrentLevel = (level - 1) * 100
  const xpForNextLevel = level * 100
  const progressXp = totalXp - xpForCurrentLevel
  const progressPercentage = (progressXp / 100) * 100

  return (
    <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold opacity-90">Your Progress</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">Level {level}</span>
            <span className="text-lg opacity-75">{totalXp} XP</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl">🎯</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm opacity-90">
          <span>Progress to Level {level + 1}</span>
          <span>{progressXp}/{100} XP</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}