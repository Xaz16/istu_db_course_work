import express from 'express';
import tableConfigs from '../config/tableConfig.js';
import { query } from '../db.js';
import { buildSelectQuery, buildInsertQuery, buildUpdateQuery, buildDeleteQuery } from '../utils/queryBuilder.js';
import { buildSchema } from '../utils/schemaFactory.js';
import { normalizePayload } from '../utils/payload.js';
import { parseKey } from '../utils/keyHelpers.js';

const router = express.Router();

const getConfig = (tableName) => {
  const config = tableConfigs[tableName];
  if (!config) {
    const error = new Error('Неизвестная таблица');
    error.status = 404;
    throw error;
  }
  return config;
};

router.get('/:table', async (req, res, next) => {
  try {
    const { table } = req.params;
    const config = getConfig(table);

    const filters = {};
    config.filterable.forEach((field) => {
      if (req.query[field] !== undefined) {
        filters[field] = req.query[field];
      }
    });

    const searchField = config.searchable.includes(req.query.searchField)
      ? req.query.searchField
      : undefined;

    const sortField = config.columns.includes(req.query.sortField)
      ? req.query.sortField
      : config.defaultSort.field;
    const sortDirection = req.query.sortDirection || config.defaultSort.direction;

    const selectQuery = buildSelectQuery({
      table,
      columns: config.columns,
      filters,
      searchField,
      searchTerm: req.query.searchTerm,
      sortField,
      sortDirection,
      page: req.query.page,
      limit: req.query.limit
    });

    const [{ rows }, countResult] = await Promise.all([
      query(selectQuery.text, selectQuery.params),
      query(`SELECT COUNT(*)::int as total FROM ${table}${selectQuery.whereClause}`, selectQuery.whereParams || [])
    ]);

    res.json({
      data: rows,
      meta: {
        total: countResult.rows[0].total,
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 25)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:table/:id', async (req, res, next) => {
  try {
    const { table, id } = req.params;
    const config = getConfig(table);
    const keyFilter = parseKey(config.primaryKey, id);

    const whereParts = config.primaryKey.map((key, idx) => `${key} = $${idx + 1}`).join(' AND ');
    const result = await query(`SELECT ${config.columns.join(', ')} FROM ${table} WHERE ${whereParts}`, Object.values(keyFilter));

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/:table', async (req, res, next) => {
  try {
    const { table } = req.params;
    const config = getConfig(table);
    const schema = buildSchema(config.schema);
    const normalized = normalizePayload(config.schema, req.body);
    const parsed = schema.parse(normalized);
    const insertQuery = buildInsertQuery({ table, payload: parsed });
    const { rows } = await query(insertQuery.text, insertQuery.params);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/:table/:id', async (req, res, next) => {
  try {
    const { table, id } = req.params;
    const config = getConfig(table);
    const keyFilter = parseKey(config.primaryKey, id);
    const schema = buildSchema(config.schema, { partial: true });
    const normalized = normalizePayload(config.schema, req.body);
    const parsed = schema.parse(normalized);

    if (!Object.keys(parsed).length) {
      return res.status(400).json({ message: 'Нет данных для обновления' });
    }

    const updateQuery = buildUpdateQuery({ table, payload: parsed, keyFilter });
    const { rows } = await query(updateQuery.text, updateQuery.params);

    if (!rows.length) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:table/:id', async (req, res, next) => {
  try {
    const { table, id } = req.params;
    const config = getConfig(table);
    const keyFilter = parseKey(config.primaryKey, id);
    const deleteQuery = buildDeleteQuery({ table, keyFilter });
    const result = await query(deleteQuery.text, deleteQuery.params);
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
