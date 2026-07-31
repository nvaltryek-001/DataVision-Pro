import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Table, Braces, ArrowRight, Sparkles, CheckCircle, Database } from 'lucide-react'
import { parseFile, generateInsights, detectDataType } from '../utils/dataUtils'
import { SAMPLE_SALES_DATA, SAMPLE_STOCK_DATA } from '../data/sampleData'
import { processData } from '../utils/dataUtils'

const FileIcon = ({ type }) => {
  if (type === 'csv') return <Table size={20} className="text-green-400" />
  if (type === 'xlsx') return <FileText size={20} className="text-blue-400" />
  return <Braces size={20} className="text-purple-400" />
}

export default function UploadPage({ onDataLoaded }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [files, setFiles] = useState([])

  const processUpload = async (file) => {
    setLoading(true)
    setError(null)
    setProgress(0)
    const interval = setInterval(() => setProgress(p => Math.min(p + 12, 85)), 180)
    try {
      const dataset = await parseFile(file)
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => { onDataLoaded(dataset, generateInsights(dataset)) }, 400)
    } catch (e) {
      clearInterval(interval)
      setError(e.message)
      setLoading(false)
    }
  }

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) { setFiles(accepted); processUpload(accepted[0]) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'], 'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'] },
    maxFiles: 1
  })

  const loadSample = (type) => {
    const raw = type === 'stock' ? SAMPLE_STOCK_DATA : SAMPLE_SALES_DATA
    const name = type === 'stock' ? 'RELIANCE_NSE_stock.csv' : 'sales_dataset.csv'
    const dataset = processData(raw, name)
    onDataLoaded(dataset, generateInsights(dataset))
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-12 fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 text-sm" style={{color:'var(--neon-b)'}}>
          <span className="pulse-dot w-2 h-2 rounded-full bg-green-400 inline-block"></span>
          AI-Powered Analytics Engine Ready
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
          <span className="gradient-animate">DataVision Pro</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Upload any dataset — CSV, Excel, or JSON — and get instant AI analysis, beautiful visualizations,
          and <span style={{color:'var(--neon-o)'}}>India stock market</span> insights.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="w-full max-w-2xl mb-8 fade-in-up" style={{animationDelay:'0.15s'}}>
        <div
          {...getRootProps()}
          className={`upload-zone p-16 text-center cursor-pointer relative overflow-hidden ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent loader"></div>
              <p className="text-lg font-medium" style={{color:'var(--neon-b)'}}>Analysing dataset...</p>
              <div className="w-64 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #00d4ff)' }}></div>
              </div>
              <p className="text-sm text-gray-500">{progress}% complete</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(0,212,255,0.1))' }}>
                <Upload size={36} style={{color:'var(--neon-b)'}} />
              </div>
              <div>
                <p className="text-xl font-semibold mb-1">{isDragActive ? '📂 Drop it here!' : 'Drop your dataset here'}</p>
                <p className="text-gray-500 text-sm">or click to browse — CSV, Excel (.xlsx), JSON supported</p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                {['CSV', 'XLSX', 'JSON'].map(f => (
                  <span key={f} className="px-3 py-1 rounded-full text-xs font-mono"
                    style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--neon-b)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    .{f.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-3 p-3 rounded-xl text-sm text-red-300" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)'}}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Sample Datasets */}
      <div className="w-full max-w-2xl fade-in-up" style={{animationDelay:'0.3s'}}>
        <p className="text-center text-gray-500 text-sm mb-4">— or try a sample dataset —</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SampleCard
            icon="📈" title="Indian Stock Data" tag="NSE · RELIANCE"
            desc="250 days of OHLCV data for Reliance Industries with technical indicators"
            color="var(--neon-o)" onClick={() => loadSample('stock')}
          />
          <SampleCard
            icon="🛒" title="Sales Analytics" tag="E-Commerce · 200 rows"
            desc="Multi-region sales data with product categories, profit and customer metrics"
            color="var(--neon-g)" onClick={() => loadSample('sales')}
          />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mt-14 fade-in-up" style={{animationDelay:'0.45s'}}>
        {[
          { icon: '🤖', label: 'AI Insights' },
          { icon: '📊', label: 'Auto Charts' },
          { icon: '🇮🇳', label: 'India Markets' },
          { icon: '🎬', label: 'Video Guide' },
        ].map(f => (
          <div key={f.label} className="glass-card p-4 text-center">
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="text-xs text-gray-400 font-medium">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SampleCard({ icon, title, tag, desc, color, onClick }) {
  return (
    <button onClick={onClick}
      className="glass-card p-5 text-left w-full hover:scale-[1.02] transition-all group"
      style={{ border: `1px solid rgba(99,102,241,0.2)` }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs px-2 py-1 rounded-full font-mono"
          style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--neon-b)' }}>{tag}</span>
      </div>
      <p className="font-semibold mb-1" style={{ color }}>{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      <div className="flex items-center gap-1 mt-3 text-xs" style={{ color }}>
        Load sample <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  )
}
