import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/components/layout/QueryProvider'
import { AuthProvider } from '@/hooks/useAuth'
import './globals.css'

export const metadata: Metadata = {
  title: 'CareerAI — AI-Powered Career Assistant',
  description: 'Supercharge your job search with AI-driven resume analysis, job matching, and interview prep.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-white antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#161b27',
                    border: '1px solid #1e2535',
                    color: '#e2e8f0',
                  },
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
