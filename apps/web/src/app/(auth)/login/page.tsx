'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductLogo } from '@/components/brand/product-logo'
import { API_BASE_URL } from '@/lib/env'
import {
  DEMO_DOCTOR_ACCESS_TOKEN,
  DEMO_DOCTOR_EMAIL,
  DEMO_DOCTOR_PASSWORD,
  DEMO_DOCTOR_USER,
  DEMO_MANAGER_ACCESS_TOKEN,
  DEMO_MANAGER_EMAIL,
  DEMO_MANAGER_PASSWORD,
  DEMO_MANAGER_USER,
  isDoctorDemoCredential,
  isManagerDemoCredential,
} from '@/lib/demo-data'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'
import { BRAND_NAME } from '@/lib/brand'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setUser, setAccessToken, isAuthenticated, user } = useAuthStore()
  const validateRegisteredCredential = useDoctorDemoStore((state) => state.validateRegisteredCredential)

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'PROFESSIONAL' ? '/doctor' : '/overview')
    }
  }, [isAuthenticated, user, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    if (isManagerDemoCredential(data.email, data.password)) {
      setUser(DEMO_MANAGER_USER)
      setAccessToken(DEMO_MANAGER_ACCESS_TOKEN)
      router.push('/overview')
      toast.success(`Bem-vindo, ${DEMO_MANAGER_USER.name.split(' ')[0]}!`)
      return
    }

    if (isDoctorDemoCredential(data.email, data.password)) {
      setUser(DEMO_DOCTOR_USER)
      setAccessToken(DEMO_DOCTOR_ACCESS_TOKEN)
      router.push('/doctor')
      toast.success(`Bem-vinda, ${DEMO_DOCTOR_USER.name.split(' ')[1]}!`)
      return
    }

    const invitedDoctor = validateRegisteredCredential(data.email, data.password)
    if (invitedDoctor) {
      setUser({
        ...DEMO_DOCTOR_USER,
        id: invitedDoctor.id,
        name: invitedDoctor.fullName,
        email: invitedDoctor.email,
      })
      setAccessToken(`${DEMO_DOCTOR_ACCESS_TOKEN}-${invitedDoctor.id}`)
      router.push('/doctor')
      toast.success(`Bem-vindo, ${invitedDoctor.fullName.split(' ')[0]}!`)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Falha no login')
      }

      const { user, accessToken } = await res.json()
      setUser(user)
      setAccessToken(accessToken)
      router.push(user.role === 'PROFESSIONAL' ? '/doctor' : '/overview')
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login')
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-12">
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-100/40 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo and title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 logo-container-light !inline-flex !p-2.5 !rounded-2xl">
            <ProductLogo variant="mark" className="h-10 w-10" imageClassName="h-full w-full" priority />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Entrar
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Acesse sua central de plantões
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com.br"
              autoComplete="email"
              {...register('email')}
              className={cn(
                'h-11 rounded-xl bg-card',
                errors.email && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">Senha</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-700 hover:text-brand-800"
              >
                Esqueceu?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
                className={cn(
                  'h-11 rounded-xl bg-card pr-10',
                  errors.password && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-brand-700 hover:bg-brand-800 text-white shadow-brand gap-2 font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Primeira vez?{' '}
            <Link href="/register" className="font-medium text-brand-700 hover:text-brand-800">
              Criar conta
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Recebeu convite?{' '}
            <Link href="/invite" className="font-medium text-brand-700 hover:text-brand-800">
              Cadastre-se no hospital
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-8 rounded-xl border border-border/60 bg-card/50 p-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Acesso demonstração</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              Gestor: <code className="text-brand-700">{DEMO_MANAGER_EMAIL}</code> / <code className="text-brand-700">{DEMO_MANAGER_PASSWORD}</code>
            </p>
            <p>
              Médico: <code className="text-brand-700">{DEMO_DOCTOR_EMAIL}</code> / <code className="text-brand-700">{DEMO_DOCTOR_PASSWORD}</code>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
