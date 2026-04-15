import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../stores/authStore'
import { Colors } from '../constants/colors'
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

export default function MonitorRequestsScreen() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<MonitorRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    if (!user) return
    setLoading(true)
    console.log('📝 [monitor-requests] Fetching para user:', user.id)
    
    const { data, error } = await supabase
      .from('monitor_requests')
      .select('*')
      .eq('patient_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ [monitor-requests] Error:', error)
    }
    
    console.log('📋 [monitor-requests] Solicitudes encontradas:', data?.length || 0)
    setRequests(data || [])
    setLoading(false)
  }

  const handleAccept = async (request: MonitorRequest) => {
    Alert.alert(
      'Aceptar Solicitud',
      `¿Aceptar que ${request.monitor_name} te monitoree?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            console.log('📝 [monitor-requests] Aceptando solicitud:', request)
            
            try {
              // Step 1: Update request status
              console.log('📝 [monitor-requests] Actualizando status a accepted...')
              const { error: updateError } = await supabase
                .from('monitor_requests')
                .update({ status: 'accepted', responded_at: new Date().toISOString() })
                .eq('id', request.id)

              if (updateError) {
                console.error('❌ [monitor-requests] Error al actualizar:', updateError)
                Alert.alert('Error', 'No se pudo aceptar la solicitud')
                return
              }
              
              console.log('✅ [monitor-requests] Status actualizado')

              // Step 2: Insert into monitor_patient
              console.log('📝 [monitor-requests] Insertando en monitor_patient:', {
                monitor_id: request.monitor_id,
                patient_id: request.patient_id
              })
              
              const { error: insertError } = await supabase
                .from('monitor_patient')
                .insert({ monitor_id: request.monitor_id, patient_id: request.patient_id })

              if (insertError) {
                console.error('❌ [monitor-requests] Error al insertar en monitor_patient:', insertError)
                Alert.alert('Error', 'No se pudo crear la relación de monitoreo')
                return
              }
              
              console.log('✅ [monitor-requests] Relación de monitoreo creada')

              await fetchRequests()
              Alert.alert('Éxito', 'Ahora puedes ser monitoreado por ' + request.monitor_name)
            } catch (err) {
              console.error('❌ [monitor-requests] Error inesperado:', err)
              Alert.alert('Error', 'Ocurrió un error inesperado')
            }
          },
        },
      ]
    )
  }

  const handleReject = async (request: MonitorRequest) => {
    Alert.alert(
      'Rechazar Solicitud',
      `¿Rechazar la solicitud de ${request.monitor_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            console.log('📝 [monitor-requests] Rechazando solicitud:', request)
            
            try {
              const { error: updateError } = await supabase
                .from('monitor_requests')
                .update({ status: 'rejected', responded_at: new Date().toISOString() })
                .eq('id', request.id)

              if (updateError) {
                console.error('❌ [monitor-requests] Error al rechazar:', updateError)
                Alert.alert('Error', 'No se pudo rechazar la solicitud')
                return
              }

              console.log('✅ [monitor-requests] Solicitud rechazada')
              await fetchRequests()
            } catch (err) {
              console.error('❌ [monitor-requests] Error inesperado al rechazar:', err)
              Alert.alert('Error', 'Ocurrió un error inesperado')
            }
          },
        },
      ]
    )
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: Colors.accent, text: 'Pendiente' }
      case 'accepted':
        return { color: Colors.success, text: 'Aceptado' }
      case 'rejected':
        return { color: Colors.error, text: 'Rechazado' }
      default:
        return { color: Colors.textSecondary, text: status }
    }
  }

  const renderRequest = ({ item }: { item: MonitorRequest }) => {
    const badge = getStatusBadge(item.status)

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={Colors.primary} />
          </View>
          <View style={styles.requestInfo}>
            <Text style={styles.monitorName}>{item.monitor_name}</Text>
            <Text style={styles.requestDate}>
              {new Date(item.created_at).toLocaleDateString('es-MX')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.color + '20' }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item)}>
              <Text style={styles.acceptBtnText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item)}>
              <Text style={styles.rejectBtnText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Monitores</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {pendingCount} solicitud{pendingCount !== 1 ? 'es' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderRequest}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No tienes solicitudes de monitoreo</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backBtn: {
    fontSize: 16,
    color: Colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  counter: {
    padding: 20,
    paddingTop: 0,
  },
  counterText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  monitorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: Colors.white,
    fontWeight: '600',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: Colors.error + '20',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: Colors.error,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
})