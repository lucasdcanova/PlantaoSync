import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { addDays, addHours, startOfToday } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Limpar dados existentes
  await prisma.auditLog.deleteMany()
  await prisma.financialRecord.deleteMany()
  await prisma.shiftConfirmation.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.pushToken.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.location.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.organization.deleteMany()

  const passwordHash = await bcrypt.hash('Senha@123', 12)
  const today = startOfToday()

  // Organização 1 - Hospital São Lucas
  const org1 = await prisma.organization.create({
    data: {
      name: 'Hospital São Lucas',
      slug: 'hospital-sao-lucas',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 3000-4000',
      subscription: {
        create: {
          plan: 'PREMIUM',
          billingCycle: 'ANNUAL',
          status: 'ACTIVE',
          currentPeriodEnd: addDays(today, 365),
        },
      },
    },
  })

  // Locais
  const loc1 = await prisma.location.create({
    data: {
      organizationId: org1.id,
      name: 'UTI Adulto',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
    },
  })

  const loc2 = await prisma.location.create({
    data: {
      organizationId: org1.id,
      name: 'Pronto-Socorro',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
    },
  })

  // Gestor
  const manager = await prisma.user.create({
    data: {
      organizationId: org1.id,
      name: 'Dr. João Silva',
      email: 'gestor@demo.com',
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
    },
  })

  // Profissionais
  const professionals = await Promise.all([
    prisma.user.create({
      data: {
        organizationId: org1.id,
        name: 'Dra. Ana Costa',
        email: 'ana.costa@demo.com',
        passwordHash,
        role: 'PROFESSIONAL',
        crm: 'CRM/SP 123456',
        specialty: 'Medicina de Emergência',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        organizationId: org1.id,
        name: 'Dr. Carlos Mendes',
        email: 'carlos.mendes@demo.com',
        passwordHash,
        role: 'PROFESSIONAL',
        crm: 'CRM/SP 654321',
        specialty: 'Medicina Intensiva',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        organizationId: org1.id,
        name: 'Enf. Maria Santos',
        email: 'maria.santos@demo.com',
        passwordHash,
        role: 'PROFESSIONAL',
        specialty: 'Enfermagem UTI',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        organizationId: org1.id,
        name: 'Dr. Pedro Oliveira',
        email: 'pedro.oliveira@demo.com',
        passwordHash,
        role: 'PROFESSIONAL',
        crm: 'CRM/SP 789012',
        specialty: 'Medicina de Emergência',
        emailVerified: true,
      },
    }),
  ])

  // Escala publicada — semana atual
  const schedule1 = await prisma.schedule.create({
    data: {
      organizationId: org1.id,
      locationId: loc1.id,
      title: `Escala UTI — ${today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      description: 'Escala mensal da UTI Adulto',
      startDate: today,
      endDate: addDays(today, 30),
      status: 'PUBLISHED',
      publishedAt: today,
    },
  })

  // Plantões
  const shifts = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i)
    // Turno diurno
    shifts.push(
      await prisma.shift.create({
        data: {
          scheduleId: schedule1.id,
          locationId: loc1.id,
          date,
          startTime: '07:00',
          endTime: '19:00',
          specialty: 'Medicina Intensiva',
          requiredCount: 2,
          valuePerShift: 120000, // R$ 1.200,00 in cents (stored as Decimal)
        },
      }),
    )
    // Turno noturno
    shifts.push(
      await prisma.shift.create({
        data: {
          scheduleId: schedule1.id,
          locationId: loc1.id,
          date,
          startTime: '19:00',
          endTime: '07:00',
          specialty: 'Medicina Intensiva',
          requiredCount: 2,
          valuePerShift: 150000,
        },
      }),
    )
  }

  // Confirmações
  await prisma.shiftConfirmation.create({
    data: {
      shiftId: shifts[0]!.id,
      userId: professionals[0]!.id,
      status: 'ACCEPTED',
      confirmedAt: new Date(),
    },
  })
  await prisma.shiftConfirmation.create({
    data: {
      shiftId: shifts[0]!.id,
      userId: professionals[1]!.id,
      status: 'ACCEPTED',
      confirmedAt: new Date(),
    },
  })
  await prisma.shiftConfirmation.create({
    data: {
      shiftId: shifts[1]!.id,
      userId: professionals[2]!.id,
      status: 'ACCEPTED',
      confirmedAt: new Date(),
    },
  })

  // Notificações
  await prisma.notification.createMany({
    data: professionals.map((p) => ({
      userId: p.id,
      type: 'SCHEDULE_PUBLISHED' as const,
      title: 'Nova escala disponível',
      body: `A escala "${schedule1.title}" foi publicada. Confira os plantões disponíveis.`,
      data: { scheduleId: schedule1.id },
      sentAt: new Date(),
    })),
  })

  console.log('✅ Seed concluído!')
  console.log('')
  console.log('📋 Dados de acesso:')
  console.log('  Gestor:       gestor@demo.com      / Senha@123')
  console.log('  Profissional: ana.costa@demo.com   / Senha@123')
  console.log('  Profissional: carlos.mendes@demo.com / Senha@123')
  console.log('')
  console.log(`  Organização:  ${org1.name} (${org1.slug})`)
  console.log(`  Locais:       ${loc1.name}, ${loc2.name}`)
  console.log(`  Profissionais criados: ${professionals.length + 1}`)
  console.log(`  Escala: ${schedule1.title}`)
  console.log(`  Plantões criados: ${shifts.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
