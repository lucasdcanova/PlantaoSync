import { Pressable, ScrollView, Text, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { Link, router } from 'expo-router'
import { Building2, LogOut, UserRoundPlus } from 'lucide-react-native'
import { useMobileAuthStore } from '../../store/auth-store'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'

const BRAND = '#4ECDC4'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const user = useMobileAuthStore((state) => state.user)
  const logout = useMobileAuthStore((state) => state.logout)
  const inviteCodes = useMobileDoctorDemoStore((state) => state.inviteCodes)

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
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{ alignItems: 'center', marginBottom: 24 }}
      >
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: `${BRAND}22`,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: BRAND,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '800', color: BRAND }}>
            {user?.name
              ?.split(' ')
              .slice(0, 2)
              .map((part) => part[0])
              .join('')
              .toUpperCase() ?? 'MD'}
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: text }}>{user?.name ?? 'Médica Demo'}</Text>
        <Text style={{ fontSize: 13, color: muted, marginTop: 2 }}>{user?.specialty}</Text>
        <Text style={{ fontSize: 12, color: BRAND, marginTop: 6, fontWeight: '700' }}>{user?.crm}</Text>
      </MotiView>

      <View style={{ backgroundColor: card, borderRadius: 16, borderWidth: 1, borderColor: border, padding: 14, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Building2 size={16} color={BRAND} />
          <Text style={{ fontSize: 14, color: text, fontWeight: '700' }}>Hospital vinculado</Text>
        </View>
        <Text style={{ fontSize: 13, color: muted }}>{user?.organizationName ?? 'Hospital São Gabriel'}</Text>
      </View>

      <View style={{ backgroundColor: card, borderRadius: 16, borderWidth: 1, borderColor: border, padding: 14, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <UserRoundPlus size={16} color={BRAND} />
          <Text style={{ fontSize: 14, color: text, fontWeight: '700' }}>Convites ativos (demo)</Text>
        </View>
        {inviteCodes.map((invite) => (
          <Text key={invite.id} style={{ fontSize: 12, color: muted, marginBottom: 4 }}>
            {invite.code} · {invite.sectorName} · {invite.status}
          </Text>
        ))}

        <Link href="/(auth)/register" asChild>
          <Pressable style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 13, color: BRAND, fontWeight: '700' }}>
              Abrir cadastro por convite
            </Text>
          </Pressable>
        </Link>
      </View>

      <Pressable
        onPress={() => {
          logout()
          router.replace('/(auth)/login')
        }}
        style={({ pressed }) => ({
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#fecaca',
          backgroundColor: '#fef2f2',
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <LogOut size={17} color="#dc2626" />
        <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: 14 }}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  )
}
