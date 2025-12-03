export const reports = [
  {
    name: 'expensive-products',
    label: 'Дорогие изделия',
    columns: {
      product_id: 'ID изделия',
      product_name: 'Название',
      price: 'Цена, ₽',
      furniture_type: 'Тип мебели',
      created_date: 'Дата создания'
    },
    summaryLabels: {
      total_price: 'Общая стоимость',
      count: 'Количество'
    },
    fields: [
      { name: 'minPrice', label: 'Минимальная цена', type: 'number', defaultValue: 50000 },
      { name: 'furnitureType', label: 'Тип мебели', type: 'text' },
      { name: 'sortField', label: 'Поле сортировки', type: 'select', options: [
        { value: 'price', label: 'Цена' },
        { value: 'product_name', label: 'Название' }
      ], defaultValue: 'price' },
      { name: 'sortDirection', label: 'Направление', type: 'select', options: [
        { value: 'desc', label: 'По убыванию' },
        { value: 'asc', label: 'По возрастанию' }
      ], defaultValue: 'desc' }
    ]
  },
  {
    name: 'component-usage',
    label: 'Популярность компонентов',
    columns: {
      component_id: 'ID компонента',
      component_name: 'Название',
      price: 'Цена, ₽',
      process_number: '№ процесса',
      product_count: 'Количество изделий'
    },
    summaryLabels: {
      total_usage: 'Общее использование'
    },
    fields: [
      { name: 'minProducts', label: 'Мин. количество изделий', type: 'number', defaultValue: 1 },
      { name: 'sortField', label: 'Поле сортировки', type: 'select', options: [
        { value: 'product_count', label: 'Количество изделий' },
        { value: 'component_name', label: 'Название' }
      ], defaultValue: 'product_count' },
      { name: 'sortDirection', label: 'Направление', type: 'select', options: [
        { value: 'desc', label: 'По убыванию' },
        { value: 'asc', label: 'По возрастанию' }
      ], defaultValue: 'desc' }
    ]
  },
  {
    name: 'sales-profit',
    label: 'Анализ прибыли',
    columns: {
      product_id: 'ID изделия',
      product_name: 'Название',
      selling_price: 'Цена продажи, ₽',
      total_cost: 'Себестоимость, ₽',
      profit: 'Прибыль, ₽',
      profitability_percent: 'Рентабельность, %'
    },
    summaryLabels: {
      total_profit: 'Общая прибыль',
      total_revenue: 'Общая выручка'
    },
    fields: [
      { name: 'minProfit', label: 'Мин. прибыль', type: 'number', defaultValue: 0 },
      { name: 'sortField', label: 'Поле сортировки', type: 'select', options: [
        { value: 'profit', label: 'Прибыль' },
        { value: 'profitability_percent', label: 'Рентабельность' },
        { value: 'product_name', label: 'Название' }
      ], defaultValue: 'profitability_percent' },
      { name: 'sortDirection', label: 'Направление', type: 'select', options: [
        { value: 'desc', label: 'По убыванию' },
        { value: 'asc', label: 'По возрастанию' }
      ], defaultValue: 'desc' }
    ]
  }
];
