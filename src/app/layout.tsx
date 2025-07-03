import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ClientOnly from '../components/ClientOnly'
import DebugPanelContainer from './debug-panel'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { MainThemeToggle } from '@/components/ui/MainThemeToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Adducation - Learn & Grow',
  description: 'Gamified learning platform for job seekers',
}

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} transition-colors duration-300`}>
        <ClientOnly>
          <ThemeProvider>
            <Toaster position="top-center" />
            {children}
            {/* Debug panel is only rendered on client side */}
            <div id="debug-panel-container" />
            <DebugPanelContainer />
            <MainThemeToggle />
          </ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  )
}