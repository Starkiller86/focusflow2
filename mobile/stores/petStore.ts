import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface Pet {
  id: string
  user_id: string
  name: string
  species: string
  level: number
  xp: number
  happiness: number
  accessory_hat: string | null
  accessory_glasses: string | null
  accessory_cape: string | null
  created_at: string
}

interface PetState {
  pet: Pet | null
  loading: boolean
  fetch: (userId: string) => Promise<void>
  createPet: (userId: string, name: string, species: string) => Promise<void>
  updatePet: (userId: string, updates: Partial<Pet>) => Promise<void>
  petInteract: (userId: string, action: 'caress' | 'feed' | 'play') => Promise<void>
}

export const usePetStore = create<PetState>((set, get) => ({
  pet: null,
  loading: false,

  fetch: async (userId: string) => {
    set({ loading: true })
    try {
      if (!userId) {
        console.error('❌ [petStore] userId es null!')
        set({ pet: null, loading: false })
        return
      }
      
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('❌ [petStore] Error fetching:', error)
        throw new Error(error.message)
      }
      
      console.log('📋 [petStore] Mascota cargada:', data)
      set({ pet: data, loading: false })
    } catch (err) {
      console.error('❌ [petStore] Fetch error:', err)
      set({ pet: null, loading: false })
    }
  },

  createPet: async (userId: string, name: string, species: string) => {
    console.log('📝 [petStore] Intentando crear mascota:', { userId, name, species })
    try {
      if (!userId) {
        console.error('❌ [petStore] userId es null o undefined!')
        throw new Error('No hay usuario autenticado')
      }
      
      const { data, error } = await supabase
        .from('pets')
        .insert({
          user_id: userId,
          name,
          species,
          level: 1,
          xp: 0,
          happiness: 100,
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ [petStore] Error de Supabase:', error)
        throw new Error(error.message)
      }
      
      if (!data) {
        console.error('❌ [petStore] No se recibió datos de mascota')
        throw new Error('No se pudo crear la mascota')
      }
      
      console.log('✅ [petStore] Mascota creada:', data)
      set({ pet: data })
    } catch (err) {
      console.error('❌ [petStore] Error:', err)
      throw err
    }
  },

  updatePet: async (userId: string, updates: Partial<Pet>) => {
    await supabase.from('pets')
      .update(updates)
      .eq('user_id', userId)
    
    set((state) => ({ pet: state.pet ? { ...state.pet, ...updates } : null }))
  },

  petInteract: async (userId: string, action: 'caress' | 'feed' | 'play') => {
    const { pet } = get()
    if (!pet) return

    let happinessChange = 0
    let xpChange = 0

    switch (action) {
      case 'caress':
        happinessChange = 5
        break
      case 'feed':
        happinessChange = 10
        break
      case 'play':
        happinessChange = 15
        xpChange = 5
        break
    }

    const newHappiness = Math.min(100, pet.happiness + happinessChange)
    const newXp = pet.xp + xpChange
    const newLevel = Math.floor(newXp / 100) + 1

    await supabase.from('pets')
      .update({
        happiness: newHappiness,
        xp: newXp,
        level: newLevel,
      })
      .eq('user_id', userId)

    set({
      pet: {
        ...pet,
        happiness: newHappiness,
        xp: newXp,
        level: newLevel
      }
    })
  },
}))