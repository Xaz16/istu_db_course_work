const tableConfigs = {
  operations_catalog: {
    label: 'Каталог операций',
    primaryKey: ['operation_id'],
    defaultSort: { field: 'operation_id', direction: 'asc' },
    columns: ['operation_id', 'operation_name', 'hourly_rate', 'hours_required', 'created_date'],
    searchable: ['operation_name'],
    filterable: ['hourly_rate'],
    schema: {
      operation_id: { type: 'number', required: true },
      operation_name: { type: 'string', required: true },
      hourly_rate: { type: 'number', required: true },
      hours_required: { type: 'number', required: false },
      created_date: { type: 'date', required: false }
    }
  },
  materials: {
    label: 'Материалы',
    primaryKey: ['material_id'],
    defaultSort: { field: 'material_id', direction: 'asc' },
    columns: ['material_id', 'material_name', 'price', 'unit_of_measure', 'stock_quantity'],
    searchable: ['material_name'],
    filterable: ['unit_of_measure'],
    schema: {
      material_id: { type: 'number', required: true },
      material_name: { type: 'string', required: true },
      price: { type: 'number', required: true },
      unit_of_measure: { type: 'string', required: false },
      stock_quantity: { type: 'number', required: false }
    }
  },
  components: {
    label: 'Компоненты',
    primaryKey: ['component_id'],
    defaultSort: { field: 'component_id', direction: 'asc' },
    columns: ['component_id', 'component_name', 'price', 'process_number', 'created_date'],
    searchable: ['component_name'],
    filterable: ['process_number'],
    schema: {
      component_id: { type: 'number', required: true },
      component_name: { type: 'string', required: true },
      price: { type: 'number', required: true },
      process_number: { type: 'number', required: true },
      created_date: { type: 'date', required: false }
    }
  },
  products: {
    label: 'Продукция',
    primaryKey: ['product_id'],
    defaultSort: { field: 'product_id', direction: 'asc' },
    columns: ['product_id', 'product_name', 'price', 'furniture_type', 'created_date'],
    searchable: ['product_name', 'furniture_type'],
    filterable: ['furniture_type'],
    schema: {
      product_id: { type: 'number', required: true },
      product_name: { type: 'string', required: true },
      price: { type: 'number', required: true },
      furniture_type: { type: 'string', required: false },
      created_date: { type: 'date', required: false }
    }
  },
  product_components: {
    label: 'Компоненты изделий',
    primaryKey: ['product_id', 'component_id'],
    defaultSort: { field: 'product_id', direction: 'asc' },
    columns: ['product_id', 'component_id', 'quantity'],
    joins: [
      { type: 'LEFT', table: 'products', on: { 'product_components.product_id': 'products.product_id' }, select: ['product_name'] },
      { type: 'LEFT', table: 'components', on: { 'product_components.component_id': 'components.component_id' }, select: ['component_name'] }
    ],
    searchable: [],
    filterable: ['product_id'],
    schema: {
      product_id: { type: 'number', required: true },
      component_id: { type: 'number', required: true },
      quantity: { type: 'number', required: true }
    }
  },
  production_process: {
    label: 'Технологический процесс',
    primaryKey: ['component_id', 'material_id', 'operation_id'],
    defaultSort: { field: 'component_id', direction: 'asc' },
    columns: ['component_id', 'material_id', 'material_quantity', 'operation_id'],
    joins: [
      { type: 'LEFT', table: 'components', on: { 'production_process.component_id': 'components.component_id' }, select: ['component_name'] },
      { type: 'LEFT', table: 'materials', on: { 'production_process.material_id': 'materials.material_id' }, select: ['material_name'] },
      { type: 'LEFT', table: 'operations_catalog', on: { 'production_process.operation_id': 'operations_catalog.operation_id' }, select: ['operation_name'] }
    ],
    searchable: [],
    filterable: ['component_id', 'material_id', 'operation_id'],
    schema: {
      component_id: { type: 'number', required: true },
      material_id: { type: 'number', required: true },
      material_quantity: { type: 'number', required: true },
      operation_id: { type: 'number', required: true }
    }
  }
};

export default tableConfigs;
