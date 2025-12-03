import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/components', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT component_id, component_name FROM components ORDER BY component_name');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/materials', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT material_id, material_name FROM materials ORDER BY material_name');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/operations', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT operation_id, operation_name FROM operations_catalog ORDER BY operation_name');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/products', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT product_id, product_name FROM products ORDER BY product_name');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

export default router;

