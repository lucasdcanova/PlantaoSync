'use client'

import { useState } from 'react'
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
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setUser, setAccessToken } = useAuthStore()
  const validateRegisteredCredential = useDoctorDemoStore((state) => state.validateRegisteredCredential)

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
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[linear-gradient(145deg,#1a1d23_0%,#22313a_55%,#2bb5ab_140%)] p-12 text-white"
      >
        <ProductLogo variant="full" className="max-w-[300px]" imageClassName="w-full h-auto" priority />

        <div>
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="space-y-4"
          >
            <p className="font-display text-3xl font-bold leading-tight">
              Confirme cobertura crítica <br />
              <span className="text-brand-100">antes da ruptura do plantão</span>
            </p>
            <p className="text-brand-100/80 text-base max-w-sm">
              Centralize escala, confirmação, troca e histórico em uma visão única para direção clínica e coordenação.
            </p>
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            {[
              { value: 'Cobertura', label: 'priorizada por criticidade' },
              { value: 'Fluxo único', label: 'convite até confirmação' },
              { value: 'Histórico', label: 'auditável por unidade' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm">
                <p className="font-display text-base font-bold">{stat.value}</p>
                <p className="text-xs text-brand-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-xs text-brand-100/70">© 2026 {BRAND_NAME} · Conforme LGPD</p>
      </motion.div>

      {/* Right panel — form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="h-9 w-9 rounded-md bg-card p-1 shadow-card">
              <ProductLogo variant="mark" className="h-full w-full" imageClassName="h-full w-full" />
            </div>
            <span className="font-display text-base font-semibold">{BRAND_NAME}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 380, damping: 28 }}
          >
            <h1 className="font-display text-2xl font-bold text-foreground">Acesse sua central operacional</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre para acompanhar cobertura e decisões de plantão em tempo real
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 380, damping: 28 }}
            className="mt-8 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com.br"
                autoComplete="email"
                {...register('email')}
                className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-800 hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={cn('pr-10', errors.password && 'border-destructive focus-visible:ring-destructive')}
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
              className="w-full bg-brand-700 hover:bg-brand-800 text-white shadow-brand gap-2"
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
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            Ainda não tem um ambiente configurado?{' '}
            <Link href="/register" className="font-medium text-brand-800 hover:underline">
              Iniciar diagnóstico
            </Link>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-2 text-center text-xs text-muted-foreground"
          >
            Gestor demo: <code className="text-brand-800">{DEMO_MANAGER_EMAIL}</code> /{' '}
            <code className="text-brand-800">{DEMO_MANAGER_PASSWORD}</code>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.37 }}
            className="mt-1 text-center text-xs text-muted-foreground"
          >
            Médico demo: <code className="text-brand-800">{DEMO_DOCTOR_EMAIL}</code> /{' '}
            <code className="text-brand-800">{DEMO_DOCTOR_PASSWORD}</code>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-1 text-center text-[11px] text-muted-foreground/80"
          >
            Acesso de demonstração funciona mesmo sem API ou banco ativos.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-2 text-center text-xs text-muted-foreground"
          >
            Recebeu convite do gestor?{' '}
            <Link href="/invite" className="font-medium text-brand-800 hover:underline">
              Cadastre-se no hospital
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
