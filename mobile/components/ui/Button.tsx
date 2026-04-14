import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native'
import { Colors } from '../../constants/colors'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const variants = {
    primary: { bg: Colors.primary, text: Colors.white },
    secondary: { bg: Colors.secondary, text: Colors.white },
    outline: { bg: 'transparent', text: Colors.primary },
    danger: { bg: Colors.error, text: Colors.white },
  }

  const sizes = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
    large: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18 },
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variants[variant].bg,
          paddingVertical: sizes[size].paddingVertical,
          paddingHorizontal: sizes[size].paddingHorizontal,
        },
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variants[variant].text} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: variants[variant].text, fontSize: sizes[size].fontSize },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
})