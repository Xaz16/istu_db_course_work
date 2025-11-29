import { useState } from 'react';
import { submitProductWithComponents } from '../api/apiClient.js';

const createComponentRow = () => ({ component_id: '', quantity: '' });

const ProductWithComponentsForm = () => {
  const [product, setProduct] = useState({
    product_id: '',
    product_name: '',
    price: '',
    furniture_type: ''
  });
  const [components, setComponents] = useState([createComponentRow()]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProductChange = (event) => {
    const { name, value } = event.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (index, field, value) => {
    setComponents((prev) => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  };

  const addComponentRow = () => setComponents((prev) => [...prev, createComponentRow()]);

  const removeComponentRow = (index) => {
    setComponents((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const payload = {
        product: {
          product_id: Number(product.product_id),
          product_name: product.product_name,
          price: Number(product.price),
          furniture_type: product.furniture_type
        },
        components: components
          .filter((item) => item.component_id && item.quantity)
          .map((item) => ({
            component_id: Number(item.component_id),
            quantity: Number(item.quantity)
          }))
      };
      await submitProductWithComponents(payload);
      setStatus('Данные сохранены ✅');
      setProduct({ product_id: '', product_name: '', price: '', furniture_type: '' });
      setComponents([createComponentRow()]);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="table-manager">
      <header className="section-header">
        <div>
          <h2>Новый продукт с компонентами</h2>
          <p>Форма 1:M (products → product_components)</p>
        </div>
      </header>
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            ID изделия
            <input name="product_id" type="number" required value={product.product_id} onChange={handleProductChange} />
          </label>
          <label>
            Название
            <input name="product_name" required value={product.product_name} onChange={handleProductChange} />
          </label>
          <label>
            Цена, ₽
            <input name="price" type="number" required value={product.price} onChange={handleProductChange} />
          </label>
          <label>
            Тип мебели
            <input name="furniture_type" value={product.furniture_type} onChange={handleProductChange} />
          </label>
        </div>

        <h3>Компоненты</h3>
        <div className="components-grid">
          {components.map((row, index) => (
            <div key={index} className="component-row">
              <input
                type="number"
                placeholder="ID компонента"
                value={row.component_id}
                onChange={(e) => handleComponentChange(index, 'component_id', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Количество"
                value={row.quantity}
                onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)}
                required
              />
              {components.length > 1 && (
                <button type="button" onClick={() => removeComponentRow(index)}>✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addComponentRow}>Добавить компонент</button>

        <div className="form-actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
        {status && <div className="status">{status}</div>}
      </form>
    </section>
  );
};

export default ProductWithComponentsForm;
