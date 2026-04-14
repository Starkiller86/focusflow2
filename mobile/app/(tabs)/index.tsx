import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { useTaskStore } from '../../stores/taskStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { usePetStore } from '../../stores/petStore'
import { Colors, PetEmojis } from '../../constants/colors'
import GamificationHeader from '../../components/gamification/GamificationHeader'
import TaskCard from '../../components/tasks/TaskCard'
import * as Haptics from 'expo-haptics'

export default function DashboardScreen() {
  const { user } = useAuthStore()
  const { tasks, fetchTasks, loading: tasksLoading } = useTaskStore()
  const { data: gamData, fetch: fetchGam } = useGamificationStore()
  const { pet, fetch: fetchPet } = usePetStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTasks(user.id)
      fetchGam(user.id)
      fetchPet(user.id)
    }
  }, [user])

  const onRefresh = async () => {
    if (!user) return
    setRefreshing(true)
    await Promise.all([fetchTasks(user.id), fetchGam(user.id), fetchPet(user.id)])
    setRefreshing(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const highPriorityTasks = tasks.filter(t => t.priority === 'alta' && t.status !== 'completada')
  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false
    const today = new Date().toISOString().split('T')[0]
    return t.due_date.startsWith(today)
  })

  const handleQuickAction = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/focus')
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.profileInitial}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.notificationBadge}>
        <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        <View style={styles.badge} />
      </TouchableOpacity>

      <GamificationHeader />

      {pet && (
        <TouchableOpacity
          style={styles.petMini}
          onPress={() => router.push('/(tabs)/pet')}
        >
          <Text style={styles.petEmoji}>{PetEmojis[pet.species] || '🐾'}</Text>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petStatus}>
              {pet.happiness >= 70 ? '😊 feliz' : pet.happiness >= 40 ? '😐 neutral' : '😢 triste'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}

      {highPriorityTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ Tareas Urgentes</Text>
            <Text style={styles.sectionCount}>{highPriorityTasks.length}</Text>
          </View>
          {highPriorityTasks.slice(0, 3).map(task => (
            <TaskCard key={task.id} task={task} compact />
          ))}
        </View>
      )}

      {todayTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Hoy</Text>
            <Text style={styles.sectionCount}>{todayTasks.length}</Text>
          </View>
          {todayTasks.slice(0, 5).map(task => (
            <TaskCard key={task.id} task={task} compact />
          ))}
        </View>
      )}

      {tasks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyTitle}>¡Bienvenido a FocusFlow!</Text>
          <Text style={styles.emptyText}>
            Crea tu primera tarea para empezar a'organizar tu día.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/task/new')}
          >
            <Text style={styles.emptyButtonText}>Crear Tarea</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.focusButton} onPress={handleQuickAction}>
        <Ionicons name="flash" size={24} color={Colors.white} />
        <Text style={styles.focusButtonText}>Modo Focus</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/task/new')}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    minHeight: 800,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  notificationBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  petMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  petEmoji: {
    fontSize: 32,
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  petStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    padding: 16,
    marginBottom: 80,
  },
  focusButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
})