import { useState, useEffect } from 'react';
import { submitProductWithComponents, fetchLookup } from '../api/apiClient.js';

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
  const [productsList, setProductsList] = useState([]);
  const [componentsList, setComponentsList] = useState([]);

  useEffect(() => {
    const loadLookupData = async () => {
      try {
        const [products, components] = await Promise.all([
          fetchLookup('products'),
          fetchLookup('components')
        ]);
        setProductsList(products);
        setComponentsList(components);
      } catch (error) {
        console.error('Failed to load lookup data:', error);
      }
    };
    loadLookupData();
  }, []);

  const handleProductChange = (event) => {
    const { name, value } = event.target;
    if (name === 'product_id') {
      const selectedProduct = productsList.find(p => p.product_id === Number(value));
      setProduct((prev) => ({ 
        ...prev, 
        [name]: value,
        product_name: selectedProduct ? selectedProduct.product_name : prev.product_name
      }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
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
            <span>Изделие</span>
            <select name="product_id" required value={product.product_id} onChange={handleProductChange}>
              <option value="">Выберите изделие...</option>
              {productsList.map((item) => (
                <option key={item.product_id} value={item.product_id}>
                  {item.product_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Название</span>
            <input name="product_name" required value={product.product_name} onChange={handleProductChange} />
          </label>
          <label>
            <span>Цена, ₽</span>
            <input name="price" type="number" required value={product.price} onChange={handleProductChange} />
          </label>
          <label>
            <span>Тип мебели</span>
            <input name="furniture_type" value={product.furniture_type} onChange={handleProductChange} />
          </label>
        </div>

        <h3>Компоненты</h3>
        <div className="components-grid">
          {components.map((row, index) => (
            <div key={index} className="component-row">
              <select
                value={row.component_id}
                onChange={(e) => handleComponentChange(index, 'component_id', e.target.value)}
                required
              >
                <option value="">Выберите компонент...</option>
                {componentsList.map((item) => (
                  <option key={item.component_id} value={item.component_id}>
                    {item.component_name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Количество"
                value={row.quantity}
                onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)}
                required
                min="1"
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
