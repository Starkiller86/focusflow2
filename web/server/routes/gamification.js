import express from 'express';
import supabase from '../config/supabase.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

router.get('/rewards', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*');

    if (error) throw error;
    res.json({ rewards: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rewards', authenticate, async (req, res) => {
  try {
    const { name, description, cost } = req.body;

    if (!name || !cost) {
      return res.status(400).json({ error: 'Name y cost son requeridos' });
    }

    const { data, error } = await supabase
      .from('rewards')
      .insert([{ name, description, cost }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Recompensa creada', reward: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/rewards/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cost } = req.body;

    const { data, error } = await supabase
      .from('rewards')
      .update({ name, description, cost })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Recompensa actualizada', reward: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/rewards/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Recompensa eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;

    const { data, error } = await supabase
      .from('gamification')
      .select('*')
      .eq('user_id', patientId)
      .single();

    if (error) throw error;
    res.json({ gamification: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { points } = req.body;

    const { data, error } = await supabase
      .from('gamification')
      .update({ points })
      .eq('user_id', patientId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Puntos actualizados', gamification: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
