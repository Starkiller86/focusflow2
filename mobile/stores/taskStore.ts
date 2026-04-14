import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'pendiente' | 'en_progreso' | 'completada'
  priority: 'alta' | 'media' | 'baja'
  due_date?: string
  created_at: string
}

interface TaskState {
  tasks: Task[]
  loading: boolean
  fetchTasks: (userId: string) => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async (userId) => {
    set({ loading: true })
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    set({ tasks: data ?? [], loading: false })
  },

  createTask: async (task) => {
    const { data } = await supabase.from('tasks').insert(task).select().single()
    if (data) set(s => ({ tasks: [data, ...s.tasks] }))
  },

  updateTask: async (id, updates) => {
    await supabase.from('tasks').update(updates).eq('id', id)
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }))
  },

  deleteTask: async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
  },
}))