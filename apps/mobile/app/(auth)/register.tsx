import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
  useColorScheme,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useMobileDoctorDemoStore } from '../../store/doctor-demo-store'

const BRAND = '#4ECDC4'

export default function InviteRegisterScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'

  const inviteCodes = useMobileDoctorDemoStore((state) => state.inviteCodes)
  const registerDoctorByInvite = useMobileDoctorDemoStore((state) => state.registerDoctorByInvite)

  const [inviteCode, setInviteCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [crm, setCrm] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bg = isDark ? '#09090f' : '#f8faff'
  const card = isDark ? '#111120' : '#ffffff'
  const text = isDark ? '#f0f4ff' : '#0f172a'
  const muted = isDark ? '#a0aec0' : '#64748b'
  const border = isDark ? '#1e2035' : '#e2e8f0'

  const submit = async () => {
    if (password.length < 8) {
      setError('A senha precisa ter ao menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setLoading(true)
    setError('')
    const result = registerDoctorByInvite({
      inviteCode,
      fullName,
      email,
      password,
      crm,
      specialty,
    })
    setLoading(false)

    if (!result.ok) {
      setError(result.message)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.replace('/(auth)/login')
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
          gap: 14,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Image
            source={require('../../assets/brand/logo-full.png')}
            style={{ width: 220, height: 74, marginBottom: 12 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 24, fontWeight: '800', color: text }}>Cadastro por convite</Text>
          <Text style={{ fontSize: 13, color: muted, marginTop: 4, textAlign: 'center' }}>
            Entre no hospital com o código enviado pelo gestor
          </Text>
        </View>

        {error !== '' && (
          <View style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#dc2626', textAlign: 'center', fontSize: 13 }}>{error}</Text>
          </View>
        )}

        {[
          { label: 'Código de convite', value: inviteCode, setValue: setInviteCode, placeholder: 'SG-UTI-2026-ALFA', upper: true },
          { label: 'Nome completo', value: fullName, setValue: setFullName, placeholder: 'Dra. Ana Costa' },
          { label: 'E-mail', value: email, setValue: setEmail, placeholder: 'medico@hospital.com.br' },
          { label: 'CRM', value: crm, setValue: setCrm, placeholder: 'CRM-SP 123456' },
          { label: 'Especialidade', value: specialty, setValue: setSpecialty, placeholder: 'Medicina Intensiva' },
        ].map((field) => (
          <View key={field.label}>
            <Text style={{ fontSize: 13, color: text, fontWeight: '600', marginBottom: 6 }}>{field.label}</Text>
            <TextInput
              value={field.value}
              onChangeText={(value) => field.setValue(field.upper ? value.toUpperCase() : value)}
              placeholder={field.placeholder}
              placeholderTextColor={muted}
              autoCapitalize="none"
              style={{
                backgroundColor: card,
                borderColor: border,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: text,
                fontSize: 14,
              }}
            />
          </View>
        ))}

        <View>
          <Text style={{ fontSize: 13, color: text, fontWeight: '600', marginBottom: 6 }}>Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={muted}
            secureTextEntry
            style={{
              backgroundColor: card,
              borderColor: border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: text,
              fontSize: 14,
            }}
          />
        </View>

        <View>
          <Text style={{ fontSize: 13, color: text, fontWeight: '600', marginBottom: 6 }}>Confirmar senha</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repita a senha"
            placeholderTextColor={muted}
            secureTextEntry
            style={{
              backgroundColor: card,
              borderColor: border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: text,
              fontSize: 14,
            }}
          />
        </View>

        <Pressable
          onPress={submit}
          disabled={loading}
          style={({ pressed }) => ({
            marginTop: 8,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            backgroundColor: pressed ? '#2BB5AB' : BRAND,
            opacity: loading ? 0.7 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700' }}>Concluir cadastro</Text>
          )}
        </Pressable>

        <View style={{ marginTop: 8, gap: 6 }}>
          <Text style={{ fontSize: 12, color: muted }}>Convites demo ativos neste dispositivo:</Text>
          {inviteCodes.map((invite) => (
            <Text key={invite.id} style={{ fontSize: 12, color: text }}>
              {invite.code} · {invite.sectorName} · {invite.status}
            </Text>
          ))}
        </View>

        <Link href="/(auth)/login" asChild>
          <Pressable style={{ marginTop: 6 }}>
            <Text style={{ textAlign: 'center', fontSize: 13, color: BRAND, fontWeight: '700' }}>
              Voltar para o login
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
