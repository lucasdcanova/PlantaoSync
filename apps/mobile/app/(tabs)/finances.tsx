import { View, Text, ScrollView, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { TrendingUp, DollarSign, CheckCircle, Clock } from 'lucide-react-native'

const BRAND = '#6366f1'
const GREEN = '#22c55e'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

const records = [
  { id: '1', date: '20/02/2026', location: 'UTI Adulto',     amount: 120000, status: 'CONFIRMED' },
  { id: '2', date: '22/02/2026', location: 'Pronto-Socorro', amount: 150000, status: 'PENDING' },
  { id: '3', date: '15/02/2026', location: 'UTI Adulto',     amount: 120000, status: 'PAID' },
]

const statusCfg = {
  PAID:      { label: 'Pago',      color: GREEN },
  CONFIRMED: { label: 'Confirmado', color: BRAND },
  PENDING:   { label: 'Pendente',  color: '#f59e0b' },
  CANCELLED: { label: 'Cancelado', color: '#ef4444' },
}

export default function FinancesScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'

  const bg     = isDark ? '#09090f' : '#f8faff'
  const card   = isDark ? '#111120' : '#ffffff'
  const text   = isDark ? '#f0f4ff' : '#0f172a'
  const muted  = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'

  const totalMonth = records.reduce((acc, r) => acc + r.amount, 0)
  const totalPaid  = records.filter(r => r.status === 'PAID').reduce((acc, r) => acc + r.amount, 0)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 + insets.bottom, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 22, fontWeight: '800', color: text, letterSpacing: -0.5, marginBottom: 20 }}>
        Financeiro
      </Text>

      {/* Summary */}
      <MotiView
        from={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{ backgroundColor: BRAND, borderRadius: 20, padding: 20, marginBottom: 16 }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>Total este mês</Text>
        <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -1 }}>
          {formatCurrency(totalMonth)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
          {[
            { label: 'Pago', value: formatCurrency(totalPaid), icon: CheckCircle },
            { label: 'A receber', value: formatCurrency(totalMonth - totalPaid), icon: Clock },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12 }}>
              <s.icon size={14} color="rgba(255,255,255,0.7)" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 4 }}>{s.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </MotiView>

      {/* Records */}
      <Text style={{ fontSize: 14, fontWeight: '700', color: text, marginBottom: 12 }}>Histórico</Text>
      {records.map((rec, i) => {
        const cfg = statusCfg[rec.status as keyof typeof statusCfg]
        return (
          <MotiView
            key={rec.id}
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: i * 60 + 100, type: 'spring', damping: 20 }}
            style={{ marginBottom: 10 }}
          >
            <View style={{ backgroundColor: card, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: border }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${cfg.color}15`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <DollarSign size={18} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: text }}>{rec.location}</Text>
                <Text style={{ fontSize: 11, color: muted }}>{rec.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: text }}>
                  {formatCurrency(rec.amount)}
                </Text>
                <Text style={{ fontSize: 11, color: cfg.color, fontWeight: '600' }}>{cfg.label}</Text>
              </View>
            </View>
          </MotiView>
        )
      })}
    </ScrollView>
  )
}
