import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Pet } from '../stores/petStore'

export function usePet(userId: string | undefined) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPet = async () => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    
    const { data, error: err } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (err && err.code !== 'PGRST116') {
      setError(err.message)
    } else {
      setPet(data)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchPet()
  }, [userId])

  const updateHappiness = async (change: number) => {
    if (!pet) return
    
    const newHappiness = Math.min(100, Math.max(0, pet.happiness + change))
    
    const { error: err } = await supabase
      .from('pets')
      .update({ happiness: newHappiness })
      .eq('id', pet.id)

    if (!err) {
      setPet({ ...pet, happiness: newHappiness })
    }
  }

  const addXp = async (xp: number) => {
    if (!pet) return
    
    const newXp = pet.xp + xp
    const newLevel = Math.floor(newXp / 100) + 1
    
    const { error: err } = await supabase
      .from('pets')
      .update({ xp: newXp, level: newLevel })
      .eq('id', pet.id)

    if (!err) {
      setPet({ ...pet, xp: newXp, level: newLevel })
    }
  }

  return {
    pet,
    loading,
    error,
    fetchPet,
    updateHappiness,
    addXp,
  }
}