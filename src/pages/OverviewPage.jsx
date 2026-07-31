import React, { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Database, BarChart2, PieChart as PieIcon, Activity } from 'lucide-react'
import { fmt } from '../utils/dataUtils'

const COLORS = ['#6366f1','#00d4ff','#00ff88','#b347ff','#ff6b35','#ffd700','#ff4488','#00ffcc']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <p className="text-gray-400 mb-1 text-xs">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? fmt(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function OverviewPage({ dataset, insights }) {
  const { rows, columns, colTypes, colStats, numericCols, categoricalCols, rowCount, colCount, completeness } = dataset

  // Build chart data from first numeric col
  const timeSeriesData = useMemo(() => {
    const dateCol = columns.find(c => colTypes[c] === 'date')
    const numCol = numericCols[0]
    if (!dateCol || !numCol) return []
    return rows.slice(0, 100).map(r => ({ date: String(r[dateCol]).slice(0, 10), value: r[numCol] }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [rows, columns, colTypes, numericCols])

  // Top categories
  const catData = useMemo(() => {
    const catCol = categoricalCols[0]
    const numCol = numericCols[0]
    if (!catCol || !numCol) return []
    const agg = {}
    rows.forEach(r => {
      const k = String(r[catCol] || 'Unknown')
      agg[k] = (agg[k] || 0) + (parseFloat(r[numCol]) || 0)
    })
    return Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, value]) => ({ name, value: +value.toFixed(2) }))
  }, [rows, categoricalCols, numericCols])

  // Distribution of second categorical
  const pieData = useMemo(() => {
    const catCol = categoricalCols[1] || categoricalCols[0]
    if (!catCol) return []
    const freq = {}
    rows.forEach(r => { const k = String(r[catCol] || 'Other'); freq[k] = (freq[k] || 0) + 1 })
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }, [rows, categoricalCols])

  // Scatter data (two numeric cols)
  const scatterData = useMemo(() => {
    const [c1, c2] = numericCols
    if (!c1 || !c2) return []
    return rows.slice(0, 200).map(r => ({ x: r[c1], y: r[c2] })).filter(d => d.x && d.y)
  }, [rows, numericCols])

  // KPI cards
  const kpis = useMemo(() => {
    return numericCols.slice(0, 4).map((col, i) => {
      const s = colStats[col]
      const colors = ['var(--neon-b)', 'var(--neon-g)', 'var(--neon-p)', 'var(--neon-o)']
      return { col, stats: s, color: colors[i] }
    })
  }, [numericCols, colStats])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-gray-400 text-sm mt-1">
            <span className="font-mono" style={{color:'var(--neon-b)'}}>{dataset.filename}</span>
            {' '}· {rowCount.toLocaleString()} rows · {colCount} columns
          </p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Completeness', value: completeness + '%', color: +completeness > 90 ? 'var(--neon-g)' : 'var(--neon-o)' },
            { label: 'Numeric cols', value: numericCols.length, color: 'var(--neon-b)' },
            { label: 'Categories', value: categoricalCols.length, color: 'var(--neon-p)' },
          ].map(s => (
            <div key={s.label} className="glass-card px-4 py-3 text-center">
              <div className="text-xl font-bold font-mono" style={{color: s.color}}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight pills */}
      {insights?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {insights.slice(0, 4).map((ins, i) => (
            <div key={i} className="px-3 py-2 rounded-xl text-sm flex items-center gap-2"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <span>{ins.icon}</span>
              <span className="text-gray-300">{ins.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ col, stats, color }) => stats && (
          <div key={col} className="metric-card p-5 shine-effect relative overflow-hidden">
            <p className="text-xs text-gray-500 mb-1 truncate">{col}</p>
            <p className="text-3xl font-bold font-mono mb-1" style={{color}}>{fmt(stats.mean)}</p>
            <p className="text-xs text-gray-500">avg · max {fmt(stats.max)}</p>
            <div className="mt-2 flex items-center gap-1 text-xs" style={{color}}>
              <Activity size={12} /> {stats.count.toLocaleString()} values
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Area chart */}
        {timeSeriesData.length > 0 && (
          <div className="glass-card p-5 md:col-span-2">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity size={16} style={{color:'var(--neon-b)'}} />
              <span>{numericCols[0]} over time</span>
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis dataKey="date" tick={{fill:'#8892a4', fontSize:10}} tickLine={false} />
                <YAxis tick={{fill:'#8892a4', fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v => fmt(v,0)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" name={numericCols[0]} stroke="#00d4ff" strokeWidth={2} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie chart */}
        {pieData.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieIcon size={16} style={{color:'var(--neon-p)'}} />
              <span>{categoricalCols[1] || categoricalCols[0]} split</span>
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{background:'#0d1526', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'10px', fontFamily:'JetBrains Mono', fontSize:12}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-1 mt-2">
              {pieData.slice(0, 4).map((d, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full" style={{background:`${COLORS[i]}22`, color:COLORS[i]}}>
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar chart */}
        {catData.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart2 size={16} style={{color:'var(--neon-g)'}} />
              <span>{numericCols[0]} by {categoricalCols[0]}</span>
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={catData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" horizontal={false} />
                <XAxis type="number" tick={{fill:'#8892a4',fontSize:10}} tickLine={false} tickFormatter={v=>fmt(v,0)} />
                <YAxis type="category" dataKey="name" tick={{fill:'#8892a4',fontSize:11}} width={80} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name={numericCols[0]} radius={[0,6,6,0]}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Scatter plot */}
        {scatterData.length > 0 && numericCols.length >= 2 && (
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity size={16} style={{color:'var(--neon-p)'}} />
              <span>{numericCols[0]} vs {numericCols[1]}</span>
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis dataKey="x" name={numericCols[0]} tick={{fill:'#8892a4',fontSize:10}} tickLine={false} tickFormatter={v=>fmt(v,0)} />
                <YAxis dataKey="y" name={numericCols[1]} tick={{fill:'#8892a4',fontSize:10}} tickLine={false} tickFormatter={v=>fmt(v,0)} />
                <Tooltip cursor={{strokeDasharray:'3 3'}} contentStyle={{background:'#0d1526',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'10px',fontSize:12}} />
                <Scatter data={scatterData} fill="#b347ff" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Column stats table */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">📋 Column Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b" style={{borderColor:'rgba(99,102,241,0.1)'}}>
                {['Column','Type','Count','Min / Unique','Max / Top Value','Mean / Null%'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {columns.slice(0, 15).map((col, i) => {
                const s = colStats[col]
                const isNum = colTypes[col] === 'numeric'
                return (
                  <tr key={col} className="border-b hover:bg-white/[0.02] transition-colors"
                    style={{borderColor:'rgba(99,102,241,0.06)'}}>
                    <td className="py-2 px-3 font-mono text-xs" style={{color:'var(--neon-b)'}}>{col}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: isNum ? 'rgba(0,212,255,0.1)' : 'rgba(179,71,255,0.1)',
                          color: isNum ? 'var(--neon-b)' : 'var(--neon-p)' }}>
                        {colTypes[col]}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">{s?.count?.toLocaleString() || '—'}</td>
                    <td className="py-2 px-3 font-mono text-xs">{isNum ? fmt(s?.min) : s?.unique}</td>
                    <td className="py-2 px-3 font-mono text-xs text-xs max-w-[120px] truncate">
                      {isNum ? fmt(s?.max) : s?.topValues?.[0]?.[0]}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">
                      {isNum ? fmt(s?.mean) : `${((s?.nullCount / rowCount) * 100).toFixed(1)}%`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
