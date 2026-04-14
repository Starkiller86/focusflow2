import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Colors } from '../../constants/colors'
import PrivacyModal from '../../components/ui/PrivacyModal'

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido (mínimo 2 caracteres)'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una minúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirmPassword: z.string(),
  acceptedTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { acceptedTerms: undefined },
  })

  const onSubmit = async (data: FormData) => {
    if (loading) return
    setLoading(true)

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setLoading(false)
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        Alert.alert('Error', 'Este correo ya está registrado')
      } else {
        Alert.alert('Error', error.message)
      }
      return
    }

    if (!authData.user) {
      setLoading(false)
      Alert.alert('Error', 'No se pudo crear el usuario')
      return
    }

    const { error: insertError } = await supabase.from('users').insert({
      id: authData.user.id,
      name: data.name,
      email: data.email,
      role: 'paciente',
    })

    if (insertError) {
      setLoading(false)
      Alert.alert('Error', 'No se pudo completar el registro')
      return
    }

    const { error: gamError } = await supabase.from('gamification').insert({
      user_id: authData.user.id,
      points: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0,
    })

    if (gamError) {
      setLoading(false)
      Alert.alert('Error', 'No se pudo inicializar gamificación')
      return
    }

    await supabase.auth.signOut()
    setLoading(false)
    Alert.alert(
      '¡Registro exitoso!',
      'Por favor verifica tu correo electrónico para continuar.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
    )
  }

  const password = watch('password')

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Únete a FocusFlow</Text>

      <View style={styles.form}>
        <View>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            {...register('name')}
            autoCapitalize="words"
          />
          {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
        </View>

        <View>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            {...register('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
        </View>

        <View>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            {...register('password')}
            secureTextEntry
          />
          {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
        </View>

        <View>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            {...register('confirmPassword')}
            secureTextEntry
          />
          {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}
        </View>

        <TouchableOpacity
          style={styles.termsButton}
          onPress={() => setShowPrivacy(true)}
        >
          <Text style={styles.termsLink}>Ver Aviso de Privacidad</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setValue('acceptedTerms', watch('acceptedTerms') ? undefined : true as any)}
        >
          <View style={[styles.checkbox, watch('acceptedTerms') && styles.checkboxChecked]}>
            {watch('acceptedTerms') && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Acepto los Términos y Condiciones y el Aviso de Privacidad
          </Text>
        </TouchableOpacity>
        {errors.acceptedTerms && <Text style={styles.error}>{errors.acceptedTerms.message}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginLink}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>

      <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  termsButton: {
    marginTop: 8,
  },
  termsLink: {
    color: Colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
})