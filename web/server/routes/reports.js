import express from 'express';
import supabase from '../config/supabase.js';
import authenticate from '../middleware/auth.js';
import { authorizeMonitorOfPatient } from '../middleware/authorize.js';

const router = express.Router();

router.get('/:patientId', authenticate, authorizeMonitorOfPatient('patientId'), async (req, res) => {
  try {
    const { patientId } = req.params;
    const { from, to } = req.query;

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', patientId);

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data: tasks, error } = await query;

    if (error) throw error;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completada').length;
    const pendingTasks = tasks.filter(t => t.status === 'pendiente').length;
    const inProgressTasks = tasks.filter(t => t.status === 'en_progreso').length;

    const productivityRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    const byPriority = {
      alta: tasks.filter(t => t.priority === 'alta').length,
      media: tasks.filter(t => t.priority === 'media').length,
      baja: tasks.filter(t => t.priority === 'baja').length
    };

    const byStatus = {
      completada: completedTasks,
      pendiente: pendingTasks,
      en_progreso: inProgressTasks
    };

    const completionByDay = {};
    tasks.forEach(task => {
      if (task.status === 'completada' && task.created_at) {
        const day = new Date(task.created_at).toISOString().split('T')[0];
        completionByDay[day] = (completionByDay[day] || 0) + 1;
      }
    });

    res.json({
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        productivityRate
      },
      byPriority,
      byStatus,
      completionByDay,
      tasks: tasks.slice(0, 50)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
