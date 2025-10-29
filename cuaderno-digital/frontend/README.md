# Frontend - Cuaderno Digital

## Requisitos
- Node.js 20+

## Configuración
1. Copiar `.env.example` a `.env` y ajustar `VITE_API_BASE_URL`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar en desarrollo:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run build`: Genera la build de producción.
- `npm run preview`: Previsualiza la build.
- `npm run lint`: Ejecuta ESLint.
- `npm run format`: Formatea con Prettier.

## Despliegue
En Vercel o Firebase Hosting configurar `VITE_API_BASE_URL` apuntando al backend desplegado.
