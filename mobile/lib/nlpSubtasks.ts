const TEMPLATES: Record<string, string[]> = {
  academico: [
    'Repasar apuntes de clase',
    'Leer el capítulo o material',
    'Hacer resumen de lo aprendido',
    'Practicar con ejercicios',
    'Revisar dudas con profesor',
    'Preparar preguntas para evaluar',
    'Autoevaluación final',
  ],
  hogar: [
    'Recoger el área',
    'Limpiar superficies',
    'Organizar cajones',
    'Tirar lo innecesario',
    'Pasar la aspiradora',
    'Limpiar pisos',
  ],
  trabajo: [
    'Definir objetivos del proyecto',
    'Investigar el tema',
    'Hacer borrador inicial',
    'Revisar con el equipo',
    'Ajustar detalles',
    'Preparar presentación',
    'Entregar resultado final',
  ],
  ejercicio: [
    'Calentar 5-10 minutos',
    'Ejercicio principal',
    'Cardio (si aplica)',
    'Estiramientos',
    'Hidratarse',
    'Registrar progreso',
  ],
  compras: [
    'Hacer lista de compras',
    'Revisar despensa/nevera',
    'Ir al mercado/supermercado',
    'Comparar precios',
    'Comprar lo necesario',
    'Guardar compras',
  ],
  estudiar: [
    'Recopilar material de estudio',
    'Leer y resumir conceptos clave',
    'Crear notas y esquemas',
    'Elaborar preguntas de práctica',
    'Realizar ejercicios',
    'Repasar lo aprendido',
    'Autoevaluación final',
  ],
  limpiar: [
    'Retirar objetos del área',
    'Clasificar por categorías',
    'Desechar lo innecesario',
    'Limpiar superficies',
    'Organizar por uso',
    'Colocar todo en su lugar',
  ],
  proyecto: [
    'Definir objetivo del proyecto',
    'Listar tareas necesarias',
    'Investigar y recopilar recursos',
    'Crear estructura inicial',
    'Desarrollar contenido principal',
    'Revisar y corregir',
    'Entregar o presentar',
  ],
  cocinar: [
    'Revisar ingredientes disponibles',
    'Preparar utensilios',
    'Picar y medir ingredientes',
    'Cocinar siguiendo la receta',
    'Emplatar y servir',
    'Lavar utensilios',
  ],
  mudanza: [
    'Hacer inventario de pertenencias',
    'Conseguir cajas y materiales',
    'Empacar por habitación',
    'Contratar o coordinar transporte',
    'Cargar y transportar',
    'Desempacar',
    'Organizar el nuevo espacio',
  ],
  medico: [
    'Agendar cita médica',
    'Preparar documentos necesarios',
    'Listar medicamentos actuales',
    'Preparar preguntas para el médico',
    'Ir a la cita',
    'Seguir recomendaciones',
    'Agendar seguimiento',
  ],
  viaje: [
    'Definir destino y fechas',
    'Buscar vuelos y alojamiento',
    'Hacer reservaciones',
    'Investigar actividades',
    'Preparar itinerario',
    'Hacer lista de equipaje',
    'Revisar documentos de viaje',
  ],
}

const KEYWORDS: Record<string, string[]> = {
  academico: ['estudiar', 'leer', 'examen', 'aprender', 'investigar', 'tarea', 'clase', 'curso', 'tesis', 'tarea'],
  hogar: ['limpiar', 'ordenar', 'organizar', 'barrer', 'cocinar', 'casa', 'lavar', 'planchar'],
  trabajo: ['proyecto', 'informe', 'presentación', 'desarrollar', 'reunión', 'trabajo', 'oficina', 'cliente'],
  ejercicio: ['gimnasio', 'entrenar', 'correr', 'deporte', 'ejercicio', 'pesas', 'yoga', 'crossfit'],
  compras: ['comprar', 'supermercado', 'mercado', 'tienda', 'ir por', 'lista de compras'],
  estudiar: ['estudiar', 'preparar examen', 'repasar', 'revisar material'],
  limpiar: ['limpiar', 'barrer', 'trapeador', 'aspirar', 'lavar'],
  proyecto: ['proyecto', 'desarrollar', 'crear', 'construir'],
  cocinar: ['cocinar', 'receta', 'preparar comida', 'hornear'],
  mudanza: ['mudanza', 'mudarme', 'cambiar de casa', 'empacar'],
  medico: ['médico', 'doctor', 'cita médica', 'consulta', 'salud'],
  viaje: ['viaje', 'vacaciones', 'turismo', 'volar', 'hotel'],
}

export function suggestSubtasks(title: string, description = ''): string[] {
  const text = (title + ' ' + description).toLowerCase()
  let category = 'trabajo'

  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => text.includes(w))) {
      category = cat
      break
    }
  }

  return TEMPLATES[category]?.slice(0, 6) || TEMPLATES.trabajo.slice(0, 6)
}
