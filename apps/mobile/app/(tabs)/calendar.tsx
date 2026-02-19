import { View, Text, ScrollView, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { Calendar as CalIcon } from 'lucide-react-native'

const BRAND = '#6366f1'

export default function CalendarScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const bg = isDark ? '#09090f' : '#f8faff'

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, alignItems: 'center', paddingBottom: 40 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          style={{ alignItems: 'center', marginTop: 40 }}
        >
          <View style={{
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: `${BRAND}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <CalIcon size={36} color={BRAND} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: text, textAlign: 'center' }}>
            Calendário de Plantões
          </Text>
          <Text style={{ fontSize: 14, color: muted, textAlign: 'center', marginTop: 8, maxWidth: 260 }}>
            Visualize sua agenda mensal de plantões confirmados
          </Text>
          <Text style={{ fontSize: 12, color: `${BRAND}99`, marginTop: 16, backgroundColor: `${BRAND}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 }}>
            📅 Calendário interativo em breve
          </Text>
        </MotiView>
      </View>
    </View>
  )
}
