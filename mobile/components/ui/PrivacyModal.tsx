import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'

interface PrivacyModalProps {
  visible: boolean
  onClose: () => void
}

export default function PrivacyModal({ visible, onClose }: PrivacyModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Aviso de Privacidad</Text>
          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>1. Datos que recopilamos</Text>
            <Text style={styles.text}>
              FocusFlow recopila los siguientes datos personales:{'\n'}
              • Nombre y correo electrónico{'\n'}
              • Foto de perfil (opcional){'\n'}
              • Tareas y preferencias{'\n'}
              • Datos de gamificación (puntos, niveles, rachas)
            </Text>
            
            <Text style={styles.sectionTitle}>2. Finalidad del tratamiento</Text>
            <Text style={styles.text}>
              Tus datos se utilizan para:{'\n'}
              • Proporcionarte el servicio de gestión de tareas{'\n'}
              • Personalizar tu experiencia{'\n'}
              • Mejorar la gamificación{'\n'}
              • Comunicarte notificaciones relevantes
            </Text>
            
            <Text style={styles.sectionTitle}>3. Derechos ARCO</Text>
            <Text style={styles.text}>
              Tienes derecho a:{'\n'}
              • Acceder a tus datos{'\n'}
              • Rectificarlos{'\n'}
              • Cancelarlos{'\n'}
              • Oponerte a su tratamiento
            </Text>
            
            <Text style={styles.sectionTitle}>4. Periodo de conservación</Text>
            <Text style={styles.text}>
              Tus datos se conservarán mientras tengas una cuenta activa. 
              Puedes solicitar su eliminación en cualquier momento.
            </Text>
            
            <Text style={styles.sectionTitle}>5. Contacto</Text>
            <Text style={styles.text}>
              Para ejercer tus derechos o dudas:{'\n'}
              contacto@focusflow.app
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  content: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
})