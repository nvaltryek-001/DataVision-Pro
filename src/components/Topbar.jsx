import React from 'react'
import { Menu, Bell, RefreshCw, Sparkles } from 'lucide-react'

export default function Topbar({ page, dataset, setMobileOpen, onReset }) {
  const labels = { overview: 'Overview', viz: 'Visualization Studio', stock: '🇮🇳 India Markets', table: 'Data Table', guide: 'Video Guide' }
  return (
    <header className="sticky top-0 z-40 flex items-center px-5 py-3 gap-4"
      style={{ background: 'rgba(7,11,20,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
      <button onClick={() => setMobileOpen(v => !v)} className="md:hidden text-gray-400 hover:text-white transition-colors">
        <Menu size={20} />
      </button>
      <h1 className="font-semibold text-sm md:text-base">{labels[page] || 'Dashboard'}</h1>
      <div className="ml-auto flex items-center gap-3">
        {dataset && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: 'var(--neon-g)' }}>
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
            {dataset.rowCount.toLocaleString()} rows loaded
          </div>
        )}
        <button onClick={onReset} className="p-2 rounded-lg text-gray-500 hover:text-white transition-colors"
          style={{ border: '1px solid rgba(99,102,241,0.15)' }} title="Load new dataset">
          <RefreshCw size={15} />
        </button>
      </div>
    </header>
  )
}
