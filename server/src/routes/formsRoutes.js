import express from 'express';
import { getClient } from '../db.js';

const router = express.Router();

router.post('/product-with-components', async (req, res, next) => {
  const { product, components } = req.body;

  if (!product || !components?.length) {
    return res.status(400).json({ message: 'Требуются данные продукта и хотя бы один компонент' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');
    const productFields = ['product_id', 'product_name', 'price', 'furniture_type'];
    const productValues = productFields.map((field) => product[field]);
    const placeholders = productFields.map((_, idx) => `$${idx + 1}`);

    const insertProduct = await client.query(
      `INSERT INTO products (${productFields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      productValues
    );

    const productRow = insertProduct.rows[0];

    const preparedComponents = components
      .filter((item) => item.component_id && item.quantity)
      .map((item) => ({
        component_id: Number(item.component_id),
        quantity: Number(item.quantity)
      }));

    if (!preparedComponents.length) {
      throw new Error('Нужно указать минимум один компонент');
    }

    for (const item of preparedComponents) {
      await client.query(
        `INSERT INTO product_components (product_id, component_id, quantity) VALUES ($1, $2, $3)
         ON CONFLICT (product_id, component_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
        [productRow.product_id, item.component_id, item.quantity]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Продукт и компоненты сохранены', product: productRow });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

export default router;
