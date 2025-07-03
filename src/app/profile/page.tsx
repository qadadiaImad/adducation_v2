'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { Button } from '@/components/ui/Button'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const { userProgress, achievements } = useGamificationStore()

  if (!user) return null

  const earnedAchievements = achievements.filter(a => 
    userProgress?.achievements.includes(a.id)
  )

  const calculateLevelProgress = () => {
    if (!userProgress) return 0
    const currentLevelXp = (userProgress.currentLevel - 1) * 100
    const nextLevelXp = userProgress.currentLevel * 100
    const progressXp = userProgress.totalXp - currentLevelXp
    return (progressXp / 100) * 100
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="card">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.firstName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-gray-500">{user.email}</p>
              {user.jobTitle && (
                <div className="mt-2">
                  <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                    {user.jobTitle}
                  </span>
                </div>
              )}
            </div>
            <Button variant="outline">
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Level Progress */}
        {userProgress && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Level Progress</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-primary-500">
                Level {userProgress.currentLevel}
              </span>
              <span className="text-lg font-semibold text-gray-600">
                {userProgress.totalXp} XP
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(calculateLevelProgress(), 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Progress to Level {userProgress.currentLevel + 1}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-500">
              {userProgress?.currentStreak || 0}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-yellow-500">
              {earnedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-2">🎤</div>
            <div className="text-2xl font-bold text-green-500">
              {userProgress?.interviewsPracticed || 0}
            </div>
            <div className="text-sm text-gray-600">Interviews</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-2xl font-bold text-purple-500">
              {userProgress?.longestStreak || 0}
            </div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </div>
        </div>

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Achievements ({earnedAchievements.length}/{achievements.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map(achievement => {
              const isEarned = earnedAchievements.some(a => a.id === achievement.id)
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border text-center ${
                    isEarned 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                  {isEarned && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      +{achievement.xpReward} XP
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}