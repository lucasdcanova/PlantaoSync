import { useEffect, useMemo, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import * as Haptics from 'expo-haptics'
import { router, useLocalSearchParams } from 'expo-router'
import { Bell, CalendarDays, CheckCircle, DollarSign, Filter, MapPin } from 'lucide-react-native'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'
import { useMobileAuthStore } from '../../store/auth-store'

const BRAND = '#4ECDC4'
const GREEN = '#22c55e'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function AvailableShiftsScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ sector?: string }>()
  const isDark = useColorScheme() === 'dark'
  const user = useMobileAuthStore((state) => state.user)
  const sectors = useMobileDoctorDemoStore((state) => state.sectors)
  const availableShifts = useMobileDoctorDemoStore((state) => state.availableShifts)
  const claimShift = useMobileDoctorDemoStore((state) => state.claimShift)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSector, setSelectedSector] = useState(params.sector ?? 'all')

  useEffect(() => {
    if (params.sector) {
      setSelectedSector(params.sector)
    }
  }, [params.sector])

  const filteredShifts = useMemo(
    () =>
      availableShifts.filter((shift) =>
        selectedSector === 'all' ? true : shift.sectorId === selectedSector,
      ),
    [availableShifts, selectedSector],
  )

  const bg = isDark ? '#09090f' : '#f8faff'
  const card = isDark ? '#111120' : '#ffffff'
  const border = isDark ? '#1e2035' : '#e2e8f0'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRefreshing(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />}
      >
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 13, color: muted }}>Bem-vinda,</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: text }}>
                {user?.name ?? 'Médica Demo'}
              </Text>
            </View>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: border,
                backgroundColor: card,
              }}
            >
              <Bell size={18} color={muted} />
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: card, borderRadius: 14, borderWidth: 1, borderColor: border, padding: 14 }}>
              <Text style={{ fontSize: 11, color: muted }}>Disponíveis agora</Text>
              <Text style={{ marginTop: 4, fontSize: 18, fontWeight: '800', color: text }}>
                {availableShifts.length} plantões
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: card, borderRadius: 14, borderWidth: 1, borderColor: border, padding: 14 }}>
              <Text style={{ fontSize: 11, color: muted }}>Setores com vaga</Text>
              <Text style={{ marginTop: 4, fontSize: 18, fontWeight: '800', color: text }}>
                {sectors.filter((sector) => sector.openShifts > 0).length}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: text, marginBottom: 10 }}>Filtrar por setor</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => setSelectedSector('all')}
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: selectedSector === 'all' ? '#9DE6E1' : border,
                  backgroundColor: selectedSector === 'all' ? '#E8F8F7' : card,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ fontSize: 12, color: selectedSector === 'all' ? '#1F9188' : muted, fontWeight: '600' }}>
                  Todos
                </Text>
              </Pressable>
              {sectors.map((sector) => (
                <Pressable
                  key={sector.id}
                  onPress={() => setSelectedSector(sector.id)}
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selectedSector === sector.id ? '#9DE6E1' : border,
                    backgroundColor: selectedSector === sector.id ? '#E8F8F7' : card,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontSize: 12, color: selectedSector === sector.id ? '#1F9188' : muted, fontWeight: '600' }}>
                    {sector.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: text, marginBottom: 12 }}>
            Plantões disponíveis
          </Text>

          {filteredShifts.map((shift, i) => (
            <MotiView
              key={shift.id}
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 70, type: 'spring', damping: 20 }}
              style={{ marginBottom: 12 }}
            >
              <Pressable
                onPress={() => router.push(`/shift/${shift.id}`)}
                style={({ pressed }) => ({
                  backgroundColor: card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: border,
                  padding: 16,
                  opacity: pressed ? 0.95 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: text }}>{shift.sectorName}</Text>
                    <Text style={{ fontSize: 12, color: BRAND, marginTop: 2 }}>{shift.specialty}</Text>
                  </View>
                  <View style={{ backgroundColor: '#E8F8F7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 11, color: '#1F9188', fontWeight: '700' }}>
                      {shift.spotsLeft} vaga{shift.spotsLeft > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CalendarDays size={13} color={muted} />
                    <Text style={{ fontSize: 12, color: muted }}>
                      {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} color={muted} />
                    <Text style={{ fontSize: 12, color: muted }}>{shift.issuedBy}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <DollarSign size={13} color={GREEN} />
                    <Text style={{ fontSize: 12, color: GREEN, fontWeight: '700' }}>
                      {formatCurrency(shift.valuePerShift)}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={async (event) => {
                    event.stopPropagation()
                    claimShift(shift.id)
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                  }}
                  style={({ pressed }) => ({
                    marginTop: 12,
                    borderRadius: 12,
                    paddingVertical: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 6,
                    backgroundColor: pressed ? '#2BB5AB' : BRAND,
                  })}
                >
                  <CheckCircle size={15} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Assumir plantão</Text>
                </Pressable>
              </Pressable>
            </MotiView>
          ))}

          {filteredShifts.length === 0 && (
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: border,
                borderStyle: 'dashed',
                backgroundColor: card,
                padding: 20,
                alignItems: 'center',
              }}
            >
              <Filter size={18} color={muted} />
              <Text style={{ fontSize: 13, color: muted, marginTop: 8, textAlign: 'center' }}>
                Nenhum plantão disponível para o setor selecionado.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
