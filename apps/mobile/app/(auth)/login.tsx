import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { Link, router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { ChevronRight, Eye, EyeOff, Lock, Mail } from 'lucide-react-native'
import {
  MOBILE_DOCTOR_EMAIL,
  MOBILE_DOCTOR_PASSWORD,
  MOBILE_DOCTOR_USER,
} from '../../lib/doctor-demo-data'
import { useMobileAuthStore } from '../../store/auth-store'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'

const BRAND = '#4ECDC4'
const BRAND_STRONG = '#2BB5AB'

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginTransitionName, setLoginTransitionName] = useState<string | null>(null)

  const login = useMobileAuthStore((state) => state.login)
  const validateRegisteredCredential = useMobileDoctorDemoStore(
    (state) => state.validateRegisteredCredential,
  )

  const bg = isDark ? '#08101a' : '#f3f8fd'
  const card = isDark ? '#0d1826' : '#ffffff'
  const inputBg = isDark ? '#0b1320' : '#f9fcff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#94a6bf' : '#64748b'
  const border = isDark ? '#1f2d3f' : '#dbe5ee'

  const runPremiumLoginTransition = async (name: string) => {
    setLoginTransitionName(name)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await new Promise((resolve) => setTimeout(resolve, 1180))
    router.replace('/(tabs)')
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }

    setError('')
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()

    try {
      await new Promise((resolve) => setTimeout(resolve, 560))

      if (normalizedEmail === MOBILE_DOCTOR_EMAIL && password === MOBILE_DOCTOR_PASSWORD) {
        login(MOBILE_DOCTOR_USER)
        await runPremiumLoginTransition(MOBILE_DOCTOR_USER.name.split(' ')[1] ?? 'Doutor')
        return
      }

      const invitedDoctor = validateRegisteredCredential(normalizedEmail, password)
      if (invitedDoctor) {
        login({
          id: invitedDoctor.id,
          name: invitedDoctor.fullName,
          email: invitedDoctor.email,
          role: 'PROFESSIONAL',
          crm: invitedDoctor.crm,
          specialty: invitedDoctor.specialty,
          organizationName: 'Hospital São Gabriel',
        })
        await runPremiumLoginTransition(invitedDoctor.fullName.split(' ')[0] ?? 'Doutor')
        return
      }

      throw new Error('invalid')
    } catch {
      setError('E-mail ou senha incorretos')
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        <MotiView
          from={{ opacity: 0.2, scale: 0.9 }}
          animate={{ opacity: 0.38, scale: 1.05 }}
          transition={{ type: 'timing', duration: 2800, loop: true }}
          style={{
            position: 'absolute',
            top: insets.top + 14,
            left: -58,
            width: 180,
            height: 180,
            borderRadius: 180,
            backgroundColor: 'rgba(78,205,196,0.35)',
          }}
        />
        <MotiView
          from={{ opacity: 0.15, scale: 0.95 }}
          animate={{ opacity: 0.28, scale: 1.08 }}
          transition={{ type: 'timing', duration: 3200, loop: true, delay: 220 }}
          style={{
            position: 'absolute',
            top: insets.top + 168,
            right: -82,
            width: 220,
            height: 220,
            borderRadius: 220,
            backgroundColor: isDark ? 'rgba(78,205,196,0.2)' : 'rgba(78,205,196,0.24)',
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, delay: 60 }}
          style={{ alignItems: 'center', marginBottom: 28 }}
        >
          <View
            style={{
              borderRadius: 26,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(159, 241, 234, 0.26)' : 'rgba(78, 205, 196, 0.28)',
              backgroundColor: isDark ? 'rgba(15, 27, 43, 0.86)' : 'rgba(255, 255, 255, 0.94)',
              paddingHorizontal: 14,
              paddingVertical: 10,
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: isDark ? 0.24 : 0.1,
              shadowRadius: 22,
              elevation: 4,
            }}
          >
            <Image
              source={require('../../assets/brand/logo-full.png')}
              style={{ width: 228, height: 76 }}
              resizeMode="contain"
            />
          </View>
          <Text style={{ marginTop: 14, fontSize: 25, fontWeight: '800', color: text }}>Entrar</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: muted, textAlign: 'center' }}>
            Acesse sua central de plantões com segurança.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 18 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 140, type: 'spring', damping: 18 }}
          style={{
            gap: 14,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: border,
            backgroundColor: card,
            padding: 18,
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: isDark ? 0.35 : 0.09,
            shadowRadius: 30,
            elevation: 4,
          }}
        >
          {error !== '' && (
            <View
              style={{
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: '#fecaca',
                backgroundColor: '#fef2f2',
              }}
            >
              <Text style={{ color: '#dc2626', fontSize: 13, textAlign: 'center' }}>{error}</Text>
            </View>
          )}

          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: text, marginBottom: 8 }}>E-mail</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: border,
                backgroundColor: inputBg,
                paddingHorizontal: 12,
              }}
            >
              <Mail size={16} color={muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com.br"
                placeholderTextColor={muted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  paddingHorizontal: 10,
                  fontSize: 15,
                  color: text,
                }}
              />
            </View>
          </View>

          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: text }}>Senha</Text>
              <Link href="/(auth)/forgot" asChild>
                <Pressable>
                  <Text style={{ fontSize: 12, color: BRAND_STRONG, fontWeight: '700' }}>Esqueceu?</Text>
                </Pressable>
              </Link>
            </View>

            <View
              style={{
                position: 'relative',
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: border,
                backgroundColor: inputBg,
                paddingLeft: 12,
              }}
            >
              <Lock size={16} color={muted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={muted}
                secureTextEntry={!showPwd}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  paddingHorizontal: 10,
                  paddingRight: 44,
                  fontSize: 15,
                  color: text,
                }}
              />
              <Pressable
                onPress={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                }}
              >
                {showPwd ? <EyeOff size={18} color={muted} /> : <Eye size={18} color={muted} />}
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading || Boolean(loginTransitionName)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? BRAND_STRONG : BRAND,
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 14,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              shadowColor: BRAND,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 3,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Entrar</Text>
                <ChevronRight size={16} color="#fff" />
              </View>
            )}
          </Pressable>

          <View style={{ alignItems: 'center', marginTop: 2, gap: 8 }}>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={{ fontSize: 12, color: BRAND_STRONG, fontWeight: '700' }}>
                  Recebeu convite do gestor? Cadastre-se aqui
                </Text>
              </Pressable>
            </Link>
          </View>
        </MotiView>
      </ScrollView>

      {loginTransitionName && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: isDark ? 'rgba(7, 14, 24, 0.92)' : 'rgba(240, 249, 255, 0.94)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 22,
          }}
        >
          <MotiView
            from={{ opacity: 0.2, scale: 0.92 }}
            animate={{ opacity: 0.42, scale: 1.08 }}
            transition={{ type: 'timing', duration: 1850, loop: true }}
            style={{
              position: 'absolute',
              width: 260,
              height: 260,
              borderRadius: 260,
              backgroundColor: isDark ? 'rgba(78,205,196,0.2)' : 'rgba(78,205,196,0.24)',
            }}
          />

          <MotiView
            from={{ opacity: 0, translateY: 16, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'timing', duration: 420 }}
            style={{
              width: '100%',
              maxWidth: 350,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(149, 231, 223, 0.24)' : 'rgba(41, 156, 148, 0.18)',
              backgroundColor: isDark ? 'rgba(12, 25, 40, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              paddingHorizontal: 22,
              paddingVertical: 24,
              alignItems: 'center',
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.25,
              shadowRadius: 34,
              elevation: 6,
            }}
          >
            <MotiView
              from={{ scale: 1, opacity: 0.74 }}
              animate={{ scale: 1.12, opacity: 1 }}
              transition={{ type: 'timing', duration: 980, loop: true }}
              style={{
                width: 86,
                height: 86,
                borderRadius: 30,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(164, 241, 234, 0.34)' : 'rgba(41, 156, 148, 0.22)',
                backgroundColor: isDark ? 'rgba(16, 37, 56, 0.85)' : 'rgba(236, 252, 251, 0.95)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <MotiView
                from={{ scale: 0.85, opacity: 0.8 }}
                animate={{ scale: 1.08, opacity: 1 }}
                transition={{ type: 'timing', duration: 820, loop: true, delay: 80 }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 16,
                  backgroundColor: BRAND,
                }}
              />
            </MotiView>

            <Text style={{ fontSize: 23, fontWeight: '800', color: text }}>
              Bem-vindo, {loginTransitionName}
            </Text>
            <Text style={{ marginTop: 8, fontSize: 13, color: muted, textAlign: 'center' }}>
              Preparando seu painel com escalas, trocas e indicadores.
            </Text>

            <View
              style={{
                marginTop: 18,
                width: '100%',
                height: 6,
                borderRadius: 6,
                overflow: 'hidden',
                backgroundColor: isDark ? 'rgba(53, 79, 104, 0.55)' : 'rgba(179, 232, 226, 0.7)',
              }}
            >
              <MotiView
                from={{ translateX: -180 }}
                animate={{ translateX: 240 }}
                transition={{ type: 'timing', duration: 900, loop: true }}
                style={{
                  width: 160,
                  height: 6,
                  borderRadius: 6,
                  backgroundColor: BRAND,
                }}
              />
            </View>
          </MotiView>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}
