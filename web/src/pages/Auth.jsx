import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

function PasswordInput({ register, errors }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Contraseña
      </label>
      <div className="relative">
        <input
          {...register('password', { 
            required: 'La contraseña es requerida',
            minLength: {
              value: 6,
              message: 'Mínimo 6 caracteres'
            }
          })}
          type={showPassword ? 'text' : 'password'}
          className="input-field pr-12"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {errors.password && (
        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
      )}
    </div>
  );
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });

        if (authError) throw authError;

        navigate('/dashboard');
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { name: data.name }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          await supabase.from('users').insert({
            id: authData.user.id,
            name: data.name,
            email: data.email,
            role: 'monitor'
          });
        }

        navigate('/qr');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    reset();
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm md:max-w-md"
      >
        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6 md:mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">FocusFlow</span>
          </Link>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-5 md:mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-3 md:px-4 rounded-lg text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-white text-primary-600 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-3 md:px-4 rounded-lg text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-white text-primary-600 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registrarse
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      {...register('name', { required: !isLogin ? 'El nombre es requerido' : false })}
                      type="text"
                      className="input-field"
                      placeholder="Juan Pérez"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    {...register('email', { 
                      required: 'El correo es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Correo inválido'
                      }
                    })}
                    type="email"
                    className="input-field"
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <PasswordInput register={register} errors={errors} />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 md:mt-6 text-center">
            {isLogin ? (
              <p className="text-gray-600 text-sm">
                ¿No tienes una cuenta?{' '}
                <button onClick={toggleMode} className="text-primary-600 font-medium hover:underline">
                  Regístrate
                </button>
              </p>
            ) : (
              <p className="text-gray-600 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <button onClick={toggleMode} className="text-primary-600 font-medium hover:underline">
                  Inicia Sesión
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5 md:mt-6">
          <Link to="/" className="hover:text-primary-600">Volver al inicio</Link>
        </p>
      </motion.div>
    </div>
  );
}
