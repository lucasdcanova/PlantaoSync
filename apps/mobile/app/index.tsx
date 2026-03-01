import { useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Constants from 'expo-constants'
import { WebView } from 'react-native-webview'
import type {
  ShouldStartLoadRequest,
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes'

const DEFAULT_PWA_URL = 'https://plantaosync.onrender.com'
const LEGACY_PWA_HOSTS = new Set(['confirmaplantao.com.br', 'www.confirmaplantao.com.br'])
const WEBVIEW_VIEWPORT_LOCK_SCRIPT = `
  (function () {
    const content = 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover';
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  })();
  true;
`
const BRAND = '#4ECDC4'

function normalizeUrl(raw?: string) {
  if (!raw) return DEFAULT_PWA_URL
  const trimmed = raw.trim()

  if (trimmed === '') return DEFAULT_PWA_URL

  const withProtocol =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`

  try {
    const parsed = new URL(withProtocol)
    if (LEGACY_PWA_HOSTS.has(parsed.hostname.toLowerCase())) return DEFAULT_PWA_URL
    return parsed.toString()
  } catch {
    return DEFAULT_PWA_URL
  }
}

function ensureLoginEntry(urlString: string) {
  try {
    const parsed = new URL(urlString)
    if (parsed.pathname === '/' || parsed.pathname === '') parsed.pathname = '/login'
    return parsed.toString()
  } catch {
    return `${DEFAULT_PWA_URL}/login`
  }
}

export default function RootPwaScreen() {
  const webviewRef = useRef<WebView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)

  const pwaUrl = useMemo(() => {
    const fromEnv = process.env.EXPO_PUBLIC_PWA_URL
    const fromExpoExtra = Constants.expoConfig?.extra?.pwaUrl as string | undefined

    return ensureLoginEntry(normalizeUrl(fromEnv ?? fromExpoExtra ?? DEFAULT_PWA_URL))
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
    setCurrentUrl(_event.url)
  }

  const handleWebViewError = (event: WebViewErrorEvent) => {
    const { code, description, domain, url } = event.nativeEvent
    const details = `Erro de rede (code=${code}${domain ? `, domain=${domain}` : ''}) em ${url}: ${description}`

    console.error('[WebView:onError]', { code, description, domain, url })
    setIsLoading(false)
    setHasError(true)
    setErrorDetails(details)
  }

  const handleWebViewHttpError = (event: WebViewHttpErrorEvent) => {
    const { statusCode, description, url } = event.nativeEvent
    const details = `HTTP ${statusCode} em ${url}: ${description}`

    console.error('[WebView:onHttpError]', { statusCode, description, url })
    setIsLoading(false)
    setHasError(true)
    setErrorDetails(details)
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
        scalesPageToFit={false}
        textZoom={100}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        injectedJavaScriptBeforeContentLoaded={WEBVIEW_VIEWPORT_LOCK_SCRIPT}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => {
          setIsLoading(true)
          setHasError(false)
          setErrorDetails(null)
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={handleWebViewError}
        onHttpError={handleWebViewHttpError}
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
          {!!errorDetails && (
            <Text style={{ fontSize: 12, color: '#475569', textAlign: 'center', lineHeight: 18 }}>
              {errorDetails}
            </Text>
          )}
          {!!currentUrl && (
            <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 16 }}>
              URL atual: {currentUrl}
            </Text>
          )}

          <Pressable
            onPress={() => {
              setHasError(false)
              setIsLoading(true)
              setErrorDetails(null)
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
