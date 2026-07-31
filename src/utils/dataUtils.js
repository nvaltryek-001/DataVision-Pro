import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (r) => resolve(processData(r.data, file.name)),
        error: reject
      })
    } else if (['xlsx', 'xls'].includes(ext)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, { defval: null })
        resolve(processData(data, file.name))
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    } else if (ext === 'json') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const raw = JSON.parse(e.target.result)
          const arr = Array.isArray(raw) ? raw : raw.data || [raw]
          resolve(processData(arr, file.name))
        } catch (err) { reject(err) }
      }
      reader.onerror = reject
      reader.readAsText(file)
    } else {
      reject(new Error('Unsupported format. Use CSV, XLSX, or JSON.'))
    }
  })
}

export const processData = (rows, filename = 'dataset') => {
  if (!rows || rows.length === 0) return null
  const columns = Object.keys(rows[0])
  const colTypes = {}
  const colStats = {}

  columns.forEach(col => {
    const vals = rows.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '')
    const nums = vals.map(v => parseFloat(v)).filter(n => !isNaN(n))
    const isNumeric = nums.length / vals.length > 0.7
    colTypes[col] = isNumeric ? 'numeric' : isDateCol(col, vals) ? 'date' : 'categorical'

    if (isNumeric && nums.length > 0) {
      const sorted = [...nums].sort((a, b) => a - b)
      colStats[col] = {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: nums.reduce((a, b) => a + b, 0) / nums.length,
        median: sorted[Math.floor(sorted.length / 2)],
        std: stdDev(nums),
        count: nums.length,
        nullCount: rows.length - vals.length
      }
    } else {
      const freq = {}
      vals.forEach(v => { freq[v] = (freq[v] || 0) + 1 })
      colStats[col] = {
        unique: Object.keys(freq).length,
        topValues: Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10),
        count: vals.length,
        nullCount: rows.length - vals.length
      }
    }
  })

  return {
    filename,
    rows,
    columns,
    colTypes,
    colStats,
    rowCount: rows.length,
    colCount: columns.length,
    numericCols: columns.filter(c => colTypes[c] === 'numeric'),
    categoricalCols: columns.filter(c => colTypes[c] === 'categorical'),
    dateCols: columns.filter(c => colTypes[c] === 'date'),
    completeness: calcCompleteness(rows, columns),
    uploadedAt: new Date().toISOString()
  }
}

const isDateCol = (col, vals) => {
  const dateKeywords = /date|time|day|month|year|dt|ts/i
  if (!dateKeywords.test(col)) return false
  const sample = vals.slice(0, 5)
  return sample.some(v => !isNaN(Date.parse(v)))
}

const stdDev = (nums) => {
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  return Math.sqrt(nums.map(n => Math.pow(n - mean, 2)).reduce((a, b) => a + b, 0) / nums.length)
}

const calcCompleteness = (rows, columns) => {
  let filled = 0, total = rows.length * columns.length
  rows.forEach(row => columns.forEach(col => { if (row[col] !== null && row[col] !== undefined && row[col] !== '') filled++ }))
  return ((filled / total) * 100).toFixed(1)
}

export const detectDataType = (filename) => {
  const f = filename.toLowerCase()
  if (f.includes('stock') || f.includes('nse') || f.includes('bse') || f.includes('sensex') || f.includes('nifty') || f.includes('share') || f.includes('equity')) return 'stock'
  if (f.includes('sales') || f.includes('revenue') || f.includes('order')) return 'sales'
  if (f.includes('customer') || f.includes('user') || f.includes('client')) return 'customer'
  if (f.includes('finance') || f.includes('budget') || f.includes('expense')) return 'finance'
  return 'general'
}

export const generateInsights = (dataset) => {
  if (!dataset) return []
  const insights = []
  const { numericCols, colStats, rowCount, completeness, filename } = dataset

  insights.push({ type: 'info', icon: '📊', text: `Dataset has ${rowCount.toLocaleString()} rows and ${dataset.colCount} columns with ${completeness}% data completeness.` })

  numericCols.slice(0, 3).forEach(col => {
    const s = colStats[col]
    const mean = Number(s?.mean)
    const std = Number(s?.std)
    if (s && Number.isFinite(mean) && mean !== 0 && std / mean > 0.5) {
      insights.push({ type: 'warning', icon: '⚡', text: `High variability detected in "${col}" (CV: ${((std / mean) * 100).toFixed(1)}%) — possible outliers.` })
    }
    if (s && s.nullCount > rowCount * 0.1) {
      insights.push({ type: 'warning', icon: '⚠️', text: `"${col}" has ${s.nullCount} missing values (${((s.nullCount / rowCount) * 100).toFixed(1)}%).` })
    }
  })

  const dataType = detectDataType(filename)
  if (dataType === 'stock') {
    insights.push({ type: 'success', icon: '📈', text: 'Stock/Market data detected! Indian market analysis (NSE/BSE) enabled with OHLCV pattern recognition.' })
    insights.push({ type: 'info', icon: '🇮🇳', text: 'Technical indicators like RSI, MACD, Bollinger Bands and candlestick patterns will be computed.' })
  }

  return insights
}

export const fmt = (n, dec = 2) => {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 1e7) return (n / 1e7).toFixed(dec) + 'Cr'
  if (Math.abs(n) >= 1e5) return (n / 1e5).toFixed(dec) + 'L'
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toFixed(dec)
}

export const fmtINR = (n) => {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return '₹' + fmt(n)
}
