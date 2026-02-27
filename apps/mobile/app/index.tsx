import { useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Constants from 'expo-constants'
import { WebView } from 'react-native-webview'
import type {
  ShouldStartLoadRequest,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes'

const DEFAULT_PWA_URL = 'https://confirmaplantao.com.br'
const BRAND = '#4ECDC4'

function normalizeUrl(raw?: string) {
  if (!raw) return DEFAULT_PWA_URL
  const trimmed = raw.trim()

  if (trimmed === '') return DEFAULT_PWA_URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed

  return `https://${trimmed}`
}

export default function RootPwaScreen() {
  const webviewRef = useRef<WebView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const pwaUrl = useMemo(() => {
    const fromEnv = process.env.EXPO_PUBLIC_PWA_URL
    const fromExpoExtra = Constants.expoConfig?.extra?.pwaUrl as string | undefined

    return normalizeUrl(fromEnv ?? fromExpoExtra ?? DEFAULT_PWA_URL)
  }, [])

  const handleShouldStartLoadWithRequest = (request: ShouldStartLoadRequest) => {
    const url = request.url

    if (url.startsWith('http://') || url.startsWith('https://')) return true

    void Linking.openURL(url).catch(() => {
      // Ignore if the scheme cannot be opened on this device.
    })

    return false
  }

  const handleNavigationStateChange = (_event: WebViewNavigation) => {
    // Kept for future native integrations that may depend on route tracking.
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar style="dark" />

      <WebView
        ref={webviewRef}
        source={{ uri: pwaUrl }}
        style={{ flex: 1 }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => {
          setIsLoading(true)
          setHasError(false)
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />

      {isLoading && !hasError && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.7)',
          }}
        >
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      )}

      {hasError && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            backgroundColor: '#ffffff',
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>
            Nao foi possivel carregar o app
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 }}>
            Verifique sua conexao e tente novamente.
          </Text>

          <Pressable
            onPress={() => {
              setHasError(false)
              setIsLoading(true)
              webviewRef.current?.reload()
            }}
            style={({ pressed }) => ({
              marginTop: 6,
              borderRadius: 12,
              backgroundColor: BRAND,
              paddingHorizontal: 16,
              paddingVertical: 10,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#ffffff', fontWeight: '700' }}>Tentar novamente</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
