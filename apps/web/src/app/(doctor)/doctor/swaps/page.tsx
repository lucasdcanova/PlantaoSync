'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeftRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { formatDate } from '@/lib/utils'

const swapStatusClass: Record<'PENDENTE' | 'ACEITA' | 'RECUSADA', string> = {
  PENDENTE:
    'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  ACEITA:
    'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
  RECUSADA:
    'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300',
}

export default function DoctorSwapsPage() {
  const myShifts = useDoctorDemoStore((state) => state.myShifts)
  const swapRequests = useDoctorDemoStore((state) => state.swapRequests)
  const requestSwap = useDoctorDemoStore((state) => state.requestSwap)
  const respondSwapRequest = useDoctorDemoStore((state) => state.respondSwapRequest)

  const eligibleShifts = myShifts.filter((shift) => shift.status === 'CONFIRMADO' || shift.status === 'TROCA_SOLICITADA')

  const [shiftId, setShiftId] = useState(eligibleShifts[0]?.id ?? '')
  const [counterpartName, setCounterpartName] = useState('')
  const [reason, setReason] = useState('')

  const incoming = useMemo(
    () => swapRequests.filter((request) => request.direction === 'entrada'),
    [swapRequests],
  )
  const outgoing = useMemo(
    () => swapRequests.filter((request) => request.direction === 'saida'),
    [swapRequests],
  )

  useEffect(() => {
    if (eligibleShifts.length === 0) {
      setShiftId('')
      return
    }

    const hasSelectedShift = eligibleShifts.some((shift) => shift.id === shiftId)
    if (!hasSelectedShift) {
      setShiftId(eligibleShifts[0].id)
    }
  }, [eligibleShifts, shiftId])

  const submitSwapRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!shiftId || !counterpartName.trim() || !reason.trim()) {
      toast.error('Preencha os campos obrigatórios para solicitar a troca.')
      return
    }
    if (!eligibleShifts.some((shift) => shift.id === shiftId)) {
      toast.error('Selecione um plantão confirmado para solicitar troca.')
      return
    }

    requestSwap({
      shiftId,
      counterpartName: counterpartName.trim(),
      reason: reason.trim(),
    })
    toast.success('Solicitação de troca enviada para análise.')
    setCounterpartName('')
    setReason('')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-foreground">Solicitar troca de plantão</h2>
        <p className="text-sm text-muted-foreground">
          Selecione seu plantão, informe o colega e envie a justificativa da troca.
        </p>

        <form onSubmit={submitSwapRequest} className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="shiftId">Plantão</Label>
            <select
              id="shiftId"
              value={shiftId}
              onChange={(event) => setShiftId(event.target.value)}
              disabled={eligibleShifts.length === 0}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {eligibleShifts.length === 0 && (
                <option value="">Nenhum plantão elegível para troca</option>
              )}
              {eligibleShifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.sectorName} · {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="counterpartName">Colega para troca</Label>
            <Input
              id="counterpartName"
              value={counterpartName}
              onChange={(event) => setCounterpartName(event.target.value)}
              placeholder="Dr. João Pereira"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="reason">Motivo da troca</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Exemplo: sobreposição com agenda de congresso"
            />
          </div>

          <Button
            type="submit"
            disabled={eligibleShifts.length === 0}
            className="gap-2 bg-brand-600 text-white shadow-brand hover:bg-brand-700 md:col-span-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Enviar solicitação
          </Button>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-bold text-foreground">Recebidas (aceitar ou recusar)</h3>
          <div className="mt-4 space-y-3">
            {incoming.map((request) => (
              <div key={request.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{request.sectorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(request.shiftDate)} · {request.shiftTime}
                    </p>
                  </div>
                  <Badge className={swapStatusClass[request.status]}>{request.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {request.counterpartName} · {request.reason}
                </p>

                {request.status === 'PENDENTE' && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => {
                        respondSwapRequest(request.id, 'ACEITA')
                        toast.success('Troca aceita com sucesso.')
                      }}
                    >
                      Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300"
                      onClick={() => {
                        respondSwapRequest(request.id, 'RECUSADA')
                        toast.success('Troca recusada.')
                      }}
                    >
                      Recusar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-bold text-foreground">Enviadas</h3>
          <div className="mt-4 space-y-3">
            {outgoing.map((request) => (
              <div key={request.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{request.sectorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(request.shiftDate)} · {request.shiftTime}
                    </p>
                  </div>
                  <Badge className={swapStatusClass[request.status]}>{request.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enviada para {request.counterpartName}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
