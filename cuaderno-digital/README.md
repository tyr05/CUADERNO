# Cuaderno Digital

Monorepo que incluye API (Express + MongoDB) y frontend (React + Vite + Tailwind) para gestionar cursos, estudiantes, anuncios y asistencias.

## Estructura
```
cuaderno-digital/
  backend/
  frontend/
```

## Requisitos generales
- Node.js 20+
- MongoDB Atlas u otra instancia compatible

## Backend
1. Ingresar a `backend/` e instalar dependencias: `npm install`.
2. Copiar `.env.example` a `.env` y configurar `MONGO_URI`, `JWT_SECRET`, `FRONTEND_ORIGIN`.
3. Opcional: ejecutar `npm run seed` para generar datos y usuarios demo.
4. Crear admin por defecto: `npm run create-admin`.
5. Ejecutar desarrollo: `npm run dev`.

### Scripts clave
- `npm run seed`: crea cursos (1° a 5°, divisiones 1 y 2, turnos TM/TT) y estudiantes.
- `npm run create-admin`: genera el admin `admin@cuaderno.com` (`ADMIN_EMAIL/ADMIN_PASSWORD` opcionales vía env).
- `npm run smoke`: verifica variables de entorno, healthcheck y login admin.

## Frontend
1. Ingresar a `frontend/` e instalar dependencias: `npm install`.
2. Copiar `.env.example` a `.env` y definir `VITE_API_BASE_URL`.
3. Ejecutar desarrollo: `npm run dev`.

## Credenciales demo
- Admin: `admin@cuaderno.com / admin123`
- Docente: `docente@cuaderno.com / docente123`
- Familia: `familia@cuaderno.com / familia123`

## Despliegue sugerido
- Backend: Render/Railway con `npm install` (build) y `npm start` (run). Configurar envs.
- Frontend: Vercel/Firebase, comando `npm run build`, directorio `dist/`, y `VITE_API_BASE_URL` apuntando al backend público.
