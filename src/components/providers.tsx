'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <ThemeProvider>{children}</ThemeProvider>
}