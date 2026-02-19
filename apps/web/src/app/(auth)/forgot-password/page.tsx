'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BRAND_NAME } from '@/lib/brand'

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotForm) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    toast.success(`Se houver conta para ${data.email}, enviaremos instruções por e-mail.`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md card-base rounded-xl p-8">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
          <MailCheck className="h-5 w-5" />
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground">Restaurar acesso da operação</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe o e-mail institucional para receber as instruções de redefinição no {BRAND_NAME}.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-700 text-white shadow-brand hover:bg-brand-800"
          >
            {isSubmitting ? 'Enviando...' : 'Receber instruções'}
          </Button>
        </form>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm text-brand-800 transition-colors hover:text-brand-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para acesso
        </Link>
      </div>
    </div>
  )
}
