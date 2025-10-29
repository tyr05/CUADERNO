# Backend - Cuaderno Digital

## Requisitos
- Node.js 20+
- MongoDB Atlas u otra instancia compatible

## Configuración
1. Copiar `.env.example` a `.env` y completar valores.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Verificar variables de entorno:
   ```bash
   npm run check:env
   ```

## Scripts útiles
- `npm run dev`: Ejecuta el servidor con recarga en caliente.
- `npm start`: Ejecuta el servidor en modo producción.
- `npm run seed`: Genera cursos y estudiantes de ejemplo.
- `npm run create-admin`: Crea un usuario administrador por defecto.
- `npm run lint`: Ejecuta ESLint.
- `npm run format`: Formatea el código con Prettier.
- `npm run smoke`: Prueba de humo (requiere servidor en marcha).

## Despliegue
Configurar las variables `MONGO_URI`, `JWT_SECRET`, `PORT` y `FRONTEND_ORIGIN` en el proveedor (Render/Railway). El comando de inicio es `npm start`.
