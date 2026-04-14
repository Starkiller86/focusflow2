import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const COLORS = ['#8b5cf6', '#06b6d4', '#d946ef', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);

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

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const patientsData = await apiCall('/api/users');
      const patientIds = patientsData.patients.map(p => p.id);

      if (patientIds.length > 0) {
        const tasksData = await apiCall('/api/tasks');
        setPatients(patientsData.patients);
        setTasks(tasksData.tasks || []);

        const pendingTasks = tasksData.tasks?.filter(t => t.status === 'pendiente') || [];
        const oldTasks = pendingTasks.filter(t => {
          if (!t.due_date) return false;
          return new Date(t.due_date) < new Date();
        });

        if (oldTasks.length > 0) {
          setAlerts([...oldTasks.map(t => ({ type: 'overdue', task: t }))]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completada').length;
  const pendingTasks = tasks.filter(t => t.status === 'pendiente').length;
  const productivityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusData = [
    { name: 'Completadas', value: completedTasks },
    { name: 'Pendientes', value: pendingTasks },
    { name: 'En Progreso', value: tasks.filter(t => t.status === 'en_progreso').length }
  ].filter(d => d.value > 0);

  const completionData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = date.toISOString().split('T')[0];
    const count = tasks.filter(t => 
      t.status === 'completada' && 
      t.created_at?.startsWith(day)
    ).length;
    completionData.push({
      day: date.toLocaleDateString('es', { weekday: 'short' }),
      tareas: count
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Bienvenido de nuevo, {profile?.name || 'Monitor'}</p>
        </div>
        <Link to="/usuarios" className="btn-primary text-sm sm:text-base text-center whitespace-nowrap">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Paciente
        </Link>
      </div>

      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-3"
        >
          <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-amber-800 text-sm sm:text-base">Alertas de Actividad</p>
            <p className="text-xs sm:text-sm text-amber-700">{alerts.length} tarea(s) vencida(s) requieren atención</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full hidden sm:inline">Total</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{patients.length}</p>
          <p className="text-xs sm:text-sm text-gray-600">Pacientes</p>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full hidden sm:inline">Completadas</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{completedTasks}</p>
          <p className="text-xs sm:text-sm text-gray-600">Completadas</p>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full hidden sm:inline">Pendientes</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{pendingTasks}</p>
          <p className="text-xs sm:text-sm text-gray-600">Pendientes</p>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent-100 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-accent-600 bg-accent-50 px-2 py-1 rounded-full hidden sm:inline">%</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{productivityRate}%</p>
          <p className="text-xs sm:text-sm text-gray-600">Productividad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tareas Completadas (7 días)</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tareas"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Estado de Tareas</h3>
          <div className="h-48 sm:h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No hay tareas todavía
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pacientes Recientes</h3>
          <Link to="/usuarios" className="text-primary-600 font-medium hover:underline text-xs sm:text-sm">
            Ver todos
          </Link>
        </div>
        {patients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {patients.slice(0, 6).map((patient) => (
              <div key={patient.id} className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium shrink-0 text-sm">
                  {patient.name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{patient.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">{patient.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">No hay pacientes registrados</p>
            <Link to="/usuarios" className="text-primary-600 hover:underline text-xs sm:text-sm">
              Agregar el primer paciente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
