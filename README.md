# FocusFlow

Sistema de gestión de tareas con gamificación y mascota virtual para mejorar la productividad.

## Estructura del Proyecto

```
focusflow2/
├── web/                    # Aplicación web (React + Vite)
│   ├── src/
│   │   ├── pages/          # Páginas de la aplicación
│   │   └── services/      # Servicios (Supabase)
│   └── server/            # Backend API (Express.js)
│       └── routes/        # Rutas de la API
├── mobile/                # Aplicación móvil (Expo + React Native)
│   ├── app/               # Pantallas (file-based routing)
│   ├── components/        # Componentes reutilizables
│   ├── hooks/             # Custom hooks
│   ├── stores/            # Estado global (Zustand)
│   ├── lib/               # Utilidades y configuración
│   └── constants/         # Constantes (colores, fuentes, config)
```

## Requisitos Previos

- **Node.js** v18 o superior
- **npm** o **yarn**
- **Expo CLI** (para la app móvil)
- **Cuenta de Supabase** (para la base de datos)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd focusflow2
```

### 2. Instalar dependencias de Web

```bash
cd web
npm install
```

### 3. Instalar dependencias del Servidor

```bash
cd web/server
npm install
```

### 4. Instalar dependencias de Mobile

```bash
cd ../mobile
npm install
```

## Configuración de Variables de Entorno

### Web (Crea `web/.env`)

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### Servidor (Crea `web/server/.env`)

```env
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### Mobile (El archivo `mobile/.env` ya debe existir con las credenciales)

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

## Ejecutar el Proyecto

Necesitas **3 terminales** para ejecutar todo el sistema:

### Terminal 1: Aplicación Web

```bash
cd web
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Terminal 2: Servidor Backend

```bash
cd web/server
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

### Terminal 3: Aplicación Móvil

```bash
cd mobile
npx expo start
```

Esto abrirá Expo Developer Tools. Puedes:
- Presionar `i` para abrir en iOS Simulator
- Presionar `a` para abrir en Android Emulator
- Escanear el código QR con la app de Expo Go

## Scripts Disponibles

### Web

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia la aplicación web |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Vista previa de la build |
| `npm run lint` | Ejecuta el linter |

### Servidor

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor con watch mode |
| `npm start` | Inicia el servidor normalmente |

### Mobile

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia Expo |
| `npm run android` | Inicia para Android |
| `npm run ios` | Inicia para iOS |
| `npm run web` | Inicia para web |

## Tecnologías Utilizadas

### Frontend Web
- **React 19** - Framework de UI
- **Vite** - Bundler y servidor de desarrollo
- **Tailwind CSS** - Framework de estilos
- **React Router DOM** - Enrutamiento
- **React Hook Form** - Formularios
- **Zod** - Validación de esquemas
- **Recharts** - Gráficos
- **Framer Motion** - Animaciones
- **Supabase** - Base de datos y autenticación
- **QRCode.react** - Generación de códigos QR

### Backend
- **Express.js** - Framework de servidor
- **CORS** - Manejo de CORS
- **Helmet** - Seguridad HTTP
- **Express Rate Limit** - Limitación de solicitudes
- **Supabase** - Cliente de base de datos

### Mobile
- **Expo SDK 54** - Framework de React Native
- **Expo Router** - Enrutamiento basado en archivos
- **React Native** - Framework de desarrollo móvil
- **Zustand** - Gestión de estado
- **NativeWind** - Estilos (Tailwind para RN)
- **Expo Notifications** - Notificaciones push
- **Expo Image Picker** - Selección de imágenes
- **Expo Haptics** - Retroalimentación háptica

### Base de Datos
- **Supabase** - PostgreSQL, autenticación, storage

## Funcionalidades Principales

- **Gestión de Tareas**: Crear, editar, eliminar y organizar tareas
- **Sistema de Enfoque (Focus)**: Modo de concentración con temporizador
- **Gamificación**: Sistema de puntos, niveles y recompensas
- **Mascota Virtual**: Tu mascota crece y evoluciona con tu productividad
- **Panel de Administración (Web)**: Gestión de usuarios y reportes
- **Notificaciones**: Recordatorios y alertas
- **Código QR**: Vinculación de cuentas con la app móvil
- **Marketplace**: Tienda de accesorios para la mascota

## Licencia

MIT License
