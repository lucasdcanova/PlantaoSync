import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const checkoutSchema = z.object({
  plan: z.enum(['BASIC', 'PREMIUM', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).default('MONTHLY'),
  customerEmail: z.string().email().optional(),
  organizationId: z.string().min(1).optional(),
  organizationName: z.string().min(1).optional(),
})

type PlanKey = z.infer<typeof checkoutSchema>['plan']
type BillingCycle = z.infer<typeof checkoutSchema>['billingCycle']

const PLAN_DEFINITIONS: Record<
  PlanKey,
  {
    displayName: string
    amountInCents: Record<BillingCycle, number>
  }
> = {
  BASIC: {
    displayName: 'Plano Básico',
    amountInCents: {
      MONTHLY: 29_700,
      ANNUAL: 356_400,
    },
  },
  PREMIUM: {
    displayName: 'Plano Premium',
    amountInCents: {
      MONTHLY: 59_700,
      ANNUAL: 716_400,
    },
  },
  ENTERPRISE: {
    displayName: 'Plano Enterprise',
    amountInCents: {
      MONTHLY: 119_700,
      ANNUAL: 1_436_400,
    },
  },
}

const BILLING_INTERVAL: Record<BillingCycle, 'month' | 'year'> = {
  MONTHLY: 'month',
  ANNUAL: 'year',
}

function getConfiguredPriceId(plan: PlanKey, billingCycle: BillingCycle) {
  const envKey = `STRIPE_PRICE_${plan}_${billingCycle}` as const
  return process.env[envKey]?.trim()
}

function getApplicationUrl(originHeader?: string | null) {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    originHeader ||
    'http://localhost:3002'
  )
}

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim()

  if (!stripeSecretKey) {
    return NextResponse.json(
      {
        message: 'Stripe não configurado. Defina STRIPE_SECRET_KEY no ambiente.',
      },
      { status: 500 },
    )
  }

  try {
    const payload = checkoutSchema.parse(await request.json())
    const planDefinition = PLAN_DEFINITIONS[payload.plan]
    const configuredPriceId = getConfiguredPriceId(payload.plan, payload.billingCycle)
    const appUrl = getApplicationUrl(request.headers.get('origin'))

    const successUrl = `${appUrl}/subscription?checkout=success`
    const cancelUrl = `${appUrl}/subscription?checkout=cancel`

    const params = new URLSearchParams()
    params.set('mode', 'subscription')
    params.set('success_url', successUrl)
    params.set('cancel_url', cancelUrl)
    params.set('allow_promotion_codes', 'true')
    params.set('line_items[0][quantity]', '1')

    if (payload.customerEmail) {
      params.set('customer_email', payload.customerEmail)
    }

    if (payload.organizationId) {
      params.set('client_reference_id', payload.organizationId)
    }

    params.set('metadata[plan]', payload.plan)
    params.set('metadata[billingCycle]', payload.billingCycle)
    params.set('subscription_data[metadata][plan]', payload.plan)
    params.set('subscription_data[metadata][billingCycle]', payload.billingCycle)

    if (payload.organizationId) {
      params.set('subscription_data[metadata][organizationId]', payload.organizationId)
    }

    if (payload.organizationName) {
      params.set('subscription_data[metadata][organizationName]', payload.organizationName)
    }

    if (configuredPriceId) {
      params.set('line_items[0][price]', configuredPriceId)
    } else {
      params.set('line_items[0][price_data][currency]', 'brl')
      params.set(
        'line_items[0][price_data][unit_amount]',
        String(planDefinition.amountInCents[payload.billingCycle]),
      )
      params.set(
        'line_items[0][price_data][product_data][name]',
        `${planDefinition.displayName} - PlantaoSync`,
      )
      params.set(
        'line_items[0][price_data][recurring][interval]',
        BILLING_INTERVAL[payload.billingCycle],
      )
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    })

    const stripePayload = (await stripeResponse.json()) as
      | { id?: string; url?: string }
      | { error?: { message?: string } }

    if (!stripeResponse.ok) {
      const message =
        'error' in stripePayload
          ? stripePayload.error?.message || 'Erro ao criar sessão no Stripe.'
          : 'Erro ao criar sessão no Stripe.'
      return NextResponse.json({ message }, { status: stripeResponse.status })
    }

    if (!('url' in stripePayload) || !stripePayload.url) {
      return NextResponse.json(
        { message: 'Sessão Stripe criada sem URL de redirecionamento.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      id: 'id' in stripePayload ? stripePayload.id : undefined,
      url: stripePayload.url,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Dados inválidos para checkout.',
          issues: error.issues,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Erro inesperado ao criar checkout Stripe.',
      },
      { status: 500 },
    )
  }
}
