import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/lib/query-provider'
import { getSiteUrl } from '@/lib/site'
import { BRAND_NAME } from '@/lib/brand'
import './globals.css'

const baseUrl = getSiteUrl()
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    'Plataforma de gestão de escalas e plantões para hospitais e clínicas com foco em previsibilidade operacional, confirmação rápida e continuidade assistencial.',
  keywords: ['escala médica', 'gestão de plantões', 'software hospitalar', 'sistema para clínicas'],
  authors: [{ name: BRAND_NAME }],
  creator: BRAND_NAME,
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: BRAND_NAME,
    description:
      'Gestão de escalas médicas com governança, rastreabilidade e confirmação em tempo real para hospitais e clínicas.',
    url: baseUrl,
    type: 'website',
    locale: 'pt_BR',
    siteName: BRAND_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND_NAME,
    description:
      'Escalas médicas com previsibilidade de cobertura e confirmação em um único painel.',
  },
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/brand/logo-mark-square.png',
    shortcut: '/brand/logo-mark-square.png',
    apple: '/brand/logo-mark-square.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: BRAND_NAME,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4ecdc4' },
    { media: '(prefers-color-scheme: dark)', color: '#2bb5ab' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
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
                style: { fontFamily: 'var(--font-inter)' },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
