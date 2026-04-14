import { useState, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Colors } from '../../constants/colors'
import Ionicons from '@expo/vector-icons/Ionicons'

const MAX_ATTEMPTS = 5
const BLOCK_MINUTES = 15

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const setUser = useAuthStore((s) => s.setUser)

  const isBlocked = blockedUntil ? new Date() < blockedUntil : false

  const handleLogin = async () => {
    if (isBlocked || !email.trim() || !password.trim()) return

    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (error) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = new Date(Date.now() + BLOCK_MINUTES * 60 * 1000)
        setBlockedUntil(until)
        startCountdown(BLOCK_MINUTES * 60)
      } else {
        Alert.alert('Error', 'Correo o contraseña incorrectos')
      }
      return
    }

    if (!data.user) {
      Alert.alert('Error', 'No se pudo iniciar sesión')
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    await AsyncStorage.multiSet([
      ['userId', data.user.id],
      ['email', email],
      ['role', profile?.role ?? 'paciente'],
    ])

    setUser(profile)

    const { data: pet } = await supabase
      .from('pets')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    router.replace(pet ? '/(tabs)' : '/onboarding/pet-setup')
  }

  const startCountdown = (seconds: number) => {
    setCountdown(seconds)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setBlockedUntil(null)
          setAttempts(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FocusFlow</Text>
      <Text style={styles.subtitle}>Inicia sesión</Text>

      {isBlocked && (
        <View style={styles.blockedBanner}>
          <Text style={styles.blockedText}>
            Demasiados intentos. Espera {mins}:{secs.toString().padStart(2, '0')}
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isBlocked || isBlocked === null}
        autoComplete="email"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          editable={!isBlocked}
        />
        <TouchableOpacity 
          style={styles.eyeButton} 
          onPress={() => setShowPassword(!showPassword)}
          disabled={isBlocked}
        >
          {showPassword ? (
            <Ionicons name="eye-off" size={20} color={Colors.textSecondary} />
          ) : (
            <Ionicons name="eye" size={20} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, (loading || isBlocked) && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading || isBlocked}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(auth)/forgot-password')}
        style={styles.linkBtn}
      >
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(auth)/register')}
        style={styles.linkBtn}
      >
        <Text style={styles.link}>Crear cuenta</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: Colors.white,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
    marginRight: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  linkBtn: {
    paddingVertical: 8,
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
    fontSize: 14,
  },
  blockedBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  blockedText: {
    color: Colors.error,
    textAlign: 'center',
    fontWeight: '600',
  },
})