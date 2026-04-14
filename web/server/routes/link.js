import express from 'express';
import supabase from '../config/supabase.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

router.post('/validate-email', authenticate, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', email.toLowerCase())
      .eq('role', 'paciente')
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Error, usuario no existe o no se ha registrado' });
    }

    res.json({ 
      valid: true, 
      patient: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Error in validate-email:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

router.post('/send-request', authenticate, async (req, res) => {
  try {
    const { patientEmail, patientId } = req.body;
    const monitorId = req.user.id;

    if (!patientId) {
      return res.status(400).json({ error: 'ID del paciente es requerido' });
    }

    const { data: monitor } = await supabase
      .from('users')
      .select('name')
      .eq('id', monitorId)
      .single();

    const { data: existingRequest } = await supabase
      .from('monitor_requests')
      .select('*')
      .eq('monitor_id', monitorId)
      .eq('patient_id', patientId)
      .in('status', ['pending', 'accepted'])
      .maybeSingle();

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ error: 'El paciente ya esta vinculado' });
      }
      return res.status(400).json({ error: 'Ya existe una solicitud pendiente' });
    }

    const { data: cooldown } = await supabase
      .from('request_cooldowns')
      .select('*')
      .eq('patient_id', patientId)
      .eq('monitor_id', monitorId)
      .gt('rejected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (cooldown) {
      const rejectTime = new Date(cooldown.rejected_at);
      const now = new Date();
      const hoursLeft = Math.ceil((rejectTime.getTime() + 24 * 60 * 60 * 1000 - now.getTime()) / (1000 * 60 * 60));
      return res.status(400).json({ error: `Debes esperar ${hoursLeft} horas para nueva solicitud` });
    }

    const { data: request, error: requestError } = await supabase
      .from('monitor_requests')
      .insert([{
        monitor_id: monitorId,
        patient_id: patientId,
        status: 'pending',
        monitor_name: monitor?.name || 'Monitor'
      }])
      .select()
      .single();

    if (requestError) {
      console.error('Error creating request:', requestError);
      return res.status(500).json({ error: 'Error al crear solicitud' });
    }

    res.status(201).json({ 
      message: 'Solicitud enviada', 
      request: {
        id: request.id,
        status: request.status,
        patientId: request.patient_id,
        monitorName: request.monitor_name
      }
    });
  } catch (error) {
    console.error('Error in send-request:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: requests, error } = await supabase
      .from('monitor_requests')
      .select(`
        id,
        status,
        monitor_name,
        created_at,
        responded_at,
        monitor:users!monitor_id(id, name, email)
      `)
      .eq('patient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      return res.status(500).json({ error: 'Error al obtener solicitudes', requests: [] });
    }

    res.json({ requests: requests || [] });
  } catch (error) {
    console.error('Error in my-requests:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor', requests: [] });
  }
});

router.post('/respond', authenticate, async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.user.id;

    if (!requestId || !action) {
      return res.status(400).json({ error: 'requestId y action son requeridos' });
    }

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Accion invalida' });
    }

    const { data: request, error: fetchError } = await supabase
      .from('monitor_requests')
      .select('*')
      .eq('id', requestId)
      .eq('patient_id', userId)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'La solicitud ya ha sido respondida' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    const { error: updateError } = await supabase
      .from('monitor_requests')
      .update({ 
        status: newStatus, 
        responded_at: new Date().toISOString() 
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request:', updateError);
      return res.status(500).json({ error: 'Error al actualizar solicitud' });
    }

    if (action === 'accept') {
      const { error: linkError } = await supabase
        .from('monitor_patient')
        .insert([{
          monitor_id: request.monitor_id,
          patient_id: userId
        }]);

      if (linkError && !linkError.message.includes('duplicate')) {
        console.error('Error linking:', linkError);
      }
    } else {
      const { error: cooldownError } = await supabase
        .from('request_cooldowns')
        .upsert([{
          patient_id: userId,
          monitor_id: request.monitor_id,
          rejected_at: new Date().toISOString()
        }], { onConflict: 'patient_id,monitor_id' });

      if (cooldownError) {
        console.error('Error creating cooldown:', cooldownError);
      }
    }

    res.json({ 
      message: action === 'accept' ? 'Solicitud aceptada' : 'Solicitud rechazada',
      status: newStatus 
    });
  } catch (error) {
    console.error('Error in respond:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

router.get('/status/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;
    const monitorId = req.user.id;

    const { data: request, error } = await supabase
      .from('monitor_requests')
      .select('*')
      .eq('monitor_id', monitorId)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching status:', error);
      return res.status(500).json({ error: 'Error al verificar estado' });
    }

    if (!request) {
      return res.json({ linked: false, status: null, cooldown: false });
    }

    const { data: cooldown } = await supabase
      .from('request_cooldowns')
      .select('rejected_at')
      .eq('patient_id', patientId)
      .eq('monitor_id', monitorId)
      .gt('rejected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    res.json({ 
      linked: request.status === 'accepted',
      status: request.status,
      cooldown: cooldown ? true : false
    });
  } catch (error) {
    console.error('Error in status:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

export default router;