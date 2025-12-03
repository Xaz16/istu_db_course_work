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

    const searchField = req.query.searchField && config.searchable.includes(req.query.searchField)
      ? req.query.searchField
      : undefined;

    const sortField = req.query.sortField && config.columns.includes(req.query.sortField)
      ? req.query.sortField
      : config.defaultSort.field;
    const sortDirection = req.query.sortDirection || config.defaultSort.direction;

    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 25), 100);
    const offset = (page - 1) * limit;

    let selectQuery, countQuery, params = [], whereParams = [];

    if (table === 'product_components') {
      const whereClauses = [];
      if (filters.product_id) {
        whereParams.push(filters.product_id);
        whereClauses.push(`product_components.product_id = $${whereParams.length}`);
      }
      const whereClause = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

      const limitParam = whereParams.length + 1;
      const offsetParam = whereParams.length + 2;

      selectQuery = `
        SELECT 
          product_components.product_id,
          product_components.component_id,
          product_components.quantity,
          products.product_name AS "products_product_name",
          components.component_name AS "components_component_name"
        FROM product_components
        LEFT JOIN products ON product_components.product_id = products.product_id
        LEFT JOIN components ON product_components.component_id = components.component_id
        ${whereClause}
        ORDER BY product_components.${sortField} ${sortDirection.toUpperCase()}
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `;
      params = [...whereParams, limit, offset];

      countQuery = `
        SELECT COUNT(*)::int as total
        FROM product_components
        LEFT JOIN products ON product_components.product_id = products.product_id
        LEFT JOIN components ON product_components.component_id = components.component_id
        ${whereClause}
      `;
    } else if (table === 'production_process') {
      const whereClauses = [];
      if (filters.component_id) {
        whereParams.push(filters.component_id);
        whereClauses.push(`production_process.component_id = $${whereParams.length}`);
      }
      if (filters.material_id) {
        whereParams.push(filters.material_id);
        whereClauses.push(`production_process.material_id = $${whereParams.length}`);
      }
      if (filters.operation_id) {
        whereParams.push(filters.operation_id);
        whereClauses.push(`production_process.operation_id = $${whereParams.length}`);
      }
      const whereClause = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

      const limitParam = whereParams.length + 1;
      const offsetParam = whereParams.length + 2;

      selectQuery = `
        SELECT 
          production_process.component_id,
          production_process.material_id,
          production_process.material_quantity,
          production_process.operation_id,
          components.component_name AS "components_component_name",
          materials.material_name AS "materials_material_name",
          operations_catalog.operation_name AS "operations_catalog_operation_name"
        FROM production_process
        LEFT JOIN components ON production_process.component_id = components.component_id
        LEFT JOIN materials ON production_process.material_id = materials.material_id
        LEFT JOIN operations_catalog ON production_process.operation_id = operations_catalog.operation_id
        ${whereClause}
        ORDER BY production_process.${sortField} ${sortDirection.toUpperCase()}
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `;
      params = [...whereParams, limit, offset];

      countQuery = `
        SELECT COUNT(*)::int as total
        FROM production_process
        LEFT JOIN components ON production_process.component_id = components.component_id
        LEFT JOIN materials ON production_process.material_id = materials.material_id
        LEFT JOIN operations_catalog ON production_process.operation_id = operations_catalog.operation_id
        ${whereClause}
      `;
    } else {
      const selectQueryResult = buildSelectQuery({
        table,
        columns: config.columns,
        filters,
        searchField,
        searchTerm: req.query.searchTerm,
        sortField,
        sortDirection,
        page,
        limit
      });
      selectQuery = selectQueryResult.text;
      params = selectQueryResult.params;
      countQuery = `SELECT COUNT(*)::int as total FROM ${table}${selectQueryResult.whereClause}`;
      whereParams = selectQueryResult.whereParams || [];
    }

    const [{ rows }, countResult] = await Promise.all([
      query(selectQuery, params),
      query(countQuery, whereParams)
    ]);

    res.json({
      data: rows,
      meta: {
        total: countResult.rows[0].total,
        page,
        limit
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

    if (config.primaryKey.length > 1) {
      const keyFilter = {};
      config.primaryKey.forEach((key) => {
        if (parsed[key] !== undefined && parsed[key] !== null) {
          keyFilter[key] = parsed[key];
        }
      });

      if (Object.keys(keyFilter).length === config.primaryKey.length) {
        const whereParts = config.primaryKey.map((key, idx) => `${key} = $${idx + 1}`).join(' AND ');
        const checkResult = await query(
          `SELECT ${config.columns.join(', ')} FROM ${table} WHERE ${whereParts}`,
          Object.values(keyFilter)
        );

        if (checkResult.rows.length > 0) {
          return res.status(409).json({
            message: 'Запись с такими значениями уже существует. Комбинация выбранных значений (компонент, материал, операция) должна быть уникальной. Используйте редактирование для изменения существующей записи.'
          });
        }
      }
    }

    const insertQuery = buildInsertQuery({ table, payload: parsed });
    const { rows } = await query(insertQuery.text, insertQuery.params);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      const duplicateError = new Error('Запись с такими значениями уже существует. Пожалуйста, используйте редактирование для изменения существующей записи.');
      duplicateError.status = 409;
      return next(duplicateError);
    }
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
