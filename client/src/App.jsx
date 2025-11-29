import { useState } from 'react';
import './App.css';
import { tables } from './config/tables.js';
import { reports } from './config/reports.js';
import TableManager from './components/TableManager.jsx';
import ReportViewer from './components/ReportViewer.jsx';
import ProductWithComponentsForm from './components/ProductWithComponentsForm.jsx';

const App = () => {
  const [activeSection, setActiveSection] = useState({ type: 'table', name: tables[0].name });

  const renderContent = () => {
    if (activeSection.type === 'table') {
      const tableConfig = tables.find((item) => item.name === activeSection.name);
      return <TableManager table={tableConfig} />;
    }
    if (activeSection.type === 'report') {
      const reportConfig = reports.find((item) => item.name === activeSection.name);
      return <ReportViewer report={reportConfig} />;
    }
    if (activeSection.type === 'form') {
      return <ProductWithComponentsForm />;
    }
    return null;
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1>Furniture ERP</h1>
        <nav>
          <p className="group-title">Таблицы</p>
          {tables.map((table) => (
            <button
              key={table.name}
              className={activeSection.name === table.name && activeSection.type === 'table' ? 'active' : ''}
              onClick={() => setActiveSection({ type: 'table', name: table.name })}
            >
              {table.label}
            </button>
          ))}
          <p className="group-title">Формы</p>
          <button
            className={activeSection.type === 'form' ? 'active' : ''}
            onClick={() => setActiveSection({ type: 'form', name: 'product-form' })}
          >
            Продукт + компоненты
          </button>
          <p className="group-title">Отчеты</p>
          {reports.map((report) => (
            <button
              key={report.name}
              className={activeSection.name === report.name && activeSection.type === 'report' ? 'active' : ''}
              onClick={() => setActiveSection({ type: 'report', name: report.name })}
            >
              {report.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">{renderContent()}</main>
    </div>
  );
};

export default App;
