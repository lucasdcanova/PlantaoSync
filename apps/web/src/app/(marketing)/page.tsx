import type { Metadata } from 'next'
import { LandingPage } from '@/components/marketing/landing-page'
import { getSiteUrl } from '@/lib/site'

const baseUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Software de Escalas Médicas para Hospitais e Clínicas',
  description:
    'Gestão de escalas médicas com foco em continuidade assistencial. Antecipe lacunas, confirme plantões com rastreabilidade e decida com visão operacional e financeira.',
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
    title: 'Escala médica sob controle antes da crise do plantão',
    description:
      'Uma central operacional para direção clínica, coordenação e financeiro atuarem com previsibilidade de cobertura.',
    url: baseUrl,
    siteName: 'AgendaPlantão',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgendaPlantão | Escala médica com governança operacional',
    description:
      'Antecipe lacunas, reduza improviso e mantenha rastreabilidade de ponta a ponta na operação de plantão.',
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AgendaPlantão',
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
    'Plataforma de gestão de escalas e plantões médicos com foco em continuidade assistencial e governança operacional.',
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
