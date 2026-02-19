import { View, Text, ScrollView, RefreshControl, Pressable, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { MotiView } from 'moti'
import { Bell, MapPin, Clock, DollarSign, ChevronRight, CheckCircle } from 'lucide-react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useState } from 'react'

const BRAND = '#6366f1'
const GREEN = '#22c55e'

interface AvailableShift {
  id: string
  scheduleTitle: string
  locationName: string
  date: string
  startTime: string
  endTime: string
  specialty?: string
  valuePerShift: number
  spotsLeft: number
}

function useAvailableShifts() {
  return useQuery<AvailableShift[]>({
    queryKey: ['available-shifts'],
    queryFn: async () => [
      {
        id: '1',
        scheduleTitle: 'Escala UTI — Fevereiro',
        locationName: 'UTI Adulto',
        date: '2026-02-20',
        startTime: '07:00',
        endTime: '19:00',
        specialty: 'Medicina Intensiva',
        valuePerShift: 120000,
        spotsLeft: 1,
      },
      {
        id: '2',
        scheduleTitle: 'Escala UTI — Fevereiro',
        locationName: 'Pronto-Socorro',
        date: '2026-02-21',
        startTime: '19:00',
        endTime: '07:00',
        specialty: 'Medicina de Emergência',
        valuePerShift: 150000,
        spotsLeft: 2,
      },
    ],
  })
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [refreshing, setRefreshing] = useState(false)
  const { data: shifts, refetch } = useAvailableShifts()

  const bg      = isDark ? '#09090f' : '#f8faff'
  const card    = isDark ? '#111120' : '#ffffff'
  const border  = isDark ? '#1e2035' : '#e2e8f0'
  const text    = isDark ? '#f0f4ff' : '#0f172a'
  const muted   = isDark ? '#a0aec0' : '#64748b'

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 13, color: muted }}>Bom dia,</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: text, letterSpacing: -0.5 }}>
                Dra. Ana Costa 👋
              </Text>
            </View>
            <Pressable
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: card, borderWidth: 1, borderColor: border,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Bell size={18} color={muted} />
              <View style={{
                position: 'absolute', top: 8, right: 8,
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: BRAND, borderWidth: 1.5, borderColor: card,
              }} />
            </Pressable>
          </View>
        </View>

        {/* Quick stats */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 }}>
          {[
            { label: 'Este mês', value: 'R$ 4.800', color: GREEN },
            { label: 'Confirmados', value: '4 plantões', color: BRAND },
          ].map((stat, i) => (
            <MotiView
              key={stat.label}
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 80, type: 'spring', damping: 20 }}
              style={{ flex: 1 }}
            >
              <View style={{
                backgroundColor: card, borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: border,
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 8,
              }}>
                <Text style={{ fontSize: 11, color: muted, marginBottom: 4 }}>{stat.label}</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: stat.color }}>{stat.value}</Text>
              </View>
            </MotiView>
          ))}
        </View>

        {/* Available shifts */}
        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: text, marginBottom: 12 }}>
            Plantões Disponíveis
          </Text>

          {shifts?.map((shift, i) => (
            <MotiView
              key={shift.id}
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 100 + 100, type: 'spring', damping: 20 }}
              style={{ marginBottom: 12 }}
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  router.push(`/shift/${shift.id}`)
                }}
                style={({ pressed }) => ({
                  backgroundColor: card,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: border,
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isDark ? 0.25 : 0.06,
                  shadowRadius: 12,
                })}
              >
                {/* Header row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: text }} numberOfLines={1}>
                      {formatDate(shift.date)} · {shift.startTime}–{shift.endTime}
                    </Text>
                    {shift.specialty && (
                      <Text style={{ fontSize: 12, color: BRAND, marginTop: 2 }}>{shift.specialty}</Text>
                    )}
                  </View>
                  <View style={{
                    backgroundColor: shift.spotsLeft <= 1 ? '#fef3c7' : '#f0fdf4',
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
                  }}>
                    <Text style={{
                      fontSize: 11, fontWeight: '600',
                      color: shift.spotsLeft <= 1 ? '#d97706' : '#16a34a',
                    }}>
                      {shift.spotsLeft} vaga{shift.spotsLeft !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                {/* Info row */}
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color={muted} />
                    <Text style={{ fontSize: 12, color: muted }}>{shift.locationName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <DollarSign size={13} color={GREEN} />
                    <Text style={{ fontSize: 12, color: GREEN, fontWeight: '600' }}>
                      {formatCurrency(shift.valuePerShift)}
                    </Text>
                  </View>
                </View>

                {/* Confirm button */}
                <Pressable
                  onPress={async (e) => {
                    e.stopPropagation()
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                    // Confirmar plantão
                  }}
                  style={({ pressed }) => ({
                    marginTop: 14,
                    backgroundColor: pressed ? '#4f46e5' : BRAND,
                    borderRadius: 12,
                    paddingVertical: 11,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 6,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <CheckCircle size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                    Confirmar Plantão
                  </Text>
                </Pressable>
              </Pressable>
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
