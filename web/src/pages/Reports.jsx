import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../services/supabase';

const COLORS = ['#8b5cf6', '#06b6d4', '#d946ef', '#10b981', '#f59e0b'];

export default function Reports() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);

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
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadReport();
    }
  }, [selectedPatient, dateRange]);

  const loadPatients = async () => {
    try {
      const patientsData = await apiCall('/api/users');
      setPatients(patientsData.patients || []);
      if (patientsData.patients?.length) {
        setSelectedPatient(patientsData.patients[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadReport = async () => {
    if (!selectedPatient) return;
    setLoading(true);

    try {
      let url = `/api/reports/${selectedPatient}`;
      const params = new URLSearchParams();
      if (dateRange.from) params.append('from', dateRange.from);
      if (dateRange.to) params.append('to', dateRange.to);
      if (params.toString()) url += '?' + params.toString();

      const data = await apiCall(url);
      
      setReportData({
        summary: data.summary,
        byStatus: Object.entries(data.byStatus).map(([name, value]) => ({ name, value })),
        byPriority: Object.entries(data.byPriority).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })),
        completionByDay: Object.entries(data.completionByDay)
          .map(([date, count]) => ({
            date: new Date(date).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
            tareas: count
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-14)
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    alert('Funcionalidad de exportación PDF Coming Soon');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm sm:text-base text-gray-600">Analiza la productividad de tus pacientes</p>
        </div>
        <button onClick={exportPDF} className="btn-secondary text-sm sm:text-base whitespace-nowrap">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar PDF
        </button>
      </div>

      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 sm:flex-none">
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex-1 sm:flex-none">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      {reportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-card p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">{reportData.summary.totalTasks}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Tareas</p>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{reportData.summary.completedTasks}</p>
              <p className="text-xs sm:text-sm text-gray-600">Completadas</p>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-amber-600">{reportData.summary.pendingTasks}</p>
              <p className="text-xs sm:text-sm text-gray-600">Pendientes</p>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-accent-600">{reportData.summary.productivityRate}%</p>
              <p className="text-xs sm:text-sm text-gray-600">Productividad</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tareas Completadas por Día</h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.completionByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="tareas" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Estado de Tareas</h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reportData.byStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {reportData.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tareas por Prioridad</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.byPriority}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {!reportData && !loading && selectedPatient && (
        <div className="glass-card p-8 sm:p-12 text-center text-gray-400">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-base sm:text-lg">No hay datos para mostrar</p>
          <p className="text-xs sm:text-sm">Selecciona un paciente y un rango de fechas</p>
        </div>
      )}

      {loading && (
        <div className="glass-card p-8 sm:p-12 text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-2 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p className="text-gray-500 text-sm">Cargando reporte...</p>
        </div>
      )}
    </div>
  );
}
