'use client'

import { ArrowLeftRight, Clock3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DoctorSwapsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-foreground">Trocas de plantão</h2>
        <p className="text-sm text-muted-foreground">
          A gestão completa de trocas está em implantação para operação com regras institucionais.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <Clock3 className="h-3.5 w-3.5" />
          Em breve
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">Sem solicitações de troca ativas</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Assim que o módulo estiver ativo, as solicitações recebidas e enviadas aparecerão aqui.
        </p>
        <div className="mt-4">
          <Badge variant="outline">Fluxo temporariamente indisponível</Badge>
        </div>
      </section>
    </div>
  )
}
