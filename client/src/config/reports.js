export const reports = [
  {
    name: 'expensive-products',
    label: 'Дорогие изделия',
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
