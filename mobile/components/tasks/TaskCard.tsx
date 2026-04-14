import { useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import { useTaskStore, Task } from '../../stores/taskStore'
import { useAuthStore } from '../../stores/authStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { POINTS, calcLevel } from '../../lib/gamification'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'

interface TaskCardProps {
  task: Task
  compact?: boolean
}

export default function TaskCard({ task, compact = false }: TaskCardProps) {
  const { updateTask, deleteTask } = useTaskStore()
  const { user } = useAuthStore()
  const { updatePoints, updateStreak, fetch } = useGamificationStore()
  const scaleAnim = useRef(new Animated.Value(1)).current

  const priorityColors = {
    alta: Colors.priorityHigh,
    media: Colors.priorityMedium,
    baja: Colors.priorityLow,
  }

  const handleComplete = async () => {
    if (!user) return

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    let points = POINTS[task.priority as keyof typeof POINTS]
    const dueDate = task.due_date ? new Date(task.due_date) : null
    if (dueDate && new Date() < dueDate) {
      points += POINTS.bonus_deadline
    }

    await updatePoints(user.id, points)
    await updateStreak(user.id)
    await supabase.from('tasks').update({ status: 'completada' }).eq('id', task.id)

    await fetch(user.id)
    await supabase.from('pets').update({ xp: 10 }).eq('user_id', user.id)

    await updateTask(task.id, { status: 'completada' })
  }

  const handlePress = () => {
    router.push(`/task/${task.id}`)
  }

  if (task.status === 'completada') {
    return null
  }

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress}>
        <View style={[styles.priorityDot, { backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] }]} />
        <Text style={styles.compactTitle} numberOfLines={1}>{task.title}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] + '20' }]}>
            <Text style={[styles.priorityText, { color: priorityColors[task.priority as keyof typeof priorityColors] }]}>
              {task.priority.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {task.due_date ? new Date(task.due_date).toLocaleDateString('es-MX') : 'Sin fecha'}
          </Text>
        </View>

        <Text style={styles.title}>{task.title}</Text>
        {task.description && (
          <Text style={styles.description} numberOfLines={2}>{task.description}</Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{task.status}</Text>
          </View>

          {task.priority !== 'baja' && (
            <Text style={[styles.points, { color: priorityColors[task.priority as keyof typeof priorityColors] }]}>
              +{POINTS[task.priority as keyof typeof POINTS]} pts
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {!task.description && (
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  compactTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  points: {
    fontSize: 14,
    fontWeight: '700',
  },
  completeButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    padding: 4,
  },
})