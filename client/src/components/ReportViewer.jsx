import { useEffect, useState } from 'react';
import { fetchReport } from '../api/apiClient.js';

const ReportViewer = ({ report }) => {
  const [params, setParams] = useState(() => {
    const defaults = {};
    report.fields.forEach((field) => {
      defaults[field.name] = field.defaultValue ?? '';
    });
    return defaults;
  });
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchReport(report.name, params);
      setData(payload.data);
      setSummary(payload.summary || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="table-manager">
      <header className="section-header">
        <div>
          <h2>{report.label}</h2>
          <p>Отчет формируется по представлениям БД</p>
        </div>
        <div className="actions">
          <button className="primary" onClick={loadReport}>Построить</button>
        </div>
      </header>

      <div className="controls">
        {report.fields.map((field) => (
          <label key={field.name}>
            {field.label}
            {field.type === 'select' ? (
              <select value={params[field.name]} onChange={(e) => handleChange(field.name, e.target.value)}>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={params[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loader">Формируем отчет...</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {data[0] && Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((value, colIdx) => (
                    <td key={colIdx}>{value}</td>
                  ))}
                </tr>
              ))}
              {!data.length && (
                <tr>
                  <td colSpan={3}>Нет данных</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {summary && (
        <div className="summary">
          <h4>Итоги</h4>
          <ul>
            {Object.entries(summary).map(([key, value]) => (
              <li key={key}>{key}: {value}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ReportViewer;
