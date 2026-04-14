import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/supabase';

export default function Marketplace() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

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

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await apiCall('/api/gamification/rewards');
      setRewards(data.rewards || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingReward) {
        await apiCall(`/api/gamification/rewards/${editingReward.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: data.name, description: data.description, cost: parseInt(data.cost) })
        });
      } else {
        await apiCall('/api/gamification/rewards', {
          method: 'POST',
          body: JSON.stringify({ name: data.name, description: data.description, cost: parseInt(data.cost) })
        });
      }

      await loadRewards();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteReward = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta recompensa?')) return;

    try {
      await apiCall(`/api/gamification/rewards/${id}`, { method: 'DELETE' });
      await loadRewards();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEditModal = (reward) => {
    setEditingReward(reward);
    setValue('name', reward.name);
    setValue('description', reward.description);
    setValue('cost', reward.cost);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReward(null);
    reset();
  };

  const totalRewards = rewards.length;
  const totalCost = rewards.reduce((sum, r) => sum + r.cost, 0);
  const avgCost = totalRewards > 0 ? Math.round(totalCost / totalRewards) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Marketplace de Recompensas</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestiona las recompensas disponibles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm sm:text-base text-center whitespace-nowrap">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Recompensa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Total Recompensas</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalRewards}</p>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Costo Total</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalCost} pts</p>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Costo Promedio</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{avgCost} pts</p>
        </div>
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
        ) : rewards.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-gray-400">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-base sm:text-lg mb-2">No hay recompensas disponibles</p>
            <p className="text-xs sm:text-sm">Crea la primera recompensa para el sistema</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6">
            {rewards.map((reward) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-primary/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(reward)}
                      className="p-2 rounded-lg hover:bg-white text-primary-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteReward(reward.id)}
                      className="p-2 rounded-lg hover:bg-white text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{reward.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{reward.description || 'Sin descripción'}</p>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-medium">
                    {reward.cost} puntos
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
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
                  {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      {...register('name', { required: 'El nombre es requerido' })}
                      className="input-field"
                      placeholder="Nombre de la recompensa"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      {...register('description')}
                      className="input-field min-h-[80px] sm:min-h-[100px]"
                      placeholder="Descripción de la recompensa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Costo (puntos)</label>
                    <input
                      {...register('cost', { required: 'El costo es requerido', min: { value: 1, message: 'Mínimo 1 punto' } })}
                      type="number"
                      className="input-field"
                      placeholder="100"
                    />
                    {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1 text-sm sm:text-base">
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary flex-1 text-sm sm:text-base">
                      {editingReward ? 'Guardar' : 'Crear'}
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
