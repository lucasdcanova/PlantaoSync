import { useEffect, useMemo, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import * as Haptics from 'expo-haptics'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Bell,
  CalendarDays,
  CheckCircle,
  DollarSign,
  Filter,
  MapPin,
  Activity,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react-native'
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

function getWeekOfMonth(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  return Math.min(5, Math.max(1, Math.ceil(date.getDate() / 7)))
}

export default function AvailableShiftsScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ sector?: string }>()
  const isDark = useColorScheme() === 'dark'
  const user = useMobileAuthStore((state) => state.user)
  const sectors = useMobileDoctorDemoStore((state) => state.sectors)
  const availableShifts = useMobileDoctorDemoStore((state) => state.availableShifts)
  const myShifts = useMobileDoctorDemoStore((state) => state.myShifts)
  const swapRequests = useMobileDoctorDemoStore((state) => state.swapRequests)
  const claimShift = useMobileDoctorDemoStore((state) => state.claimShift)

  const [refreshing, setRefreshing] = useState(false)
  const [selectedSector, setSelectedSector] = useState(params.sector ?? 'all')
  const [insightMode, setInsightMode] = useState<'doctor' | 'manager'>('doctor')
  const [selectedRevenueIndex, setSelectedRevenueIndex] = useState(0)
  const [selectedDemandIndex, setSelectedDemandIndex] = useState(0)
  const [selectedLoadIndex, setSelectedLoadIndex] = useState(0)
  const [selectedSwapIndex, setSelectedSwapIndex] = useState(0)

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

  const now = new Date()
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const monthMyShifts = useMemo(
    () =>
      myShifts.filter((shift) => {
        const date = new Date(`${shift.date}T00:00:00`)
        return date >= monthStart && date < monthEnd
      }),
    [myShifts, monthEnd, monthStart],
  )

  const monthOpenShifts = useMemo(
    () =>
      availableShifts.filter((shift) => {
        const date = new Date(`${shift.date}T00:00:00`)
        return date >= monthStart && date < monthEnd
      }),
    [availableShifts, monthEnd, monthStart],
  )

  const monthProjection = monthMyShifts.reduce((sum, shift) => sum + shift.value, 0)
  const upsideProjection = monthOpenShifts
    .slice(0, 3)
    .reduce((sum, shift) => sum + shift.valuePerShift, 0)
  const emsProjection = monthProjection + upsideProjection
  const emsTarget = Math.max(emsProjection, 680000)
  const emsProgress = Math.min(100, Math.round((monthProjection / emsTarget) * 100))

  const weeklyRevenueData = useMemo(() => {
    const buckets = Array.from({ length: 5 }, (_, index) => ({
      id: `week-${index + 1}`,
      label: `S${index + 1}`,
      value: 0,
      shifts: 0,
    }))

    monthMyShifts.forEach((shift) => {
      const week = getWeekOfMonth(shift.date) - 1
      buckets[week].value += shift.value
      buckets[week].shifts += 1
    })

    return buckets
  }, [monthMyShifts])

  const loadDistributionData = useMemo(() => {
    const loadMap = monthMyShifts.reduce<Record<string, number>>((acc, shift) => {
      acc[shift.patientLoad] = (acc[shift.patientLoad] ?? 0) + 1
      return acc
    }, {})

    return [
      {
        id: 'baixa',
        label: 'Baixa',
        value: loadMap.Baixa ?? 0,
        color: '#22c55e',
        note: 'Fluxo estável',
      },
      {
        id: 'moderada',
        label: 'Moderada',
        value: loadMap.Moderada ?? 0,
        color: '#4ECDC4',
        note: 'Exige priorização',
      },
      {
        id: 'alta',
        label: 'Alta',
        value: loadMap.Alta ?? 0,
        color: '#f59e0b',
        note: 'Cobertura crítica',
      },
    ]
  }, [monthMyShifts])

  const sectorDemandData = useMemo(
    () =>
      sectors
        .map((sector) => {
          const opportunities = availableShifts.filter(
            (shift) => shift.sectorId === sector.id,
          ).length
          const pressure = Math.min(
            100,
            Math.round((sector.openShifts / Math.max(1, opportunities + 1)) * 72),
          )
          return {
            id: sector.id,
            name: sector.name,
            openShifts: sector.openShifts,
            opportunities,
            pressure,
            nextCriticalWindow: sector.nextCriticalWindow,
          }
        })
        .sort((a, b) => b.pressure - a.pressure),
    [availableShifts, sectors],
  )

  const swapStatusData = useMemo(() => {
    const statusMap = swapRequests.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1
      return acc
    }, {})

    return [
      { id: 'pendente', label: 'Pendentes', value: statusMap.PENDENTE ?? 0, color: '#f59e0b' },
      { id: 'aceita', label: 'Aceitas', value: statusMap.ACEITA ?? 0, color: '#22c55e' },
      { id: 'recusada', label: 'Recusadas', value: statusMap.RECUSADA ?? 0, color: '#ef4444' },
    ]
  }, [swapRequests])

  useEffect(() => {
    if (selectedRevenueIndex >= weeklyRevenueData.length) setSelectedRevenueIndex(0)
  }, [selectedRevenueIndex, weeklyRevenueData.length])

  useEffect(() => {
    if (selectedDemandIndex >= sectorDemandData.length) setSelectedDemandIndex(0)
  }, [selectedDemandIndex, sectorDemandData.length])

  useEffect(() => {
    if (selectedLoadIndex >= loadDistributionData.length) setSelectedLoadIndex(0)
  }, [loadDistributionData.length, selectedLoadIndex])

  useEffect(() => {
    if (selectedSwapIndex >= swapStatusData.length) setSelectedSwapIndex(0)
  }, [selectedSwapIndex, swapStatusData.length])

  const selectedRevenue = weeklyRevenueData[selectedRevenueIndex] ?? weeklyRevenueData[0]
  const selectedDemand = sectorDemandData[selectedDemandIndex] ?? sectorDemandData[0]
  const selectedLoad = loadDistributionData[selectedLoadIndex] ?? loadDistributionData[0]
  const selectedSwap = swapStatusData[selectedSwapIndex] ?? swapStatusData[0]

  const maxRevenueValue = Math.max(1, ...weeklyRevenueData.map((item) => item.value))
  const totalLoadEvents = loadDistributionData.reduce((sum, item) => sum + item.value, 0)
  const totalSwaps = swapStatusData.reduce((sum, item) => sum + item.value, 0)

  const bg = isDark ? '#09090f' : '#f8faff'
  const card = isDark ? '#111120' : '#ffffff'
  const border = isDark ? '#1e2035' : '#e2e8f0'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const softBrand = isDark ? '#16383B' : '#E8F8F7'

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRefreshing(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 108 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />
        }
      >
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 16 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
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

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 420 }}
          style={{ paddingHorizontal: 20, marginBottom: 14 }}
        >
          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isDark ? '#226E68' : '#BCEFEB',
              backgroundColor: softBrand,
              padding: 16,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -40,
                right: -25,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: isDark ? '#1F5A57' : '#C6F3EF',
                opacity: 0.4,
              }}
            />

            <Text
              style={{ fontSize: 11, color: muted, textTransform: 'uppercase', letterSpacing: 1.2 }}
            >
              Projeção EMS · {monthLabel}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 30, fontWeight: '800', color: text }}>
              {formatCurrency(emsProjection)}
            </Text>
            <Text style={{ marginTop: 2, fontSize: 12, color: muted }}>
              Confirmado até agora: {formatCurrency(monthProjection)}
            </Text>

            <View style={{ marginTop: 10 }}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
              >
                <Text style={{ fontSize: 11, color: muted }}>Execução da meta mensal</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: text }}>{emsProgress}%</Text>
              </View>
              <View
                style={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: isDark ? '#22303C' : '#CFEDEA',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${emsProgress}%`,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: BRAND,
                  }}
                />
              </View>
            </View>
          </View>
        </MotiView>

        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: border,
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 11, color: muted }}>Disponíveis agora</Text>
              <Text style={{ marginTop: 4, fontSize: 18, fontWeight: '800', color: text }}>
                {availableShifts.length} plantões
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: border,
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 11, color: muted }}>Setores com vaga</Text>
              <Text style={{ marginTop: 4, fontSize: 18, fontWeight: '800', color: text }}>
                {sectors.filter((sector) => sector.openShifts > 0).length}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View
            style={{
              backgroundColor: card,
              borderWidth: 1,
              borderColor: border,
              borderRadius: 16,
              padding: 5,
              flexDirection: 'row',
              gap: 6,
            }}
          >
            <Pressable
              onPress={async () => {
                setInsightMode('doctor')
                await Haptics.selectionAsync()
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                paddingVertical: 9,
                backgroundColor: insightMode === 'doctor' ? BRAND : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: insightMode === 'doctor' ? '#ffffff' : muted,
                }}
              >
                Visão médica
              </Text>
            </Pressable>

            <Pressable
              onPress={async () => {
                setInsightMode('manager')
                await Haptics.selectionAsync()
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                paddingVertical: 9,
                backgroundColor: insightMode === 'manager' ? BRAND : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: insightMode === 'manager' ? '#ffffff' : muted,
                }}
              >
                Visão gestão
              </Text>
            </Pressable>
          </View>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 120, type: 'timing', duration: 450 }}
          style={{ paddingHorizontal: 20, marginBottom: 12 }}
        >
          <View
            style={{
              backgroundColor: card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
            }}
          >
            {insightMode === 'doctor' ? (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: text }}>
                      Ganhos por semana
                    </Text>
                    <Text style={{ fontSize: 12, color: muted }}>
                      Toque na barra para detalhes da semana
                    </Text>
                  </View>
                  <TrendingUp size={18} color={BRAND} />
                </View>

                <View
                  style={{ marginTop: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}
                >
                  {weeklyRevenueData.map((point, index) => {
                    const active = index === selectedRevenueIndex
                    const height = 28 + Math.round((point.value / maxRevenueValue) * 96)
                    return (
                      <Pressable
                        key={point.id}
                        onPress={async () => {
                          setSelectedRevenueIndex(index)
                          await Haptics.selectionAsync()
                        }}
                        style={{ flex: 1, alignItems: 'center' }}
                      >
                        <View style={{ height: 126, justifyContent: 'flex-end' }}>
                          <MotiView
                            animate={{ opacity: active ? 1 : 0.55, scale: active ? 1 : 0.95 }}
                            transition={{ type: 'timing', duration: 250 }}
                            style={{
                              width: 22,
                              height,
                              borderRadius: 12,
                              backgroundColor: active ? BRAND : isDark ? '#334155' : '#cbd5e1',
                            }}
                          />
                        </View>
                        <Text style={{ marginTop: 6, fontSize: 11, color: active ? text : muted }}>
                          {point.label}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>

                <View
                  style={{
                    marginTop: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: bg,
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: muted,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Semana selecionada
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 20, fontWeight: '800', color: text }}>
                    {formatCurrency(selectedRevenue?.value ?? 0)}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: muted }}>
                    {selectedRevenue?.shifts ?? 0} plantão(ões) registrados em{' '}
                    {selectedRevenue?.label ?? 'S1'}.
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: text }}>
                      Pressão de cobertura
                    </Text>
                    <Text style={{ fontSize: 12, color: muted }}>
                      Toque no setor para acompanhar risco operacional
                    </Text>
                  </View>
                  <ShieldAlert size={18} color="#f59e0b" />
                </View>

                <View style={{ marginTop: 12, gap: 10 }}>
                  {sectorDemandData.map((sector, index) => {
                    const active = index === selectedDemandIndex
                    return (
                      <Pressable
                        key={sector.id}
                        onPress={async () => {
                          setSelectedDemandIndex(index)
                          await Haptics.selectionAsync()
                        }}
                        style={{
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: active ? '#F6D48E' : border,
                          backgroundColor: active ? (isDark ? '#2D2519' : '#FFF6E4') : bg,
                          padding: 10,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: text }}>
                            {sector.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '700',
                              color: active ? '#A16207' : muted,
                            }}
                          >
                            {sector.pressure}%
                          </Text>
                        </View>
                        <View
                          style={{
                            marginTop: 7,
                            height: 7,
                            borderRadius: 999,
                            backgroundColor: isDark ? '#293347' : '#E2E8F0',
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: `${sector.pressure}%`,
                              height: 7,
                              borderRadius: 999,
                              backgroundColor: active ? '#f59e0b' : BRAND,
                            }}
                          />
                        </View>
                        <Text style={{ marginTop: 7, fontSize: 11, color: muted }}>
                          {sector.openShifts} vaga(s) · janela crítica {sector.nextCriticalWindow}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>

                <View
                  style={{
                    marginTop: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: bg,
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: muted,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Setor em foco
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 16, fontWeight: '800', color: text }}>
                    {selectedDemand?.name ?? 'UTI Adulto'}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: muted }}>
                    {selectedDemand?.openShifts ?? 0} vaga(s) abertas e{' '}
                    {selectedDemand?.opportunities ?? 0} oportunidade(s) ativa(s).
                  </Text>
                </View>
              </>
            )}
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, type: 'timing', duration: 470 }}
          style={{ paddingHorizontal: 20, marginBottom: 14 }}
        >
          <View
            style={{
              backgroundColor: card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
            }}
          >
            {insightMode === 'doctor' ? (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: text }}>
                    Carga assistencial
                  </Text>
                  <Activity size={18} color={BRAND} />
                </View>

                <View style={{ marginTop: 12, gap: 9 }}>
                  {loadDistributionData.map((item, index) => {
                    const active = index === selectedLoadIndex
                    const share =
                      totalLoadEvents === 0 ? 0 : Math.round((item.value / totalLoadEvents) * 100)
                    return (
                      <Pressable
                        key={item.id}
                        onPress={async () => {
                          setSelectedLoadIndex(index)
                          await Haptics.selectionAsync()
                        }}
                        style={{
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: active ? '#9DE6E1' : border,
                          backgroundColor: active ? (isDark ? '#1A2F30' : '#ECFBF9') : bg,
                          padding: 10,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: text }}>
                            {item.label}
                          </Text>
                          <Text style={{ fontSize: 12, color: muted }}>
                            {item.value} registro(s) · {share}%
                          </Text>
                        </View>
                        <View
                          style={{
                            marginTop: 6,
                            height: 7,
                            borderRadius: 999,
                            backgroundColor: isDark ? '#293347' : '#E2E8F0',
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: `${share}%`,
                              height: 7,
                              borderRadius: 999,
                              backgroundColor: item.color,
                            }}
                          />
                        </View>
                      </Pressable>
                    )
                  })}
                </View>

                <View
                  style={{
                    marginTop: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: bg,
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: muted,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Leitura da equipe
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 15, fontWeight: '800', color: text }}>
                    Carga {selectedLoad?.label ?? 'Moderada'}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: muted }}>
                    {selectedLoad?.note}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: text }}>
                    Estado das trocas
                  </Text>
                  <Filter size={18} color={BRAND} />
                </View>

                <View style={{ marginTop: 12, gap: 9 }}>
                  {swapStatusData.map((item, index) => {
                    const active = index === selectedSwapIndex
                    const share = totalSwaps === 0 ? 0 : Math.round((item.value / totalSwaps) * 100)
                    return (
                      <Pressable
                        key={item.id}
                        onPress={async () => {
                          setSelectedSwapIndex(index)
                          await Haptics.selectionAsync()
                        }}
                        style={{
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: active ? '#9DE6E1' : border,
                          backgroundColor: active ? (isDark ? '#1A2F30' : '#ECFBF9') : bg,
                          padding: 10,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: text }}>
                            {item.label}
                          </Text>
                          <Text style={{ fontSize: 12, color: muted }}>
                            {item.value} · {share}%
                          </Text>
                        </View>
                        <View
                          style={{
                            marginTop: 6,
                            height: 7,
                            borderRadius: 999,
                            backgroundColor: isDark ? '#293347' : '#E2E8F0',
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: `${share}%`,
                              height: 7,
                              borderRadius: 999,
                              backgroundColor: item.color,
                            }}
                          />
                        </View>
                      </Pressable>
                    )
                  })}
                </View>

                <View
                  style={{
                    marginTop: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: bg,
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: muted,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Observação atual
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 15, fontWeight: '800', color: text }}>
                    {selectedSwap?.label ?? 'Pendentes'}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: muted }}>
                    {selectedSwap?.value ?? 0} solicitação(ões) nesse estado.
                  </Text>
                </View>
              </>
            )}
          </View>
        </MotiView>

        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: text, marginBottom: 10 }}>
            Filtrar por setor
          </Text>
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
                <Text
                  style={{
                    fontSize: 12,
                    color: selectedSector === 'all' ? '#1F9188' : muted,
                    fontWeight: '600',
                  }}
                >
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
                  <Text
                    style={{
                      fontSize: 12,
                      color: selectedSector === sector.id ? '#1F9188' : muted,
                      fontWeight: '600',
                    }}
                  >
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
              transition={{ delay: i * 60, type: 'spring', damping: 20 }}
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
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: text }}>
                      {shift.sectorName}
                    </Text>
                    <Text style={{ fontSize: 12, color: BRAND, marginTop: 2 }}>
                      {shift.specialty}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: '#E8F8F7',
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
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
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                    Assumir plantão
                  </Text>
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
