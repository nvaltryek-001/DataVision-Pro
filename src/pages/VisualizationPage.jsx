import React, { useState, useMemo } from 'react'
import { AreaChart, Area, LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { BarChart2, TrendingUp, Activity, Grid, Target, Layers } from 'lucide-react'
import { fmt } from '../utils/dataUtils'

const COLORS = ['#6366f1','#00d4ff','#00ff88','#b347ff','#ff6b35','#ffd700','#ff4488','#00ffcc']

const CHART_TYPES = [
  { id: 'line', label: 'Line', icon: TrendingUp },
  { id: 'area', label: 'Area', icon: Activity },
  { id: 'bar', label: 'Bar', icon: BarChart2 },
  { id: 'scatter', label: 'Scatter', icon: Target },
  { id: 'radar', label: 'Radar', icon: Grid },
  { id: 'multi', label: 'Multi', icon: Layers },
]

export default function VisualizationPage({ dataset }) {
  const { rows, columns, colTypes, numericCols, categoricalCols } = dataset
  const [chartType, setChartType] = useState('area')
  const [xCol, setXCol] = useState(columns.find(c => colTypes[c] === 'date') || columns[0])
  const [yCols, setYCols] = useState(numericCols.slice(0, 2))
  const [colorBy, setColorBy] = useState(categoricalCols[0] || '')

  const chartData = useMemo(() => {
    const limit = 200
    return rows.slice(0, limit).map(r => {
      const obj = { x: r[xCol] }
      yCols.forEach(c => { obj[c] = r[c] })
      if (colorBy) obj._color = r[colorBy]
      return obj
    }).sort((a, b) => String(a.x).localeCompare(String(b.x)))
  }, [rows, xCol, yCols, colorBy])

  // Aggregated bar data
  const aggData = useMemo(() => {
    const catCol = categoricalCols[0]
    if (!catCol || !yCols[0]) return []
    const agg = {}
    rows.forEach(r => {
      const k = String(r[catCol] || 'Unknown').slice(0, 15)
      yCols.forEach(c => { if (!agg[k]) agg[k] = {}; agg[k][c] = (agg[k][c] || 0) + (parseFloat(r[c]) || 0) })
    })
    return Object.entries(agg).sort((a, b) => b[1][yCols[0]] - a[1][yCols[0]]).slice(0, 10)
      .map(([name, vals]) => ({ name, ...vals }))
  }, [rows, categoricalCols, yCols])

  // Radar data from numeric stats
  const radarData = useMemo(() => {
    return numericCols.slice(0, 6).map(col => {
      const vals = rows.map(r => parseFloat(r[col])).filter(n => !isNaN(n))
      const max = Math.max(...vals)
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length
      return { col, normalized: max > 0 ? +(mean / max * 100).toFixed(1) : 0 }
    })
  }, [rows, numericCols])

  const toggleY = (col) => {
    setYCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col].slice(0, 4))
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="custom-tooltip">
        <p className="text-gray-400 mb-2 text-xs border-b pb-1" style={{borderColor:'rgba(99,102,241,0.2)'}}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-xs">
            {p.name}: <span className="font-bold">{fmt(p.value)}</span>
          </p>
        ))}
      </div>
    )
  }

  const renderChart = () => {
    const common = {
      data: chartType === 'bar' ? aggData : chartData,
      margin: { top: 5, right: 10, left: 0, bottom: 5 }
    }
    const axisProps = {
      tick: { fill: '#8892a4', fontSize: 10 }, tickLine: false,
    }

    if (chartType === 'line') return (
      <LineChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
        <XAxis dataKey="x" {...axisProps} />
        <YAxis {...axisProps} axisLine={false} tickFormatter={v => fmt(v, 0)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#8892a4', fontSize: 12 }} />
        {yCols.map((col, i) => <Line key={col} type="monotone" dataKey={col} stroke={COLORS[i]} strokeWidth={2} dot={false} />)}
      </LineChart>
    )

    if (chartType === 'area') return (
      <AreaChart {...common}>
        <defs>
          {yCols.map((col, i) => (
            <linearGradient key={col} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[i]} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
        <XAxis dataKey="x" {...axisProps} />
        <YAxis {...axisProps} axisLine={false} tickFormatter={v => fmt(v, 0)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#8892a4', fontSize: 12 }} />
        {yCols.map((col, i) => (
          <Area key={col} type="monotone" dataKey={col} stroke={COLORS[i]} strokeWidth={2} fill={`url(#grad${i})`} />
        ))}
      </AreaChart>
    )

    if (chartType === 'bar') return (
      <BarChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis {...axisProps} axisLine={false} tickFormatter={v => fmt(v, 0)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#8892a4', fontSize: 12 }} />
        {yCols.map((col, i) => <Bar key={col} dataKey={col} fill={COLORS[i]} radius={[4, 4, 0, 0]} />)}
      </BarChart>
    )

    if (chartType === 'scatter') return (
      <ScatterChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
        <XAxis dataKey={yCols[0] || 'x'} name={yCols[0]} {...axisProps} tickFormatter={v => fmt(v, 0)} />
        <YAxis dataKey={yCols[1] || yCols[0]} name={yCols[1]} {...axisProps} axisLine={false} tickFormatter={v => fmt(v, 0)} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', fontSize: 12 }} />
        <Scatter data={chartData.map(d => ({ x: d[yCols[0]], y: d[yCols[1] || yCols[0]] }))} fill="#b347ff" fillOpacity={0.7} />
      </ScatterChart>
    )

    if (chartType === 'radar') return (
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
        <PolarGrid stroke="rgba(99,102,241,0.15)" />
        <PolarAngleAxis dataKey="col" tick={{ fill: '#8892a4', fontSize: 11 }} />
        <Radar name="Average %" dataKey="normalized" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.2} strokeWidth={2} />
        <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', fontSize: 12 }} />
      </RadarChart>
    )

    if (chartType === 'multi') return (
      <ComposedChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
        <XAxis dataKey="x" {...axisProps} />
        <YAxis {...axisProps} axisLine={false} tickFormatter={v => fmt(v, 0)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#8892a4', fontSize: 12 }} />
        {yCols[0] && <Bar dataKey={yCols[0]} fill="#6366f1" fillOpacity={0.7} radius={[4, 4, 0, 0]} />}
        {yCols[1] && <Line type="monotone" dataKey={yCols[1]} stroke="#00ff88" strokeWidth={2} dot={false} />}
      </ComposedChart>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Visualization Studio</h2>

      {/* Controls */}
      <div className="glass-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart type */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Chart Type</label>
            <div className="grid grid-cols-3 gap-2">
              {CHART_TYPES.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setChartType(id)}
                  className={`tab-btn px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 glass-card border ${chartType === id ? 'active' : 'border-transparent text-gray-400 hover:text-white'}`}>
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* X Axis */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">X Axis</label>
            <select value={xCol} onChange={e => setXCol(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm text-white"
              style={{ background: 'rgba(13,21,38,0.9)', border: '1px solid rgba(99,102,241,0.25)' }}>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Y Axes */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Y Axes (select up to 4)</label>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {numericCols.map((col, i) => (
                <button key={col} onClick={() => toggleY(col)}
                  className="px-2 py-1 rounded-lg text-xs transition-all"
                  style={{
                    background: yCols.includes(col) ? `${COLORS[i % COLORS.length]}33` : 'rgba(99,102,241,0.08)',
                    border: `1px solid ${yCols.includes(col) ? COLORS[i % COLORS.length] : 'rgba(99,102,241,0.15)'}`,
                    color: yCols.includes(col) ? COLORS[i % COLORS.length] : '#8892a4'
                  }}>
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main chart */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 text-gray-300">
          {yCols.join(', ')} — {CHART_TYPES.find(c => c.id === chartType)?.label} Chart
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Distribution charts for each numeric col */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-300">📊 Column Distributions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {numericCols.slice(0, 6).map((col, ci) => {
            const vals = rows.map(r => parseFloat(r[col])).filter(n => !isNaN(n))
            const min = Math.min(...vals), max = Math.max(...vals)
            const buckets = 15
            const step = (max - min) / buckets
            const hist = Array.from({ length: buckets }, (_, i) => {
              const lo = min + i * step, hi = lo + step
              return { range: fmt(lo, 0), count: vals.filter(v => v >= lo && v < hi).length }
            })
            return (
              <div key={col} className="glass-card p-4">
                <p className="text-xs font-medium mb-3" style={{ color: COLORS[ci % COLORS.length] }}>{col}</p>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={hist} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <XAxis dataKey="range" tick={{ fill: '#8892a4', fontSize: 9 }} tickLine={false} interval={4} />
                    <YAxis tick={{ fill: '#8892a4', fontSize: 9 }} tickLine={false} axisLine={false} />
                    <Bar dataKey="count" fill={COLORS[ci % COLORS.length]} fillOpacity={0.75} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
