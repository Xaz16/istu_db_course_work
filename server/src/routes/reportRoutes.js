import express from 'express';
import { query } from '../db.js';

const router = express.Router();

const applySorting = (baseQuery, allowedFields, sortField, sortDirection) => {
  if (!allowedFields.includes(sortField)) {
    return baseQuery;
  }
  const dir = sortDirection?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `${baseQuery} ORDER BY ${sortField} ${dir}`;
};

router.get('/expensive-products', async (req, res, next) => {
  try {
    const { minPrice = 50000, furnitureType, sortField = 'price', sortDirection = 'desc' } = req.query;
    const conditions = ['price >= $1'];
    const params = [Number(minPrice)];
    if (furnitureType) {
      params.push(furnitureType);
      conditions.push('furniture_type = $2');
    }
    let sql = `SELECT * FROM expensive_products WHERE ${conditions.join(' AND ')}`;
    sql = applySorting(sql, ['price', 'product_name'], sortField, sortDirection);
    const { rows } = await query(sql, params);
    const total = rows.reduce((acc, row) => acc + Number(row.price), 0);
    res.json({ data: rows, summary: { total_price: total, count: rows.length } });
  } catch (error) {
    next(error);
  }
});

router.get('/component-usage', async (req, res, next) => {
  try {
    const { minProducts = 1, sortField = 'product_count', sortDirection = 'desc' } = req.query;
    const params = [Number(minProducts)];
    let sql = `SELECT * FROM full_component_info WHERE product_count >= $1`;
    sql = applySorting(sql, ['product_count', 'component_name'], sortField, sortDirection);
    const { rows } = await query(sql, params);
    const totalUsage = rows.reduce((acc, row) => acc + Number(row.product_count), 0);
    res.json({ data: rows, summary: { total_usage: totalUsage } });
  } catch (error) {
    next(error);
  }
});

router.get('/sales-profit', async (req, res, next) => {
  try {
    const { minProfit = 0, sortField = 'profitability_percent', sortDirection = 'desc' } = req.query;
    const params = [Number(minProfit)];
    let sql = 'SELECT * FROM sales_profit WHERE profit >= $1';
    sql = applySorting(sql, ['profit', 'profitability_percent', 'product_name'], sortField, sortDirection);
    const { rows } = await query(sql, params);
    const summary = rows.reduce(
      (acc, row) => {
        acc.total_profit += Number(row.profit);
        acc.total_revenue += Number(row.selling_price);
        return acc;
      },
      { total_profit: 0, total_revenue: 0 }
    );
    res.json({ data: rows, summary });
  } catch (error) {
    next(error);
  }
});

export default router;
