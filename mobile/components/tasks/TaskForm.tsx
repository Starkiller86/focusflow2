import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Colors } from '../../constants/colors'
import { useState } from 'react'

interface TaskFormProps {
  initialData?: {
    title?: string
    description?: string
    priority?: 'alta' | 'media' | 'baja'
    due_date?: string
  }
  onSubmit: (data: {
    title: string
    description: string
    priority: 'alta' | 'media' | 'baja'
    due_date?: string
  }) => void
  onCancel: () => void
}

export default function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [priority, setPriority] = useState<'alta' | 'media' | 'baja'>(initialData?.priority || 'media')

  const priorities = [
    { key: 'alta', label: 'Alta', color: Colors.priorityHigh },
    { key: 'media', label: 'Media', color: Colors.priorityMedium },
    { key: 'baja', label: 'Baja', color: Colors.priorityLow },
  ]

  const handleSubmit = () => {
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: initialData?.due_date,
    })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="¿Qué necesitas hacer?"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />
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
          {priorities.map((p) => (
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

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, !title.trim() && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={!title.trim()}
        >
          <Text style={styles.submitText}>Guardar</Text>
        </TouchableOpacity>
      </View>
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
    color: Colors.textSecondary,
  },
  priorityTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: Colors.white,
    fontWeight: '600',
  },
})