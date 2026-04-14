import supabase from '../config/supabase.js';

export function authorizeMonitorOfPatient(paramName = 'patientId') {
  return async (req, res, next) => {
    try {
      const patientId = req.params[paramName] || req.body[paramName];

      if (!patientId) {
        return res.status(400).json({ error: 'ID de paciente requerido' });
      }

      const { data, error } = await supabase
        .from('monitor_patient')
        .select('id')
        .eq('monitor_id', req.user.id)
        .eq('patient_id', patientId)
        .single();

      if (error || !data) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este paciente' });
      }

      req.patientId = patientId;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export function authorizeMonitorOfTask() {
  return async (req, res, next) => {
    try {
      const taskId = req.params.id;

      if (!taskId) {
        return res.status(400).json({ error: 'ID de tarea requerido' });
      }

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('user_id')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      const { data, error } = await supabase
        .from('monitor_patient')
        .select('id')
        .eq('monitor_id', req.user.id)
        .eq('patient_id', task.user_id)
        .single();

      if (error || !data) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a esta tarea' });
      }

      req.patientId = task.user_id;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export function authorizeMonitorOfUser() {
  return async (req, res, next) => {
    try {
      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }

      const { data, error } = await supabase
        .from('monitor_patient')
        .select('id')
        .eq('monitor_id', req.user.id)
        .eq('patient_id', userId)
        .single();

      if (error || !data) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este paciente' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
