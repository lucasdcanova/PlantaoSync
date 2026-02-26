import { Pressable, ScrollView, Text, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Bell, ChevronLeft, ShieldCheck } from 'lucide-react-native'

const BRAND = '#4ECDC4'

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'

  const bg = isDark ? '#09090f' : '#f8faff'
  const card = isDark ? '#111120' : '#ffffff'
  const border = isDark ? '#1e2035' : '#e2e8f0'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const softBrand = isDark ? '#16383B' : '#E8F8F7'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 28 + insets.bottom,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <Pressable
          onPress={() => router.replace('/')}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            backgroundColor: card,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <ChevronLeft size={20} color={text} />
        </Pressable>

        <Text style={{ fontSize: 18, fontWeight: '800', color: text }}>
          Notificações
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <View
        style={{
          backgroundColor: card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: border,
          padding: 18,
          gap: 14,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: softBrand,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={24} color={BRAND} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: text }}>
            Central de notificações em preparação
          </Text>
          <Text style={{ fontSize: 13, lineHeight: 20, color: muted }}>
            Esta tela foi adicionada para garantir a rota do app em produção. Em breve,
            você verá alertas de plantões, trocas e confirmações aqui.
          </Text>
        </View>

        <View
          style={{
            borderRadius: 14,
            backgroundColor: isDark ? '#0f1f1f' : '#f0fdfa',
            borderWidth: 1,
            borderColor: isDark ? '#134e4a' : '#99f6e4',
            padding: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <ShieldCheck size={18} color={BRAND} />
          <Text style={{ flex: 1, fontSize: 12, lineHeight: 18, color: muted }}>
            Rota criada para evitar erro fatal ao iniciar o app quando a tela era
            registrada no stack sem arquivo correspondente.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
