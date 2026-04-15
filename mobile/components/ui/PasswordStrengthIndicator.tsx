import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'

interface PasswordStrengthIndicatorProps {
  password: string
}

interface Check {
  label: string
  test: (pwd: string) => boolean
}

const checks: Check[] = [
  { label: 'Mínimo 8 caracteres', test: (pwd) => pwd.length >= 8 },
  { label: 'Al menos una mayúscula', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Al menos una minúscula', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Al menos un número', test: (pwd) => /[0-9]/.test(pwd) },
]

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  return (
    <View style={styles.container}>
      {checks.map((check, index) => {
        const passed = check.test(password)
        return (
          <View key={index} style={styles.row}>
            <Ionicons
              name={passed ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={passed ? Colors.success : Colors.textSecondary}
            />
            <Text style={[styles.label, passed && styles.labelPassed]}>
              {check.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

export function isPasswordValid(password: string): boolean {
  return checks.every((check) => check.test(password))
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  labelPassed: {
    color: Colors.success,
    fontWeight: '500',
  },
})
