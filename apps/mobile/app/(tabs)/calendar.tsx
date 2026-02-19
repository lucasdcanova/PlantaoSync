import { ScrollView, Text, View, Pressable, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { Building2, ChevronRight } from 'lucide-react-native'
import { router } from 'expo-router'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'

const BRAND = '#4ECDC4'

export default function SectorsScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const sectors = useMobileDoctorDemoStore((state) => state.sectors)

  const bg = isDark ? '#09090f' : '#f8faff'
  const card = isDark ? '#111120' : '#ffffff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 + insets.bottom, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 22, fontWeight: '800', color: text, marginBottom: 8 }}>Setores do hospital</Text>
      <Text style={{ fontSize: 13, color: muted, marginBottom: 14 }}>
        Veja onde há cobertura aberta e vá direto para os plantões disponíveis.
      </Text>

      {sectors.map((sector, index) => (
        <MotiView
          key={sector.id}
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: index * 70, type: 'spring', damping: 20 }}
          style={{ marginBottom: 12 }}
        >
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(tabs)/index',
                params: { sector: sector.id },
              })
            }
            style={({ pressed }) => ({
              borderRadius: 16,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: card,
              padding: 16,
              opacity: pressed ? 0.95 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${BRAND}18`, alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={16} color={BRAND} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: text }}>{sector.name}</Text>
                    <Text style={{ fontSize: 12, color: muted }}>{sector.floor}</Text>
                  </View>
                </View>
                <Text style={{ marginTop: 10, fontSize: 12, color: muted }}>
                  Janela crítica: {sector.nextCriticalWindow}
                </Text>
                <Text style={{ marginTop: 6, fontSize: 12, color: '#1F9188', fontWeight: '700' }}>
                  {sector.openShifts} plantão(ões) aberto(s)
                </Text>
              </View>
              <ChevronRight size={18} color={muted} />
            </View>
          </Pressable>
        </MotiView>
      ))}
    </ScrollView>
  )
}
