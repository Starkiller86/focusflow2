import express from 'express';
import supabase from '../config/supabase.js';
import authenticate from '../middleware/auth.js';
import { authorizeMonitorOfUser } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { data: patients, error } = await supabase
      .from('monitor_patient')
      .select(`
        id,
        patient:users!patient_id(
          id,
          name,
          email,
          created_at
        )
      `)
      .eq('monitor_id', req.user.id);

    if (error) throw error;

    const formattedPatients = patients.map(p => p.patient);
    res.json({ patients: formattedPatients });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email y password son requeridos' });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) throw authError;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          role: 'paciente'
        }
      ])
      .select()
      .single();

    if (userError) throw userError;

    const { error: relationError } = await supabase
      .from('monitor_patient')
      .insert([
        {
          monitor_id: req.user.id,
          patient_id: userData.id
        }
      ]);

    if (relationError) throw relationError;

    await supabase.from('gamification').insert([
      { user_id: userData.id, points: 0, level: 1 }
    ]);

    res.status(201).json({ 
      message: 'Paciente creado exitosamente',
      patient: userData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, authorizeMonitorOfUser(), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ name, email })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Paciente actualizado', patient: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorizeMonitorOfUser(), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Paciente desactivado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
