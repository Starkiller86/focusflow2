import { useState, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal, Platform, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { useTaskStore } from '../../stores/taskStore'
import { Colors } from '../../constants/colors'
import { suggestSubtasks } from '../../lib/nlpSubtasks'
import { Calendar } from 'react-native-calendars'
import TemplateSelector, { Plantilla } from '../../components/TemplateSelector'

export default function NewTaskScreen() {
  const { user } = useAuthStore()
  const { createTask } = useTaskStore()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'alta' | 'media' | 'baja'>('media')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [showSubtasksModal, setShowSubtasksModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [markedDates, setMarkedDates] = useState<{[key: string]: {marked: boolean, dotColor: string}}>({})
  const [showTemplates, setShowTemplates] = useState(false)
  const dueDateRef = useRef<Date | null>(null)

  const priorities = [
    { key: 'alta', label: 'Alta', color: Colors.priorityHigh },
    { key: 'media', label: 'Media', color: Colors.priorityMedium },
    { key: 'baja', label: 'Baja', color: Colors.priorityLow },
  ]

  const handleSuggestSubtasks = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Primero ingresa un título para la tarea')
      return
    }
    const suggestions = suggestSubtasks(title, description)
    setSuggestedSubtasks(suggestions)
    setShowSubtasks(true)
  }

  const handleSave = async () => {
    if (!user) return
    
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido')
      return
    }

    if (title.length > 200) {
      Alert.alert('Error', 'El título no può dépassar 200 caracteres')
      return
    }

    setLoading(true)
    
    try {
      console.log('📝 [new-task] Creando tarea...')
      const finalDueDate = dueDateRef.current || dueDate
      await createTask({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status: 'pendiente',
        due_date: finalDueDate?.toISOString(),
      })
      console.log('✅ [new-task] Tarea creada exitosamente')
      
      router.back()
    } catch (error: any) {
      console.error('❌ [new-task] Error:', error)
      Alert.alert('Error', error?.message || 'No se pudo crear la tarea')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (plantilla: Plantilla) => {
    setTitle(plantilla.nombre)
    setSuggestedSubtasks(plantilla.subtareas)
    setShowSubtasks(true)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelBtn}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Tarea</Text>
        <TouchableOpacity
          style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!title.trim() || loading}
        >
          <Text style={styles.saveBtnText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <View style={styles.field}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="¿Qué necesitas hacer?"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
          <Text style={styles.charCount}>{title.length}/200</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Agrega más detalles..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.priorityRow}>
            {priorities.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.priorityBtn,
                  priority === p.key && { backgroundColor: p.color },
                ]}
                onPress={() => setPriority(p.key as 'alta' | 'media' | 'baja')}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === p.key && styles.priorityTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Fecha límite</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.dateBtnText}>
              {dueDate ? dueDate.toLocaleDateString('es-MX') : 'Seleccionar fecha'}
            </Text>
          </TouchableOpacity>
          {dueDate && (
            <TouchableOpacity onPress={() => setDueDate(null)}>
              <Text style={styles.clearDate}>Limpiar fecha</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal visible={showCalendar} animationType="slide" transparent>
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Seleccionar fecha</Text>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <Text style={styles.calendarClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <Calendar
                current={new Date().toISOString()}
                minDate={new Date().toISOString()}
                onDayPress={(day: { dateString: string }) => {
                  const selectedDate = new Date(day.dateString)
                  dueDateRef.current = selectedDate
                  setDueDate(selectedDate)
                  setMarkedDates({
                    [day.dateString]: { marked: true, dotColor: Colors.primary }
                  })
                  setShowCalendar(false)
                }}
                markedDates={markedDates}
                theme={{
                  backgroundColor: Colors.white,
                  calendarBackground: Colors.white,
                  selectedDayBackgroundColor: Colors.primary,
                  selectedDayTextColor: Colors.white,
                  todayTextColor: Colors.primary,
                  dayTextColor: Colors.textPrimary,
                  arrowColor: Colors.primary,
                  monthTextColor: Colors.textPrimary,
                  textDayFontWeight: '400',
                  textMonthFontWeight: '600',
                  textDayHeaderFontWeight: '500',
                }}
              />
              <TouchableOpacity
                style={styles.calendarCancelBtn}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.calendarCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.suggestBtn}
          onPress={() => setShowTemplates(true)}
        >
          <Text style={styles.suggestBtnText}>Usar plantilla</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.suggestBtn, { marginTop: 8 }]}
          onPress={handleSuggestSubtasks}
        >
          <Text style={styles.suggestBtnText}>Dividir en subtareas (IA)</Text>
        </TouchableOpacity>

        <Modal visible={showSubtasks} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Subtareas sugeridas</Text>
              <ScrollView>
                {suggestedSubtasks.map((subtask, index) => (
                  <View key={index} style={styles.subtaskItem}>
                    <Text style={styles.subtaskText}>{subtask}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setShowSubtasks(false)}
              >
                <Text style={styles.modalBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TemplateSelector
          visible={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelect={handleSelectTemplate}
        />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cancelBtn: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  formContent: {
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
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  priorityTextActive: {
    color: Colors.white,
  },
  dateBtn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateBtnText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  clearDate: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 8,
  },
  suggestBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  suggestBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  modalBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  subtaskItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subtaskText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    width: '100%',
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  calendarClose: {
    fontSize: 20,
    color: Colors.textSecondary,
    padding: 8,
  },
  calendarCancelBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  calendarCancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
})