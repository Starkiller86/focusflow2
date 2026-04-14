import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password y name son requeridos' });
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
          role: 'monitor'
        }
      ])
      .select()
      .single();

    if (userError) throw userError;

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user: userData
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) throw userError;

    const token = authData.session.access_token;

    res.json({ 
      message: 'Login exitoso',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({ user: userData });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
