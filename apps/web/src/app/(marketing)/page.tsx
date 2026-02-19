import type { Metadata } from 'next'
import { LandingPage } from '@/components/marketing/landing-page'
import { getSiteUrl } from '@/lib/site'
import { BRAND_NAME } from '@/lib/brand'

const baseUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Software de Escalas e Confirmação de Plantões para Hospitais e Clínicas',
  description:
    'Gestão de escalas médicas com confirmação em tempo real. Antecipe lacunas, valide cobertura com rastreabilidade e decida com visão operacional e financeira.',
  keywords: [
    'software de escalas médicas',
    'gestão de plantões',
    'sistema para hospitais e clínicas',
    'escala hospitalar',
    'continuidade assistencial',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Escala médica sob controle com confirmação em tempo real',
    description:
      'Uma central operacional para direção clínica, coordenação e financeiro atuarem com previsibilidade de cobertura e confirmação imediata.',
    url: baseUrl,
    siteName: BRAND_NAME,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} | Escala médica com governança operacional`,
    description:
      'Antecipe lacunas, reduza improviso e mantenha rastreabilidade de ponta a ponta na operação de plantão.',
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: BRAND_NAME,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'pt-BR',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
    description: 'Diagnóstico inicial gratuito',
  },
  audience: {
    '@type': 'BusinessAudience',
    audienceType: 'Hospitais e clínicas',
  },
  description:
    'Plataforma de gestão de escalas e confirmações de plantão com foco em continuidade assistencial e governança operacional.',
}

export default function MarketingHomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <LandingPage />
    </>
  )
}
