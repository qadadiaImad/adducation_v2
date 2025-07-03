'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProgressCard } from '@/components/dashboard/ProgressCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentAchievements } from '@/components/dashboard/RecentAchievements'
import { LearningStreak } from '@/components/dashboard/LearningStreak'
import { RecommendedLearning } from '@/components/dashboard/RecommendedLearning'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { loadUserProgress, userProgress } = useGamificationStore()

  useEffect(() => {
    if (user) {
      loadUserProgress(user.id)
    }
  }, [user, loadUserProgress])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Learner'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Progress Overview */}
        <ProgressCard userProgress={userProgress} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Achievements */}
        {userProgress?.achievements && userProgress.achievements.length > 0 && (
          <RecentAchievements achievements={userProgress.achievements} />
        )}

        {/* Learning Streak */}
        <LearningStreak userProgress={userProgress} />

        {/* Recommended Learning */}
        <RecommendedLearning />
      </div>
    </DashboardLayout>
  )
}