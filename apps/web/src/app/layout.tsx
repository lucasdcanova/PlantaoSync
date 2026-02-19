import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/lib/query-provider'
import { getSiteUrl } from '@/lib/site'
import './globals.css'

const baseUrl = getSiteUrl()

export const metadata: Metadata = {
  title: {
    default: 'AgendaPlantão',
    template: '%s | AgendaPlantão',
  },
  description:
    'Plataforma de gestão de escalas e plantões para hospitais e clínicas com foco em previsibilidade operacional e continuidade assistencial.',
  keywords: ['escala médica', 'gestão de plantões', 'software hospitalar', 'sistema para clínicas'],
  authors: [{ name: 'AgendaPlantão' }],
  creator: 'AgendaPlantão',
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'AgendaPlantão',
    description:
      'Gestão de escalas médicas com governança, rastreabilidade e visão operacional para hospitais e clínicas.',
    url: baseUrl,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'AgendaPlantão',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgendaPlantão',
    description:
      'Escalas médicas com previsibilidade de cobertura e controle operacional em um único painel.',
  },
  alternates: {
    canonical: '/',
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
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
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
                style: { fontFamily: 'var(--font-geist-sans)' },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
