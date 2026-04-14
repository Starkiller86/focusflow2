const TEMPLATES: Record<string, string[]> = {
  academico: [
    'Repasar apuntes', 'Leer el capítulo', 'Hacer resumen',
    'Practicar ejercicios', 'Revisar dudas', 'Preparar preguntas',
  ],
  hogar: [
    'Recoger el área', 'Limpiar superficies', 'Organizar cajones',
    'Tirar lo innecesario', 'Pasar la aspiradora',
  ],
  trabajo: [
    'Definir objetivos', 'Investigar el tema', 'Hacer borrador',
    'Revisar con equipo', 'Ajustar detalles', 'Entregar',
  ],
  ejercicio: [
    'Calentar 5 min', 'Ejercicio principal', 'Estiramientos',
    'Hidratarse', 'Registrar progreso',
  ],
  compras: [
    'Hacer lista', 'Revisar despensa', 'Ir al mercado',
    'Comparar precios', 'Guardar compras',
  ],
}

const KEYWORDS: Record<string, string[]> = {
  academico: ['estudiar','leer','examen','aprender','investigar','tarea','clase'],
  hogar:     ['limpiar','ordenar','organizar','barrer','cocinar','casa'],
  trabajo:   ['proyecto','informe','presentación','desarrollar','reunión','trabajo'],
  ejercicio: ['gimnasio','entrenar','correr','deporte','ejercicio','pesas'],
  compras:   ['comprar','supermercado','mercado','tienda','ir por'],
}

export function suggestSubtasks(title: string, description = ''): string[] {
  const text = (title + ' ' + description).toLowerCase()
  let category = 'trabajo' // default

  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => text.includes(w))) {
      category = cat
      break
    }
  }

  return TEMPLATES[category].slice(0, 5)
}