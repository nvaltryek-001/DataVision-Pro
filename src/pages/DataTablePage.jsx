import React, { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, Download, Filter } from 'lucide-react'
import { fmt } from '../utils/dataUtils'

export default function DataTablePage({ dataset }) {
  const { rows, columns, colTypes, colStats } = dataset
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(0)
  const pageSize = 50

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r => columns.some(c => String(r[c] ?? '').toLowerCase().includes(q)))
  }, [rows, columns, search])

  const sorted = useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol]
      if (va === null || va === undefined) return 1
      if (vb === null || vb === undefined) return -1
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortCol, sortDir])

  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(sorted.length / pageSize)

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
    setPage(0)
  }

  const exportCSV = () => {
    const header = columns.join(',')
    const csvRows = sorted.map(r => columns.map(c => {
      const v = r[c]
      return v === null || v === undefined ? '' : typeof v === 'string' && v.includes(',') ? `"${v}"` : v
    }).join(','))
    const blob = new Blob([[header, ...csvRows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${dataset.filename.replace(/\.[^.]+$/, '')}_filtered.csv`; a.click()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Data Table</h2>
          <p className="text-sm text-gray-400 mt-1">
            Showing <span style={{color:'var(--neon-b)'}} className="font-mono">{sorted.length.toLocaleString()}</span> of {rows.length.toLocaleString()} rows
            {search && <span className="text-yellow-400"> · filtered</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search all columns..."
              className="pl-8 pr-4 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(13,21,38,0.9)', border: '1px solid rgba(99,102,241,0.25)', width: 220 }} />
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--neon-b)' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Rows', value: rows.length.toLocaleString(), color: 'var(--neon-b)' },
          { label: 'Columns', value: columns.length, color: 'var(--neon-g)' },
          { label: 'Filtered Rows', value: sorted.length.toLocaleString(), color: 'var(--neon-p)' },
          { label: 'Current Page', value: `${page+1} / ${totalPages}`, color: 'var(--neon-o)' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="font-bold font-mono text-lg" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
                <th className="py-3 px-4 text-left text-xs text-gray-500 font-medium w-12">#</th>
                {columns.map(col => (
                  <th key={col} className="py-3 px-4 text-left text-xs font-medium cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                    style={{ color: sortCol === col ? 'var(--neon-b)' : '#8892a4' }}
                    onClick={() => handleSort(col)}>
                    <div className="flex items-center gap-1">
                      {col}
                      <span className="ml-1">
                        {sortCol === col
                          ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                          : <span className="text-gray-700">↕</span>}
                      </span>
                      <span className="ml-1 px-1 rounded text-xs"
                        style={{ background: colTypes[col] === 'numeric' ? 'rgba(0,212,255,0.1)' : 'rgba(179,71,255,0.1)',
                          color: colTypes[col] === 'numeric' ? 'var(--neon-b)' : 'var(--neon-p)', fontSize: 9 }}>
                        {colTypes[col]?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, ri) => (
                <tr key={ri}
                  className="border-b hover:bg-white/[0.025] transition-colors"
                  style={{ borderColor: 'rgba(99,102,241,0.05)' }}>
                  <td className="py-2 px-4 text-xs text-gray-600 font-mono">
                    {page * pageSize + ri + 1}
                  </td>
                  {columns.map(col => {
                    const v = row[col]
                    const isNum = colTypes[col] === 'numeric'
                    const isEmpty = v === null || v === undefined || v === ''
                    return (
                      <td key={col} className="py-2 px-4 whitespace-nowrap max-w-[180px] text-xs"
                        style={{ color: isEmpty ? '#444' : isNum ? '#e2e8f0' : '#c4cde0' }}>
                        {isEmpty ? <span className="text-gray-700 italic">null</span>
                          : isNum ? <span className="font-mono">{fmt(parseFloat(v))}</span>
                          : <span className="truncate block max-w-[150px]" title={String(v)}>{String(v)}</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <p className="text-xs text-gray-500">
            Rows {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(0)} disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 transition-all hover:opacity-80"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--neon-b)' }}>
              ««
            </button>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 transition-all"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--neon-b)' }}>
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = Math.max(0, Math.min(page - 3, totalPages - 7)) + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-xs transition-all"
                  style={{
                    background: p === page ? 'rgba(0,212,255,0.2)' : 'rgba(99,102,241,0.08)',
                    border: `1px solid ${p === page ? 'rgba(0,212,255,0.4)' : 'rgba(99,102,241,0.12)'}`,
                    color: p === page ? 'var(--neon-b)' : '#8892a4'
                  }}>
                  {p + 1}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 transition-all"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--neon-b)' }}>
              Next ›
            </button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 transition-all"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--neon-b)' }}>
              »»
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
