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
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react-native'
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

  const bg = isDark ? '#071019' : '#F3F7FB'
  const surface = isDark ? 'rgba(10, 18, 29, 0.86)' : 'rgba(255, 255, 255, 0.92)'
  const surfaceStrong = isDark ? '#0D1824' : '#FFFFFF'
  const text = isDark ? '#EAF2FA' : '#0F172A'
  const muted = isDark ? '#94A3B8' : '#64748B'
  const border = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.08)'
  const hairline = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.06)'
  const inputBg = isDark ? '#0A1420' : '#F8FAFC'
  const footerBlur = isDark ? 'rgba(7, 16, 25, 0.94)' : 'rgba(243, 247, 251, 0.96)'
  const footerHeight = 112 + insets.bottom

  const runPremiumLoginTransition = async (name: string) => {
    setLoginTransitionName(name)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await new Promise((resolve) => setTimeout(resolve, 1050))
    router.replace('/(tabs)')
  }

  const fillDemoAccess = async () => {
    setEmail(MOBILE_DOCTOR_EMAIL)
    setPassword(MOBILE_DOCTOR_PASSWORD)
    setError('')
    await Haptics.selectionAsync()
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha e-mail e senha para continuar')
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 6 : 0}
    >
      <View style={{ flex: 1, backgroundColor: bg }}>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <MotiView
            from={{ opacity: 0.16, scale: 0.94 }}
            animate={{ opacity: 0.3, scale: 1.06 }}
            transition={{ type: 'timing', duration: 3200, loop: true }}
            style={{
              position: 'absolute',
              top: insets.top + 8,
              right: -70,
              width: 210,
              height: 210,
              borderRadius: 210,
              backgroundColor: isDark ? 'rgba(78,205,196,0.12)' : 'rgba(78,205,196,0.18)',
            }}
          />
          <MotiView
            from={{ opacity: 0.08, scale: 0.9 }}
            animate={{ opacity: 0.16, scale: 1.08 }}
            transition={{ type: 'timing', duration: 4200, loop: true, delay: 180 }}
            style={{
              position: 'absolute',
              top: insets.top + 130,
              left: -90,
              width: 240,
              height: 240,
              borderRadius: 240,
              backgroundColor: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.05)',
            }}
          />
        </View>

        <ScrollView
          contentInsetAdjustmentBehavior="always"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: footerHeight + 22,
          }}
        >
          <MotiView
            from={{ opacity: 0, translateY: -14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 380 }}
            style={{ marginBottom: 18 }}
          >
            <View
              style={{
                alignSelf: 'flex-start',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: border,
                backgroundColor: surface,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Image
                source={require('../../assets/brand/logo-full.png')}
                style={{ width: 178, height: 54 }}
                resizeMode="contain"
              />
            </View>

            <Text style={{ marginTop: 16, fontSize: 28, fontWeight: '800', color: text }}>
              Entrar
            </Text>
            <Text style={{ marginTop: 6, fontSize: 14, lineHeight: 20, color: muted }}>
              Acesse sua central de plantões com uma interface limpa e foco no que importa.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 80 }}
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: surfaceStrong,
              padding: 16,
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: isDark ? 0.28 : 0.08,
              shadowRadius: 20,
              elevation: 4,
              gap: 14,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: text }}>Acesso seguro</Text>
                <Text style={{ marginTop: 2, fontSize: 12, color: muted }}>
                  Use sua conta convidada ou acesso demo para testar.
                </Text>
              </View>

              <Pressable
                onPress={fillDemoAccess}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(78,205,196,0.22)' : 'rgba(78,205,196,0.32)',
                  backgroundColor: isDark ? 'rgba(78,205,196,0.08)' : 'rgba(78,205,196,0.1)',
                  opacity: pressed ? 0.8 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                })}
              >
                <Sparkles size={14} color={BRAND_STRONG} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: BRAND_STRONG }}>
                  Preencher demo
                </Text>
              </Pressable>
            </View>

            {error !== '' && (
              <View
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#fecaca',
                  backgroundColor: '#fef2f2',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontSize: 12, color: '#b91c1c' }}>{error}</Text>
              </View>
            )}

            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ marginBottom: 7, fontSize: 12, fontWeight: '700', color: text }}>
                  E-mail
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: hairline,
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
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    selectionColor={BRAND}
                    style={{
                      flex: 1,
                      color: text,
                      fontSize: 15,
                      paddingVertical: 13,
                      paddingHorizontal: 10,
                    }}
                  />
                </View>
              </View>

              <View>
                <View
                  style={{
                    marginBottom: 7,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: text }}>Senha</Text>
                  <Link href="/(auth)/forgot" asChild>
                    <Pressable hitSlop={8}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: BRAND_STRONG }}>
                        Esqueceu?
                      </Text>
                    </Pressable>
                  </Link>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: hairline,
                    backgroundColor: inputBg,
                    paddingLeft: 12,
                    paddingRight: 10,
                  }}
                >
                  <Lock size={16} color={muted} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={muted}
                    secureTextEntry={!showPwd}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    selectionColor={BRAND}
                    onSubmitEditing={handleLogin}
                    style={{
                      flex: 1,
                      color: text,
                      fontSize: 15,
                      paddingVertical: 13,
                      paddingHorizontal: 10,
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPwd((current) => !current)}
                    hitSlop={8}
                    style={{ padding: 4 }}
                  >
                    {showPwd ? <EyeOff size={18} color={muted} /> : <Eye size={18} color={muted} />}
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={{ paddingTop: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <Link href="/(auth)/register" asChild>
                <Pressable hitSlop={8}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: BRAND_STRONG }}>
                    Cadastre-se por convite
                  </Text>
                </Pressable>
              </Link>
              <Text style={{ fontSize: 12, color: muted }}>Hospital São Gabriel • Demo</Text>
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 420, delay: 160 }}
            style={{
              marginTop: 14,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: surface,
              paddingHorizontal: 14,
              paddingVertical: 12,
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: muted, letterSpacing: 0.3 }}>
              ACESSO DEMO
            </Text>
            <Text style={{ fontSize: 13, color: text }}>
              {MOBILE_DOCTOR_EMAIL}
            </Text>
            <Text style={{ fontSize: 13, color: text }}>{MOBILE_DOCTOR_PASSWORD}</Text>
          </MotiView>
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 10),
            backgroundColor: footerBlur,
            borderTopWidth: 1,
            borderTopColor: border,
          }}
        >
          <Pressable
            onPress={handleLogin}
            disabled={loading || Boolean(loginTransitionName)}
            style={({ pressed }) => ({
              minHeight: 54,
              borderRadius: 16,
              backgroundColor: loading || loginTransitionName ? BRAND_STRONG : BRAND,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
              shadowColor: BRAND,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.24 : 0.18,
              shadowRadius: 14,
              elevation: 4,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '800' }}>
                  Entrar
                </Text>
                <ArrowRight size={16} color="#ffffff" />
              </>
            )}
          </Pressable>
          <Text style={{ marginTop: 7, fontSize: 11, color: muted, textAlign: 'center' }}>
            Botão fixo no rodapé para manter visibilidade no iPhone.
          </Text>
        </View>

        {loginTransitionName && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: isDark ? 'rgba(7, 13, 22, 0.93)' : 'rgba(248, 250, 252, 0.94)',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 22,
            }}
          >
            <MotiView
              from={{ opacity: 0.35, scale: 0.88 }}
              animate={{ opacity: 0.55, scale: 1.06 }}
              transition={{ type: 'timing', duration: 1100, loop: true }}
              style={{
                position: 'absolute',
                width: 220,
                height: 220,
                borderRadius: 220,
                backgroundColor: isDark ? 'rgba(78,205,196,0.14)' : 'rgba(78,205,196,0.18)',
              }}
            />

            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300 }}
              style={{
                width: '100%',
                maxWidth: 340,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: border,
                backgroundColor: surfaceStrong,
                paddingHorizontal: 20,
                paddingVertical: 18,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? 'rgba(78,205,196,0.12)' : 'rgba(78,205,196,0.12)',
                  marginBottom: 14,
                }}
              >
                <MotiView
                  from={{ scale: 0.88, opacity: 0.8 }}
                  animate={{ scale: 1.08, opacity: 1 }}
                  transition={{ type: 'timing', duration: 650, loop: true }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: BRAND,
                  }}
                />
              </View>

              <Text style={{ fontSize: 20, fontWeight: '800', color: text }}>
                Bem-vindo, {loginTransitionName}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: muted,
                  textAlign: 'center',
                  lineHeight: 18,
                }}
              >
                Preparando seu painel de plantões e confirmações.
              </Text>
            </MotiView>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}
