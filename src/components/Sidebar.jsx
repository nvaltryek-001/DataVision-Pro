import React from 'react'
import { LayoutDashboard, BarChart2, TrendingUp, Table, Video, Upload, Zap, X } from 'lucide-react'

const NAV = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview', color: 'var(--neon-b)' },
  { id: 'viz', icon: BarChart2, label: 'Visualizations', color: 'var(--neon-g)' },
  { id: 'stock', icon: TrendingUp, label: 'India Markets', color: 'var(--neon-o)' },
  { id: 'table', icon: Table, label: 'Data Table', color: 'var(--neon-p)' },
  { id: 'guide', icon: Video, label: 'Video Guide', color: '#ffd700' },
]

export default function Sidebar({ page, setPage, dataset, onReset, mobileOpen, setMobileOpen }) {
  const content = (
    <div className="flex flex-col h-full" style={{ background: 'rgba(7,11,20,0.97)', borderRight: '1px solid rgba(99,102,241,0.12)' }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #00d4ff)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">DataVision Pro</p>
            <p className="text-xs text-gray-500">AI Analytics</p>
          </div>
        </div>
      </div>

      {/* Dataset info */}
      {dataset && (
        <div className="mx-3 mt-3 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <p className="text-xs text-gray-400 truncate font-mono">{dataset.filename}</p>
          <p className="text-xs text-gray-600">{dataset.rowCount.toLocaleString()} rows · {dataset.colCount} cols</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ id, icon: Icon, label, color }) => (
          <button key={id} onClick={() => { setPage(id); setMobileOpen?.(false) }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left"
            style={{
              background: page === id ? `${color}1a` : 'transparent',
              border: page === id ? `1px solid ${color}33` : '1px solid transparent',
              color: page === id ? color : '#8892a4',
            }}>
            <Icon size={16} style={{ color: page === id ? color : '#8892a4' }} />
            <span className="text-sm font-medium">{label}</span>
            {page === id && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
          </button>
        ))}
      </nav>

      {/* New dataset */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
        <button onClick={onReset}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:opacity-90"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#8892a4' }}>
          <Upload size={14} /> Load new dataset
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-56 flex-shrink-0 h-screen sticky top-0">{content}</div>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56">{content}</div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )
}
