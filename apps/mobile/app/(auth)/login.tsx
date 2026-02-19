import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, useColorScheme, ActivityIndicator,
  Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { Link, router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Eye, EyeOff } from 'lucide-react-native'
import { MOBILE_DOCTOR_EMAIL, MOBILE_DOCTOR_PASSWORD, MOBILE_DOCTOR_USER } from '../../lib/doctor-demo-data'
import { useMobileAuthStore } from '../../store/auth-store'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'

const BRAND = '#4ECDC4'

export default function LoginScreen() {
  const insets  = useSafeAreaInsets()
  const isDark  = useColorScheme() === 'dark'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const login = useMobileAuthStore((state) => state.login)
  const validateRegisteredCredential = useMobileDoctorDemoStore((state) => state.validateRegisteredCredential)

  const bg   = isDark ? '#09090f' : '#f8faff'
  const card = isDark ? '#111120' : '#ffffff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }
    setError('')
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()

    try {
      await new Promise((r) => setTimeout(r, 600))

      if (normalizedEmail === MOBILE_DOCTOR_EMAIL && password === MOBILE_DOCTOR_PASSWORD) {
        login(MOBILE_DOCTOR_USER)
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        router.replace('/(tabs)')
        return
      }

      const invitedDoctor = validateRegisteredCredential(email, password)
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
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        router.replace('/(tabs)')
        return
      }

      throw new Error('invalid')
    } catch (_error) {
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          style={{ alignItems: 'center', marginBottom: 40 }}
        >
          <Image
            source={require('../../assets/brand/logo-full.png')}
            style={{ width: 230, height: 78, marginBottom: 10 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 14, color: muted, marginTop: 4 }}>
            Entre na sua conta
          </Text>
        </MotiView>

        {/* Form */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100, type: 'spring', damping: 20 }}
          style={{ gap: 14 }}
        >
          {error !== '' && (
            <View style={{ backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#fecaca' }}>
              <Text style={{ color: '#dc2626', fontSize: 13, textAlign: 'center' }}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: text, marginBottom: 6 }}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com.br"
              placeholderTextColor={muted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              style={{
                backgroundColor: card, borderWidth: 1, borderColor: border,
                borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
                fontSize: 15, color: text,
              }}
            />
          </View>

          {/* Password */}
          <View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: text, marginBottom: 6 }}>Senha</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={muted}
                secureTextEntry={!showPwd}
                style={{
                  backgroundColor: card, borderWidth: 1, borderColor: border,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
                  paddingRight: 44, fontSize: 15, color: text,
                }}
              />
              <Pressable
                onPress={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
              >
                {showPwd ? <EyeOff size={18} color={muted} /> : <Eye size={18} color={muted} />}
              </Pressable>
            </View>
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#2BB5AB' : BRAND,
              borderRadius: 14, paddingVertical: 14,
              alignItems: 'center', marginTop: 8,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              shadowColor: BRAND, shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 12,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Entrar</Text>
            )}
          </Pressable>

          {/* Demo hint */}
          <View style={{ alignItems: 'center', marginTop: 4, gap: 6 }}>
            <Text style={{ fontSize: 12, color: muted, textAlign: 'center' }}>
              Demo médico: <Text style={{ color: BRAND }}>{MOBILE_DOCTOR_EMAIL}</Text> /{' '}
              <Text style={{ color: BRAND }}>{MOBILE_DOCTOR_PASSWORD}</Text>
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={{ fontSize: 12, color: BRAND, fontWeight: '700' }}>
                  Recebeu convite do gestor? Cadastre-se aqui
                </Text>
              </Pressable>
            </Link>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
