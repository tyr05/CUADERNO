import 'dotenv/config';

const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Falta la variable de entorno ${key}`);
    process.exit(1);
  }
}

const baseUrl = `http://localhost:${process.env.PORT || 5000}`;

const adminEmail = process.env.ADMIN_EMAIL || 'admin@cuaderno.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const fetchJson = async (url, options) => {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Respuesta inválida: ${text}`);
  }
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${data.message || text}`);
  }
  return data;
};

const run = async () => {
  console.log('1) Verificando healthcheck');
  const health = await fetchJson(`${baseUrl}/api/health`);
  console.log('Health:', health);

  console.log('2) Intentando login admin');
  const login = await fetchJson(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  console.log('Login OK:', login.user);

  console.log('Smoke test finalizado con éxito');
};

run().catch((error) => {
  console.error('Smoke test falló:', error.message);
  process.exit(1);
});
