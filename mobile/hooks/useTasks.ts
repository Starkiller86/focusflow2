import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Task } from '../stores/taskStore'

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    
    const { data, error: err } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setTasks(data || [])
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [userId])

  const getTaskById = (id: string) => tasks.find(t => t.id === id)
  
  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status)
  
  const getTasksByPriority = (priority: string) => tasks.filter(t => t.priority === priority)

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    getTaskById,
    getTasksByStatus,
    getTasksByPriority,
  }
}