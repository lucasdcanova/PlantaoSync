import { Pressable, ScrollView, Text, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { MotiView } from 'moti'
import * as Haptics from 'expo-haptics'
import { Calendar, CheckCircle, Clock, MapPin, Users, X } from 'lucide-react-native'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'

const BRAND = '#4ECDC4'
const GREEN = '#22c55e'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

export default function ShiftDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const availableShifts = useMobileDoctorDemoStore((state) => state.availableShifts)
  const claimShift = useMobileDoctorDemoStore((state) => state.claimShift)

  const shift = availableShifts.find((item) => item.id === id)

  const bg = isDark ? '#111120' : '#ffffff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'
  const dimBg = isDark ? '#1a1a2e' : '#f8faff'

  if (!shift) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, color: text, fontWeight: '700' }}>Plantão não encontrado</Text>
        <Text style={{ fontSize: 13, color: muted, marginTop: 6, textAlign: 'center' }}>
          Este plantão pode já ter sido assumido.
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 14 }}>
          <Text style={{ color: BRAND, fontWeight: '700' }}>Voltar</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
        <View style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: border }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 8 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: dimBg, alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} color={muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120 }}>
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', damping: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: text }}>Plantão disponível</Text>
          <Text style={{ fontSize: 14, color: muted, marginTop: 3 }}>{shift.sectorName}</Text>
        </MotiView>

        <View style={{ gap: 10, marginTop: 20 }}>
          {[
            { icon: Calendar, label: 'Data', value: formatDate(shift.date), color: BRAND },
            { icon: Clock, label: 'Horário', value: `${shift.startTime} - ${shift.endTime}`, color: BRAND },
            { icon: MapPin, label: 'Setor', value: shift.sectorName, color: BRAND },
            {
              icon: Users,
              label: 'Vagas',
              value: `${shift.spotsLeft} disponível`,
              color: shift.spotsLeft <= 1 ? '#f59e0b' : GREEN,
            },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: dimBg,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${item.color}1a`, alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={18} color={item.color} />
              </View>
              <View>
                <Text style={{ fontSize: 11, color: muted }}>{item.label}</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: text }}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: 14,
            backgroundColor: '#f0fdf4',
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: '#bbf7d0',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '600', marginBottom: 4 }}>
            Valor do plantão
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#15803d' }}>{formatCurrency(shift.valuePerShift)}</Text>
        </View>

        {shift.notes ? (
          <View style={{ marginTop: 14, backgroundColor: dimBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: border }}>
            <Text style={{ fontSize: 12, color: muted, marginBottom: 4 }}>Observações</Text>
            <Text style={{ fontSize: 14, color: text }}>{shift.notes}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          paddingBottom: insets.bottom + 20,
          borderTopWidth: 1,
          borderTopColor: border,
          backgroundColor: bg,
        }}
      >
        <Pressable
          onPress={async () => {
            claimShift(shift.id)
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            router.back()
          }}
          style={({ pressed }) => ({
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            backgroundColor: pressed ? '#2BB5AB' : BRAND,
          })}
        >
          <CheckCircle size={22} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Confirmar plantão</Text>
        </Pressable>
      </View>
    </View>
  )
}
