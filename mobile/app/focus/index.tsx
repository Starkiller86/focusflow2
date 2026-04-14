import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Animated } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { useTaskStore, Task } from '../../stores/taskStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { Colors } from '../../constants/colors'
import { POINTS } from '../../lib/gamification'
import { supabase } from '../../lib/supabase'
import * as Haptics from 'expo-haptics'

type Phase = 'config' | 'active' | 'summary'

export default function FocusScreen() {
  const { user } = useAuthStore()
  const { tasks, fetchTasks, updateTask } = useTaskStore()
  const { updatePoints, updateStreak, fetch: fetchGam } = useGamificationStore()
  
  const [phase, setPhase] = useState<Phase>('config')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [duration, setDuration] = useState(25)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const durations = [15, 25, 45, 60]

  useEffect(() => {
    if (user) {
      fetchTasks(user.id)
    }
  }, [user])

  useEffect(() => {
    if (phase === 'active') {
      setTimeLeft(duration * 60)
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase])

  const pendingTasks = tasks.filter(t => t.status !== 'completada').slice(0, 10)

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : prev.length < 5 ? [...prev, taskId] : prev
    )
  }

  const handleStart = () => {
    if (selectedTasks.length === 0) {
      Alert.alert('Error', 'Selecciona al menos una tarea')
      return
    }
    setPhase('active')
    setCurrentIndex(0)
  }

  const handleCompleteTask = async () => {
    if (!user || selectedTasks.length === 0) return

    const taskId = selectedTasks[currentIndex]
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    let points = Math.round(POINTS[task.priority as keyof typeof POINTS] * POINTS.focus_multiplier)

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await updateTask(taskId, { status: 'completada' })
    await supabase.from('tasks').update({ status: 'completada' }).eq('id', taskId)
    
    setPointsEarned(prev => prev + points)
    setTasksCompleted(prev => prev + 1)

    if (currentIndex < selectedTasks.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleSessionEnd()
    }
  }

  const handleSessionEnd = async () => {
    if (!user) return

    if (intervalRef.current) clearInterval(intervalRef.current)

    await updatePoints(user.id, pointsEarned * 0.1)
    await updateStreak(user.id)
    await fetchGam(user.id)

    setPhase('summary')
  }

  const handleExit = () => {
    Alert.alert(
      'Salir del Modo Focus',
      '¿Estás seguro de que quieres salir? Perderás el progreso de esta sesión.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => router.back() },
      ]
    )
  }

  const startHold = () => {
    setHoldProgress(0)
    holdTimer.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 3) {
          if (holdTimer.current) clearInterval(holdTimer.current)
          handleExit()
          return 0
        }
        return prev + 1
      })
    }, 1000)
  }

  const endHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current)
    setHoldProgress(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (phase === 'config') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Modo Focus</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.subtitle}>Selecciona las tareas para esta sesión</Text>

        <ScrollView style={styles.taskList}>
          {pendingTasks.map(task => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskItem,
                selectedTasks.includes(task.id) && styles.taskSelected,
              ]}
              onPress={() => toggleTask(task.id)}
            >
              <View style={[
                styles.checkbox,
                selectedTasks.includes(task.id) && styles.checkboxSelected,
              ]}>
                {selectedTasks.includes(task.id) && (
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                )}
              </View>
              <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.durationLabel}>Duración</Text>
        <View style={styles.durationRow}>
          {durations.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.durationBtn, duration === d && styles.durationBtnActive]}
              onPress={() => setDuration(d)}
            >
              <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>
                {d} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.startBtn,
            selectedTasks.length === 0 && styles.startBtnDisabled,
          ]}
          onPress={handleStart}
          disabled={selectedTasks.length === 0}
        >
          <Text style={styles.startBtnText}>Activar Focus</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (phase === 'summary') {
    return (
      <View style={styles.container}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>🎉</Text>
          <Text style={styles.summaryTitle}>¡Sesión completada!</Text>
          <Text style={styles.summaryStats}>
            {tasksCompleted} de {selectedTasks.length} tareas
          </Text>
          <Text style={styles.summaryPoints}>
            +{Math.round(pointsEarned * 0.1)} puntos ganados
          </Text>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const currentTask = tasks.find(t => t.id === selectedTasks[currentIndex])
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100

  return (
    <View style={styles.activeContainer}>
      <View style={styles.timerSection}>
        <View style={styles.timerCircle}>
          <Animated.View style={[styles.timerProgress, { transform: [{ rotate: `${progress * 3.6}deg` }] }]} />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <View style={styles.currentTask}>
        <Text style={styles.currentTaskLabel}>Tarea actual</Text>
        <Text style={styles.currentTaskTitle}>{currentTask?.title}</Text>
        <Text style={styles.taskProgress}>
          {currentIndex + 1} de {selectedTasks.length}
        </Text>
      </View>

      <TouchableOpacity style={styles.completeTaskBtn} onPress={handleCompleteTask}>
        <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
        <Text style={styles.completeTaskText}>Tarea completada</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exitBtn}
        onPressIn={startHold}
        onPressOut={endHold}
      >
        <Text style={styles.exitText}>
          Salir ({3 - holdProgress}s)
        </Text>
      </TouchableOpacity>
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
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    padding: 20,
    paddingTop: 0,
  },
  taskList: {
    flex: 1,
    padding: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  taskSelected: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: 20,
    paddingBottom: 8,
  },
  durationRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  durationBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  durationBtnActive: {
    backgroundColor: Colors.primary,
  },
  durationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  durationTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    margin: 20,
    alignItems: 'center',
  },
  startBtnDisabled: {
    opacity: 0.5,
  },
  startBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  activeContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    padding: 20,
  },
  timerSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerProgress: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
  },
  currentTask: {
    alignItems: 'center',
    marginTop: 40,
  },
  currentTaskLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  currentTaskTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginTop: 8,
  },
  taskProgress: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 8,
  },
  completeTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: 16,
    padding: 18,
    marginTop: 40,
  },
  completeTaskText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  exitBtn: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  exitText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  summaryEmoji: {
    fontSize: 64,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 16,
  },
  summaryStats: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  summaryPoints: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.success,
    marginTop: 8,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    margin: 20,
    alignItems: 'center',
  },
  closeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
})