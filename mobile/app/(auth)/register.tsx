import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Colors } from '../../constants/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import PrivacyModal from '../../components/ui/PrivacyModal'
import PasswordStrengthIndicator, { isPasswordValid } from '../../components/ui/PasswordStrengthIndicator'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTermsChecked, setAcceptedTermsChecked] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const validateForm = (): boolean => {
    console.log('🔍 Validando...')
    const newErrors: FormErrors = {}
    
    if (!name || name.trim().length < 2) {
      console.log('❌ Error nombre: muy corto')
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }
    
    if (!email || !email.includes('@')) {
      console.log('❌ Error email: inválido')
      newErrors.email = 'Ingresa un correo electrónico válido'
    }
    
    if (!password || password.length < 8) {
      console.log('❌ Error password: muy corta')
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      console.log('❌ Error password: falta mayúscula/minúscula/número')
      newErrors.password = 'La contraseña debe tener mayúscula, minúscula y número'
    }
    
    if (!confirmPassword || confirmPassword !== password) {
      console.log('❌ Error confirmPassword: no coincide')
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    console.log('📋 Errores encontrados:', newErrors)
    
    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log('✅ ¿Formulario válido?:', isValid)
    return isValid
  }

  const handleRegister = async () => {
    if (loading) return
    
    console.log('📋 Datos:', { name, email, password, confirmPassword })
    
    if (!validateForm()) {
      console.log('❌ Errores de validación:', errors)
      return
    }

    if (!acceptedTermsChecked) {
      Alert.alert('Términos requeridos', 'Debes aceptar los términos y condiciones')
      return
    }

    if (!isPasswordValid(password)) {
      Alert.alert('Contraseña débil', 'La contraseña no cumple con todos los requisitos')
      return
    }

    console.log('📡 Enviando a Supabase...')
    setLoading(true)

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('📡 Respuesta Supabase:', authData, error)

      if (error) {
        setLoading(false)
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          Alert.alert('Correo en uso', 'Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.')
        } else {
          Alert.alert('Error', error.message)
        }
        return
      }

      if (!authData?.user) {
        setLoading(false)
        Alert.alert('Error', 'No se pudo crear el usuario')
        return
      }

      const userId = authData.user.id

      try {
        const { error: insertError } = await supabase.from('users').insert({
          id: userId,
          name,
          email,
          role: 'paciente',
        })

        if (insertError) {
          console.error('❌ Error insertando en users:', insertError)
        }
      } catch (err) {
        console.error('❌ Excepción insertando en users:', err)
      }

      try {
        const { error: gamError } = await supabase.from('gamification').insert({
          user_id: userId,
          points: 0,
          level: 1,
          current_streak: 0,
          longest_streak: 0,
        })

        if (gamError) {
          console.error('❌ Error insertando en gamification:', gamError)
        }
      } catch (err) {
        console.error('❌ Excepción insertando en gamification:', err)
      }

      await supabase.auth.signOut()
      setLoading(false)
      
      Alert.alert(
        '¡Cuenta creada!',
        'Por favor verifica tu correo electrónico para activar tu cuenta.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    } catch (err) {
      console.error('❌ Error general en registro:', err)
      setLoading(false)
      Alert.alert('Error', 'Ocurrió un error inesperado. Por favor intenta de nuevo.')
    }
  }

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
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        <View>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>

        <View>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton} 
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Ionicons name="eye-off" size={20} color={Colors.textSecondary} />
              ) : (
                <Ionicons name="eye" size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          <PasswordStrengthIndicator password={password} />
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        </View>

        <View>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <Ionicons name="eye-off" size={20} color={Colors.textSecondary} />
              ) : (
                <Ionicons name="eye" size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
        </View>

        <TouchableOpacity
          style={styles.termsButton}
          onPress={() => setShowPrivacy(true)}
        >
          <Text style={styles.termsLink}>Ver Aviso de Privacidad</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAcceptedTermsChecked(!acceptedTermsChecked)}
        >
          <View style={[styles.checkbox, acceptedTermsChecked && styles.checkboxChecked]}>
            {acceptedTermsChecked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Acepto los Términos y Condiciones y el Aviso de Privacidad
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, (loading || !isPasswordValid(password)) && styles.buttonDisabled]}
          onPress={() => {
            console.log('🔘 Botón presionado')
            console.log('📝 name:', name, '| email:', email, '| password:', password, '| confirm:', confirmPassword)
            console.log('📝 acceptedTermsChecked:', acceptedTermsChecked)
            handleRegister()
          }}
          disabled={loading || !isPasswordValid(password)}
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
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