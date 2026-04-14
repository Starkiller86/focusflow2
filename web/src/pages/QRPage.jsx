import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

export default function QRPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setShowSuccess(true);
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  const downloadAppUrl = 'https://focusflow.app/download';

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-800">FocusFlow</span>
        </Link>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-8 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Registro Exitoso!
              </h1>
              <p className="text-gray-600 mb-6">
                Escanea el código QR para descargar la app móvil de FocusFlow
              </p>

              <div className="bg-white rounded-2xl p-4 inline-block shadow-lg mb-6">
                <QRCodeSVG
                  value={downloadAppUrl}
                  size={200}
                  level="H"
                  includeMargin
                  imageSettings={{
                    src: '/favicon.svg',
                    height: 40,
                    width: 40,
                    excavate: true
                  }}
                />
              </div>

              <div className="space-y-3">
                <a
                  href={downloadAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full block"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar App
                </a>
                
                <Link to="/dashboard" className="btn-secondary w-full block">
                  Ir al Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
