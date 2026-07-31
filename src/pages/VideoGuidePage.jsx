import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, ChevronRight, BookOpen, Lightbulb, BarChart2, TrendingUp, Database, Upload } from 'lucide-react'

const CHAPTERS = [
  {
    id: 1, icon: '📤', title: 'Uploading Your Data',
    duration: '2:15', color: 'var(--neon-b)',
    steps: [
      'Drag & drop CSV, Excel, or JSON files onto the upload zone',
      'DataVision auto-detects column types: numeric, categorical, date',
      'Missing values, outliers, and data quality are instantly flagged',
      'AI generates smart insights before you even ask',
    ],
    tip: 'Pro tip: For Indian stock data, name your file with "NSE", "BSE", or "stock" to auto-activate the market analysis module.'
  },
  {
    id: 2, icon: '📊', title: 'Dashboard Overview',
    duration: '3:40', color: 'var(--neon-g)',
    steps: [
      'KPI cards show mean, max, and count for every numeric column',
      'Auto-generated area chart from first date + numeric column pair',
      'Pie chart shows distribution of categorical data',
      'Scatter plot reveals correlations between numeric fields',
      'Full column statistics table with type, range, and null rates',
    ],
    tip: 'Hover any chart element for detailed tooltips with exact values and field names.'
  },
  {
    id: 3, icon: '🎨', title: 'Visualization Studio',
    duration: '4:20', color: 'var(--neon-p)',
    steps: [
      'Switch between 6 chart types: Line, Area, Bar, Scatter, Radar, Multi',
      'Select any column as X-axis from the dropdown',
      'Toggle up to 4 Y-axis columns simultaneously',
      'Distribution histograms auto-generated for all numeric columns',
      'Multi chart overlays bars and lines for comparison',
    ],
    tip: 'The Radar chart is perfect for comparing normalized performance across multiple metrics.'
  },
  {
    id: 4, icon: '🇮🇳', title: 'India Stock Analysis',
    duration: '5:10', color: 'var(--neon-o)',
    steps: [
      'NIFTY 50, SENSEX, and sectoral indices shown in real-time style',
      'OHLCV price chart with Bollinger Bands overlay',
      'RSI indicator: above 70 = overbought, below 30 = oversold',
      'MACD histogram: green bars = bullish momentum, red = bearish',
      'Volume bars colored green/red based on price direction',
      'Sector heatmap shows 1M, 3M, 1Y performance',
    ],
    tip: 'Upload your own NSE/BSE stock CSV with Date, Open, High, Low, Close, Volume columns for personalized analysis.'
  },
  {
    id: 5, icon: '📋', title: 'Data Table & Summary',
    duration: '2:50', color: 'var(--neon-g)',
    steps: [
      'Full raw dataset displayed in sortable, searchable table',
      'Click any column header to sort ascending/descending',
      'Search box filters across all visible columns instantly',
      'Export filtered view to CSV directly from the table',
      'Row count and active filters shown in real-time',
    ],
    tip: 'Use the search box with column:value syntax for precise filtering, e.g. "Region:North".'
  },
]

const AnimatedBar = ({ value, max, color, delay }) => {
  const [width, setWidth] = useState(0)
  useEffect(() => { setTimeout(() => setWidth(value), delay) }, [value, delay])
  return (
    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(width/max)*100}%`, background: color }} />
    </div>
  )
}

const ProgressRing = ({ value, color, label }) => {
  const r = 28, circ = 2 * Math.PI * r
  const [pct, setPct] = useState(0)
  useEffect(() => { setTimeout(() => setPct(value), 300) }, [value])
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth={5} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)}
          strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }} />
        <text x={36} y={40} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">{pct}%</text>
      </svg>
      <p className="text-xs text-gray-500 text-center leading-tight">{label}</p>
    </div>
  )
}

export default function VideoGuidePage() {
  const [active, setActive] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const chapter = CHAPTERS.find(c => c.id === active)

  useEffect(() => {
    setProgress(0)
    setPlaying(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [active])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(intervalRef.current); setPlaying(false); return 100 }
          return p + 0.4
        })
      }, 60)
    } else if (intervalRef.current) clearInterval(intervalRef.current)
    return () => clearInterval(intervalRef.current)
  }, [playing])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Video Guide</h2>
        <p className="text-gray-400 text-sm mt-1">Interactive tutorials to master DataVision Pro</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapter list */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Chapters</p>
          {CHAPTERS.map(ch => (
            <button key={ch.id} onClick={() => setActive(ch.id)}
              className={`w-full text-left glass-card p-4 rounded-xl transition-all ${active === ch.id ? 'glow-blue' : 'opacity-70 hover:opacity-100'}`}
              style={{ border: active === ch.id ? `1px solid ${ch.color}44` : '1px solid rgba(99,102,241,0.1)' }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{ch.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ch.title}</p>
                  <p className="text-xs text-gray-500">{ch.duration}</p>
                </div>
                {active === ch.id && <ChevronRight size={14} style={{ color: ch.color }} />}
              </div>
            </button>
          ))}
        </div>

        {/* Main video + steps */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video player mock */}
          <div className="video-frame" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #070b14 0%, #0d1526 50%, #070b14 100%)' }}>
            {/* Animated demo screen */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4 animate-bounce">{chapter.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: chapter.color }}>{chapter.title}</h3>
                <p className="text-gray-500 text-sm">Chapter {active} of {CHAPTERS.length}</p>
                {/* Animated chart preview */}
                <div className="mt-6 flex gap-1 justify-center items-end h-16">
                  {[40,65,45,80,55,90,70,85,60,95,75,88].map((h, i) => (
                    <div key={i} className="w-3 rounded-t transition-all duration-500"
                      style={{ height: playing ? `${h}%` : '10%',
                        background: chapter.color, opacity: 0.7 + (i % 3) * 0.1,
                        transitionDelay: `${i * 50}ms` }} />
                  ))}
                </div>
              </div>
            </div>
            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4"
              style={{ background: 'linear-gradient(transparent, rgba(7,11,20,0.9))' }}>
              <div className="h-1 rounded-full bg-gray-700 mb-3 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: chapter.color }} />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setPlaying(!playing)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ background: chapter.color + '33', border: `1px solid ${chapter.color}66` }}>
                  {playing ? <Pause size={16} style={{ color: chapter.color }} /> : <Play size={16} style={{ color: chapter.color }} />}
                </button>
                <span className="text-xs text-gray-400 font-mono">{chapter.duration}</span>
                <span className="text-xs text-gray-500 font-mono ml-auto">{progress.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={15} style={{ color: chapter.color }} />
              <h4 className="font-semibold">What you'll learn</h4>
            </div>
            <div className="space-y-3">
              {chapter.steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                    style={{ background: chapter.color + '22', color: chapter.color, border: `1px solid ${chapter.color}44` }}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl flex gap-2"
              style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
              <Lightbulb size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-300 leading-relaxed">{chapter.tip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-300">🚀 Platform Capabilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Upload, label: 'Multi-format', desc: 'CSV · XLSX · JSON', color: 'var(--neon-b)' },
            { icon: BarChart2, label: '6 Chart Types', desc: 'Line, Area, Bar, Scatter, Radar, Multi', color: 'var(--neon-g)' },
            { icon: TrendingUp, label: 'India Markets', desc: 'NSE · BSE · RSI · MACD', color: 'var(--neon-o)' },
            { icon: Database, label: 'Auto Analysis', desc: 'Stats, outliers, insights', color: 'var(--neon-p)' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="glass-card p-4">
              <Icon size={22} style={{ color }} className="mb-3" />
              <p className="font-semibold text-sm mb-1">{label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress rings */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-6 text-gray-300">📈 Analytics Accuracy Benchmarks</h3>
        <div className="flex flex-wrap justify-around gap-6">
          {[
            { value: 98, color: 'var(--neon-b)', label: 'Data\nParsing' },
            { value: 94, color: 'var(--neon-g)', label: 'Column\nDetection' },
            { value: 91, color: 'var(--neon-p)', label: 'Insight\nQuality' },
            { value: 96, color: 'var(--neon-o)', label: 'Chart\nRendering' },
            { value: 88, color: '#ffd700', label: 'Technical\nIndicators' },
          ].map(r => <ProgressRing key={r.label} {...r} />)}
        </div>
        <div className="mt-6 space-y-3">
          {[
            { label: 'CSV & Excel parsing speed', value: 95, max: 100, color: 'var(--neon-b)' },
            { label: 'Numerical analysis accuracy', value: 98, max: 100, color: 'var(--neon-g)' },
            { label: 'Indian market pattern recognition', value: 89, max: 100, color: 'var(--neon-o)' },
            { label: 'Visualization rendering performance', value: 93, max: 100, color: 'var(--neon-p)' },
          ].map((b, i) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{b.label}</span><span>{b.value}%</span>
              </div>
              <AnimatedBar {...b} delay={i * 150} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
