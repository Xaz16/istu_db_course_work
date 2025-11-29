export const serializeKey = (primaryKey, row) => {
  return primaryKey.map((key) => row[key]).join(':');
};

export const parseKey = (primaryKey, raw) => {
  const pieces = raw.split(':');
  if (pieces.length !== primaryKey.length) {
    throw new Error('Некорректный идентификатор записи');
  }
  const keyFilter = {};
  primaryKey.forEach((key, idx) => {
    const value = pieces[idx];
    keyFilter[key] = /^\d+$/.test(value) ? Number(value) : value;
  });
  return keyFilter;
};
