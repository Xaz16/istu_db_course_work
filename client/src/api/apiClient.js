const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, value);
  });
  return searchParams.toString() ? `?${searchParams.toString()}` : '';
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload?.message || 'Ошибка запроса';
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
};

export const fetchTable = (table, params) => {
  return fetch(`${API_URL}/tables/${table}${buildQuery(params)}`).then(handleResponse);
};

export const fetchRecord = (table, id) => {
  return fetch(`${API_URL}/tables/${table}/${id}`).then(handleResponse);
};

export const createRecord = (table, payload) => {
  return fetch(`${API_URL}/tables/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse);
};

export const updateRecord = (table, id, payload) => {
  return fetch(`${API_URL}/tables/${table}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse);
};

export const deleteRecord = (table, id) => {
  return fetch(`${API_URL}/tables/${table}/${id}`, {
    method: 'DELETE'
  }).then(handleResponse);
};

export const submitProductWithComponents = (payload) => {
  return fetch(`${API_URL}/forms/product-with-components`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse);
};

export const fetchReport = (reportName, params) => {
  return fetch(`${API_URL}/reports/${reportName}${buildQuery(params)}`).then(handleResponse);
};
