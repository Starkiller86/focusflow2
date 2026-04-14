import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface Reward {
  id: string
  name: string
  description: string | null
  cost: number
  created_at: string
}

export interface UserReward {
  id: string
  user_id: string
  reward_id: string
  redeemed_at: string
}

interface RewardState {
  rewards: Reward[]
  userRewards: UserReward[]
  loading: boolean
  fetchRewards: () => Promise<void>
  fetchUserRewards: (userId: string) => Promise<void>
  redeemReward: (userId: string, rewardId: string, cost: number) => Promise<boolean>
  hasRedeemed: (rewardId: string) => boolean
}

export const useRewardStore = create<RewardState>((set, get) => ({
  rewards: [],
  userRewards: [],
  loading: false,

  fetchRewards: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('rewards')
      .select('*')
      .order('name')
    set({ rewards: data ?? [], loading: false })
  },

  fetchUserRewards: async (userId: string) => {
    const { data } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
    set({ userRewards: data ?? [] })
  },

  redeemReward: async (userId: string, rewardId: string, cost: number) => {
    const { data: gam } = await supabase
      .from('gamification')
      .select('points')
      .eq('user_id', userId)
      .single()
    
    if (!gam || gam.points < cost) return false

    const { error } = await supabase.from('user_rewards').insert({
      user_id: userId,
      reward_id: rewardId,
    })

    if (error) return false

    await supabase.from('gamification')
      .update({ points: gam.points - cost })
      .eq('user_id', userId)

    set((state) => ({
      userRewards: [...state.userRewards, { id: crypto.randomUUID(), user_id: userId, reward_id: rewardId, redeemed_at: new Date().toISOString() }]
    }))

    return true
  },

  hasRedeemed: (rewardId: string) => {
    return get().userRewards.some(ur => ur.reward_id === rewardId)
  },
}))