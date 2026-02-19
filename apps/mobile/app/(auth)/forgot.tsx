import { View, Text, Pressable, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link } from 'expo-router'

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'

  const bg = isDark ? '#09090f' : '#f8faff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const brand = '#4ECDC4'

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top + 32, paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: text }}>Recuperar acesso</Text>
      <Text style={{ marginTop: 8, fontSize: 14, color: muted }}>
        No ambiente demo, utilize as credenciais fornecidas pelo gestor para entrar no hospital.
      </Text>

      <Link href="/(auth)/login" asChild>
        <Pressable style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 14, color: brand, fontWeight: '700' }}>Voltar ao login</Text>
        </Pressable>
      </Link>
    </View>
  )
}
