# 🚀 DataVision Pro — AI-Powered Analytics Dashboard

> Upload any dataset. Get instant beautiful visualizations, AI insights, and India stock market analysis.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 Multi-format Upload | CSV, Excel (.xlsx/.xls), JSON — drag & drop or click to browse |
| 📊 Auto Analysis | Column type detection, stats, outlier detection, completeness check |
| 🎨 Visualization Studio | 6 chart types: Line, Area, Bar, Scatter, Radar, Multi-axis |
| 🇮🇳 India Markets | NIFTY 50, SENSEX, NSE/BSE stocks, RSI, MACD, Bollinger Bands, sector heatmap |
| 🎬 Video Guide | Interactive tutorial chapters with animated explainers |
| 📋 Data Table | Sortable, searchable table with CSV export |
| 💡 AI Insights | Smart auto-generated observations about your data |

---

## 🛠 Setup (VS Code / Windsurf)

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org))
- Any modern terminal

### Steps

```bash
# 1. Open the project folder
cd DataVision

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app opens at **http://localhost:5173** 🎉

### Build for production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
DataVision/
├── src/
│   ├── pages/
│   │   ├── UploadPage.jsx       # Landing + file upload
│   │   ├── OverviewPage.jsx     # KPIs + summary charts
│   │   ├── VisualizationPage.jsx # Interactive chart studio
│   │   ├── IndiaStockPage.jsx   # NSE/BSE stock analysis
│   │   ├── DataTablePage.jsx    # Sortable data table
│   │   └── VideoGuidePage.jsx   # Tutorial chapters
│   ├── components/
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   └── Topbar.jsx           # Header bar
│   ├── utils/
│   │   └── dataUtils.js         # Data parsing + stats
│   ├── data/
│   │   ├── indiaMarket.js       # India market data + indicators
│   │   └── sampleData.js        # Demo datasets
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                # Design system
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 📈 Indian Stock Data Format

Upload a CSV with these columns for full NSE/BSE analysis:

| Column | Required | Example |
|--------|----------|---------|
| Date | ✅ | 2024-01-15 |
| Open | ✅ | 2456.30 |
| High | ✅ | 2489.75 |
| Low | ✅ | 2441.20 |
| Close | ✅ | 2478.90 |
| Volume | Optional | 4523100 |

**Tip:** Name your file with "NSE", "BSE", "stock", or "NIFTY" to auto-activate the markets module.

Download historical data from:
- [NSE India](https://www.nseindia.com)
- [BSE India](https://www.bseindia.com)
- [Yahoo Finance](https://finance.yahoo.com) (search `RELIANCE.NS`)

---

## 🎨 Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Neon Blue | `#00d4ff` | Primary accent, charts |
| Neon Green | `#00ff88` | Positive/bullish signals |
| Neon Purple | `#b347ff` | Categorical data |
| Neon Orange | `#ff6b35` | India markets, alerts |

---

## 🔧 Customization

### Add your own chart
Edit `src/pages/VisualizationPage.jsx` and add a new entry to `CHART_TYPES`.

### Add a new data source
Create a file in `src/data/` and import it in the relevant page.

### Change color theme
Edit CSS variables in `src/index.css` under `:root`.

---

## 📦 Tech Stack

- **React 18** + Vite
- **Recharts** — charting library
- **PapaParse** — CSV parsing
- **SheetJS (xlsx)** — Excel parsing
- **Tailwind CSS** — utility styling
- **Lucide React** — icons

---

Built with ❤️ for data analysts and Indian market traders.
