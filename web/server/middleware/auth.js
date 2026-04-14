import supabase from '../config/supabase.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('=== Auth middleware ===');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Auth error:', error);
      res.status(401).json({ error: 'Token inválido: ' + error.message });
      return;
    }

    if (!data.user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    console.log('User authenticated:', data.user.id);
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Auth exception:', error);
    res.status(500).json({ error: 'Error de autenticación: ' + error.message });
  }
};

export default authenticate;