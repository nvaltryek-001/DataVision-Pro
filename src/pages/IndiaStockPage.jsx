import React, { useState, useMemo } from 'react'
import { AreaChart, Area, LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, Activity, IndianRupee, Zap } from 'lucide-react'
import { INDIA_INDICES, TOP_STOCKS, SECTOR_DATA, generateCandlestickData,
  computeRSI, computeMACD, computeBollinger, generateNiftyHistory } from '../data/indiaMarket'
import { fmt, fmtINR } from '../utils/dataUtils'

const CandleBar = ({ x, y, width, height, open, close, high, low, fill }) => {
  const isUp = close >= open
  const color = isUp ? '#00ff88' : '#ff4488'
  const bodyY = Math.min(y, y + height), bodyH = Math.abs(height) || 1
  const wickX = x + width / 2
  return (
    <g>
      <line x1={wickX} y1={y - Math.abs((high - Math.max(open, close)) / (high - low)) * 100} x2={wickX} y2={bodyY} stroke={color} strokeWidth={1} />
      <rect x={x + 1} y={bodyY} width={Math.max(width - 2, 1)} height={bodyH} fill={color} fillOpacity={0.85} rx={1} />
      <line x1={wickX} y1={bodyY + bodyH} x2={wickX} y2={bodyY + bodyH + 5} stroke={color} strokeWidth={1} />
    </g>
  )
}

export default function IndiaStockPage({ dataset }) {
  const [selectedStock, setSelectedStock] = useState('RELIANCE')
  const [period, setPeriod] = useState('3M')
  const [indicator, setIndicator] = useState('RSI')

  // Use dataset if it looks like stock data, otherwise use sample
  const useDataset = dataset && (dataset.filename.toLowerCase().includes('stock') ||
    dataset.columns.some(c => ['open','high','low','close','volume'].includes(c.toLowerCase())))

  const ohlcv = useMemo(() => {
    if (useDataset) {
      const rows = dataset.rows
      const cols = dataset.columns.map(c => c.toLowerCase())
      const get = (r, names) => {
        for (const n of names) { const i = cols.indexOf(n); if (i !== -1) return parseFloat(r[dataset.columns[i]]) || 0 }
        return 0
      }
      return rows.map(r => ({
        date: r[dataset.columns[cols.indexOf('date')]] || r[dataset.columns[0]],
        open: get(r, ['open']), high: get(r, ['high']), low: get(r, ['low']),
        close: get(r, ['close','adj close']), volume: get(r, ['volume']),
      })).filter(d => d.close > 0)
    }
    return generateCandlestickData(180, 2000 + Math.random() * 3000, 0.018)
  }, [useDataset, dataset])

  const periodDays = { '1M': 22, '3M': 66, '6M': 132, '1Y': 252 }
  const filtered = ohlcv.slice(-periodDays[period] || ohlcv.length)
  const closes = filtered.map(d => d.close)
  const rsiVals = computeRSI(closes)
  const macdData = computeMACD(closes)
  const bollData = computeBollinger(closes)

  const rsiChart = filtered.slice(-rsiVals.length).map((d, i) => ({ date: d.date, rsi: rsiVals[i] }))
  const macdChart = filtered.slice(-macdData.macd.length).map((d, i) => ({
    date: d.date, macd: macdData.macd[i], signal: macdData.signal[i], hist: macdData.histogram[i]
  }))
  const niftyHistory = generateNiftyHistory()

  const lastClose = closes[closes.length - 1] || 0
  const prevClose = closes[closes.length - 2] || lastClose
  const change = lastClose - prevClose
  const changePct = prevClose ? (change / prevClose * 100) : 0
  const isUp = change >= 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="custom-tooltip">
        <p className="text-gray-400 mb-1 text-xs">{label}</p>
        {payload.map((p, i) => p.value !== undefined && (
          <p key={i} style={{ color: p.color || '#fff' }} className="text-xs">
            {p.name}: <span className="font-bold">₹{fmt(p.value)}</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🇮🇳</span>
            <h2 className="text-2xl font-bold">India Stock Market</h2>
          </div>
          <p className="text-gray-400 text-sm">NSE · BSE · Real-time analysis & technical indicators</p>
        </div>
        <div className="flex gap-2">
          {['1M','3M','6M','1Y'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${period===p ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              style={period===p ? {background:'rgba(0,212,255,0.2)', border:'1px solid rgba(0,212,255,0.4)', color:'var(--neon-b)'} : {border:'1px solid rgba(99,102,241,0.15)'}}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Indices ticker */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {INDIA_INDICES.map(idx => (
          <div key={idx.name} className="glass-card p-3 india-stock">
            <p className="text-xs text-gray-500 mb-1">{idx.name}</p>
            <p className="text-lg font-bold font-mono">{idx.value.toLocaleString('en-IN')}</p>
            <p className={`text-xs font-mono ${idx.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {idx.change >= 0 ? '▲' : '▼'} {Math.abs(idx.changePct).toFixed(2)}%
            </p>
          </div>
        ))}
      </div>

      {/* Main chart + price info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {/* Price chart */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <select value={selectedStock} onChange={e => setSelectedStock(e.target.value)}
                  className="font-bold text-lg bg-transparent border-none outline-none cursor-pointer"
                  style={{color:'var(--neon-b)'}}>
                  {TOP_STOCKS.map(s => <option key={s.symbol} value={s.symbol} style={{background:'#0d1526'}}>{s.symbol}</option>)}
                </select>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-bold font-mono">₹{lastClose.toFixed(2)}</span>
                  <span className={`text-sm font-mono ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {isUp ? '▲' : '▼'} ₹{Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={filtered}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#00ff88' : '#ff4488'} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={isUp ? '#00ff88' : '#ff4488'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" />
                <XAxis dataKey="date" tick={{fill:'#8892a4',fontSize:10}} tickLine={false} interval={Math.floor(filtered.length/6)} />
                <YAxis tick={{fill:'#8892a4',fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>'₹'+fmt(v,0)} width={70} />
                <Tooltip content={<CustomTooltip />} />
                {bollData.length > 0 && (() => {
                  const offset = filtered.length - bollData.length
                  const bData = filtered.map((d, i) => ({ ...d, ...(bollData[i - offset] || {}) }))
                  return <>
                    <Line type="monotone" dataKey="upper" data={bData} stroke="rgba(179,71,255,0.4)" strokeWidth={1} dot={false} name="BB Upper" />
                    <Line type="monotone" dataKey="lower" data={bData} stroke="rgba(179,71,255,0.4)" strokeWidth={1} dot={false} name="BB Lower" />
                  </>
                })()}
                <Area type="monotone" dataKey="close" stroke={isUp ? '#00ff88' : '#ff4488'} strokeWidth={2}
                  fill="url(#priceGrad)" name="Close" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Technical indicators */}
          <div className="glass-card p-5">
            <div className="flex gap-3 mb-4">
              {['RSI','MACD','Volume'].map(ind => (
                <button key={ind} onClick={() => setIndicator(ind)}
                  className={`tab-btn px-3 py-1.5 rounded-lg text-xs font-medium glass-card border ${indicator===ind ? 'active' : 'border-transparent text-gray-500'}`}>
                  {ind}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              {indicator === 'RSI' ? (
                <ComposedChart data={rsiChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" />
                  <XAxis dataKey="date" tick={{fill:'#8892a4',fontSize:10}} tickLine={false} interval={Math.floor(rsiChart.length/6)} />
                  <YAxis domain={[0,100]} tick={{fill:'#8892a4',fontSize:10}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{background:'#0d1526',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'10px',fontSize:12}} />
                  <ReferenceLine y={70} stroke="rgba(255,68,136,0.4)" strokeDasharray="4 4" label={{value:'Overbought',fill:'#ff4488',fontSize:9}} />
                  <ReferenceLine y={30} stroke="rgba(0,255,136,0.4)" strokeDasharray="4 4" label={{value:'Oversold',fill:'#00ff88',fontSize:9}} />
                  <Line type="monotone" dataKey="rsi" stroke="#b347ff" strokeWidth={2} dot={false} name="RSI(14)" />
                </ComposedChart>
              ) : indicator === 'MACD' ? (
                <ComposedChart data={macdChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" />
                  <XAxis dataKey="date" tick={{fill:'#8892a4',fontSize:10}} tickLine={false} interval={Math.floor(macdChart.length/6)} />
                  <YAxis tick={{fill:'#8892a4',fontSize:10}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{background:'#0d1526',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'10px',fontSize:12}} />
                  <Bar dataKey="hist" name="Histogram">
                    {macdChart.map((d, i) => <Cell key={i} fill={d.hist >= 0 ? '#00ff88' : '#ff4488'} />)}
                  </Bar>
                  <Line type="monotone" dataKey="macd" stroke="#00d4ff" strokeWidth={1.5} dot={false} name="MACD" />
                  <Line type="monotone" dataKey="signal" stroke="#ff6b35" strokeWidth={1.5} dot={false} name="Signal" />
                </ComposedChart>
              ) : (
                <BarChart data={filtered.slice(-60)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" />
                  <XAxis dataKey="date" tick={{fill:'#8892a4',fontSize:10}} tickLine={false} interval={10} />
                  <YAxis tick={{fill:'#8892a4',fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>(v/1e6).toFixed(1)+'M'} />
                  <Tooltip contentStyle={{background:'#0d1526',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'10px',fontSize:12}} />
                  <Bar dataKey="volume" name="Volume">
                    {filtered.slice(-60).map((d, i) => <Cell key={i} fill={d.close >= d.open ? '#00ff88' : '#ff4488'} fillOpacity={0.7} />)}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top stocks list */}
        <div className="glass-card p-5 h-fit">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap size={14} style={{color:'var(--neon-o)'}} /> Top Stocks
          </h3>
          <div className="space-y-2">
            {TOP_STOCKS.slice(0, 8).map(s => (
              <div key={s.symbol} className="flex items-center justify-between py-2 border-b"
                style={{borderColor:'rgba(99,102,241,0.08)'}}>
                <div>
                  <p className="text-xs font-semibold" style={{color:'var(--neon-b)'}}>{s.symbol}</p>
                  <p className="text-xs text-gray-500">{s.sector}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold">₹{s.price.toLocaleString('en-IN')}</p>
                  <p className={`text-xs font-mono ${s.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {s.change >= 0 ? '▲' : '▼'}{Math.abs(s.changePct).toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector heatmap */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">🏭 Sector Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SECTOR_DATA.map(s => {
            const ret = s.return1M
            const bg = ret > 3 ? 'rgba(0,255,136,0.15)' : ret > 0 ? 'rgba(0,212,255,0.1)' : ret > -2 ? 'rgba(255,107,53,0.12)' : 'rgba(255,68,136,0.15)'
            const col = ret > 3 ? '#00ff88' : ret > 0 ? '#00d4ff' : ret > -2 ? '#ff6b35' : '#ff4488'
            return (
              <div key={s.sector} className="rounded-xl p-3" style={{background:bg, border:`1px solid ${col}33`}}>
                <p className="text-xs font-medium text-gray-300 mb-2 leading-tight">{s.sector}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500">1M</p>
                    <p className="font-bold text-sm font-mono" style={{color:col}}>
                      {ret >= 0 ? '+' : ''}{ret}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">1Y</p>
                    <p className="text-xs font-mono text-gray-300">{s.return1Y > 0 ? '+' : ''}{s.return1Y}%</p>
                  </div>
                </div>
                <div className="mt-2 h-1 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${s.weight*2}%`, background:col, opacity:0.7}}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Weight: {s.weight}%</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* NIFTY 1Y chart */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">📈 NIFTY 50 — 1 Year Journey</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={niftyHistory}>
            <defs>
              <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" />
            <XAxis dataKey="date" tick={{fill:'#8892a4',fontSize:10}} tickLine={false} interval={30} />
            <YAxis tick={{fill:'#8892a4',fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>v.toLocaleString('en-IN')} width={75} />
            <Tooltip contentStyle={{background:'#0d1526',border:'1px solid rgba(255,107,53,0.3)',borderRadius:'10px',fontSize:12,fontFamily:'JetBrains Mono'}} />
            <Area type="monotone" dataKey="nifty" stroke="#ff6b35" strokeWidth={2} fill="url(#niftyGrad)" name="NIFTY 50" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
