import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MotiView } from 'moti'
import * as Haptics from 'expo-haptics'
import { X, MapPin, Clock, DollarSign, CheckCircle, Calendar, Users } from 'lucide-react-native'
import { useState } from 'react'

const BRAND = '#6366f1'
const GREEN = '#22c55e'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export default function ShiftDetailModal() {
  const { id }   = useLocalSearchParams<{ id: string }>()
  const insets   = useSafeAreaInsets()
  const isDark   = useColorScheme() === 'dark'
  const qc       = useQueryClient()
  const [confirmed, setConfirmed] = useState(false)

  const bg   = isDark ? '#111120' : '#ffffff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'
  const dimBg = isDark ? '#1a1a2e' : '#f8faff'

  // Mock data
  const shift = {
    id,
    locationName: 'UTI Adulto',
    scheduleTitle: 'Escala UTI — Fevereiro 2026',
    date: '20 de fevereiro de 2026',
    startTime: '07:00',
    endTime: '19:00',
    specialty: 'Medicina Intensiva',
    valuePerShift: 120000,
    spotsLeft: 1,
    requiredCount: 2,
    confirmedCount: 1,
    notes: 'Trazer jaleco e crachá. Check-in na portaria principal.',
  }

  const confirmMutation = useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 1000))
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setConfirmed(true)
      qc.invalidateQueries({ queryKey: ['available-shifts'] })
      setTimeout(() => router.back(), 1800)
    },
  })

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Handle bar */}
      <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
        <View style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: border }} />
      </View>

      {/* Close button */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 8 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: dimBg, alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} color={muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120 }}>
        {/* Title */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', damping: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: text, letterSpacing: -0.5, marginBottom: 4 }}>
            Plantão Disponível
          </Text>
          <Text style={{ fontSize: 14, color: muted }}>{shift.scheduleTitle}</Text>
        </MotiView>

        {/* Info cards */}
        <View style={{ gap: 10, marginTop: 24 }}>
          {[
            { icon: Calendar, label: 'Data',     value: shift.date,                           color: BRAND },
            { icon: Clock,    label: 'Horário',  value: `${shift.startTime} – ${shift.endTime}`, color: BRAND },
            { icon: MapPin,   label: 'Local',    value: shift.locationName,                   color: BRAND },
            { icon: Users,    label: 'Vagas',    value: `${shift.spotsLeft} de ${shift.requiredCount} disponível`, color: shift.spotsLeft <= 1 ? '#f59e0b' : GREEN },
          ].map((item, i) => (
            <MotiView
              key={item.label}
              from={{ opacity: 0, translateX: -12 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: i * 60, type: 'spring', damping: 20 }}
            >
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 14,
                backgroundColor: dimBg, borderRadius: 14, padding: 14,
                borderWidth: 1, borderColor: border,
              }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${item.color}1a`, alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={18} color={item.color} />
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: muted }}>{item.label}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: text }}>{item.value}</Text>
                </View>
              </View>
            </MotiView>
          ))}
        </View>

        {/* Valor */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 280, type: 'spring', damping: 20 }}
          style={{ marginTop: 16 }}
        >
          <View style={{
            backgroundColor: '#f0fdf4', borderRadius: 16, padding: 18,
            borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '600', marginBottom: 4 }}>
              Remuneração do Plantão
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '800', color: '#15803d' }}>
              {formatCurrency(shift.valuePerShift)}
            </Text>
          </View>
        </MotiView>

        {/* Notes */}
        {shift.notes && (
          <View style={{ marginTop: 16, backgroundColor: dimBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: border }}>
            <Text style={{ fontSize: 12, color: muted, marginBottom: 4 }}>Observações</Text>
            <Text style={{ fontSize: 14, color: text }}>{shift.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* CTA fixed bottom */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20, paddingBottom: insets.bottom + 20,
        backgroundColor: bg, borderTopWidth: 1, borderTopColor: border,
      }}>
        {confirmed ? (
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ borderRadius: 16, backgroundColor: GREEN, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
          >
            <CheckCircle size={22} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Plantão Confirmado!</Text>
          </MotiView>
        ) : (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              confirmMutation.mutate()
            }}
            disabled={confirmMutation.isPending}
            style={({ pressed }) => ({
              borderRadius: 16,
              backgroundColor: pressed ? '#4f46e5' : BRAND,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              shadowColor: BRAND,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              opacity: confirmMutation.isPending ? 0.8 : 1,
            })}
          >
            <CheckCircle size={22} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
              {confirmMutation.isPending ? 'Confirmando...' : 'Confirmar Plantão'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
