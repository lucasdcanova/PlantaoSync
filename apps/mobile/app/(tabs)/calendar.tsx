import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { router } from 'expo-router'
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Sparkles } from 'lucide-react-native'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'

const BRAND = '#4ECDC4'
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function MonthlyOpenShiftsScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const sectors = useMobileDoctorDemoStore((state) => state.sectors)
  const availableShifts = useMobileDoctorDemoStore((state) => state.availableShifts)

  const firstShiftDate = useMemo(() => {
    if (availableShifts.length === 0) return new Date()

    const ordered = [...availableShifts].sort((a, b) => a.date.localeCompare(b.date))
    return new Date(`${ordered[0].date}T00:00:00`)
  }, [availableShifts])

  const [currentDate, setCurrentDate] = useState(
    new Date(firstShiftDate.getFullYear(), firstShiftDate.getMonth(), 1),
  )
  const [selectedSector, setSelectedSector] = useState('all')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const filteredMonthShifts = useMemo(
    () =>
      availableShifts.filter((shift) => {
        const date = new Date(`${shift.date}T00:00:00`)
        const sameMonth = date.getFullYear() === year && date.getMonth() === month
        const matchesSector = selectedSector === 'all' || shift.sectorId === selectedSector
        return sameMonth && matchesSector
      }),
    [availableShifts, month, selectedSector, year],
  )

  const shiftsByDay = useMemo(() => {
    const map = new Map<number, typeof filteredMonthShifts>()

    filteredMonthShifts.forEach((shift) => {
      const day = Number(shift.date.slice(-2))
      const entries = map.get(day) ?? []
      map.set(day, [...entries, shift])
    })

    return map
  }, [filteredMonthShifts])

  const selectedDayShifts = selectedDay ? (shiftsByDay.get(selectedDay) ?? []) : []

  const calendarCells: Array<number | null> = []
  for (let index = 0; index < firstDay; index += 1) calendarCells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) calendarCells.push(day)

  const bg = isDark ? '#09090f' : '#f8faff'
  const card = isDark ? '#111120' : '#ffffff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'

  const prevMonth = () => {
    setCurrentDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
    setSelectedDay(null)
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 100 + insets.bottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 22, fontWeight: '800', color: text }}>Calendário em aberto</Text>
      <Text style={{ fontSize: 13, color: muted, marginTop: 4 }}>
        Visualize o mês inteiro com plantões abertos e filtre por setor.
      </Text>

      <View
        style={{
          marginTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={prevMonth}
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            backgroundColor: card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={16} color={text} />
        </Pressable>

        <Text style={{ fontSize: 16, fontWeight: '700', color: text }}>
          {MONTHS[month]} {year}
        </Text>

        <Pressable
          onPress={nextMonth}
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            backgroundColor: card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={16} color={text} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => {
              setSelectedSector('all')
              setSelectedDay(null)
            }}
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
                fontWeight: '700',
              }}
            >
              Todos os setores
            </Text>
          </Pressable>

          {sectors.map((sector) => (
            <Pressable
              key={sector.id}
              onPress={() => {
                setSelectedSector(sector.id)
                setSelectedDay(null)
              }}
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
                  fontWeight: '700',
                }}
              >
                {sector.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 320 }}
        style={{
          marginTop: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: border,
          backgroundColor: card,
        }}
      >
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: border }}>
          {WEEKDAYS.map((weekday) => (
            <View key={weekday} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: muted,
                  textTransform: 'uppercase',
                }}
              >
                {weekday}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {calendarCells.map((day, index) => {
            if (day === null) {
              return (
                <View
                  key={`empty-${index}`}
                  style={{
                    width: '14.2857%',
                    aspectRatio: 1,
                    borderRightWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: border,
                    backgroundColor: isDark ? '#0f1020' : '#f8fafc',
                  }}
                />
              )
            }

            const openCount =
              shiftsByDay.get(day)?.reduce((sum, shift) => sum + shift.spotsLeft, 0) ?? 0
            const hasOpen = openCount > 0
            const isSelected = selectedDay === day

            return (
              <Pressable
                key={`${year}-${month}-${day}`}
                onPress={() => setSelectedDay((current) => (current === day ? null : day))}
                style={{
                  width: '14.2857%',
                  aspectRatio: 1,
                  borderRightWidth: 1,
                  borderBottomWidth: 1,
                  borderColor: border,
                  paddingHorizontal: 4,
                  paddingTop: 4,
                  backgroundColor: isSelected ? '#E8F8F7' : 'transparent',
                }}
              >
                <Text style={{ fontSize: 11, color: text, fontWeight: '600' }}>{day}</Text>
                {hasOpen && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      right: 4,
                      borderRadius: 999,
                      backgroundColor: BRAND,
                      paddingVertical: 2,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>
                      {openCount} aberto(s)
                    </Text>
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </MotiView>

      <View
        style={{
          marginTop: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: border,
          backgroundColor: card,
          padding: 14,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: text }}>
            {selectedDay ? `Dia ${selectedDay}` : 'Selecione um dia no calendário'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Sparkles size={14} color={BRAND} />
            <Text style={{ fontSize: 11, color: muted }}>{selectedDayShifts.length} turno(s)</Text>
          </View>
        </View>

        {selectedDay ? (
          selectedDayShifts.length > 0 ? (
            <View style={{ marginTop: 10, gap: 8 }}>
              {selectedDayShifts.map((shift) => (
                <Pressable
                  key={shift.id}
                  onPress={() => router.push(`/shift/${shift.id}`)}
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: isDark ? '#0f1020' : '#f8fafc',
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: text }}>
                      {shift.sectorName}
                    </Text>
                    <View
                      style={{
                        borderRadius: 999,
                        backgroundColor: '#E8F8F7',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: '#1F9188', fontWeight: '700' }}>
                        {shift.spotsLeft} vaga(s)
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginTop: 6, gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Clock size={12} color={muted} />
                      <Text style={{ fontSize: 11, color: muted }}>
                        {shift.startTime} - {shift.endTime}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Calendar size={12} color={muted} />
                      <Text style={{ fontSize: 11, color: muted }}>{formatDate(shift.date)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <MapPin size={12} color={muted} />
                      <Text style={{ fontSize: 11, color: muted }}>{shift.issuedBy}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View
              style={{
                marginTop: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: border,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 12, color: muted }}>
                Não há plantões em aberto para esse dia com o filtro atual.
              </Text>
            </View>
          )
        ) : (
          <View
            style={{
              marginTop: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: border,
              padding: 12,
            }}
          >
            <Text style={{ fontSize: 12, color: muted }}>
              Toque em um dia para ver os plantões abertos e entrar no detalhe.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
