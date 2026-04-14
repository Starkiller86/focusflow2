import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'

interface SubtaskListProps {
  subtasks: string[]
  completed?: string[]
  onToggle?: (index: number) => void
  onDelete?: (index: number) => void
}

export default function SubtaskList({ subtasks, completed = [], onToggle, onDelete }: SubtaskListProps) {
  if (subtasks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No hay subtareas</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {subtasks.map((subtask, index) => {
        const isCompleted = completed.includes(subtask)
        return (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => onToggle?.(index)}
            onLongPress={() => onDelete?.(index)}
          >
            <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
              {isCompleted && (
                <Ionicons name="checkmark" size={14} color={Colors.white} />
              )}
            </View>
            <Text style={[styles.text, isCompleted && styles.textCompleted]}>
              {subtask}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
})