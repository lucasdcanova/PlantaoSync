import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash screen was already handled by the native runtime.
})

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {
      // Ignore race conditions when the splash screen is already hidden.
    })
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
