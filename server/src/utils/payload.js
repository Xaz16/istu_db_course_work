export const normalizePayload = (schema, payload = {}) => {
  const normalized = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (!(key in schema)) return;
    if (value === undefined || value === null || value === '') return;

    const fieldMeta = schema[key];
    if (fieldMeta.type === 'number') {
      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        normalized[key] = numeric;
      }
      return;
    }

    normalized[key] = value;
  });
  return normalized;
};
