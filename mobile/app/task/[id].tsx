import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { useTaskStore, Task } from '../../stores/taskStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { Colors } from '../../constants/colors'
import { POINTS } from '../../lib/gamification'
import { supabase } from '../../lib/supabase'
import * as Haptics from 'expo-haptics'

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuthStore()
  const { tasks, updateTask, deleteTask } = useTaskStore()
  const { updatePoints, updateStreak, fetch: fetchGam } = useGamificationStore()
  
  const [task, setTask] = useState<Task | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'alta' | 'media' | 'baja'>('media')
  const [status, setStatus] = useState<'pendiente' | 'en_progreso' | 'completada'>('pendiente')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const found = tasks.find(t => t.id === id)
    if (found) {
      setTask(found)
      setTitle(found.title)
      setDescription(found.description || '')
      setPriority(found.priority as 'alta' | 'media' | 'baja')
      setStatus(found.status as 'pendiente' | 'en_progreso' | 'completada')
    }
  }, [id, tasks])

  const priorities = [
    { key: 'alta', label: 'Alta', color: Colors.priorityHigh },
    { key: 'media', label: 'Media', color: Colors.priorityMedium },
    { key: 'baja', label: 'Baja', color: Colors.priorityLow },
  ]

  const statuses = [
    { key: 'pendiente', label: 'Pendiente' },
    { key: 'en_progreso', label: 'En Progreso' },
    { key: 'completada', label: 'Completada' },
  ]

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido')
      return
    }

    setLoading(true)
    try {
      await updateTask(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
      })
      setIsEditing(false)
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
          await deleteTask(id)
          router.back()
        }},
      ]
    )
  }

  const handleComplete = async () => {
    if (!user || !task) return

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    let points = POINTS[task.priority as keyof typeof POINTS]
    if (task.due_date && new Date() < new Date(task.due_date)) {
      points += POINTS.bonus_deadline
    }

    await updatePoints(user.id, points)
    await updateStreak(user.id)
    await supabase.from('tasks').update({ status: 'completada' }).eq('id', id)
    await supabase.from('pets').update({ xp: 10 }).eq('user_id', user.id)
    await fetchGam(user.id)

    await updateTask(id, { status: 'completada' })
    Alert.alert('¡Felicidades!', `Ganaste +${points} puntos`)
  }

  if (!task) {
    return (
      <View style={styles.loading}>
        <Text>Cargando...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>Volver</Text>
        </TouchableOpacity>
        {isEditing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelBtn}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editBtn}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {isEditing ? (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Prioridad</Text>
              <View style={styles.optionsRow}>
                {priorities.map(p => (
                  <TouchableOpacity
                    key={p.key}
                    style={[
                      styles.optionBtn,
                      priority === p.key && { backgroundColor: p.color },
                    ]}
                    onPress={() => setPriority(p.key as 'alta' | 'media' | 'baja')}
                  >
                    <Text style={[styles.optionText, priority === p.key && styles.optionTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Estado</Text>
              <View style={styles.optionsCol}>
                {statuses.map(s => (
                  <TouchableOpacity
                    key={s.key}
                    style={[
                      styles.statusBtn,
                      status === s.key && styles.statusBtnActive,
                    ]}
                    onPress={() => setStatus(s.key as any)}
                  >
                    <Text style={[styles.statusText, status === s.key && styles.statusTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.detailHeader}>
              <View style={[styles.priorityBadge, { backgroundColor: 
                priority === 'alta' ? Colors.priorityHigh + '20' :
                priority === 'media' ? Colors.priorityMedium + '20' :
                Colors.priorityLow + '20'
              }]}>
                <Text style={[styles.priorityText, { color:
                  priority === 'alta' ? Colors.priorityHigh :
                  priority === 'media' ? Colors.priorityMedium :
                  Colors.priorityLow
                }]}>
                  {priority.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.statusText}>
                {status === 'pendiente' ? 'Pendiente' : status === 'en_progreso' ? 'En Progreso' : 'Completada'}
              </Text>
            </View>

            <Text style={styles.title}>{task.title}</Text>
            {task.description && (
              <Text style={styles.description}>{task.description}</Text>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de creación</Text>
              <Text style={styles.infoValue}>
                {new Date(task.created_at).toLocaleDateString('es-MX')}
              </Text>
            </View>

            {task.due_date && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha límite</Text>
                <Text style={styles.infoValue}>
                  {new Date(task.due_date).toLocaleDateString('es-MX')}
                </Text>
              </View>
            )}

            <View style={styles.pointsCard}>
              <Text style={styles.pointsLabel}>Puntos por completar</Text>
              <Text style={styles.pointsValue}>
                +{POINTS[task.priority as keyof typeof POINTS]} pts
              </Text>
            </View>

            {status !== 'completada' && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
              >
                <Text style={styles.completeButtonText}>Completar Tarea</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Eliminar Tarea</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    fontSize: 16,
    color: Colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelBtn: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  editBtn: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  optionsCol: {
    gap: 8,
  },
  statusBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  statusBtnActive: {
    backgroundColor: Colors.primary,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statusTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  pointsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 24,
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.success,
    marginTop: 4,
  },
  completeButton: {
    backgroundColor: Colors.success,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: Colors.error + '10',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
})