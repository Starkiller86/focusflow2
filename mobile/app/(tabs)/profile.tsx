import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useAuthStore } from '../../stores/authStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { Colors } from '../../constants/colors'
import { supabase } from '../../lib/supabase'
import * as Haptics from 'expo-haptics'

export default function ProfileScreen() {
  const { user, setUser, signOut } = useAuthStore()
  const { data: gamData, fetch: fetchGam } = useGamificationStore()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)

  useEffect(() => {
    if (user) {
      fetchGam(user.id)
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completada')
    setTasksCompleted(count || 0)
  }

  const handlePickImage = async () => {
    console.log('📝 [profile] Iniciando selección de imagen...')
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (result.canceled) {
        console.log('📝 [profile] Usuario canceló selección')
        return
      }

      const uri = result.assets[0].uri
      const ext = uri.split('.').pop() || 'jpg'
      const path = `${user!.id}/avatar.${ext}`
      const contentType = result.assets[0].type || 'image/jpeg'

      console.log('📝 [profile] Subiendo a:', path, 'contentType:', contentType)

      const response = await fetch(uri)
      const blob = await response.blob()
      console.log('📝 [profile] Blob creado, tamaño:', blob.size, 'tipo:', blob.type)

      const { data: uploadData, error } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { 
          upsert: true,
          contentType: contentType,
        })

      if (error) {
        console.error('❌ [profile] Error de upload:', JSON.stringify(error))
        Alert.alert('Error', 'No fue posible subir la foto: ' + error.message)
        return
      }

      console.log('✅ [profile] Upload exitoso:', uploadData)

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = publicUrlData.publicUrl

      console.log('📝 [profile] Public URL:', publicUrl)

      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user!.id)

      if (user) {
        setUser({ ...user, avatar_url: publicUrl })
      }
      
      Alert.alert('Éxito', 'Foto de perfil actualizada')
    } catch (err: any) {
      console.error('❌ [profile] Error general:', err)
      Alert.alert('Error', 'No fue posible subir la foto: ' + err?.message)
    }
  }

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return

    setLoading(true)
    await supabase.from('users').update({ name: newName.trim() }).eq('id', user.id)
    setUser({ ...user, name: newName.trim() })
    setLoading(false)
    setEditingName(false)
    setNewName('')
  }

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar', style: 'destructive', onPress: async () => {
          await signOut()
          router.replace('/(auth)/login')
        }},
      ]
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Perfil</Text>

      <TouchableOpacity style={styles.avatarSection} onPress={handlePickImage}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={16} color={Colors.white} />
        </View>
        <Text style={styles.changePhoto}>Cambiar foto</Text>
      </TouchableOpacity>

      {editingName ? (
        <View style={styles.editNameSection}>
          <TextInput
            style={styles.nameInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Tu nombre"
          />
          <View style={styles.editActions}>
            <TouchableOpacity onPress={() => setEditingName(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName} disabled={loading}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => { setNewName(user?.name || ''); setEditingName(true) }}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.editName}>Editar nombre</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{gamData?.level || 1}</Text>
          <Text style={styles.statLabel}>Nivel</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{gamData?.points || 0}</Text>
          <Text style={styles.statLabel}>Puntos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tasksCompleted}</Text>
          <Text style={styles.statLabel}>Tareas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{gamData?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>Racha</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
        <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        <Text style={styles.menuText}>Configuración</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/monitor-requests')}>
        <Ionicons name="people-outline" size={24} color={Colors.textPrimary} />
        <Text style={styles.menuText}>Solicitudes de Monitoreo</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>FocusFlow v1.0.0</Text>
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
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    color: Colors.white,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: Colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhoto: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  editName: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  editNameSection: {
    marginBottom: 16,
  },
  nameInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  saveText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '10',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    marginLeft: 12,
  },
  version: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
})