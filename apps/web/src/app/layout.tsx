import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/lib/query-provider'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})


export const metadata: Metadata = {
  title: {
    default: 'AgendaPlantão — Gestão Inteligente de Escalas Médicas',
    template: '%s | AgendaPlantão',
  },
  description:
    'Plataforma SaaS para gestão de escalas e plantões médicos. Reduza 80% do tempo de gestão. Notificações em tempo real. Confirmação com 1 clique.',
  keywords: ['escalas médicas', 'plantões', 'gestão hospitalar', 'SaaS saúde'],
  authors: [{ name: 'AgendaPlantão' }],
  creator: 'AgendaPlantão',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://agendaplantao.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'AgendaPlantão',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AgendaPlantão',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#4f46e5' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                style: { fontFamily: 'var(--font-dm-sans)' },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
