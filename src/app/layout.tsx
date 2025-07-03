import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ClientOnly from '../components/ClientOnly'
import DebugPanelContainer from './debug-panel'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Adducation - Learn & Grow',
  description: 'Gamified learning platform for job seekers',
}

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-center" />
        {children}
        <ClientOnly>
          {/* Debug panel is only rendered on client side */}
          <div id="debug-panel-container" />
          <DebugPanelContainer />
        </ClientOnly>
      </body>
    </html>
  )
}