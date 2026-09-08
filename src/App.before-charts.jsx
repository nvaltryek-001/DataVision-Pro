import React, { useMemo, useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  FileJson,
  BarChart3,
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
  Table2,
  Columns3,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  Menu,
  X,
  FileText,
  Search,
  ChevronDown
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useDropzone } from "react-dropzone";

const API_URL = "http://localhost:5000";

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2
  });
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${Number(value).toFixed(2)}%`;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function MetricCard({ icon: Icon, label, value, detail, tone = "blue" }) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <div className="metric-top">
        <div className="metric-icon">
          <Icon size={19} />
        </div>
        <span>{label}</span>
      </div>

      <div className="metric-value">
        {value}
      </div>

      {detail && (
        <div className="metric-detail">
          {detail}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={28} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function AnalysisScreen({ filename }) {

  return (
    <div className="analysis-screen fast-analysis">

      <div className="analysis-card">

        <div className="analysis-logo">
          <Activity size={28} />
        </div>

        <div className="analysis-badge">
          ANALYZING DATA
        </div>

        <h1>
          Analyzing your dataset
        </h1>

        <p className="analysis-file">
          <FileText size={16} />
          {filename}
        </p>

        <div className="fast-loader">
          <div className="loader-ring"></div>
        </div>

        <div className="quick-status">

          <div className="quick-status-item active">
            <div className="quick-check">
              <Activity size={15} />
            </div>

            <div>
              <strong>Analyzing dataset</strong>
              <span>Reading structure and detecting columns</span>
            </div>
          </div>

          <div className="quick-status-item">
            <div className="quick-check">
              <CheckCircle2 size={15} />
            </div>

            <div>
              <strong>Calculating statistics</strong>
              <span>Preparing data quality and numerical analysis</span>
            </div>
          </div>

          <div className="quick-status-item">
            <div className="quick-check">
              <Sparkles size={15} />
            </div>

            <div>
              <strong>Generating insights</strong>
              <span>Finding patterns and relationships</span>
            </div>
          </div>

        </div>

        <div className="analysis-note">
          <Activity size={15} />
          Processing your file through the DataVisionPro backend...
        </div>

      </div>

    </div>
  );
}

function UploadScreen({ onAnalyzed }) {
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [filename, setFilename] = useState("");

  const analyzeFile = async (file) => {

    if (!file) return;

    setError("");

    const allowed = [".csv", ".xlsx", ".xls", ".json"];

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowed.includes(extension)) {
      setError("Please upload CSV, XLS, XLSX or JSON.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("Maximum file size is 25 MB.");
      return;
    }

    setFilename(file.name);
    setAnalyzing(true);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000);

    try {

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/analyze`,
        {
          method: "POST",
          body: formData,
          signal: controller.signal
        }
      );

      clearTimeout(timeout);

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result?.error ||
          "Unable to analyze the dataset."
        );
      }

      if (!result.data) {
        throw new Error(
          "Backend returned no analysis data."
        );
      }

      // IMPORTANT:
      // Move directly to dashboard as soon as
      // the REAL backend response arrives.

      onAnalyzed(result.data);

    } catch (err) {

      clearTimeout(timeout);

      console.error(
        "DataVisionPro analysis error:",
        err
      );

      setAnalyzing(false);

      if (err?.name === "AbortError") {

        setError(
          "Analysis is taking longer than 30 seconds. " +
          "The backend may be processing a large dataset."
        );

      } else if (
        err?.message?.includes("Failed to fetch")
      ) {

        setError(
          "Cannot connect to the backend. " +
          "Make sure the DataVisionPro API is running on port 5000."
        );

      } else {

        setError(
          err?.message ||
          "Unable to analyze the dataset."
        );
      }
    }
  };

  const onDrop = (files) => {
    if (files?.length) {
      analyzeFile(files[0]);
    }
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    multiple: false,
    disabled: analyzing,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx"
      ]
    }
  });

  if (analyzing) {
    return <AnalysisScreen filename={filename} />;
  }

  return (
    <div className="upload-page">

      <header className="landing-header">
        <div className="brand">
          <div className="brand-mark">
            <BarChart3 size={22} />
          </div>

          <div>
            <div className="brand-title">
              DataVision<span>Pro</span>
            </div>

            <div className="brand-subtitle">
              Data Analytics Platform
            </div>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot"></span>
          Analytics API connected
        </div>
      </header>

      <main className="upload-container">

        <section className="hero-copy">

          <div className="eyebrow">
            <Sparkles size={15} />
            SIMPLE • POWERFUL • INSIGHTFUL
          </div>

          <h1>
            Turn your data into
            <span> meaningful insights.</span>
          </h1>

          <p>
            Upload a dataset and let DataVisionPro automatically analyze
            structure, quality, statistics, relationships and patterns.
          </p>

        </section>

        <section
          {...getRootProps()}
          className={`drop-card ${
            isDragActive ? "drop-active" : ""
          }`}
        >

          <input {...getInputProps()} />

          <div className="drop-icon">
            <UploadCloud size={34} />
          </div>

          <h2>
            {isDragActive
              ? "Drop your dataset here"
              : "Upload your dataset"}
          </h2>

          <p>
            Drag and drop your file here or browse from your computer.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={(event) => {
              event.stopPropagation();

              document
                .querySelector(".drop-card input")
                ?.click();
            }}
          >
            <UploadCloud size={18} />
            Choose Dataset
          </button>

          <div className="supported">
            <span>Supported formats</span>

            <div className="format-list">
              <div>
                <FileSpreadsheet size={17} />
                CSV
              </div>

              <div>
                <FileSpreadsheet size={17} />
                XLSX
              </div>

              <div>
                <FileSpreadsheet size={17} />
                XLS
              </div>

              <div>
                <FileJson size={17} />
                JSON
              </div>
            </div>

            <small>
              Maximum file size: 25 MB
            </small>
          </div>

        </section>

        {error && (
          <div className="error-banner">
            <AlertTriangle size={19} />
            <span>{error}</span>
          </div>
        )}

        <section className="feature-grid">

          <div className="feature">
            <div className="feature-icon">
              <Database size={21} />
            </div>

            <div>
              <h3>Automatic Analysis</h3>
              <p>
                Understand rows, columns, data types and structure.
              </p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon green">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h3>Data Quality</h3>
              <p>
                Detect missing values, duplicates and completeness.
              </p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon orange">
              <TrendingUp size={21} />
            </div>

            <div>
              <h3>Smart Insights</h3>
              <p>
                Discover statistics, outliers and relationships.
              </p>
            </div>
          </div>

        </section>

      </main>

      <footer className="landing-footer">
        <span>DataVisionPro</span>
        <span>Upload</span>
        <span>Analyze</span>
        <span>Visualize</span>
        <span>Discover</span>
      </footer>

    </div>
  );
}

function Dashboard({ data, onReset }) {

  const [section, setSection] = useState("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  const overview = data?.overview || {};
  const columns = safeArray(data?.columns);
  const numericColumns = safeArray(data?.numericColumns);
  const categoricalColumns = safeArray(data?.categoricalColumns);
  const dateColumns = safeArray(data?.dateColumns);
  const correlations = safeArray(data?.correlations);
  const insights = safeArray(data?.insights);
  const preview = safeArray(data?.preview);
  const columnAnalysis = data?.columnAnalysis || {};

  const filteredRows = useMemo(() => {

    if (!search.trim()) {
      return preview;
    }

    const query = search.toLowerCase();

    return preview.filter((row) =>
      Object.values(row || {})
        .join(" ")
        .toLowerCase()
        .includes(query)
    );

  }, [preview, search]);

  const firstNumeric = numericColumns[0];

  const numericChartData = useMemo(() => {

    if (!firstNumeric) {
      return [];
    }

    return preview
      .map((row, index) => ({
        index: index + 1,
        value: Number(row?.[firstNumeric])
      }))
      .filter((item) => Number.isFinite(item.value))
      .slice(0, 30);

  }, [preview, firstNumeric]);

  const categoricalChartData = useMemo(() => {

    const firstCategorical = categoricalColumns[0];

    if (!firstCategorical) {
      return [];
    }

    return safeArray(
      columnAnalysis?.[firstCategorical]?.topValues
    ).map((item) => ({
      name: String(item.name),
      value: Number(item.count)
    }));

  }, [categoricalColumns, columnAnalysis]);

  const qualityData = [
    {
      name: "Complete",
      value: Number(overview.completeness || 0)
    },
    {
      name: "Missing",
      value: Math.max(
        0,
        100 - Number(overview.completeness || 0)
      )
    }
  ];

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3
    },
    {
      id: "quality",
      label: "Data Quality",
      icon: ShieldCheck
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: Activity
    },
    {
      id: "visualizations",
      label: "Visualizations",
      icon: TrendingUp
    },
    {
      id: "insights",
      label: "Insights",
      icon: Sparkles
    },
    {
      id: "table",
      label: "Data Table",
      icon: Table2
    }
  ];

  const navigate = (id) => {
    setSection(id);
    setMobileMenu(false);
  };

  const renderOverview = () => (
    <>

      <div className="page-intro">
        <div>
          <div className="page-kicker">
            DATASET OVERVIEW
          </div>

          <h1>
            Your data at a glance
          </h1>

          <p>
            Automated analysis of <strong>{data.filename}</strong>
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onReset}
        >
          <RefreshCw size={17} />
          Analyze another
        </button>
      </div>

      <div className="metrics-grid">

        <MetricCard
          icon={Database}
          label="Rows"
          value={formatNumber(overview.rows)}
          detail="Records analyzed"
        />

        <MetricCard
          icon={Columns3}
          label="Columns"
          value={formatNumber(overview.columns)}
          detail={`${numericColumns.length} numeric`}
          tone="purple"
        />

        <MetricCard
          icon={ShieldCheck}
          label="Completeness"
          value={formatPercent(overview.completeness)}
          detail={`${formatNumber(overview.missingValues)} missing cells`}
          tone="green"
        />

        <MetricCard
          icon={AlertTriangle}
          label="Duplicates"
          value={formatNumber(overview.duplicateRows)}
          detail="Duplicate records"
          tone="orange"
        />

      </div>

      <div className="dashboard-grid">

        <section className="panel chart-panel">

          <div className="panel-header">
            <div>
              <h2>Data distribution</h2>
              <p>
                {firstNumeric
                  ? `Preview of ${firstNumeric}`
                  : "Numeric data distribution"}
              </p>
            </div>

            <span className="panel-tag">
              {firstNumeric || "No numeric column"}
            </span>
          </div>

          {numericChartData.length ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={numericChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="index"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No numeric data"
              text="The backend did not detect a numeric column for this visualization."
            />
          )}

        </section>

        <section className="panel quality-panel">

          <div className="panel-header">
            <div>
              <h2>Data quality</h2>
              <p>Completeness of your dataset</p>
            </div>
          </div>

          <div className="quality-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={4}
                >
                  <Cell fill="#2563eb" />
                  <Cell fill="#e5e7eb" />
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="quality-center">
              <strong>
                {formatPercent(overview.completeness)}
              </strong>

              <span>complete</span>
            </div>
          </div>

          <div className="quality-summary">
            <div>
              <span className="quality-dot blue"></span>
              Complete cells
              <strong>
                {formatPercent(overview.completeness)}
              </strong>
            </div>

            <div>
              <span className="quality-dot gray"></span>
              Missing cells
              <strong>
                {formatNumber(overview.missingValues)}
              </strong>
            </div>
          </div>

        </section>

      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h2>Dataset structure</h2>
            <p>
              Automatically detected data types
            </p>
          </div>

          <span className="panel-tag">
            {columns.length} columns
          </span>
        </div>

        <div className="column-grid">

          {columns.map((column) => {

            const analysis = columnAnalysis[column] || {};

            return (
              <div
                className="column-card"
                key={column}
              >
                <div className="column-card-top">
                  <span className="column-name">
                    {column}
                  </span>

                  <span
                    className={`type-badge type-${analysis.type}`}
                  >
                    {analysis.type || "unknown"}
                  </span>
                </div>

                <div className="column-meta">
                  <span>
                    {formatNumber(analysis.count)} values
                  </span>

                  <span>
                    {formatNumber(analysis.unique)} unique
                  </span>
                </div>
              </div>
            );
          })}

        </div>

      </section>

    </>
  );

  const renderQuality = () => (
    <>
      <div className="page-intro">
        <div>
          <div className="page-kicker">
            DATA QUALITY
          </div>
          <h1>Check the health of your data</h1>
          <p>
            Identify completeness, duplicates, missing values and potential
            outliers.
          </p>
        </div>
      </div>

      <div className="metrics-grid">

        <MetricCard
          icon={ShieldCheck}
          label="Completeness"
          value={formatPercent(overview.completeness)}
          detail="Overall data completeness"
          tone="green"
        />

        <MetricCard
          icon={AlertTriangle}
          label="Missing Cells"
          value={formatNumber(overview.missingValues)}
          detail="Cells requiring attention"
          tone="orange"
        />

        <MetricCard
          icon={CopyIcon}
          label="Duplicate Rows"
          value={formatNumber(overview.duplicateRows)}
          detail="Repeated records"
        />

        <MetricCard
          icon={Database}
          label="Total Cells"
          value={formatNumber(
            Number(overview.rows || 0) *
            Number(overview.columns || 0)
          )}
          detail="Rows × columns"
          tone="purple"
        />

      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h2>Column quality</h2>
            <p>Missing and unique value analysis</p>
          </div>
        </div>

        <div className="quality-table">

          <div className="quality-row quality-head">
            <span>Column</span>
            <span>Type</span>
            <span>Values</span>
            <span>Missing</span>
            <span>Unique</span>
          </div>

          {columns.map((column) => {

            const item = columnAnalysis[column] || {};

            return (
              <div
                className="quality-row"
                key={column}
              >
                <strong>{column}</strong>

                <span>
                  <span className={`mini-type type-${item.type}`}>
                    {item.type || "unknown"}
                  </span>
                </span>

                <span>{formatNumber(item.count)}</span>

                <span>
                  {formatNumber(item.missing)}
                  {" "}
                  <small>
                    ({formatPercent(item.missingPercentage)})
                  </small>
                </span>

                <span>{formatNumber(item.unique)}</span>
              </div>
            );
          })}

        </div>

      </section>
    </>
  );

  const renderStatistics = () => (
    <>
      <div className="page-intro">
        <div>
          <div className="page-kicker">
            STATISTICS
          </div>
          <h1>Explore your numerical data</h1>
          <p>
            Descriptive statistics calculated by the analytics backend.
          </p>
        </div>
      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h2>Numerical columns</h2>
            <p>
              Mean, median, standard deviation and quartiles
            </p>
          </div>

          <span className="panel-tag">
            {numericColumns.length} numeric
          </span>
        </div>

        {numericColumns.length ? (
          <div className="statistics-grid">

            {numericColumns.map((column) => {

              const item = columnAnalysis[column] || {};

              return (
                <div
                  className="stat-card"
                  key={column}
                >
                  <div className="stat-card-title">
                    {column}
                  </div>

                  <div className="stat-values">

                    <div>
                      <span>Mean</span>
                      <strong>{formatNumber(item.mean)}</strong>
                    </div>

                    <div>
                      <span>Median</span>
                      <strong>{formatNumber(item.median)}</strong>
                    </div>

                    <div>
                      <span>Min</span>
                      <strong>{formatNumber(item.min)}</strong>
                    </div>

                    <div>
                      <span>Max</span>
                      <strong>{formatNumber(item.max)}</strong>
                    </div>

                    <div>
                      <span>Std. Dev.</span>
                      <strong>{formatNumber(item.std)}</strong>
                    </div>

                    <div>
                      <span>Variance</span>
                      <strong>{formatNumber(item.variance)}</strong>
                    </div>

                  </div>

                  {item.outliers && (
                    <div className="outlier-info">
                      <AlertTriangle size={15} />
                      {formatNumber(item.outliers.count)}
                      {" "}
                      potential outliers
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        ) : (
          <EmptyState
            icon={CalculatorIcon}
            title="No numeric columns detected"
            text="Statistics are available when the backend detects numerical data."
          />
        )}

      </section>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h2>Column types</h2>
            <p>Dataset classification</p>
          </div>
        </div>

        <div className="type-summary">

          <div>
            <span>Numeric</span>
            <strong>{numericColumns.length}</strong>
          </div>

          <div>
            <span>Categorical</span>
            <strong>{categoricalColumns.length}</strong>
          </div>

          <div>
            <span>Date</span>
            <strong>{dateColumns.length}</strong>
          </div>

        </div>

      </section>
    </>
  );

  const renderVisualizations = () => (
    <>
      <div className="page-intro">
        <div>
          <div className="page-kicker">
            VISUALIZATIONS
          </div>

          <h1>See your data visually</h1>

          <p>
            Charts are generated from the analysis returned by your backend.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">

        <section className="panel chart-panel">

          <div className="panel-header">
            <div>
              <h2>Numeric trend</h2>
              <p>
                First detected numeric column
              </p>
            </div>
          </div>

          {numericChartData.length ? (
            <div className="chart-wrap large">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={numericChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="index" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No numeric visualization available"
              text="Upload a dataset containing numerical values."
            />
          )}

        </section>

        <section className="panel chart-panel">

          <div className="panel-header">
            <div>
              <h2>Category frequency</h2>
              <p>
                Most frequent values
              </p>
            </div>
          </div>

          {categoricalChartData.length ? (
            <div className="chart-wrap large">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoricalChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#7c3aed"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No categorical visualization available"
              text="Upload a dataset containing categorical values."
            />
          )}

        </section>

      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h2>Correlations</h2>
            <p>
              Relationships between numerical columns
            </p>
          </div>

          <span className="panel-tag">
            {correlations.length} relationships
          </span>
        </div>

        {correlations.length ? (
          <div className="correlation-list">

            {correlations.slice(0, 10).map((item, index) => {

              const value = Number(item.correlation || 0);
              const width = Math.min(
                100,
                Math.abs(value) * 100
              );

              return (
                <div
                  className="correlation-item"
                  key={`${item.columnA}-${item.columnB}-${index}`}
                >
                  <div className="correlation-name">
                    <strong>
                      {item.columnA}
                    </strong>

                    <ArrowUpRight size={15} />

                    <strong>
                      {item.columnB}
                    </strong>
                  </div>

                  <div className="correlation-bar">
                    <div
                      style={{
                        width: `${width}%`
                      }}
                    />
                  </div>

                  <span className="correlation-value">
                    {value.toFixed(4)}
                  </span>
                </div>
              );
            })}

          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No correlations available"
            text="At least two numerical columns with enough valid values are needed."
          />
        )}

      </section>
    </>
  );

  const renderInsights = () => (
    <>
      <div className="page-intro">
        <div>
          <div className="page-kicker">
            INSIGHTS
          </div>

          <h1>What your data is telling you</h1>

          <p>
            Automatically generated observations from the analytics backend.
          </p>
        </div>
      </div>

      <div className="insights-grid">

        {insights.length ? (
          insights.map((insight, index) => {

            const type = insight.type || "info";

            const Icon =
              type === "warning"
                ? AlertTriangle
                : type === "success"
                  ? CheckCircle2
                  : Info;

            return (
              <div
                className={`insight-card insight-${type}`}
                key={`${insight.title}-${index}`}
              >
                <div className="insight-icon">
                  <Icon size={20} />
                </div>

                <div>
                  <span className="insight-type">
                    {type}
                  </span>

                  <h3>
                    {insight.title || "Insight"}
                  </h3>

                  <p>
                    {insight.message || insight.text || ""}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No insights generated"
            text="The backend did not return any automated insights."
          />
        )}

      </div>
    </>
  );

  const renderTable = () => (
    <>
      <div className="page-intro">

        <div>
          <div className="page-kicker">
            DATA TABLE
          </div>

          <h1>Explore your records</h1>

          <p>
            Showing the preview returned by the analytics backend.
          </p>
        </div>

        <div className="table-count">
          {filteredRows.length} visible rows
        </div>

      </div>

      <section className="panel table-panel">

        <div className="table-toolbar">

          <div className="table-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search preview..."
            />
          </div>

          <span>
            First {Math.min(100, preview.length)} rows
          </span>

        </div>

        {filteredRows.length ? (
          <div className="data-table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>#</th>

                  {columns.map((column) => (
                    <th key={column}>
                      {column}
                    </th>
                  ))}

                </tr>
              </thead>

              <tbody>

                {filteredRows.map((row, index) => (
                  <tr key={index}>

                    <td className="row-number">
                      {index + 1}
                    </td>

                    {columns.map((column) => (
                      <td key={column}>
                        {row?.[column] === null ||
                        row?.[column] === undefined ||
                        row?.[column] === ""
                          ? "—"
                          : String(row[column])}
                      </td>
                    ))}

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No matching records"
            text="Try a different search term."
          />
        )}

      </section>
    </>
  );

  const renderContent = () => {

    if (section === "overview") return renderOverview();
    if (section === "quality") return renderQuality();
    if (section === "statistics") return renderStatistics();
    if (section === "visualizations") return renderVisualizations();
    if (section === "insights") return renderInsights();
    if (section === "table") return renderTable();

    return renderOverview();
  };

  return (
    <div className="app">

      <aside
        className={`sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >

        <div className="sidebar-header">

          <div className="brand-mark">
            <BarChart3 size={21} />
          </div>

          <div>
            <div className="brand-title">
              DataVision<span>Pro</span>
            </div>

            <div className="sidebar-subtitle">
              Analytics workspace
            </div>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>

        </div>

        <div className="dataset-mini">

          <div className="dataset-mini-icon">
            <FileText size={17} />
          </div>

          <div>
            <strong>{data.filename}</strong>
            <span>
              {formatNumber(overview.rows)} rows
              {" • "}
              {formatNumber(overview.columns)} columns
            </span>
          </div>

        </div>

        <div className="nav-label">
          ANALYSIS
        </div>

        <nav>

          {navItems.map((item) => {

            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={
                  section === item.id
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => navigate(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>

                {section === item.id && (
                  <ChevronDown
                    size={15}
                    className="active-arrow"
                  />
                )}
              </button>
            );
          })}

        </nav>

        <div className="sidebar-bottom">

          <div className="backend-status">
            <span className="status-dot"></span>
            Backend connected
          </div>

          <button
            className="new-analysis"
            onClick={onReset}
          >
            <UploadCloud size={17} />
            New analysis
          </button>

        </div>

      </aside>

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main">

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={21} />
          </button>

          <div className="topbar-title">
            <span>Workspace</span>
            <strong>
              {navItems.find((item) => item.id === section)?.label}
            </strong>
          </div>

          <div className="topbar-right">

            <div className="topbar-file">
              <FileText size={16} />
              {data.filename}
            </div>

            <button
              className="topbar-new"
              onClick={onReset}
            >
              <RefreshCw size={16} />
              New
            </button>

          </div>

        </header>

        <div className="content">
          {renderContent()}
        </div>

        <footer className="dashboard-footer">
          <span>DataVisionPro</span>
          <span>Analysis generated {new Date(data.generatedAt).toLocaleString()}</span>
        </footer>

      </main>

    </div>
  );
}

function CopyIcon(props) {
  return <Database {...props} />;
}

function CalculatorIcon(props) {
  return <Activity {...props} />;
}

export default function App() {

  const [data, setData] = useState(null);

  if (!data) {
    return (
      <UploadScreen
        onAnalyzed={setData}
      />
    );
  }

  return (
    <Dashboard
      data={data}
      onReset={() => setData(null)}
    />
  );
}
