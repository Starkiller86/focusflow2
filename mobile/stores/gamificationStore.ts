import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { calcLevel } from '../lib/gamification'

export interface GamificationData {
  id: string
  user_id: string
  points: number
  level: number
  current_streak: number
  longest_streak: number
  last_task_completed_at: string | null
}

interface GamificationState {
  data: GamificationData | null
  loading: boolean
  fetch: (userId: string) => Promise<void>
  updatePoints: (userId: string, pointsToAdd: number) => Promise<void>
  updateStreak: (userId: string) => Promise<void>
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  data: null,
  loading: false,

  fetch: async (userId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('gamification')
      .select('*')
      .eq('user_id', userId)
      .single()
    set({ data, loading: false })
  },

  updatePoints: async (userId: string, pointsToAdd: number) => {
    const { data: current } = await supabase
      .from('gamification')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!current) return
    
    const newPoints = current.points + pointsToAdd
    const newLevel = calcLevel(newPoints)
    
    await supabase.from('gamification')
      .update({ 
        points: newPoints,
        level: newLevel,
      })
      .eq('user_id', userId)
    
    set({ data: { ...current, points: newPoints, level: newLevel } })
  },

  updateStreak: async (userId: string) => {
    const { data: current } = await supabase
      .from('gamification')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!current) return
    
    const last = current.last_task_completed_at ? new Date(current.last_task_completed_at) : null
    const now = new Date()
    const diffDays = last ? Math.floor((now.getTime() - last.getTime()) / 86400000) : 999
    
    let newStreak = current.current_streak
    
    if (diffDays === 1) {
      newStreak += 1
    } else if (diffDays > 1) {
      newStreak = 1
    }
    
    const newLongest = Math.max(newStreak, current.longest_streak)
    
    await supabase.from('gamification')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_task_completed_at: now.toISOString(),
      })
      .eq('user_id', userId)
    
    set({ data: { ...current, current_streak: newStreak, longest_streak: newLongest } })
  },
}))