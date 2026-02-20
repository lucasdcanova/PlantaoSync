import { Tabs, router } from 'expo-router'
import { View, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { useEffect } from 'react'
import { Home, Calendar, ClipboardList, Repeat, User } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMobileAuthStore } from '../../store/auth-store'

const BRAND = '#4ECDC4'

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

function HighlightedTabIcon({
  icon: Icon,
  focused,
}: {
  icon: React.ComponentType<any>
  focused: boolean
}) {
  return (
    <View
      style={{
        width: 62,
        height: 62,
        borderRadius: 31,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BRAND,
        borderWidth: 4,
        borderColor: '#ffffff',
        shadowColor: BRAND,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
        transform: [{ translateY: -18 }],
      }}
    >
      <Icon
        size={28}
        color="#ffffff"
        strokeWidth={2.5}
      />
    </View>
  )
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()
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
          borderTopColor: '#e2e8f0',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
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
              tint="light"
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
            <HighlightedTabIcon icon={Calendar} focused={focused} />
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
