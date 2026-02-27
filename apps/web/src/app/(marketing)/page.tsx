import type { Metadata } from 'next'
import { LandingPage } from '@/components/marketing/landing-page'
import { getSiteUrl } from '@/lib/site'
import { BRAND_NAME } from '@/lib/brand'

const baseUrl = getSiteUrl()

export const metadata: Metadata = {
  title: {
    absolute: 'Plataforma de Gestão de Escalas Médicas para Hospitais | Confirma Plantão',
  },
  description:
    'Plataforma institucional para gestão de escalas médicas, confirmação de cobertura, substituições e consolidação financeira em hospitais, UPAs e clínicas.',
  keywords: [
    'software de escalas médicas',
    'gestão de plantões hospitalares',
    'sistema de escalas para hospitais e clínicas',
    'confirmação de plantão online',
    'escala hospitalar digital',
    'cobertura assistencial em tempo real',
    'substituição de planilha de escala médica',
    'software médico SaaS',
    'gestão de cobertura de plantão',
    'rastreabilidade de escalas ANVISA CFM',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Governança de Escalas Médicas para Instituições de Saúde',
    description:
      'Padronize publicação, confirmação e substituição de plantões com rastreabilidade operacional e visão consolidada de cobertura.',
    url: baseUrl,
    siteName: BRAND_NAME,
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} - Gestão de escalas médicas em tempo real`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} | Governança de escalas médicas`,
    description:
      'Plataforma para instituições de saúde com cobertura em tempo real, trilha de auditoria e consolidação financeira por unidade.',
    images: [`${baseUrl}/twitter-image`],
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: BRAND_NAME,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  inLanguage: 'pt-BR',
  offers: [
    {
      '@type': 'Offer',
      name: 'Plano Básico',
      price: '297',
      priceCurrency: 'BRL',
      description: 'Até 15 profissionais, 1 unidade',
    },
    {
      '@type': 'Offer',
      name: 'Plano Premium',
      price: '597',
      priceCurrency: 'BRL',
      description: 'Até 30 profissionais, 2 unidades',
    },
    {
      '@type': 'Offer',
      name: 'Plano Enterprise',
      price: '1197',
      priceCurrency: 'BRL',
      description: 'Até 100 profissionais, 8 unidades',
    },
  ],
  audience: {
    '@type': 'BusinessAudience',
    audienceType: 'Hospitais, UPAs e clínicas médicas',
  },
  description:
    'Plataforma SaaS para governança de escalas médicas com confirmação de cobertura, substituições formalizadas, consolidação financeira e conformidade LGPD.',
  featureList: [
    'Confirmação de plantão com registro de data e hora',
    'Painel de cobertura em tempo real por setor e especialidade',
    'Gestão de trocas com trilha de auditoria completa',
    'Consolidação financeira por plantão, profissional e unidade',
    'Relatórios exportáveis em PDF e Excel',
    'Registros para auditoria institucional',
    'Conformidade com LGPD e boas práticas de segurança da informação',
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quanto tempo leva para colocar a primeira escala no ar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O prazo depende da estrutura da instituição e do escopo inicial. Em operações padrão, a configuração de uma unidade piloto é concluída em curto prazo com acompanhamento da implantação.',
      },
    },
    {
      '@type': 'Question',
      name: 'Os médicos precisam baixar algum aplicativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O CONFIRMA PLANTÃO funciona como PWA (Progressive Web App). O médico pode confirmar plantões diretamente pelo navegador do celular, sem precisar instalar nada.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como funciona a migração das planilhas atuais?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A migração pode ser realizada por importação em lote via planilha para profissionais, setores e histórico de escalas. O processo é acompanhado pela equipe de implantação conforme o plano contratado.',
      },
    },
    {
      '@type': 'Question',
      name: 'Tem integração com sistemas HIS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A API de integração está disponível para os planos Enterprise, permitindo sincronizar com sistemas como MV, Tasy, Soul MV e outros HIS.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como a plataforma garante conformidade com LGPD?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O CONFIRMA PLANTÃO opera com isolamento de dados por organização (row-level security), coleta de consentimento, logs de auditoria e APIs para exportação e exclusão de dados. Toda a infraestrutura usa criptografia AES-256.',
      },
    },
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND_NAME,
  url: baseUrl,
  logo: `${baseUrl}/brand/logo-mark-square.png`,
  sameAs: [],
}

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: BRAND_NAME,
  url: baseUrl,
  inLanguage: 'pt-BR',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${baseUrl}/faq?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export default function MarketingHomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <LandingPage />
    </>
  )
}
