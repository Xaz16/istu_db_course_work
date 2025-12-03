export const buildWhere = ({ filters = {}, searchField, searchTerm, table = '' }) => {
  const clauses = [];
  const params = [];

  Object.entries(filters).forEach(([field, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.push(value);
      const qualifiedField = table ? `${table}.${field}` : field;
      clauses.push(`${qualifiedField} = $${params.length}`);
    }
  });

  if (searchField && searchTerm) {
    params.push(`%${searchTerm}%`);
    const qualifiedSearchField = table ? `${table}.${searchField}` : searchField;
    clauses.push(`${qualifiedSearchField} ILIKE $${params.length}`);
  }

  const text = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  return { text, params };
};

export const buildSelectQuery = ({
  table,
  columns = ['*'],
  filters = {},
  searchField,
  searchTerm,
  sortField,
  sortDirection = 'asc',
  page = 1,
  limit = 25,
  joins = []
}) => {
  const { text: whereClause, params } = buildWhere({ filters, searchField, searchTerm, table });

  const joinClauses = [];
  const joinColumns = [];

  if (joins && joins.length > 0) {
    joins.forEach((join) => {
      const joinType = join.type || 'LEFT';
      const joinTable = join.table;
      const onConditions = Object.entries(join.on).map(([left, right]) => `${left} = ${right}`).join(' AND ');
      joinClauses.push(`${joinType} JOIN ${joinTable} ON ${onConditions}`);

      if (join.select && join.select.length > 0) {
        join.select.forEach((col) => {
          const alias = `${joinTable}_${col}`;
          joinColumns.push(`${joinTable}.${col} AS "${alias}"`);
        });
      }
    });
  }

  const baseTableColumns = columns.map(col => `${table}.${col}`).join(', ');
  const allColumns = joinColumns.length > 0
    ? `${baseTableColumns}, ${joinColumns.join(', ')}`
    : baseTableColumns;

  const joinClause = joinClauses.length > 0 ? ` ${joinClauses.join(' ')}` : '';
  let text = `SELECT ${allColumns} FROM ${table}${joinClause}${whereClause}`;
  const whereParams = [...params];

  if (sortField) {
    const dir = sortDirection?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const sortColumn = columns.includes(sortField) ? `${table}.${sortField}` : sortField;
    text += ` ORDER BY ${sortColumn} ${dir}`;
  }

  const safeLimit = Math.min(Number(limit) || 25, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  params.push(safeLimit);
  params.push((safePage - 1) * safeLimit);
  text += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

  return { text, params, whereClause, whereParams };
};

export const buildInsertQuery = ({ table, payload }) => {
  const columns = Object.keys(payload);
  const placeholders = columns.map((_, idx) => `$${idx + 1}`);
  const text = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
  const params = Object.values(payload);
  return { text, params };
};

export const buildUpdateQuery = ({ table, payload, keyFilter }) => {
  const columns = Object.keys(payload);
  const params = [];
  const setters = columns.map((column, idx) => {
    params.push(payload[column]);
    return `${column} = $${idx + 1}`;
  });

  const whereParts = Object.keys(keyFilter).map((key, idx) => {
    params.push(keyFilter[key]);
    return `${key} = $${columns.length + idx + 1}`;
  });

  const text = `UPDATE ${table} SET ${setters.join(', ')} WHERE ${whereParts.join(' AND ')} RETURNING *`;
  return { text, params };
};

export const buildDeleteQuery = ({ table, keyFilter }) => {
  const conditions = Object.keys(keyFilter).map((key, idx) => `${key} = $${idx + 1}`);
  const params = Object.values(keyFilter);
  const text = `DELETE FROM ${table} WHERE ${conditions.join(' AND ')}`;
  return { text, params };
};
