import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { calcLevel } from '../lib/gamification'
import { GamificationData } from '../stores/gamificationStore'

export function useGamification(userId: string | undefined) {
  const [data, setData] = useState<GamificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGamification = async () => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    
    const { data: gam, error: err } = await supabase
      .from('gamification')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (err && err.code !== 'PGRST116') {
      setError(err.message)
    } else {
      setData(gam)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchGamification()
  }, [userId])

  const addPoints = async (points: number) => {
    if (!data) return
    
    const newPoints = data.points + points
    const newLevel = calcLevel(newPoints)
    
    const { error: err } = await supabase
      .from('gamification')
      .update({
        points: newPoints,
        level: newLevel,
      })
      .eq('user_id', userId)

    if (!err) {
      setData({ ...data, points: newPoints, level: newLevel })
    }
  }

  const getLevelProgress = () => {
    if (!data) return 0
    const current = Math.pow(((data.level - 1) * 100), 2) / 100
    const next = Math.pow((data.level) * 100, 2) / 100
    return ((data.points - current) / (next - current)) * 100
  }

  return {
    data,
    loading,
    error,
    fetchGamification,
    addPoints,
    getLevelProgress,
  }
}