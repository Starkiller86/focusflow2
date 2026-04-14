import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, TextInput } from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '../stores/authStore'
import { Colors } from '../constants/colors'
import PrivacyModal from '../components/ui/PrivacyModal'
import { supabase } from '../lib/supabase'

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore()
  const [notifications, setNotifications] = useState(true)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  const handleToggleNotifications = async (value: boolean) => {
    setNotifications(value)
    await AsyncStorage.setItem('notifications', value ? 'true' : 'false')
  }

  const handleChangePassword = async () => {
    Alert.alert('Cambiar Contraseña', 'Esta función requiere configuración SMTP en Supabase. Usa la web para recuperar contraseña.')
  }

  const handleExportData = async () => {
    if (!user) return

    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', user.id)
    const { data: gam } = await supabase.from('gamification').select('*').eq('user_id', user.id)

    const exportData = {
      user: { name: user.name, email: user.email },
      tasks,
      gamification: gam,
      exportedAt: new Date().toISOString(),
    }

    Alert.alert('Datos exportados', JSON.stringify(exportData, null, 2))
  }

  const handleDeleteAccount = async () => {
    if (deleteText.toLowerCase() !== 'eliminar') {
      Alert.alert('Error', 'Escribe "eliminar" para confirmar')
      return
    }

    if (!user) return

    Alert.alert('Eliminar Cuenta', 'Esta acción es irreversible. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('users').delete().eq('id', user.id)
          await signOut()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
          <Text style={styles.menuText}>Cambiar contraseña</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidad</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => setShowPrivacy(true)}>
          <Text style={styles.menuText}>Ver Aviso de Privacidad</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
          <Text style={styles.menuText}>Exportar mis datos</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <View style={styles.toggleItem}>
          <Text style={styles.menuText}>Activar notificaciones</Text>
          <Switch
            value={notifications}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#D1D5DB', true: Colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zona Peligrosa</Text>

        <TouchableOpacity
          style={[styles.menuItem, styles.dangerItem]}
          onPress={() => setShowDeleteConfirm(true)}
        >
          <Text style={styles.dangerText}>Eliminar cuenta</Text>
        </TouchableOpacity>
      </View>

      {showDeleteConfirm && (
        <View style={styles.confirmDelete}>
          <Text style={styles.confirmText}>
            Escribe "eliminar" para confirmar la eliminación de tu cuenta
          </Text>
          <TextInput
            style={styles.deleteInput}
            value={deleteText}
            onChangeText={setDeleteText}
            placeholder='Escribe "eliminar"'
          />
          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setShowDeleteConfirm(false); setDeleteText('') }}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, deleteText.toLowerCase() !== 'eliminar' && styles.confirmBtnDisabled]}
              onPress={handleDeleteAccount}
              disabled={deleteText.toLowerCase() !== 'eliminar'}
            >
              <Text style={styles.confirmBtnText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </ScrollView>
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
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  dangerItem: {
    backgroundColor: Colors.error + '10',
  },
  dangerText: {
    fontSize: 16,
    color: Colors.error,
  },
  confirmDelete: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    margin: 20,
  },
  confirmText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  deleteInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: Colors.white,
    fontWeight: '600',
  },
})