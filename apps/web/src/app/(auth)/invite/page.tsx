'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductLogo } from '@/components/brand/product-logo'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { cn } from '@/lib/utils'

interface InviteFormState {
  inviteCode: string
  fullName: string
  email: string
  crm: string
  specialty: string
  password: string
  confirmPassword: string
}

const initialFormState: InviteFormState = {
  inviteCode: '',
  fullName: '',
  email: '',
  crm: '',
  specialty: '',
  password: '',
  confirmPassword: '',
}

export default function InviteRegisterPage() {
  const router = useRouter()
  const registerDoctorByInvite = useDoctorDemoStore((state) => state.registerDoctorByInvite)
  const [form, setForm] = useState<InviteFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChange = (field: keyof InviteFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (form.password.length < 8) {
      setError('A senha precisa ter ao menos 8 caracteres.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setIsSubmitting(true)
    const result = registerDoctorByInvite({
      inviteCode: form.inviteCode,
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      crm: form.crm,
      specialty: form.specialty,
    })
    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen">
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden w-1/2 flex-col justify-between bg-[linear-gradient(145deg,#1a1d23_0%,#22313a_55%,#2bb5ab_140%)] p-12 text-white lg:flex"
      >
        <ProductLogo variant="full" className="max-w-[300px]" imageClassName="w-full h-auto" priority />

        <div className="space-y-5">
          <h1 className="font-display text-3xl font-bold leading-tight">
            Cadastro médico
            <br />
            <span className="text-brand-200">via convite do gestor</span>
          </h1>
          <p className="max-w-sm text-sm text-brand-100/85">
            Informe o código recebido para entrar no hospital correto e acessar plantões, trocas e histórico
            completo no ambiente médico.
          </p>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
            Exemplo de convite demo: <span className="font-semibold">SG-UTI-2026-ALFA</span>
          </div>
        </div>

        <p className="text-xs text-brand-100/70">Convites ativos são gerenciados pela coordenação do hospital</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12"
      >
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <Button asChild variant="ghost" className="gap-2">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </Link>
            </Button>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground">Entrar no hospital por convite</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Finalize o cadastro para liberar seu ambiente médico com dados de plantão.
          </p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="inviteCode">Código de convite</Label>
              <Input
                id="inviteCode"
                placeholder="SG-UTI-2026-ALFA"
                value={form.inviteCode}
                onChange={(event) => onChange('inviteCode', event.target.value.toUpperCase())}
                className={cn(error && !form.inviteCode && 'border-destructive')}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                placeholder="Dra. Ana Costa"
                value={form.fullName}
                onChange={(event) => onChange('fullName', event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="medico@hospital.com.br"
                value={form.email}
                onChange={(event) => onChange('email', event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="crm">CRM</Label>
              <Input
                id="crm"
                placeholder="CRM-SP 123456"
                value={form.crm}
                onChange={(event) => onChange('crm', event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                placeholder="Medicina Intensiva"
                value={form.specialty}
                onChange={(event) => onChange('specialty', event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(event) => onChange('password', event.target.value)}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={form.confirmPassword}
                onChange={(event) => onChange('confirmPassword', event.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive md:col-span-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-brand-700 text-white shadow-brand hover:bg-brand-800 md:col-span-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validando convite...
                </>
              ) : (
                <>
                  Concluir cadastro e acessar login
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
