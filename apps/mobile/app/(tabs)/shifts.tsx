import { useMemo, useState } from 'react'
import { ScrollView, Text, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react-native'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'

const tabs = ['Próximos', 'Histórico'] as const
const BRAND = '#4ECDC4'
const GREEN = '#22c55e'
const AMBER = '#f59e0b'
const RED = '#ef4444'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

const statusConfig = {
  CONFIRMADO: { label: 'Confirmado', color: GREEN, icon: CheckCircle },
  CONCLUIDO: { label: 'Concluído', color: BRAND, icon: Calendar },
  TROCA_SOLICITADA: { label: 'Troca solicitada', color: AMBER, icon: Clock },
  CANCELADO: { label: 'Cancelado', color: RED, icon: XCircle },
}

export default function ShiftsHistoryScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const [activeTab, setActiveTab] = useState(0)
  const shifts = useMobileDoctorDemoStore((state) => state.myShifts)

  const displayShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const isUpcoming = shift.status === 'CONFIRMADO' || shift.status === 'TROCA_SOLICITADA'
      return activeTab === 0 ? isUpcoming : !isUpcoming
    })
  }, [activeTab, shifts])

  const bg = isDark ? '#09090f' : '#f8faff'
  const card = isDark ? '#111120' : '#ffffff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: text, marginBottom: 14 }}>Histórico médico</Text>
        <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1a1a2e' : '#f1f5f9', borderRadius: 12, padding: 3 }}>
          {tabs.map((tab, index) => (
            <Text
              key={tab}
              onPress={() => setActiveTab(index)}
              style={{
                flex: 1,
                textAlign: 'center',
                paddingVertical: 8,
                borderRadius: 10,
                color: activeTab === index ? text : muted,
                backgroundColor: activeTab === index ? card : 'transparent',
                fontSize: 13,
                fontWeight: activeTab === index ? '700' : '500',
              }}
            >
              {tab}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 100 + insets.bottom }}>
        {displayShifts.map((shift, index) => {
          const cfg = statusConfig[shift.status]
          const StatusIcon = cfg.icon
          return (
            <MotiView
              key={shift.id}
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 70, type: 'spring', damping: 20 }}
              style={{ marginBottom: 12 }}
            >
              <View style={{ backgroundColor: card, borderRadius: 16, borderWidth: 1, borderColor: border, padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: text }}>{shift.sectorName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${cfg.color}18`, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <StatusIcon size={11} color={cfg.color} />
                    <Text style={{ fontSize: 11, color: cfg.color, fontWeight: '700' }}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: muted }}>
                  {shift.date} · {shift.startTime}–{shift.endTime}
                </Text>
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: muted }}>Carga: {shift.patientLoad}</Text>
                  <Text style={{ fontSize: 13, color: GREEN, fontWeight: '700' }}>{formatCurrency(shift.value)}</Text>
                </View>
              </View>
            </MotiView>
          )
        })}

        {displayShifts.length === 0 && (
          <View style={{ borderRadius: 14, borderWidth: 1, borderColor: border, borderStyle: 'dashed', backgroundColor: card, padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: muted, textAlign: 'center' }}>
              Nenhum plantão nesta aba.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
