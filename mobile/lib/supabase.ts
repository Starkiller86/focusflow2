import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (url, options) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000)
      return fetch(url, { 
        ...options, 
        signal: controller.signal,
        headers: {
          ...options?.headers,
          'Content-Type': 'application/json',
        },
      })
        .finally(() => clearTimeout(timeout))
    },
  },
})