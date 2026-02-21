import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { CheckCircle, Clock, XCircle, Calendar, MapPin, DollarSign } from 'lucide-react-native'
import { useState } from 'react'

const BRAND  = '#6366f1'
const GREEN  = '#22c55e'
const AMBER  = '#f59e0b'
const RED    = '#ef4444'

const tabs = ['Próximos', 'Histórico']

const shifts = [
  { id: '1', date: '20/02/2026', location: 'UTI Adulto',     time: '07:00–19:00', value: 120000, status: 'ACCEPTED' },
  { id: '2', date: '22/02/2026', location: 'Pronto-Socorro', time: '19:00–07:00', value: 150000, status: 'ACCEPTED' },
  { id: '3', date: '15/02/2026', location: 'UTI Adulto',     time: '07:00–19:00', value: 120000, status: 'ACCEPTED' },
  { id: '4', date: '10/02/2026', location: 'UTI Adulto',     time: '19:00–07:00', value: 150000, status: 'CANCELLED' },
]

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

const statusConfig = {
  ACCEPTED:  { label: 'Confirmado', color: GREEN,  icon: CheckCircle },
  PENDING:   { label: 'Pendente',   color: AMBER,  icon: Clock },
  CANCELLED: { label: 'Cancelado',  color: RED,    icon: XCircle },
}

export default function ShiftsScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const [activeTab, setActiveTab] = useState(0)

  const bg     = isDark ? '#09090f' : '#f8faff'
  const card   = isDark ? '#111120' : '#ffffff'
  const text   = isDark ? '#f0f4ff' : '#0f172a'
  const muted  = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 0 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: text, letterSpacing: -0.5, marginBottom: 16 }}>
          Meus Plantões
        </Text>
        {/* Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1a1a2e' : '#f1f5f9', borderRadius: 12, padding: 3, marginBottom: 4 }}>
          {tabs.map((tab, i) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(i)}
              style={{
                flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
                backgroundColor: activeTab === i ? (isDark ? '#111120' : '#fff') : 'transparent',
                shadowColor: activeTab === i ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: activeTab === i ? '700' : '500', color: activeTab === i ? text : muted }}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {shifts.map((shift, i) => {
          const cfg = statusConfig[shift.status as keyof typeof statusConfig]
          const StatusIcon = cfg.icon
          return (
            <MotiView
              key={shift.id}
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 60, type: 'spring', damping: 20 }}
              style={{ marginBottom: 12 }}
            >
              <View style={{ backgroundColor: card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color={BRAND} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: text }}>{shift.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${cfg.color}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                    <StatusIcon size={11} color={cfg.color} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: cfg.color }}>{cfg.label}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color={muted} />
                    <Text style={{ fontSize: 13, color: muted }}>{shift.location}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} color={muted} />
                    <Text style={{ fontSize: 13, color: muted }}>{shift.time}</Text>
                  </View>
                </View>
                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <DollarSign size={14} color={GREEN} />
                  <Text style={{ fontSize: 16, fontWeight: '800', color: GREEN }}>
                    {formatCurrency(shift.value)}
                  </Text>
                </View>
              </View>
            </MotiView>
          )
        })}
      </ScrollView>
    </View>
  )
}
