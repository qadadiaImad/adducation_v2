import { Button } from '@/components/ui/Button'

export function RecommendedLearning() {
  const recommendations = [
    {
      title: 'JavaScript Fundamentals',
      type: 'Course',
      duration: '2 hours',
      difficulty: 'Beginner',
      icon: '📚'
    },
    {
      title: 'Interview Preparation',
      type: 'Practice',
      duration: '30 min',
      difficulty: 'Intermediate',
      icon: '🎤'
    },
    {
      title: 'Resume Building',
      type: 'Guide',
      duration: '1 hour',
      difficulty: 'Beginner',
      icon: '📄'
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
      <div className="space-y-3">
        {recommendations.map((item, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">
                    {item.type} • {item.duration} • {item.difficulty}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Start
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}