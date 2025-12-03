import { useEffect, useState } from 'react';

const toStringValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' && value.includes('T')) {
    return value.slice(0, 10);
  }
  return value;
};

const RecordForm = ({ fields, initialData = {}, onSubmit, onCancel, primaryKey, lookupData = {} }) => {
  const buildState = () => {
    const state = {};
    Object.entries(fields).forEach(([key, meta]) => {
      state[key] = initialData[key] ?? '';
    });
    return state;
  };

  const [formState, setFormState] = useState(buildState);

  useEffect(() => {
    setFormState(buildState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {};
    Object.entries(fields).forEach(([key, meta]) => {
      if (meta.displayOnly) return;
      if (formState[key] === '') return;
      if (meta.type === 'number') {
        payload[key] = Number(formState[key]);
      } else {
        payload[key] = formState[key];
      }
    });
    onSubmit(payload);
  };

  const isPrimaryKey = (field) => primaryKey?.includes(field);

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        {Object.entries(fields).map(([name, meta]) => {
          if (meta.displayOnly) return null;
          
          if (meta.type === 'select' && meta.lookup && lookupData[meta.lookup]) {
            const options = lookupData[meta.lookup];
            const idField = meta.lookup === 'products' ? 'product_id' : 
                          meta.lookup === 'components' ? 'component_id' :
                          meta.lookup === 'materials' ? 'material_id' :
                          meta.lookup === 'operations' ? 'operation_id' : 'id';
            const nameField = meta.lookup === 'products' ? 'product_name' :
                            meta.lookup === 'components' ? 'component_name' :
                            meta.lookup === 'materials' ? 'material_name' :
                            meta.lookup === 'operations' ? 'operation_name' : 'name';
            
            return (
              <label key={name}>
                <span>
                  {meta.label}
                  {meta.required && <sup>*</sup>}
                </span>
                <select
                  name={name}
                  value={toStringValue(formState[name])}
                  onChange={handleChange}
                  required={meta.required}
                  disabled={!!initialData[name] && isPrimaryKey(name)}
                >
                  <option value="">Выберите...</option>
                  {options.map((item) => (
                    <option key={item[idField]} value={item[idField]}>
                      {item[nameField]}
                    </option>
                  ))}
                </select>
              </label>
            );
          }
          
          return (
            <label key={name}>
              <span>
                {meta.label}
                {meta.required && <sup>*</sup>}
              </span>
              <input
                name={name}
                type={meta.type === 'number' ? 'number' : meta.type}
                value={toStringValue(formState[name])}
                onChange={handleChange}
                required={meta.required}
                disabled={!!initialData[name] && isPrimaryKey(name)}
              />
            </label>
          );
        })}
      </div>
      <div className="form-actions">
        <button type="submit" className="primary">Сохранить</button>
        <button type="button" onClick={onCancel}>Отмена</button>
      </div>
    </form>
  );
};

export default RecordForm;
