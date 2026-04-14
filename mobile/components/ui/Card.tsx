import { View, StyleSheet, ViewStyle } from 'react-native'
import { Colors } from '../../constants/colors'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  style?: ViewStyle
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
})