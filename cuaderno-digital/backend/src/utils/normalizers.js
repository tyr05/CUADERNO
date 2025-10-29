export const normalizeCurso = (value) => {
  if (value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const normalizeDivision = (value) => {
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
};

export const normalizeFecha = (fecha) => {
  const date = fecha ? new Date(fecha) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha inválida');
  }
  date.setHours(0, 0, 0, 0);
  return date;
};
