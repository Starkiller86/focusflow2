import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'paciente' | 'monitor'
  avatar_url?: string
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  setUser: (user: UserProfile | null) => void
  signOut: () => Promise<void>
  loadSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => {
    console.log('🔵 [authStore] setUser llamado:', user ? { id: user.id, name: user.name, email: user.email } : null)
    console.log('🔵 [authStore] Estado anterior:', get().user)
    set({ user })
    console.log('🔵 [authStore] Estado nuevo:', get().user)
  },

  loadSession: async () => {
    console.log('🔵 [authStore] loadSession iniciado')
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ [authStore] Error obteniendo session:', sessionError)
        set({ user: null, loading: false })
        return
      }
      
      console.log('🔵 [authStore] Session:', session?.user ? { id: session.user.id, email: session.user.email } : 'null')
      
      if (session?.user) {
        console.log('🔵 [authStore] Obteniendo perfil de usuario...')
        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.error('❌ [authStore] Error obteniendo perfil:', profileError)
          set({ user: null, loading: false })
          return
        }
        
        console.log('🔵 [authStore] Perfil obtenido:', data)
        set({ user: data, loading: false })
      } else {
        console.log('🔵 [authStore] No hay session, user = null')
        set({ user: null, loading: false })
      }
    } catch (err) {
      console.error('❌ [authStore] Error en loadSession:', err)
      set({ user: null, loading: false })
    }
  },

  signOut: async () => {
    console.log('🔵 [authStore] signOut iniciado')
    await supabase.auth.signOut()
    await AsyncStorage.clear()
    set({ user: null })
    console.log('🔵 [authStore] signOut completado')
  },
}))