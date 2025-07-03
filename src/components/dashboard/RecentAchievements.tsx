import { useGamificationStore } from '@/stores/gamificationStore'

interface RecentAchievementsProps {
  achievements: string[]
}

export function RecentAchievements({ achievements }: RecentAchievementsProps) {
  const { achievements: allAchievements } = useGamificationStore()
  
  const earnedAchievements = allAchievements.filter(a => achievements.includes(a.id))
  const recentAchievements = earnedAchievements.slice(-3) // Show last 3

  if (recentAchievements.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Recent Achievements</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {recentAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex-shrink-0 w-32 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <span className="text-2xl">{achievement.icon}</span>
            </div>
            <h4 className="font-medium text-sm text-gray-900 mb-1">{achievement.title}</h4>
            <p className="text-xs text-gray-600 leading-tight">{achievement.description}</p>
            <div className="mt-1">
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                +{achievement.xpReward} XP
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}