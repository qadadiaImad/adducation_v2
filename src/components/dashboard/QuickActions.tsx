import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: 'Start Learning',
      description: 'Browse courses and tutorials',
      icon: '📚',
      color: 'bg-blue-500',
      href: '/learn'
    },
    {
      title: 'Practice Interview',
      description: 'Mock interviews with AI',
      icon: '🎤',
      color: 'bg-green-500',
      href: '/interview'
    },
    {
      title: 'Take Assessment',
      description: 'Test your knowledge',
      icon: '📝',
      color: 'bg-orange-500',
      href: '/assessment'
    },
    {
      title: 'View Progress',
      description: 'Track your growth',
      icon: '📊',
      color: 'bg-purple-500',
      href: '/profile'
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <div
            key={action.title}
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => router.push(action.href)}
          >
            <div className="text-center">
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{action.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}