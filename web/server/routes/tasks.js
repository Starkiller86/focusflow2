import express from 'express';
import supabase from '../config/supabase.js';
import authenticate from '../middleware/auth.js';
import { authorizeMonitorOfTask } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { data: patients, error: patientsError } = await supabase
      .from('monitor_patient')
      .select('patient_id')
      .eq('monitor_id', req.user.id);

    if (patientsError) throw patientsError;

    if (!patients || patients.length === 0) {
      return res.json({ tasks: [] });
    }

    const patientIds = patients.map(p => p.patient_id);

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('user_id', patientIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (tasksError) throw tasksError;
    res.json({ tasks: tasks || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, priority } = req.query;

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', patientId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;

    if (error) throw error;
    res.json({ tasks: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { user_id, title, description, priority, due_date } = req.body;

    if (!user_id || !title) {
      return res.status(400).json({ error: 'user_id y title son requeridos' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id,
          title,
          description,
          priority: priority || 'media',
          status: 'pendiente',
          due_date
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Tarea creada', task: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, authorizeMonitorOfTask(), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date } = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .update({ title, description, status, priority, due_date })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Tarea actualizada', task: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorizeMonitorOfTask(), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
