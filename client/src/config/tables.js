export const tables = [
  {
    name: 'operations_catalog',
    label: 'Каталог операций',
    primaryKey: ['operation_id'],
    searchable: ['operation_name'],
    filterable: ['hourly_rate'],
    fields: {
      operation_id: { label: 'ID операции', type: 'number', required: true },
      operation_name: { label: 'Название', type: 'text', required: true },
      hourly_rate: { label: 'Ставка, ₽/ч', type: 'number', required: true },
      hours_required: { label: 'Трудоемкость, ч', type: 'number', required: false },
      created_date: { label: 'Дата создания', type: 'date', required: false }
    }
  },
  {
    name: 'materials',
    label: 'Материалы',
    primaryKey: ['material_id'],
    searchable: ['material_name'],
    filterable: ['unit_of_measure'],
    fields: {
      material_id: { label: 'ID материала', type: 'number', required: true },
      material_name: { label: 'Название', type: 'text', required: true },
      price: { label: 'Цена, ₽', type: 'number', required: true },
      unit_of_measure: { label: 'Ед. изм.', type: 'text', required: false },
      stock_quantity: { label: 'Остаток', type: 'number', required: false }
    }
  },
  {
    name: 'components',
    label: 'Компоненты',
    primaryKey: ['component_id'],
    searchable: ['component_name'],
    filterable: ['process_number'],
    fields: {
      component_id: { label: 'ID компонента', type: 'number', required: true },
      component_name: { label: 'Название', type: 'text', required: true },
      price: { label: 'Цена, ₽', type: 'number', required: true },
      process_number: { label: '№ процесса', type: 'number', required: true },
      created_date: { label: 'Дата создания', type: 'date', required: false }
    }
  },
  {
    name: 'products',
    label: 'Изделия',
    primaryKey: ['product_id'],
    searchable: ['product_name', 'furniture_type'],
    filterable: ['furniture_type'],
    fields: {
      product_id: { label: 'ID изделия', type: 'number', required: true },
      product_name: { label: 'Название', type: 'text', required: true },
      price: { label: 'Цена, ₽', type: 'number', required: true },
      furniture_type: { label: 'Тип мебели', type: 'text', required: false },
      created_date: { label: 'Дата создания', type: 'date', required: false }
    }
  },
  {
    name: 'product_components',
    label: 'Компоненты изделий',
    primaryKey: ['product_id', 'component_id'],
    searchable: [],
    filterable: ['product_id'],
    fields: {
      product_id: { label: 'Изделие', type: 'select', lookup: 'products', required: true },
      products_product_name: { label: 'Название изделия', type: 'text', displayOnly: true },
      component_id: { label: 'Компонент', type: 'select', lookup: 'components', required: true },
      components_component_name: { label: 'Название компонента', type: 'text', displayOnly: true },
      quantity: { label: 'Количество', type: 'number', required: true }
    }
  },
  {
    name: 'production_process',
    label: 'Техпроцесс',
    primaryKey: ['component_id', 'material_id', 'operation_id'],
    searchable: [],
    filterable: ['component_id', 'material_id', 'operation_id'],
    fields: {
      component_id: { label: 'Компонент', type: 'select', lookup: 'components', required: true },
      components_component_name: { label: 'Название компонента', type: 'text', displayOnly: true },
      material_id: { label: 'Материал', type: 'select', lookup: 'materials', required: true },
      materials_material_name: { label: 'Название материала', type: 'text', displayOnly: true },
      material_quantity: { label: 'Количество материала', type: 'number', required: true },
      operation_id: { label: 'Операция', type: 'select', lookup: 'operations', required: true },
      operations_catalog_operation_name: { label: 'Название операции', type: 'text', displayOnly: true }
    }
  }
];
