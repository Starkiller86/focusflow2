export const AppConfig = {
  appName: 'FocusFlow',
  version: '1.0.0',
  
  // Puntos por completar tareas
  points: {
    alta: 100,
    media: 50,
    baja: 20,
    bonus_deadline: 25,
    bonus_streak: 10,
    focus_multiplier: 1.5,
  },
  
  // Límites
  maxSubtasks: 8,
  maxTasksInFocus: 5,
  
  // Tiempos de bloqueo (minutos)
  loginAttempts: 5,
  blockTime: 15,
  
  // Juegos de mascota por día
  maxPetGames: 3,
  
  // Rangos de nivel
  levelRanges: {
    aprendiz: 10,
    explorador: 25,
    especialista: 50,
    experto: 75,
    maestro: 100,
  },
  
  // Especie de mascotas
  species: ['perro', 'gato', 'loro', 'lobo', 'toro', 'vaca', 'pez', 'capibara', 'panda'],
}