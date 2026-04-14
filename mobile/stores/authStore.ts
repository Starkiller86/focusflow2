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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  loadSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      set({ user: data, loading: false })
    } else {
      set({ user: null, loading: false })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    await AsyncStorage.clear()
    set({ user: null })
  },
}))