// Sample Indian Market Data (NSE/BSE style)
export const INDIA_INDICES = [
  { name: 'NIFTY 50', value: 24589.25, change: +156.30, changePct: +0.64, color: '#00ff88' },
  { name: 'SENSEX', value: 81234.67, change: +487.20, changePct: +0.60, color: '#00d4ff' },
  { name: 'NIFTY BANK', value: 52348.90, change: -234.15, changePct: -0.45, color: '#b347ff' },
  { name: 'NIFTY IT', value: 36782.45, change: +412.80, changePct: +1.13, color: '#ff6b35' },
  { name: 'NIFTY AUTO', value: 24156.30, change: +89.60, changePct: +0.37, color: '#ffd700' },
  { name: 'NIFTY PHARMA', value: 21876.55, change: -156.45, changePct: -0.71, color: '#ff4488' },
]

export const TOP_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2987.45, change: +23.15, changePct: +0.78, mktCap: '20.2L Cr', pe: 28.4, sector: 'Energy' },
  { symbol: 'TCS', name: 'Tata Consultancy Svc', price: 4156.80, change: +67.30, changePct: +1.65, mktCap: '15.1L Cr', pe: 32.1, sector: 'IT' },
  { symbol: 'HDFC BANK', name: 'HDFC Bank Ltd', price: 1723.60, change: -12.45, changePct: -0.72, mktCap: '13.1L Cr', pe: 21.3, sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1834.25, change: +45.80, changePct: +2.56, mktCap: '7.7L Cr', pe: 27.8, sector: 'IT' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1678.90, change: +34.20, changePct: +2.08, mktCap: '9.4L Cr', pe: 45.2, sector: 'Telecom' },
  { symbol: 'ITC', name: 'ITC Limited', price: 512.35, change: -3.45, changePct: -0.67, mktCap: '6.4L Cr', pe: 29.6, sector: 'FMCG' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', price: 623.40, change: +18.90, changePct: +3.13, mktCap: '3.3L Cr', pe: 24.5, sector: 'IT' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 1234.55, change: -8.70, changePct: -0.70, mktCap: '3.8L Cr', pe: 17.8, sector: 'Banking' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 12456.75, change: +234.50, changePct: +1.92, mktCap: '3.8L Cr', pe: 31.4, sector: 'Auto' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1876.30, change: -45.60, changePct: -2.37, mktCap: '4.5L Cr', pe: 38.7, sector: 'Pharma' },
]

// Generate OHLCV candlestick data
export const generateCandlestickData = (days = 90, startPrice = 2000, volatility = 0.02) => {
  const data = []
  let price = startPrice
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    const open = price
    const change = (Math.random() - 0.48) * volatility * price
    const high = open + Math.abs(change) * (1 + Math.random() * 0.5)
    const low = open - Math.abs(change) * (1 + Math.random() * 0.5)
    const close = open + change
    const volume = Math.floor(1000000 + Math.random() * 5000000)
    price = close
    data.push({
      date: date.toISOString().split('T')[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    })
  }
  return data
}

// Compute RSI
export const computeRSI = (prices, period = 14) => {
  const rsi = []
  for (let i = period; i < prices.length; i++) {
    let gains = 0, losses = 0
    for (let j = i - period + 1; j <= i; j++) {
      const diff = prices[j] - prices[j - 1]
      if (diff > 0) gains += diff
      else losses -= diff
    }
    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    rsi.push(+(100 - 100 / (1 + rs)).toFixed(2))
  }
  return rsi
}

// Compute MACD
export const computeMACD = (prices) => {
  const ema = (data, period) => {
    const k = 2 / (period + 1)
    let emaVal = data[0]
    return data.map(p => { emaVal = p * k + emaVal * (1 - k); return +emaVal.toFixed(2) })
  }
  const ema12 = ema(prices, 12)
  const ema26 = ema(prices, 26)
  const macd = ema12.map((v, i) => +(v - ema26[i]).toFixed(2))
  const signal = ema(macd, 9)
  const histogram = macd.map((v, i) => +(v - signal[i]).toFixed(2))
  return { macd, signal, histogram }
}

// Compute Bollinger Bands
export const computeBollinger = (prices, period = 20) => {
  return prices.map((_, i) => {
    if (i < period - 1) return null
    const slice = prices.slice(i - period + 1, i + 1)
    const mean = slice.reduce((a, b) => a + b) / period
    const std = Math.sqrt(slice.map(p => Math.pow(p - mean, 2)).reduce((a, b) => a + b) / period)
    return { upper: +(mean + 2 * std).toFixed(2), middle: +mean.toFixed(2), lower: +(mean - 2 * std).toFixed(2) }
  }).filter(Boolean)
}

// Sector performance
export const SECTOR_DATA = [
  { sector: 'Information Technology', return1M: 4.2, return3M: 8.7, return1Y: 23.4, weight: 15.2 },
  { sector: 'Financial Services', return1M: -1.3, return3M: 2.1, return1Y: 12.8, weight: 33.1 },
  { sector: 'Healthcare', return1M: -2.1, return3M: -3.5, return1Y: 8.2, weight: 4.8 },
  { sector: 'Consumer Goods', return1M: 1.8, return3M: 5.4, return1Y: 18.6, weight: 9.4 },
  { sector: 'Energy', return1M: 3.4, return3M: 7.2, return1Y: 31.2, weight: 12.3 },
  { sector: 'Automobile', return1M: 2.7, return3M: 6.8, return1Y: 26.5, weight: 5.9 },
  { sector: 'Telecom', return1M: 5.1, return3M: 12.3, return1Y: 42.1, weight: 4.2 },
  { sector: 'Metals & Mining', return1M: -3.2, return3M: -1.8, return1Y: 14.7, weight: 4.6 },
]

export const generateNiftyHistory = () => {
  const data = []
  let val = 18000
  const startDate = new Date('2023-01-01')
  for (let i = 0; i < 365; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const change = (Math.random() - 0.47) * 0.012 * val
    val = Math.max(15000, val + change)
    data.push({ date: d.toISOString().split('T')[0], nifty: +val.toFixed(2) })
  }
  return data
}
