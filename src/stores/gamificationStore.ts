import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/authService'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  unlockedAt?: string
}

export interface UserProgress {
  id: string
  userId: string
  currentLevel: number
  totalXp: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
  skillLevels: Record<string, number>
  completedCourses: string[]
  achievements: string[]
  interviewsPracticed: number
  averageInterviewScore: number
}

interface GamificationState {
  userProgress: UserProgress | null
  achievements: Achievement[]
  isLoading: boolean
  addXP: (amount: number, reason: string) => void
  updateStreak: () => void
  unlockAchievement: (achievementId: string) => void
  loadUserProgress: (userId: string) => void
}

const defaultAchievements: Achievement[] = [
  {
    id: 'first_login',
    title: 'Welcome Aboard!',
    description: 'Complete your first login',
    icon: '👋',
    xpReward: 10,
  },
  {
    id: 'first_lesson',
    title: 'Learning Begins',
    description: 'Complete your first lesson',
    icon: '📚',
    xpReward: 25,
  },
  {
    id: 'first_interview',
    title: 'Interview Ready',
    description: 'Complete your first mock interview',
    icon: '🎤',
    xpReward: 50,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '⚡',
    xpReward: 75,
  },
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    xpReward: 100,
  },
]

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      userProgress: null,
      achievements: defaultAchievements,
      isLoading: false,

      addXP: async (amount: number, reason: string) => {
        const { userProgress } = get()
        if (!userProgress) return

        const newTotalXp = userProgress.totalXp + amount
        const newLevel = Math.floor(newTotalXp / 100) + 1

        const updatedProgress = {
          ...userProgress,
          totalXp: newTotalXp,
          currentLevel: newLevel,
          lastActivityDate: new Date().toISOString(),
        }

        set({ userProgress: updatedProgress })

        // Sync with backend
        try {
          await authService.updateUserProgress(userProgress.userId, updatedProgress)
        } catch (error) {
          console.error('Failed to sync progress with backend:', error)
        }

        // Check for level achievements
        if (newLevel >= 5 && !userProgress.achievements.includes('level_5')) {
          get().unlockAchievement('level_5')
        }
      },

      updateStreak: async () => {
        const { userProgress } = get()
        if (!userProgress) return

        const now = new Date()
        const lastActivity = new Date(userProgress.lastActivityDate)
        const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

        let newStreak = userProgress.currentStreak
        if (daysDiff === 1) {
          newStreak += 1
        } else if (daysDiff > 1) {
          newStreak = 1
        }

        const newLongestStreak = Math.max(newStreak, userProgress.longestStreak)

        const updatedProgress = {
          ...userProgress,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastActivityDate: now.toISOString(),
        }

        set({ userProgress: updatedProgress })

        // Sync with backend
        try {
          await authService.updateUserProgress(userProgress.userId, updatedProgress)
        } catch (error) {
          console.error('Failed to sync streak with backend:', error)
        }

        // Check for streak achievements
        if (newStreak >= 7 && !userProgress.achievements.includes('streak_7')) {
          get().unlockAchievement('streak_7')
        }
      },

      unlockAchievement: async (achievementId: string) => {
        const { userProgress, achievements } = get()
        if (!userProgress || userProgress.achievements.includes(achievementId)) return

        const achievement = achievements.find(a => a.id === achievementId)
        if (!achievement) return

        const updatedProgress = {
          ...userProgress,
          achievements: [...userProgress.achievements, achievementId],
          totalXp: userProgress.totalXp + achievement.xpReward,
        }

        set({ userProgress: updatedProgress })

        // Sync with backend
        try {
          await authService.updateUserProgress(userProgress.userId, updatedProgress)
        } catch (error) {
          console.error('Failed to sync achievement with backend:', error)
        }
      },

      loadUserProgress: async (userId: string) => {
        set({ isLoading: true })
        
        try {
          // Try to load from backend first
          const backendProgress = await authService.getUserProgress(userId)
          
          if (backendProgress) {
            set({ userProgress: backendProgress, isLoading: false })
          } else {
            // Initialize default progress if none exists
            const defaultProgress = {
              id: `progress_${userId}`,
              userId,
              currentLevel: 1,
              totalXp: 0,
              currentStreak: 0,
              longestStreak: 0,
              lastActivityDate: new Date().toISOString(),
              skillLevels: {},
              completedCourses: [],
              achievements: [],
              interviewsPracticed: 0,
              averageInterviewScore: 0,
            }
            
            set({ userProgress: defaultProgress, isLoading: false })
            
            // Create initial progress in backend
            try {
              await authService.updateUserProgress(userId, defaultProgress)
            } catch (error) {
              console.error('Failed to create initial progress in backend:', error)
            }
          }
        } catch (error) {
          console.error('Failed to load user progress:', error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'gamification-storage',
    }
  )
)