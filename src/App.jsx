import React, { Suspense, lazy, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'

const UploadPage = lazy(() => import('./pages/UploadPage.jsx'))
const OverviewPage = lazy(() => import('./pages/OverviewPage.jsx'))
const VisualizationPage = lazy(() => import('./pages/VisualizationPage.jsx'))
const IndiaStockPage = lazy(() => import('./pages/IndiaStockPage.jsx'))
const DataTablePage = lazy(() => import('./pages/DataTablePage.jsx'))
const VideoGuidePage = lazy(() => import('./pages/VideoGuidePage.jsx'))

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">
      Loading workspace...
    </div>
  )
}

export default function App() {
  const [dataset, setDataset] = useState(null)
  const [insights, setInsights] = useState([])
  const [page, setPage] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDataLoaded = (ds, ins) => {
    setDataset(ds)
    setInsights(ins)
    setPage('overview')
  }

  const handleReset = () => { setDataset(null); setInsights([]) }

  if (!dataset) return (
    <Suspense fallback={<PageLoader />}>
      <UploadPage onDataLoaded={handleDataLoaded} />
    </Suspense>
  )

  const pages = {
    overview: <OverviewPage dataset={dataset} insights={insights} />,
    viz: <VisualizationPage dataset={dataset} />,
    stock: <IndiaStockPage dataset={dataset} />,
    table: <DataTablePage dataset={dataset} />,
    guide: <VideoGuidePage />,
  }

  return (
    <div className="flex h-screen overflow-hidden grid-bg">
      <Sidebar page={page} setPage={setPage} dataset={dataset} onReset={handleReset}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar page={page} dataset={dataset} setMobileOpen={setMobileOpen} onReset={handleReset} />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            {pages[page] || pages.overview}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
