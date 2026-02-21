import { ImageResponse } from 'next/og'
import { BRAND_NAME } from '@/lib/brand'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '54px',
        background: 'linear-gradient(145deg, #f6fbfb 0%, #eef5ff 46%, #eaf9f5 100%)',
        color: '#0f172a',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(43,181,171,0.35)',
            borderRadius: 999,
            padding: '10px 16px',
            fontSize: 24,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#176b65',
            background: 'rgba(255,255,255,0.75)',
          }}
        >
          SaaS para hospitais e clinicas
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
        <div style={{ fontSize: 68, lineHeight: 1.05, fontWeight: 700 }}>
          Gestao de escalas medicas com confirmacao em tempo real
        </div>
        <div style={{ fontSize: 33, lineHeight: 1.25, color: '#334155' }}>
          Menos planilha e WhatsApp. Mais previsibilidade operacional e cobertura assistencial.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 14,
              background: 'rgba(15,23,42,0.92)',
              color: '#fff',
              fontSize: 24,
            }}
          >
            {BRAND_NAME}
          </div>
        </div>
        <div style={{ fontSize: 24, color: '#475569' }}>
          Confirmacao em 1 toque • LGPD • Dashboard em tempo real
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  )
}
