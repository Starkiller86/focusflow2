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
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ [taskStore] Error fetching:', error)
        throw new Error(error.message)
      }
      
      console.log('📋 [taskStore] Tareas cargadas:', data?.length || 0)
      set({ tasks: data ?? [], loading: false })
    } catch (err) {
      console.error('❌ [taskStore] Fetch error:', err)
      set({ tasks: [], loading: false })
    }
  },

  createTask: async (task) => {
    console.log('📝 [taskStore] Intentando crear tarea:', task)
    try {
      const { data, error } = await supabase.from('tasks').insert(task).select().single()
      
      if (error) {
        console.error('❌ [taskStore] Error de Supabase:', error)
        throw new Error(error.message)
      }
      
      if (!data) {
        console.error('❌ [taskStore] No se recibió datos')
        throw new Error('No se pudo crear la tarea')
      }
      
      console.log('✅ [taskStore] Tarea creada:', data)
      set(s => ({ tasks: [data, ...s.tasks] }))
    } catch (err) {
      console.error('❌ [taskStore] Error:', err)
      throw err
    }
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