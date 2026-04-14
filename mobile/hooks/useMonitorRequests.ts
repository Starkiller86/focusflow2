import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface MonitorRequest {
  id: string
  monitor_id: string
  patient_id: string
  status: 'pending' | 'accepted' | 'rejected'
  monitor_name: string
  created_at: string
  responded_at: string | null
}

export function useMonitorRequests(userId: string | undefined) {
  const [requests, setRequests] = useState<MonitorRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    
    const { data, error: err } = await supabase
      .from('monitor_requests')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setRequests(data || [])
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [userId])

  const acceptRequest = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId)
    if (!request) return

    await supabase
      .from('monitor_requests')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', requestId)

    await supabase
      .from('monitor_patient')
      .insert({ monitor_id: request.monitor_id, patient_id: request.patient_id })

    await fetchRequests()
  }

  const rejectRequest = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId)
    if (!request) return

    await supabase
      .from('monitor_requests')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('id', requestId)

    await supabase
      .from('request_cooldowns')
      .insert({ patient_id: request.patient_id, monitor_id: request.monitor_id })

    await fetchRequests()
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return {
    requests,
    loading,
    error,
    fetchRequests,
    acceptRequest,
    rejectRequest,
    pendingCount,
  }
}