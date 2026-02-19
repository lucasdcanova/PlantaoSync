import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOccupancyReport(organizationId: string, month?: Date) {
    const target = month ?? new Date()
    const start = startOfMonth(target)
    const end   = endOfMonth(target)

    const shifts = await this.prisma.shift.findMany({
      where: {
        schedule: { organizationId, status: 'PUBLISHED' },
        date: { gte: start, lte: end },
      },
      include: {
        confirmations: { where: { status: 'ACCEPTED' } },
        location: true,
      },
    })

    const totalSlots     = shifts.reduce((acc, s) => acc + s.requiredCount, 0)
    const filledSlots    = shifts.reduce((acc, s) => acc + s.confirmations.length, 0)
    const occupancyRate  = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0

    return {
      period: { start: start.toISOString(), end: end.toISOString() },
      totalShifts: shifts.length,
      totalSlots,
      filledSlots,
      openSlots: totalSlots - filledSlots,
      occupancyRate,
      byLocation: Object.values(
        shifts.reduce((acc, shift) => {
          const name = shift.location.name
          if (!acc[name]) acc[name] = { location: name, slots: 0, filled: 0 }
          acc[name].slots  += shift.requiredCount
          acc[name].filled += shift.confirmations.length
          return acc
        }, {} as Record<string, { location: string; slots: number; filled: number }>),
      ),
    }
  }

  async getHoursReport(organizationId: string, month?: Date) {
    const target = month ?? new Date()
    const start  = startOfMonth(target)
    const end    = endOfMonth(target)

    const confirmations = await this.prisma.shiftConfirmation.findMany({
      where: {
        status: 'ACCEPTED',
        shift: {
          schedule: { organizationId },
          date: { gte: start, lte: end },
        },
      },
      include: {
        user: { select: { id: true, name: true, specialty: true } },
        shift: true,
      },
    })

    const byUser: Record<string, { userId: string; name: string; specialty?: string; shifts: number; hours: number; earnings: number }> = {}

    for (const c of confirmations) {
      const key = c.userId
      if (!byUser[key]) {
        byUser[key] = {
          userId:    c.user.id,
          name:      c.user.name,
          specialty: c.user.specialty ?? undefined,
          shifts:    0,
          hours:     0,
          earnings:  0,
        }
      }

      // Calcular horas
      const [sh, sm] = c.shift.startTime.split(':').map(Number)
      const [eh, em] = c.shift.endTime.split(':').map(Number)
      let diffH = (eh + em / 60) - (sh + sm / 60)
      if (diffH < 0) diffH += 24

      byUser[key].shifts   += 1
      byUser[key].hours    += diffH
      byUser[key].earnings += Number(c.shift.valuePerShift)
    }

    return {
      period: { start: start.toISOString(), end: end.toISOString() },
      professionals: Object.values(byUser).sort((a, b) => b.earnings - a.earnings),
    }
  }

  async getCostReport(organizationId: string) {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i))

    const results = await Promise.all(
      months.map(async (m) => {
        const start = startOfMonth(m)
        const end   = endOfMonth(m)

        const agg = await this.prisma.financialRecord.aggregate({
          where: { user: { organizationId }, createdAt: { gte: start, lte: end } },
          _sum: { amount: true },
        })

        return {
          month:    `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`,
          label:    m.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          total:    Number(agg._sum.amount ?? 0),
        }
      }),
    )

    return results.reverse()
  }
}
