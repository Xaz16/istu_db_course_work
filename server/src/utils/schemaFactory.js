import { z } from 'zod';

const mapper = {
  string: () => z.string().min(1),
  number: () => z.number(),
  date: () => z.string().optional()
};

export const buildSchema = (config, { partial = false } = {}) => {
  const shape = {};
  Object.entries(config).forEach(([field, meta]) => {
    const base = mapper[meta.type] ? mapper[meta.type]() : z.any();
    shape[field] = meta.required && !partial ? base : base.optional();
  });
  const schema = z.object(shape);
  return partial ? schema.partial() : schema;
};
