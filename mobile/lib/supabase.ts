import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

console.log('🔵 [supabase] URL:', supabaseUrl ? '✓ configurada' : '✗ FALTANTE')
console.log('🔵 [supabase] Key:', supabaseAnonKey ? '✓ configurada' : '✗ FALTANTE')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [supabase] ERROR: Variables de entorno faltantes!')
  throw new Error('Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})