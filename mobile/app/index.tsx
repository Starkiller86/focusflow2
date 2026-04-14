import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { Colors } from '../constants/colors'

export default function Index() {
  const { user, loading } = useAuthStore()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/(auth)/login')
      return
    }

    // Verificar si tiene mascota - usar maybeSingle para evitar error cuando no hay resultados
    supabase.from('pets').select('id').eq('user_id', user.id).maybeSingle()
      .then(({ data: pet, error }) => {
        if (error) {
          console.error('❌ Error verificando mascota:', error.message)
        }
        if (pet) {
          router.replace('/(tabs)')
        } else {
          router.replace('/onboarding/pet-setup')
        }
      })
  }, [user, loading])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  )
}