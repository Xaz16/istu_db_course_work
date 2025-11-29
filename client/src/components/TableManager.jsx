import { useEffect, useMemo, useState } from 'react';
import {
  fetchTable,
  createRecord,
  updateRecord,
  deleteRecord
} from '../api/apiClient.js';
import RecordForm from './RecordForm.jsx';

const composeId = (primaryKey, row) => primaryKey.map((key) => row[key]).join(':');

const TableManager = ({ table }) => {
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchField, setSearchField] = useState(table.searchable[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState(Object.keys(table.fields)[0]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filterEntries = useMemo(() => table.filterable || [], [table]);

  const loadData = async (page = meta.page) => {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchTable(table.name, {
        page,
        limit: meta.limit,
        searchField,
        searchTerm,
        sortField,
        sortDirection,
        ...filters
      });
      setRecords(payload.data);
      setMeta(payload.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchField, searchTerm, sortField, sortDirection, JSON.stringify(filters)]);

  const handleSave = async (payload) => {
    try {
      if (editing) {
        await updateRecord(table.name, composeId(table.primaryKey, editing), payload);
      } else {
        await createRecord(table.name, payload);
      }
      setShowForm(false);
      setEditing(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Удалить запись?')) return;
    try {
      await deleteRecord(table.name, composeId(table.primaryKey, row));
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const renderCell = (value) => {
    if (value === null || value === undefined) return '—';
    return value;
  };

  return (
    <section className="table-manager">
      <header className="section-header">
        <div>
          <h2>{table.label}</h2>
          <p>Всего записей: {meta.total}</p>
        </div>
        <div className="actions">
          <button className="primary" onClick={() => { setEditing(null); setShowForm(true); }}>Добавить запись</button>
          <button onClick={() => loadData()}>Обновить</button>
        </div>
      </header>

      <div className="controls">
        {table.searchable.length > 0 && (
          <div className="control-group">
            <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
              {table.searchable.map((field) => (
                <option key={field} value={field}>{table.fields[field].label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Поиск"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        <div className="control-group">
          <label>
            Сортировка
            <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
              {Object.entries(table.fields).map(([field, metaField]) => (
                <option key={field} value={field}>{metaField.label}</option>
              ))}
            </select>
          </label>
          <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
            <option value="asc">↑</option>
            <option value="desc">↓</option>
          </select>
        </div>
        {filterEntries.length > 0 && (
          <div className="filters">
            {filterEntries.map((field) => (
              <label key={field}>
                {table.fields[field].label}
                <input
                  type="text"
                  value={filters[field] || ''}
                  onChange={(e) => handleFilterChange(field, e.target.value)}
                />
              </label>
            ))}
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loader">Загрузка...</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {Object.entries(table.fields).map(([field, metaField]) => (
                  <th key={field}>{metaField.label}</th>
                ))}
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <tr key={composeId(table.primaryKey, row)}>
                  {Object.keys(table.fields).map((field) => (
                    <td key={field}>{renderCell(row[field])}</td>
                  ))}
                  <td>
                    <button onClick={() => { setEditing(row); setShowForm(true); }}>Изменить</button>
                    <button className="danger" onClick={() => handleDelete(row)}>Удалить</button>
                  </td>
                </tr>
              ))}
              {!records.length && (
                <tr>
                  <td colSpan={Object.keys(table.fields).length + 1}>Нет данных</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <footer className="pagination">
        <button disabled={meta.page <= 1} onClick={() => loadData(meta.page - 1)}>Назад</button>
        <span>Страница {meta.page}</span>
        <button disabled={meta.page * meta.limit >= meta.total} onClick={() => loadData(meta.page + 1)}>Вперед</button>
      </footer>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editing ? 'Правка записи' : 'Новая запись'}</h3>
            <RecordForm
              fields={table.fields}
              initialData={editing || {}}
              onSubmit={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
              primaryKey={table.primaryKey}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default TableManager;
