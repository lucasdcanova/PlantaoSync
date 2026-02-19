import { View, Text, ScrollView, Pressable, Switch, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { User, CreditCard, Bell, Shield, LogOut, ChevronRight, Award } from 'lucide-react-native'
import { useState } from 'react'

const BRAND = '#6366f1'

const menuItems = [
  { icon: User,       label: 'Dados Pessoais',    sub: 'CRM, especialidade, contato' },
  { icon: Bell,       label: 'Notificações',      sub: 'Push, e-mail, preferências' },
  { icon: Shield,     label: 'Segurança',         sub: 'Senha, biometria, 2FA' },
  { icon: CreditCard, label: 'Histórico Financeiro', sub: 'Pagamentos e remunerações' },
]

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'

  const bg     = isDark ? '#09090f' : '#f8faff'
  const card   = isDark ? '#111120' : '#ffffff'
  const text   = isDark ? '#f0f4ff' : '#0f172a'
  const muted  = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + name */}
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{ alignItems: 'center', paddingHorizontal: 20, marginBottom: 28 }}
      >
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: `${BRAND}22`, alignItems: 'center', justifyContent: 'center',
          marginBottom: 14, borderWidth: 3, borderColor: BRAND,
        }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: BRAND }}>AC</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: text }}>Dra. Ana Costa</Text>
        <Text style={{ fontSize: 13, color: muted, marginTop: 2 }}>Medicina de Emergência</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: `${BRAND}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
          <Award size={12} color={BRAND} />
          <Text style={{ fontSize: 12, color: BRAND, fontWeight: '600' }}>CRM/SP 123456</Text>
        </View>
      </MotiView>

      {/* Stats row */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 80, type: 'spring', damping: 20 }}
        style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 24 }}
      >
        {[
          { label: 'Plantões', value: '42' },
          { label: 'Horas', value: '504h' },
          { label: 'Avaliação', value: '4.9 ★' },
        ].map((s) => (
          <View key={s.label} style={{ flex: 1, backgroundColor: card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: border }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: text }}>{s.value}</Text>
            <Text style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </MotiView>

      {/* Menu */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 120, type: 'spring', damping: 20 }}
        style={{ marginHorizontal: 20, backgroundColor: card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: border }}
      >
        {menuItems.map((item, i) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
              borderTopWidth: i > 0 ? 1 : 0, borderTopColor: border,
              backgroundColor: pressed ? (isDark ? '#1a1a2e' : '#f8faff') : 'transparent',
            })}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${BRAND}15`, alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={18} color={BRAND} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: text }}>{item.label}</Text>
              <Text style={{ fontSize: 12, color: muted }}>{item.sub}</Text>
            </View>
            <ChevronRight size={16} color={muted} />
          </Pressable>
        ))}
      </MotiView>

      {/* Logout */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 200 }}
        style={{ marginHorizontal: 20, marginTop: 16 }}
      >
        <Pressable
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: '#fef2f2', borderRadius: 14, padding: 14,
            borderWidth: 1, borderColor: '#fecaca',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <LogOut size={18} color="#dc2626" />
          <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: 14 }}>Sair da conta</Text>
        </Pressable>
      </MotiView>
    </ScrollView>
  )
}
