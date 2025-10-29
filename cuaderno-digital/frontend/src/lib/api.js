const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const buildUrl = (path) => {
  const full = path.startsWith('http')
    ? path
    : `${API_BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
  const url = new URL(full);
  url.searchParams.set('ts', Date.now().toString());
  return url.toString();
};

const handleResponse = async (response) => {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error('Respuesta inválida del servidor');
  }
  if (!response.ok) {
    const message = data?.message || `Error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
};

const request = async (path, { method = 'GET', body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  return handleResponse(response);
};

export const apiGet = (path, token) => request(path, { method: 'GET', token });
export const apiPost = (path, body, token) => request(path, { method: 'POST', body, token });
export const apiPut = (path, body, token) => request(path, { method: 'PUT', body, token });
export const apiDelete = (path, token) => request(path, { method: 'DELETE', token });
