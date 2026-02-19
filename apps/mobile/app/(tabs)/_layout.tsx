import { Tabs, router } from 'expo-router'
import { useColorScheme, View, Text, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { useEffect } from 'react'
import { Home, Calendar, ClipboardList, Repeat, User } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMobileAuthStore } from '../../store/auth-store'

const BRAND = '#4ECDC4'
const BRAND_MUTED = '#65D4CD'

function TabIcon({
  icon: Icon,
  label,
  focused,
}: {
  icon: React.ComponentType<any>
  label: string
  focused: boolean
}) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? `${BRAND}22` : 'transparent',
        }}
      >
        <Icon
          size={20}
          color={focused ? BRAND : '#94a3b8'}
          strokeWidth={focused ? 2.5 : 1.75}
        />
      </View>
    </View>
  )
}

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const isDark = colorScheme === 'dark'
  const isAuthenticated = useMobileAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login')
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0.5,
          borderTopColor: isDark ? '#1e2035' : '#e2e8f0',
          backgroundColor: isDark ? 'rgba(9, 9, 15, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 24,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint={isDark ? 'dark' : 'light'}
              style={{ flex: 1 }}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Disponíveis',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Home} label="Início" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Setores',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Calendar} label="Calendário" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="shifts"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={ClipboardList} label="Plantões" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="finances"
        options={{
          title: 'Trocas',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Repeat} label="Trocas" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={User} label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}
