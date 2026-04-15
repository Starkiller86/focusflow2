import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/colors'

export interface Plantilla {
  id: string
  categoria: string
  nombre: string
  subtareas: string[]
}

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'academic-project',
    categoria: 'Académico',
    nombre: 'Proyecto de investigación',
    subtareas: [
      'Elegir tema de investigación',
      'Buscar fuentes bibliográficas',
      'Leer y tomar notas',
      'Elaborar esquema',
      'Redactar introducción',
      'Desarrollar cuerpo',
      'Conclusiones',
      'Revisar y corregir',
      'Formatear según normas',
      'Entregar',
    ],
  },
  {
    id: 'academic-exam',
    categoria: 'Académico',
    nombre: 'Preparar examen',
    subtareas: [
      'Revisar temario',
      'Repasar notas de clase',
      'Leer libro/material',
      'Hacer resúmenes',
      'Crear flashcards',
      'Practicar con ejercicios',
      'Simulacro de examen',
      'Repasar errores',
    ],
  },
  {
    id: 'home-cleaning',
    categoria: 'Hogar',
    nombre: 'Limpieza general',
    subtareas: [
      'Sala y comedor',
      'Cocina',
      'Baños',
      'Habitaciones',
      'Aspirar/barrer pisos',
      'Trapear',
      'Limpiar ventanas',
      'Sacar basura',
    ],
  },
  {
    id: 'home-organization',
    categoria: 'Hogar',
    nombre: 'Organizar closet',
    subtareas: [
      'Retirar toda la ropa',
      'Clasificar por categorías',
      'Desechar lo innecesario',
      'Lavar ropa guardada',
      'Organizar por temporadas',
      'Colocar todo en su lugar',
    ],
  },
  {
    id: 'work-project',
    categoria: 'Trabajo',
    nombre: 'Proyecto de trabajo',
    subtareas: [
      'Definir alcance',
      'Reunión de kickoff',
      'Asignar responsabilidades',
      'Primera entrega parcial',
      'Revisión intermedia',
      'Ajustes y correcciones',
      'Entrega final',
      'Retrospectiva',
    ],
  },
  {
    id: 'work-meeting',
    categoria: 'Trabajo',
    nombre: 'Preparar reunión',
    subtareas: [
      'Definir agenda',
      'Enviar invitaciones',
      'Preparar presentación',
      'Revisar materiales',
      'Preparar sala/virtual',
      'Tomar notas',
      'Enviar minuta',
    ],
  },
  {
    id: 'personal-fitness',
    categoria: 'Personal',
    nombre: 'Rutina de ejercicio semanal',
    subtareas: [
      'Lunes: Pecho y tríceps',
      'Martes: Espalda y bíceps',
      'Miércoles: Cardio',
      'Jueves: Piernas',
      'Viernes: Hombros y abdomen',
      'Sábado: Cardio ligero',
      'Domingo: Descanso activo',
    ],
  },
  {
    id: 'personal-health',
    categoria: 'Personal',
    nombre: 'Revisión médica',
    subtareas: [
      'Agendar cita',
      'Revisar documentos necesarios',
      'Preparar preguntas para el médico',
      'Listar medicamentos actuales',
      'Preparar historial médico',
      'Ir a la cita',
      'Seguir recomendaciones',
    ],
  },
  {
    id: 'travel-trip',
    categoria: 'Viaje',
    nombre: 'Planear viaje',
    subtareas: [
      'Definir destino y fechas',
      'Buscar vuelos/hotel',
      'Hacer reservaciones',
      'Investigar actividades',
      'Preparar itinerario',
      'Hacer lista de equipaje',
      'Revisar documentos',
      'Organizar finanzas',
    ],
  },
  {
    id: 'study-course',
    categoria: 'Aprendizaje',
    nombre: 'Nuevo curso online',
    subtareas: [
      'Investigación de plataformas',
      'Inscripción',
      'Revisar syllabus',
      'Crear horario de estudio',
      'Ver lecciones semana 1',
      'Hacer ejercicios',
      'Evaluación parcial',
      'Proyecto final',
    ],
  },
]

const CATEGORIAS = ['Todas', 'Académico', 'Hogar', 'Trabajo', 'Personal', 'Viaje', 'Aprendizaje']

interface TemplateSelectorProps {
  visible: boolean
  onClose: () => void
  onSelect: (plantilla: Plantilla) => void
}

export default function TemplateSelector({ visible, onClose, onSelect }: TemplateSelectorProps) {
  const [categoria, setCategoria] = useState('Todas')
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<Plantilla | null>(null)

  const plantillasFiltradas = categoria === 'Todas'
    ? PLANTILLAS
    : PLANTILLAS.filter((p) => p.categoria === categoria)

  const handleSelect = (plantilla: Plantilla) => {
    setPlantillaSeleccionada(plantilla)
  }

  const handleConfirm = () => {
    if (plantillaSeleccionada) {
      onSelect(plantillaSeleccionada)
      onClose()
      setPlantillaSeleccionada(null)
      setCategoria('Todas')
    }
  }

  const handleClose = () => {
    setPlantillaSeleccionada(null)
    setCategoria('Todas')
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Plantillas</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, categoria === cat && styles.categoryChipActive]}
                onPress={() => setCategoria(cat)}
              >
                <Text style={[styles.categoryText, categoria === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {plantillasFiltradas.map((plantilla) => (
              <TouchableOpacity
                key={plantilla.id}
                style={[
                  styles.plantillaCard,
                  plantillaSeleccionada?.id === plantilla.id && styles.plantillaCardSelected,
                ]}
                onPress={() => handleSelect(plantilla)}
              >
                <View style={styles.plantillaInfo}>
                  <Text style={styles.plantillaName}>{plantilla.nombre}</Text>
                  <Text style={styles.plantillaCategory}>{plantilla.categoria}</Text>
                  <Text style={styles.plantillaCount}>
                    {plantilla.subtareas.length} subtareas
                  </Text>
                </View>
                {plantillaSeleccionada?.id === plantilla.id && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {plantillaSeleccionada && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Vista previa:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {plantillaSeleccionada.subtareas.slice(0, 5).map((subtarea, index) => (
                  <View key={index} style={styles.previewItem}>
                    <Text style={styles.previewNumber}>{index + 1}</Text>
                    <Text style={styles.previewText} numberOfLines={1}>
                      {subtarea}
                    </Text>
                  </View>
                ))}
                {plantillaSeleccionada.subtareas.length > 5 && (
                  <View style={styles.previewMore}>
                    <Text style={styles.previewMoreText}>
                      +{plantillaSeleccionada.subtareas.length - 5} más
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            style={[styles.confirmBtn, !plantillaSeleccionada && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!plantillaSeleccionada}
          >
            <Text style={styles.confirmBtnText}>Usar plantilla</Text>
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoriesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Colors.white,
  },
  list: {
    flex: 1,
  },
  plantillaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  plantillaCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  plantillaInfo: {
    flex: 1,
  },
  plantillaName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  plantillaCategory: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  plantillaCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  previewContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  previewItem: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 140,
  },
  previewNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 6,
  },
  previewText: {
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
  },
  previewMore: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
  },
  previewMoreText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})
