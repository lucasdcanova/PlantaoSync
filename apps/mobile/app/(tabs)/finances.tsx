import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import * as Haptics from 'expo-haptics'
import { ArrowLeftRight } from 'lucide-react-native'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'

const BRAND = '#4ECDC4'
const GREEN = '#22c55e'
const AMBER = '#f59e0b'
const RED = '#ef4444'

const statusColor = {
  PENDENTE: AMBER,
  ACEITA: GREEN,
  RECUSADA: RED,
} as const

export default function SwapRequestsScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const myShifts = useMobileDoctorDemoStore((state) => state.myShifts)
  const swapRequests = useMobileDoctorDemoStore((state) => state.swapRequests)
  const requestSwap = useMobileDoctorDemoStore((state) => state.requestSwap)
  const respondSwapRequest = useMobileDoctorDemoStore((state) => state.respondSwapRequest)

  const eligibleShifts = useMemo(
    () => myShifts.filter((shift) => shift.status === 'CONFIRMADO' || shift.status === 'TROCA_SOLICITADA'),
    [myShifts],
  )

  const [shiftId, setShiftId] = useState(eligibleShifts[0]?.id ?? '')
  const [counterpartName, setCounterpartName] = useState('')
  const [reason, setReason] = useState('')

  const incoming = useMemo(() => swapRequests.filter((swap) => swap.direction === 'entrada'), [swapRequests])
  const outgoing = useMemo(() => swapRequests.filter((swap) => swap.direction === 'saida'), [swapRequests])

  useEffect(() => {
    if (eligibleShifts.length === 0) {
      setShiftId('')
      return
    }

    const hasSelectedShift = eligibleShifts.some((shift) => shift.id === shiftId)
    if (!hasSelectedShift) {
      setShiftId(eligibleShifts[0].id)
    }
  }, [eligibleShifts, shiftId])

  const bg = isDark ? '#09090f' : '#f8faff'
  const card = isDark ? '#111120' : '#ffffff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'

  const submitSwapRequest = async () => {
    if (!shiftId || !counterpartName.trim() || !reason.trim()) return
    if (!eligibleShifts.some((shift) => shift.id === shiftId)) return
    requestSwap({
      shiftId,
      counterpartName: counterpartName.trim(),
      reason: reason.trim(),
    })
    setCounterpartName('')
    setReason('')
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 + insets.bottom, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 22, fontWeight: '800', color: text, marginBottom: 8 }}>Trocas de plantão</Text>
      <Text style={{ fontSize: 13, color: muted, marginBottom: 14 }}>
        Solicite troca com colegas e aprove ou recuse solicitações recebidas.
      </Text>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{ backgroundColor: card, borderRadius: 16, borderWidth: 1, borderColor: border, padding: 14, marginBottom: 14 }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: text, marginBottom: 8 }}>Nova solicitação</Text>

        <Text style={{ fontSize: 12, color: muted, marginBottom: 4 }}>Plantão</Text>
        <View style={{ borderWidth: 1, borderColor: border, borderRadius: 10, marginBottom: 8 }}>
          {eligibleShifts.length === 0 && (
            <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
              <Text style={{ fontSize: 12, color: muted }}>Nenhum plantão elegível para troca.</Text>
            </View>
          )}
          {eligibleShifts.map((shift) => (
            <Pressable
              key={shift.id}
              onPress={() => setShiftId(shift.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: shiftId === shift.id ? '#E8F8F7' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 12, color: shiftId === shift.id ? '#1F9188' : text }}>
                {shift.sectorName} · {shift.date} · {shift.startTime}-{shift.endTime}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={counterpartName}
          onChangeText={setCounterpartName}
          placeholder="Colega para troca"
          placeholderTextColor={muted}
          style={{
            borderWidth: 1,
            borderColor: border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: text,
            marginBottom: 8,
          }}
        />
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Motivo da troca"
          placeholderTextColor={muted}
          style={{
            borderWidth: 1,
            borderColor: border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: text,
            marginBottom: 10,
          }}
        />

        <Pressable
          onPress={submitSwapRequest}
          disabled={eligibleShifts.length === 0}
          style={({ pressed }) => ({
            borderRadius: 12,
            backgroundColor: pressed ? '#2BB5AB' : BRAND,
            paddingVertical: 10,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
            opacity: eligibleShifts.length === 0 ? 0.6 : 1,
          })}
        >
          <ArrowLeftRight size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Solicitar troca</Text>
        </Pressable>
      </MotiView>

      <Text style={{ fontSize: 14, fontWeight: '700', color: text, marginBottom: 8 }}>Solicitações recebidas</Text>
      {incoming.map((request, index) => (
        <MotiView
          key={request.id}
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: index * 60, type: 'spring', damping: 20 }}
          style={{ marginBottom: 10 }}
        >
          <View style={{ backgroundColor: card, borderRadius: 14, borderWidth: 1, borderColor: border, padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: text, fontWeight: '700', fontSize: 14 }}>{request.sectorName}</Text>
              <Text style={{ color: statusColor[request.status], fontSize: 11, fontWeight: '700' }}>{request.status}</Text>
            </View>
            <Text style={{ color: muted, fontSize: 12 }}>{request.shiftDate} · {request.shiftTime}</Text>
            <Text style={{ color: muted, fontSize: 12, marginTop: 4 }}>{request.counterpartName}</Text>
            <Text style={{ color: text, fontSize: 12, marginTop: 6 }}>{request.reason}</Text>

            {request.status === 'PENDENTE' && (
              <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={async () => {
                    respondSwapRequest(request.id, 'ACEITA')
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                  }}
                  style={{ flex: 1, borderRadius: 10, backgroundColor: GREEN, paddingVertical: 9, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Aceitar</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    respondSwapRequest(request.id, 'RECUSADA')
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
                  }}
                  style={{ flex: 1, borderRadius: 10, backgroundColor: '#fee2e2', paddingVertical: 9, alignItems: 'center' }}
                >
                  <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700' }}>Recusar</Text>
                </Pressable>
              </View>
            )}
          </View>
        </MotiView>
      ))}

      <Text style={{ fontSize: 14, fontWeight: '700', color: text, marginBottom: 8, marginTop: 10 }}>Solicitações enviadas</Text>
      {outgoing.map((request, index) => (
        <MotiView
          key={request.id}
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: index * 60, type: 'spring', damping: 20 }}
          style={{ marginBottom: 10 }}
        >
          <View style={{ backgroundColor: card, borderRadius: 14, borderWidth: 1, borderColor: border, padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: text, fontWeight: '700', fontSize: 14 }}>{request.sectorName}</Text>
              <Text style={{ color: statusColor[request.status], fontSize: 11, fontWeight: '700' }}>{request.status}</Text>
            </View>
            <Text style={{ color: muted, fontSize: 12 }}>{request.shiftDate} · {request.shiftTime}</Text>
            <Text style={{ color: muted, fontSize: 12, marginTop: 4 }}>Para: {request.counterpartName}</Text>
          </View>
        </MotiView>
      ))}
    </ScrollView>
  )
}
