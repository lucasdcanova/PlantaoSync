'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Loader2, Activity, ShieldCheck, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductLogo } from '@/components/brand/product-logo'
import { API_BASE_URL } from '@/lib/env'
import {
  DEMO_DOCTOR_ACCESS_TOKEN,
  DEMO_DOCTOR_USER,
  DEMO_MANAGER_ACCESS_TOKEN,
  DEMO_MANAGER_USER,
  isDoctorDemoCredential,
  isManagerDemoCredential,
} from '@/lib/demo-data'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { useAuthStore } from '@/store/auth.store'
import { useSchedulesStore } from '@/store/schedules.store'
import { useProfessionalsStore } from '@/store/professionals.store'
import { useInstitutionStore } from '@/store/institution.store'
import { useLocationsStore } from '@/store/locations.store'
import { cn } from '@/lib/utils'
import { BRAND_NAME } from '@/lib/brand'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginTransition, setLoginTransition] = useState(false)
  const didInitialRedirect = useRef(false)
  const router = useRouter()
  const { setUser, setAccessToken, isAuthenticated, user } = useAuthStore()
  const validateRegisteredCredential = useDoctorDemoStore(
    (state) => state.validateRegisteredCredential,
  )

  // Store actions accessed via getState() to avoid unnecessary re-renders
  const activateDemoMode = () => {
    useSchedulesStore.getState().initDemoData()
    useProfessionalsStore.getState().initDemoData()
    useLocationsStore.getState().initDemoData()
    useInstitutionStore.getState().initDemoData()
  }

  const clearDemoData = (authUser: Parameters<typeof setUser>[0]) => {
    useSchedulesStore.getState().resetSchedules()
    useProfessionalsStore.getState().resetProfessionals()
    useLocationsStore.getState().resetLocations()
    useInstitutionStore.getState().initFromUser(authUser)
  }

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (didInitialRedirect.current) return
    if (isAuthenticated && user) {
      didInitialRedirect.current = true
      router.replace(user.role === 'PROFESSIONAL' ? '/doctor' : '/overview')
    }
  }, [isAuthenticated, user, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const runPremiumLoginTransition = async (destination: '/overview' | '/doctor') => {
    setLoginTransition(true)
    await new Promise((resolve) => setTimeout(resolve, 980))
    router.push(destination)
  }

  const onSubmit = async (data: LoginForm) => {
    if (isManagerDemoCredential(data.email, data.password)) {
      activateDemoMode()
      setUser(DEMO_MANAGER_USER, true)
      setAccessToken(DEMO_MANAGER_ACCESS_TOKEN)
      await runPremiumLoginTransition('/overview')
      return
    }

    if (isDoctorDemoCredential(data.email, data.password)) {
      activateDemoMode()
      setUser(DEMO_DOCTOR_USER, true)
      setAccessToken(DEMO_DOCTOR_ACCESS_TOKEN)
      await runPremiumLoginTransition('/doctor')
      return
    }

    const invitedDoctor = validateRegisteredCredential(data.email, data.password)
    if (invitedDoctor) {
      const invitedUser = {
        ...DEMO_DOCTOR_USER,
        id: invitedDoctor.id,
        name: invitedDoctor.fullName,
        email: invitedDoctor.email,
      }
      activateDemoMode()
      setUser(invitedUser, true)
      setAccessToken(`${DEMO_DOCTOR_ACCESS_TOKEN}-${invitedDoctor.id}`)
      await runPremiumLoginTransition('/doctor')
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

      const { user: authUser, accessToken } = await res.json()
      clearDemoData(authUser)
      setUser(authUser, false)
      setAccessToken(accessToken)
      await runPremiumLoginTransition(authUser.role === 'PROFESSIONAL' ? '/doctor' : '/overview')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login')
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[linear-gradient(155deg,#f6fbfb_0%,#f8faff_42%,#ecf6f5_100%)] px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="bg-brand-300/30 absolute -left-24 top-16 h-64 w-64 rounded-full blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.46, 0.3] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-brand-200/45 absolute right-[-5rem] top-[30%] h-72 w-72 rounded-full blur-3xl"
          animate={{ scale: [1, 1.14, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 8.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.06fr_0.94fr]">
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="border-brand-200/80 text-brand-800 inline-flex items-center rounded-full border bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              Plataforma hospitalar
            </div>
            <h1 className="font-display text-foreground mt-5 max-w-xl text-4xl font-bold tracking-tight">
              Gestão de plantões com fluidez operacional e segurança clínica.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-lg text-base leading-relaxed">
              {BRAND_NAME} centraliza escalas, trocas e histórico em uma experiência estável para
              gestão e corpo médico.
            </p>

            <div className="mt-8 grid max-w-lg gap-3">
              <div className="border-border/70 bg-card/75 flex items-center gap-3 rounded-2xl border p-4 shadow-sm backdrop-blur">
                <div className="bg-brand-100 text-brand-800 rounded-xl p-2">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">Escalas em tempo real</p>
                  <p className="text-muted-foreground text-xs">
                    Visibilidade imediata de cobertura
                  </p>
                </div>
              </div>
              <div className="border-border/70 bg-card/75 flex items-center gap-3 rounded-2xl border p-4 shadow-sm backdrop-blur">
                <div className="bg-brand-100 text-brand-800 rounded-xl p-2">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">Fluxo médico simplificado</p>
                  <p className="text-muted-foreground text-xs">
                    Trocas e confirmações com menos atrito
                  </p>
                </div>
              </div>
              <div className="border-border/70 bg-card/75 flex items-center gap-3 rounded-2xl border p-4 shadow-sm backdrop-blur">
                <div className="bg-brand-100 text-brand-800 rounded-xl p-2">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">Acesso protegido</p>
                  <p className="text-muted-foreground text-xs">
                    Controle seguro por perfil de usuário
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="relative mx-auto w-full max-w-[460px]"
          >
            <div className="border-border/70 bg-card/92 relative overflow-hidden rounded-[28px] border p-6 shadow-[0_24px_58px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-8">
              <div className="from-brand-300/0 via-brand-500/60 to-brand-300/0 pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r" />

              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 inline-flex">
                  <ProductLogo
                    variant="full"
                    className="w-[256px] max-w-[calc(100vw-5rem)]"
                    imageClassName="h-auto w-full"
                    priority
                  />
                </div>
                <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
                  Entrar na plataforma
                </h2>
                <p className="text-muted-foreground mt-1.5 text-sm">
                  Acesse sua central de plantões com credenciais institucionais.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-foreground block text-xs font-semibold">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com.br"
                    autoComplete="email"
                    {...register('email')}
                    className={cn(
                      'bg-background/80 border-border/80 h-11 rounded-xl',
                      errors.email && 'border-destructive focus-visible:ring-destructive',
                    )}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-foreground block text-xs font-semibold"
                    >
                      Senha
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-brand-700 hover:text-brand-800 text-xs font-medium"
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
                        'bg-background/80 border-border/80 h-11 rounded-xl pr-10',
                        errors.password && 'border-destructive focus-visible:ring-destructive',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-xs">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || Boolean(loginTransition)}
                  className="bg-brand-700 hover:bg-brand-800 shadow-brand-lg h-11 w-full gap-2 rounded-xl font-semibold text-white"
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

              <div className="mt-6 space-y-2 text-center">
                <p className="text-muted-foreground text-sm">
                  Primeira vez?{' '}
                  <Link
                    href="/register"
                    className="text-brand-700 hover:text-brand-800 font-semibold"
                  >
                    Criar conta
                  </Link>
                </p>
                <p className="text-muted-foreground text-xs">
                  Recebeu convite?{' '}
                  <Link
                    href="/invite"
                    className="text-brand-700 hover:text-brand-800 font-semibold"
                  >
                    Cadastre-se no hospital
                  </Link>
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <AnimatePresence>
        {loginTransition && (
          <motion.div
            className="fixed inset-0 z-[120] overflow-hidden bg-[linear-gradient(160deg,#f4faf9_0%,#f6f9ff_50%,#eef8f7_100%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="bg-brand-200/35 absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.5, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70"
              animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut', delay: 0.08 }}
            />

            <div className="relative z-10 flex h-full items-center justify-center px-4">
              <motion.div
                className="border-border/50 bg-white/72 relative grid h-36 w-36 place-items-center rounded-[34px] border shadow-[0_28px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl"
                initial={{ y: 14, scale: 0.96, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="border-brand-200/70 absolute inset-3 rounded-[26px] border"
                  animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.025, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                ></motion.div>

                <motion.div
                  className="absolute inset-0 rounded-[34px]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="bg-brand-500/85 absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full" />
                </motion.div>

                <ProductLogo
                  variant="mark"
                  className="h-16 w-16"
                  imageClassName="h-full w-full"
                  priority
                />
                <span className="sr-only">Entrando na plataforma</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
