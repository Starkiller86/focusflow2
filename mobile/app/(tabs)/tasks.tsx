import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Calendar } from 'react-native-calendars'
import { useAuthStore } from '../../stores/authStore'
import { useTaskStore, Task } from '../../stores/taskStore'
import { Colors } from '../../constants/colors'
import TaskCard from '../../components/tasks/TaskCard'

type ViewMode = 'lista' | 'kanban' | 'calendario'

export default function TasksScreen() {
  const { user } = useAuthStore()
  const { tasks, fetchTasks, deleteTask, loading } = useTaskStore()
  const [view, setView] = useState<ViewMode>('lista')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchTasks(user.id)
    }
  }, [user])

  const filteredTasks = tasks.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false
    if (selectedDate && t.due_date?.split('T')[0] !== selectedDate) return false
    return true
  })

  const highTasks = filteredTasks.filter(t => t.priority === 'alta' && t.status !== 'completada')
  const mediumTasks = filteredTasks.filter(t => t.priority === 'media' && t.status !== 'completada')
  const lowTasks = filteredTasks.filter(t => t.priority === 'baja' && t.status !== 'completada')

  const pendingTasks = filteredTasks.filter(t => t.status === 'pendiente')
  const inProgressTasks = filteredTasks.filter(t => t.status === 'en_progreso')
  const completedTasks = filteredTasks.filter(t => t.status === 'completada')

  const markedDates = tasks.reduce((acc, task) => {
    if (!task.due_date) return acc
    const date = task.due_date.split('T')[0]
    const color = task.priority === 'alta' ? Colors.priorityHigh
              : task.priority === 'media' ? Colors.priorityMedium
              : Colors.priorityLow
    acc[date] = { marked: true, dotColor: color }
    return acc
  }, {} as Record<string, any>)

  const handleDelete = (taskId: string) => {
    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteTask(taskId) },
      ]
    )
  }

  const renderLista = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { borderLeftColor: Colors.priorityHigh }]}>
          <Text style={styles.sectionTitle}>Alta Prioridad</Text>
          <Text style={styles.sectionCount}>{highTasks.length}</Text>
        </View>
        {highTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={[styles.sectionHeader, { borderLeftColor: Colors.priorityMedium }]}>
          <Text style={styles.sectionTitle}>Media Prioridad</Text>
          <Text style={styles.sectionCount}>{mediumTasks.length}</Text>
        </View>
        {mediumTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={[styles.sectionHeader, { borderLeftColor: Colors.priorityLow }]}>
          <Text style={styles.sectionTitle}>Baja Prioridad</Text>
          <Text style={styles.sectionCount}>{lowTasks.length}</Text>
        </View>
        {lowTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </View>
    </ScrollView>
  )

  const renderKanban = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kanbanContainer}>
      <View style={styles.kanbanColumn}>
        <View style={styles.columnHeader}>
          <Text style={styles.columnTitle}>Pendiente</Text>
          <Text style={styles.columnCount}>{pendingTasks.length}</Text>
        </View>
        {pendingTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </View>

      <View style={styles.kanbanColumn}>
        <View style={styles.columnHeader}>
          <Text style={styles.columnTitle}>En Progreso</Text>
          <Text style={styles.columnCount}>{inProgressTasks.length}</Text>
        </View>
        {inProgressTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </View>

      <View style={styles.kanbanColumn}>
        <View style={styles.columnHeader}>
          <Text style={styles.columnTitle}>Completada</Text>
          <Text style={styles.columnCount}>{completedTasks.length}</Text>
        </View>
        {completedTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </View>
    </ScrollView>
  )

  const renderCalendario = () => (
    <View style={styles.calendarContainer}>
      <Calendar
        current={new Date().toISOString()}
        markedDates={markedDates}
        markingType="dot"
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: Colors.background,
          calendarBackground: Colors.white,
          textSectionTitleColor: Colors.textSecondary,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: Colors.white,
          todayTextColor: Colors.primary,
          dayTextColor: Colors.textPrimary,
          textDisabledColor: '#D1D5DB',
          dotColor: Colors.primary,
          arrowColor: Colors.primary,
        }}
      />
      {selectedDate && (
        <View style={styles.dateTasks}>
          <Text style={styles.dateTasksTitle}>
            Tareas para {new Date(selectedDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' })}
          </Text>
          {filteredTasks.filter(t => t.due_date?.split('T')[0] === selectedDate).map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </View>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tareas</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'lista' && styles.toggleActive]}
            onPress={() => setView('lista')}
          >
            <Ionicons name="list" size={20} color={view === 'lista' ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'kanban' && styles.toggleActive]}
            onPress={() => setView('kanban')}
          >
            <Ionicons name="grid" size={20} color={view === 'kanban' ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'calendario' && styles.toggleActive]}
            onPress={() => setView('calendario')}
          >
            <Ionicons name="calendar" size={20} color={view === 'calendario' ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {view === 'lista' && renderLista()}
      {view === 'kanban' && renderKanban()}
      {view === 'calendario' && renderCalendario()}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/task/new')}
      >
        <View style={styles.fabContent}>
          <Ionicons name="add" size={24} color={Colors.white} />
          <Text style={styles.fabLabel}>Nueva tarea</Text>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    padding: 8,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
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
  kanbanContainer: {
    flex: 1,
    padding: 20,
  },
  kanbanColumn: {
    width: 280,
    marginRight: 16,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  columnCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  calendarContainer: {
    flex: 1,
    padding: 20,
  },
  dateTasks: {
    marginTop: 16,
  },
  dateTasksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
})