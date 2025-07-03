# Adducation Web App

A modern, gamified learning platform for job seekers built with React, Next.js, and TypeScript.

## Features

- 🎯 **Personalized Learning Paths** - AI-generated content tailored to your career goals
- 🎤 **Interview Practice** - Mock interviews with AI feedback
- 🏆 **Gamification** - XP, levels, achievements, and learning streaks
- 🤖 **AI Integration** - OpenRouter API for personalized content generation
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔐 **Secure Authentication** - User registration and login system

## Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Headless UI, Heroicons
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI Integration**: OpenRouter API
- **Storage**: LocalStorage (for demo)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd adducation-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your OpenRouter API key to `.env.local`:
```
OPENROUTER_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Getting Started

1. **Register/Login**: Create an account or sign in
2. **Set API Key**: Click the AI settings button (bottom right) to add your OpenRouter API key
3. **Explore Features**: 
   - Dashboard: View your progress and quick actions
   - Learn: Access learning paths and AI-generated content
   - Interview: Practice with AI-generated questions
   - Profile: Track achievements and stats

### AI Features

The app integrates with OpenRouter to provide:
- Personalized learning recommendations
- AI-generated interview questions
- Intelligent response evaluation
- Custom content based on your skills and goals

### Gamification

- **XP System**: Earn experience points for completing activities
- **Levels**: Progress through levels as you learn
- **Achievements**: Unlock badges for milestones
- **Streaks**: Maintain daily learning habits

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard-specific components
│   └── ai/               # AI-related components
├── services/             # API and external service integrations
├── stores/               # Zustand state management
└── types/                # TypeScript type definitions
```

## Deployment

### Netlify (Recommended)

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `out`
   - Add environment variables in Netlify dashboard

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

## Environment Variables

- `OPENROUTER_API_KEY`: Your OpenRouter API key for AI features
- `JWT_SECRET`: Secret key for JWT token generation
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_URL`: Application URL

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@adducation.com or join our Discord community.