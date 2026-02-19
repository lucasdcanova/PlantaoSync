'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Calendar, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Informe seu nome completo'),
    organizationName: z.string().min(2, 'Informe o nome da organizacao'),
    organizationSlug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]*$/, 'Use apenas letras minusculas, numeros e hifen')
      .optional()
      .or(z.literal('')),
    phone: z.string().max(20, 'Telefone muito longo').optional().or(z.literal('')),
    email: z.string().email('E-mail invalido'),
    password: z
      .string()
      .min(8, 'Senha deve ter no minimo 8 caracteres')
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Use maiusculas, minusculas e numeros'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas nao conferem',
  })

type RegisterForm = z.infer<typeof registerSchema>

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { setUser, setAccessToken } = useAuthStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationSlug: '',
      phone: '',
    },
  })

  const organizationName = watch('organizationName')
  const organizationSlug = watch('organizationSlug')

  const onSubmit = async (data: RegisterForm) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        organizationName: data.organizationName,
        organizationSlug: data.organizationSlug || slugify(data.organizationName),
        phone: data.phone || undefined,
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        const message = Array.isArray(err?.message)
          ? err.message.join(', ')
          : err?.message ?? 'Nao foi possivel criar a conta'
        throw new Error(message)
      }

      const { user, accessToken } = await res.json()
      setUser(user)
      setAccessToken(accessToken)
      toast.success('Conta criada com sucesso')
      router.push('/overview')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar conta')
    }
  }

  return (
    <div className="flex min-h-screen">
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 p-12 text-white lg:flex"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold">AgendaPlantao</span>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight">
              Crie sua organizacao
              <br />
              <span className="text-brand-200">em menos de 2 minutos</span>
            </h1>
            <p className="mt-3 max-w-sm text-brand-100/85">
              Centralize escalas, notificacoes e confirmacoes em um unico fluxo.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              'Publicacao de escalas com poucos cliques',
              'Confirmacao de plantao em tempo real',
              'Visibilidade completa de custos e ocupacao',
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-brand-200/70">Teste gratis por 7 dias · sem cartao</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12"
      >
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold">AgendaPlantao</span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Criar conta</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure sua organizacao e acesse o painel imediatamente
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Dra. Maria Silva"
                autoComplete="name"
                {...register('name')}
                className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organizationName">Organizacao</Label>
              <Input
                id="organizationName"
                placeholder="Hospital Sao Lucas"
                {...register('organizationName')}
                className={cn(errors.organizationName && 'border-destructive focus-visible:ring-destructive')}
                onBlur={() => {
                  if (!organizationSlug) {
                    setValue('organizationSlug', slugify(organizationName ?? ''), {
                      shouldDirty: true,
                    })
                  }
                }}
              />
              {errors.organizationName && (
                <p className="text-xs text-destructive">{errors.organizationName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organizationSlug">Slug da organizacao</Label>
              <Input
                id="organizationSlug"
                placeholder="hospital-sao-lucas"
                {...register('organizationSlug')}
                className={cn(errors.organizationSlug && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.organizationSlug && (
                <p className="text-xs text-destructive">{errors.organizationSlug.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input id="phone" placeholder="(11) 99999-9999" {...register('phone')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="gestor@hospital.com.br"
                autoComplete="email"
                {...register('email')}
                className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('password')}
                  className={cn('pr-10', errors.password && 'border-destructive focus-visible:ring-destructive')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={cn(
                    'pr-10',
                    errors.confirmPassword && 'border-destructive focus-visible:ring-destructive',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 bg-brand-600 text-white shadow-brand hover:bg-brand-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar conta e acessar painel
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            Dados protegidos e em conformidade com a LGPD
          </p>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            Ja tem uma conta?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
