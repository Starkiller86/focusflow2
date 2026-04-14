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
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .single()
    set({ pet: data, loading: false })
  },

  createPet: async (userId: string, name: string, species: string) => {
    const { data } = await supabase
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
    set({ pet: data })
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