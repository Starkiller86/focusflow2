import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/supabase';

export default function UserManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [linkStatus, setLinkStatus] = useState(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('monitor_patient')
        .select(`
          patient:users!patient_id(
            id, name, email, created_at
          )
        `)
        .eq('monitor_id', user.id);

      setPatients(data?.map(p => p.patient) || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const apiCall = async (url, options = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
        ...options.headers
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error en la petición');
    return json;
  };

  const onSubmit = async (data) => {
    try {
      if (editingPatient) {
        await apiCall(`/api/users/${editingPatient.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: data.name, email: data.email })
        });
      } else {
        await apiCall('/api/users', {
          method: 'POST',
          body: JSON.stringify({ name: data.name, email: data.email, password: data.password })
        });
      }

      await loadPatients();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deletePatient = async (id) => {
    if (!confirm('¿Estás seguro de desactivar este paciente?')) return;
    
    try {
      await apiCall(`/api/users/${id}`, { method: 'DELETE' });
      await loadPatients();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setValue('name', patient.name);
    setValue('email', patient.email);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPatient(null);
    reset();
  };

  const openLinkModal = () => {
    setLinkStatus(null);
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setLinkStatus(null);
  };

  const validateAndLink = async (data) => {
    setLinkLoading(true);
    setLinkStatus(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setLinkStatus({ type: 'error', message: 'Sesion no valida. Por favor inicia sesion de nuevo.' });
        setLinkLoading(false);
        return;
      }
      
      const validateRes = await fetch('/api/link/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: data.email }),
      });
      
      let validateJson;
      try {
        validateJson = await validateRes.json();
      } catch (e) {
        setLinkStatus({ type: 'error', message: 'Error de servidor. Verifica que el servidor este corriendo.' });
        setLinkLoading(false);
        return;
      }
      
      if (!validateRes.ok) {
        setLinkStatus({ type: 'error', message: validateJson.error || 'Error desconocido' });
        setLinkLoading(false);
        return;
      }

      const requestRes = await fetch('/api/link/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          patientEmail: data.email,
          patientId: validateJson.patient.id 
        }),
      });
      
      let requestJson;
      try {
        requestJson = await requestRes.json();
      } catch (e) {
        setLinkStatus({ type: 'error', message: 'Error de servidor al enviar solicitud.' });
        setLinkLoading(false);
        return;
      }
      
      if (!requestRes.ok) {
        setLinkStatus({ type: 'error', message: requestJson.error || 'Error desconocido' });
        setLinkLoading(false);
        return;
      }

      setLinkStatus({ 
        type: 'success', 
        message: 'Solicitud enviada. Espera a que el paciente acepte el monitoreo.',
        patientName: validateJson.patient.name
      });
      
      setTimeout(() => {
        closeLinkModal();
        loadPatients();
        setLinkLoading(false);
      }, 3000);
      
    } catch (error) {
      setLinkStatus({ type: 'error', message: error.message || 'Error inesperado' });
      setLinkLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-sm sm:text-base text-gray-600">Administra los pacientes que monitoreas</p>
        </div>
        <button onClick={openLinkModal} className="btn-primary text-sm sm:text-base text-center whitespace-nowrap">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Vincular Paciente
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <svg className="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Cargando...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-gray-400">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-base sm:text-lg mb-2">No hay pacientes registrados</p>
            <p className="text-xs sm:text-sm">Agrega tu primer paciente para comenzar</p>
          </div>
        ) : (
          <>
            {/* Mobile card layout */}
            <div className="sm:hidden p-4 space-y-3">
              {patients.map((patient) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium shrink-0">
                      {patient.name?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{patient.name}</p>
                      <p className="text-xs text-gray-500 truncate">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(patient.created_at).toLocaleDateString('es')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(patient)}
                        className="p-2 rounded-lg hover:bg-white text-primary-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deletePatient(patient.id)}
                        className="p-2 rounded-lg hover:bg-white text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Paciente</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha de Registro</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.map((patient) => (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium">
                            {patient.name?.charAt(0) || 'P'}
                          </div>
                          <span className="font-medium text-gray-900">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{patient.email}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(patient.created_at).toLocaleDateString('es')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(patient)}
                            className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deletePatient(patient.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  {editingPatient ? 'Editar Paciente' : 'Agregar Paciente'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      {...register('name', { required: 'El nombre es requerido' })}
                      className="input-field"
                      placeholder="Nombre del paciente"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      {...register('email', { 
                        required: 'El email es requerido',
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' }
                      })}
                      type="email"
                      className="input-field"
                      placeholder="email@ejemplo.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  {!editingPatient && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                      <input
                        {...register('password', { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                        type="password"
                        className="input-field"
                        placeholder="••••••••"
                      />
                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1 text-sm sm:text-base">
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary flex-1 text-sm sm:text-base">
                      {editingPatient ? 'Guardar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLinkModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={closeLinkModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Vincular Paciente por Email
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Ingresa el correo electrónico de un paciente registrado en la app móvil para solicitar monitoreo.
                </p>
                
                {linkStatus && (
                  <div className={`p-4 rounded-xl mb-4 ${
                    linkStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    <p className="text-sm">{linkStatus.message}</p>
                    {linkStatus.patientName && (
                      <p className="text-sm font-medium mt-1">Paciente: {linkStatus.patientName}</p>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit(validateAndLink)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email del Paciente</label>
                    <input
                      {...register('email', { 
                        required: 'El email es requerido',
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' }
                      })}
                      type="email"
                      className="input-field"
                      placeholder="paciente@ejemplo.com"
                      disabled={linkLoading || linkStatus?.type === 'success'}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={closeLinkModal} 
                      className="btn-secondary flex-1 text-sm sm:text-base"
                      disabled={linkLoading}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary flex-1 text-sm sm:text-base"
                      disabled={linkLoading || linkStatus?.type === 'success'}
                    >
                      {linkLoading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
