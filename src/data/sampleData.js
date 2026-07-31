export const SAMPLE_SALES_DATA = Array.from({ length: 200 }, (_, i) => ({
  Date: new Date(2023, Math.floor(i / 17), (i % 28) + 1).toISOString().split('T')[0],
  Product: ['Laptop', 'Phone', 'Tablet', 'Watch', 'Earbuds'][i % 5],
  Category: ['Electronics', 'Accessories', 'Electronics', 'Wearables', 'Accessories'][i % 5],
  Region: ['North', 'South', 'East', 'West', 'Central'][i % 5],
  Sales: +(10000 + Math.random() * 90000).toFixed(2),
  Units: Math.floor(1 + Math.random() * 50),
  Profit: +(1000 + Math.random() * 20000).toFixed(2),
  CustomerAge: Math.floor(22 + Math.random() * 43),
  Rating: +(3 + Math.random() * 2).toFixed(1),
}))

export const SAMPLE_STOCK_DATA = Array.from({ length: 250 }, (_, i) => {
  const date = new Date(2024, 0, 1)
  date.setDate(date.getDate() + i)
  const base = 2000 + i * 3 + Math.sin(i / 10) * 200
  const open = +(base + (Math.random() - 0.5) * 40).toFixed(2)
  const close = +(base + (Math.random() - 0.48) * 40).toFixed(2)
  const high = +(Math.max(open, close) + Math.random() * 30).toFixed(2)
  const low = +(Math.min(open, close) - Math.random() * 30).toFixed(2)
  return {
    Date: date.toISOString().split('T')[0],
    Symbol: 'RELIANCE.NS',
    Open: open, High: high, Low: low, Close: close,
    Volume: Math.floor(1000000 + Math.random() * 8000000),
    'Adj Close': close,
  }
})
