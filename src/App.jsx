import React, { useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Columns3,
  Database,
  FileBarChart,
  FileText,
  Filter,
  FolderOpen,
  Grid3X3,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Menu,
  MoreHorizontal,
  PieChart as PieChartIcon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Table2,
  Target,
  TrendingUp,
  Upload,
  UploadCloud,
  X,
  Zap
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const CHART_TYPES = [
  "Line Chart",
  "Bar Chart",
  "Area Chart",
  "Pie Chart",
  "Donut Chart",
  "Histogram",
  "Scatter Plot",
  "Box Plot",
  "Heatmap"
];

const AGGREGATIONS = [
  "Sum",
  "Average",
  "Count",
  "Minimum",
  "Maximum"
];

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#ea580c",
  "#0891b2",
  "#db2777",
  "#ca8a04",
  "#475569",
  "#059669",
  "#9333ea"
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatNumber(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) return "0";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(n);
}

function compactNumber(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) return "0";

  if (Math.abs(n) >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(n) >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }

  return formatNumber(n);
}

function getColumnName(item) {
  if (typeof item === "string") return item;

  return (
    item?.name ||
    item?.column ||
    item?.columnName ||
    item?.field ||
    ""
  );
}

function getCorrelationValue(item) {
  return Number(
    item?.correlation ??
    item?.value ??
    item?.coefficient ??
    0
  );
}

function EmptyChart({ title, text }) {
  return (
    <div className="empty-chart">
      <BarChart3 size={28} />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function ChartSelector({
  value,
  onChange
}) {
  return (
    <div className="chart-selector">

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >

        {CHART_TYPES.map((type) => (
          <option
            key={type}
            value={type}
          >
            {type}
          </option>
        ))}

      </select>

      <ChevronDown size={14} />

    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  tone = "blue"
}) {
  return (
    <div className="stat-card">

      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>

      <div className="stat-content">

        <span className="stat-title">
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {subtitle}
        </small>

      </div>

    </div>
  );
}

function AnalyzingOverlay({ filename }) {
  return (
    <div className="analysis-overlay">

      <div className="analysis-modal">

        <button className="analysis-close">
          <X size={17} />
        </button>

        <div className="analysis-brand-icon">
          <Activity size={28} />
        </div>

        <div className="analysis-badge">
          ANALYZING YOUR DATA
        </div>

        <h2>
          Understanding your dataset
        </h2>

        <div className="analysis-file">
          <FileText size={16} />
          {filename}
        </div>

        <div className="analysis-loader">
          <div />
        </div>

        <div className="analysis-progress">
          <div />
        </div>

        <div className="analysis-steps">

          <AnalysisStep
            label="Uploading dataset"
            done
          />

          <AnalysisStep
            label="Reading dataset structure"
            done
          />

          <AnalysisStep
            label="Detecting column types"
            done
          />

          <AnalysisStep
            label="Calculating statistics"
            active
          />

          <AnalysisStep
            label="Checking data quality"
            active
          />

          <AnalysisStep
            label="Finding relationships"
            active
          />

          <AnalysisStep
            label="Generating insights"
            active
          />

        </div>

        <div className="analysis-footer-note">
          <Sparkles size={16} />
          Processing your data through the DataVisionPro analytics backend.
        </div>

      </div>

    </div>
  );
}

function AnalysisStep({
  label,
  done,
  active
}) {
  return (
    <div
      className={`analysis-step ${
        done ? "done" : active ? "active" : ""
      }`}
    >

      <div className="step-icon">

        {done ? (
          <Check size={13} />
        ) : active ? (
          <Activity size={14} />
        ) : (
          <span />
        )}

      </div>

      <span>
        {label}
      </span>

    </div>
  );
}

function UploadScreen({
  onFile
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (files) => {

    const file = files?.[0];

    if (!file) return;

    const extension =
      file.name
        .substring(
          file.name.lastIndexOf(".")
        )
        .toLowerCase();

    const allowed = [
      ".csv",
      ".xlsx",
      ".xls",
      ".json"
    ];

    if (!allowed.includes(extension)) {
      setError(
        "Please upload CSV, XLS, XLSX or JSON."
      );
      return;
    }

    if (
      file.size >
      25 * 1024 * 1024
    ) {
      setError(
        "Maximum file size is 25 MB."
      );
      return;
    }

    setError("");

    onFile(file);
  };

  return (
    <div className="upload-page">

      <div className="upload-center">

        <div className="brand-large">
          <div className="brand-large-icon">
            <BarChart3 size={28} />
          </div>

          <div>
            <strong>
              DataVision<span>Pro</span>
            </strong>

            <small>
              Turn Data Into Insights
            </small>
          </div>
        </div>

        <div
          className={`upload-drop ${
            dragging ? "dragging" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(
              Array.from(e.dataTransfer.files)
            );
          }}
        >

          <input
            id="dataset-upload"
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={(e) =>
              handleFiles(
                Array.from(e.target.files || [])
              )
            }
          />

          <div className="upload-cloud">
            <UploadCloud size={34} />
          </div>

          <h1>
            Upload your dataset
          </h1>

          <p>
            Drag and drop your file here or browse
            from your computer.
          </p>

          <label
            htmlFor="dataset-upload"
            className="primary-button"
          >
            <Upload size={17} />
            Choose Dataset
          </label>

          <div className="supported-files">
            CSV
            <span>•</span>
            Excel
            <span>•</span>
            JSON
            <span>•</span>
            Maximum 25 MB
          </div>

        </div>

        {error && (
          <div className="upload-error">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <div className="upload-features">

          <div>
            <Sparkles size={18} />
            <strong>Automatic analysis</strong>
            <span>Understand your data instantly</span>
          </div>

          <div>
            <BarChart3 size={18} />
            <strong>Powerful visualizations</strong>
            <span>Explore multiple chart types</span>
          </div>

          <div>
            <Target size={18} />
            <strong>Smart insights</strong>
            <span>Discover useful patterns</span>
          </div>

        </div>

      </div>

    </div>
  );
}

function Dashboard({
  data,
  filename,
  onNewAnalysis
}) {

  const overview =
    data?.overview || {};

  const preview =
    safeArray(data?.preview);

  const numericColumns =
    safeArray(data?.numericColumns)
      .map(getColumnName)
      .filter(Boolean);

  const categoricalColumns =
    safeArray(data?.categoricalColumns)
      .map(getColumnName)
      .filter(Boolean);

  const dateColumns =
    safeArray(data?.dateColumns)
      .map(getColumnName)
      .filter(Boolean);

  const columns =
    safeArray(data?.columns)
      .map(getColumnName)
      .filter(Boolean);

  const columnAnalysis =
    data?.columnAnalysis ||
    data?.columnStats ||
    {};

  const correlations =
    safeArray(data?.correlations);

  const insights =
    safeArray(data?.insights);

  const [page, setPage] =
    useState("Overview");

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [mainChartType, setMainChartType] =
    useState(
      dateColumns.length
        ? "Line Chart"
        : numericColumns.length
          ? "Bar Chart"
          : "Bar Chart"
    );

  const [categoryChartType, setCategoryChartType] =
    useState("Bar Chart");

  const [customX, setCustomX] =
    useState(
      dateColumns[0] ||
      categoricalColumns[0] ||
      columns[0] ||
      ""
    );

  const [customY, setCustomY] =
    useState(
      numericColumns[0] ||
      columns[1] ||
      ""
    );

  const [customType, setCustomType] =
    useState("Line Chart");

  const [aggregation, setAggregation] =
    useState("Sum");

  const [generatedChart, setGeneratedChart] =
    useState(null);

  const [search, setSearch] =
    useState("");

  //
  // NUMERIC DATA
  //

  const numericTrend = useMemo(() => {

    if (!numericColumns[0]) {
      return [];
    }

    const key =
      numericColumns[0];

    return preview
      .map((row, index) => ({
        index: index + 1,
        value: Number(row?.[key])
      }))
      .filter(
        (item) =>
          Number.isFinite(item.value)
      )
      .slice(0, 30);

  }, [preview, numericColumns]);

  //
  // SECOND NUMERIC DATA
  //

  const secondNumeric =
    numericColumns[1];

  const scatterData = useMemo(() => {

    if (
      !numericColumns[0] ||
      !secondNumeric
    ) {
      return [];
    }

    return preview
      .map((row) => ({
        x: Number(
          row?.[numericColumns[0]]
        ),
        y: Number(
          row?.[secondNumeric]
        )
      }))
      .filter(
        (item) =>
          Number.isFinite(item.x) &&
          Number.isFinite(item.y)
      )
      .slice(0, 120);

  }, [
    preview,
    numericColumns,
    secondNumeric
  ]);

  //
  // CATEGORY DATA
  //

  const categoryData = useMemo(() => {

    const key =
      categoricalColumns[0];

    if (!key) return [];

    const counts = {};

    preview.forEach((row) => {

      const value =
        String(
          row?.[key] ??
          "Unknown"
        );

      counts[value] =
        (counts[value] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 10)
      .map(([name, value]) => ({
        name,
        value
      }));

  }, [
    preview,
    categoricalColumns
  ]);

  //
  // HISTOGRAM
  //

  const histogramData =
    useMemo(() => {

      const key =
        numericColumns[0];

      if (!key) return [];

      const values =
        preview
          .map(
            (row) =>
              Number(row?.[key])
          )
          .filter(
            (value) =>
              Number.isFinite(value)
          );

      if (!values.length) {
        return [];
      }

      const min =
        Math.min(...values);

      const max =
        Math.max(...values);

      if (min === max) {
        return [
          {
            range:
              formatNumber(min),
            count:
              values.length
          }
        ];
      }

      const binCount = 8;

      const width =
        (max - min) /
        binCount;

      const bins =
        Array.from(
          {
            length:
              binCount
          },
          (_, index) => {

            const from =
              min +
              index * width;

            const to =
              index ===
              binCount - 1
                ? max
                : min +
                  (index + 1) *
                    width;

            return {
              range:
                `${compactNumber(from)}-${compactNumber(to)}`,
              count: 0
            };
          }
        );

      values.forEach(
        (value) => {

          let index =
            Math.floor(
              (value - min) /
                width
            );

          if (
            index >=
            binCount
          ) {
            index =
              binCount - 1;
          }

          bins[index].count++;
        }
      );

      return bins;

    }, [
      preview,
      numericColumns
    ]);

  //
  // DATE TREND
  //

  const dateTrend =
    useMemo(() => {

      const dateKey =
        dateColumns[0];

      const valueKey =
        numericColumns[0];

      if (
        !dateKey ||
        !valueKey
      ) {
        return [];
      }

      return preview
        .map((row) => ({
          date:
            String(
              row?.[dateKey] ??
              ""
            ),
          value:
            Number(
              row?.[valueKey]
            )
        }))
        .filter(
          (item) =>
            item.date &&
            Number.isFinite(
              item.value
            )
        )
        .slice(0, 30);

    }, [
      preview,
      dateColumns,
      numericColumns
    ]);

  //
  // CORRELATION DATA
  //

  const heatmapData =
    useMemo(() => {

      if (
        correlations.length
      ) {
        return correlations
          .slice(0, 25)
          .map(
            (item) => ({
              a:
                item?.columnA ||
                item?.x ||
                item?.first ||
                "Variable A",
              b:
                item?.columnB ||
                item?.y ||
                item?.second ||
                "Variable B",
              value:
                getCorrelationValue(
                  item
                )
            })
          );
      }

      return [];

    }, [correlations]);

  //
  // COMPLETENESS
  //

  const completeness =
    Number(
      overview.completeness ||
      overview.completenessPercentage ||
      0
    );

  const missing =
    Math.max(
      0,
      100 - completeness
    );

  //
  // DUPLICATES
  //

  const duplicateCount =
    Number(
      overview.duplicateRows ??
      overview.duplicates ??
      0
    );

  //
  // CUSTOM CHART
  //

  const buildCustomData =
    () => {

      if (!customX) return [];

      const groups = {};

      preview.forEach(
        (row) => {

          const xValue =
            String(
              row?.[customX] ??
              "Unknown"
            );

          if (!groups[xValue]) {
            groups[xValue] = [];
          }

          const yValue =
            Number(
              row?.[customY]
            );

          if (
            Number.isFinite(
              yValue
            )
          ) {
            groups[xValue].push(
              yValue
            );
          }

        }
      );

      return Object.entries(
        groups
      )
        .slice(0, 30)
        .map(
          ([name, values]) => {

            let value = 0;

            if (
              aggregation ===
              "Count"
            ) {
              value =
                values.length;
            } else if (
              aggregation ===
              "Average"
            ) {
              value =
                values.reduce(
                  (a, b) =>
                    a + b,
                  0
                ) /
                Math.max(
                  1,
                  values.length
                );
            } else if (
              aggregation ===
              "Minimum"
            ) {
              value =
                Math.min(
                  ...values
                );
            } else if (
              aggregation ===
              "Maximum"
            ) {
              value =
                Math.max(
                  ...values
                );
            } else {
              value =
                values.reduce(
                  (a, b) =>
                    a + b,
                  0
                );
            }

            return {
              name,
              value
            };

          }
        );

    };

  const generateCustomChart =
    () => {

      setGeneratedChart({
        type:
          customType,
        x:
          customX,
        y:
          customY,
        aggregation,
        data:
          buildCustomData()
      });

      setPage(
        "Visualizations"
      );
    };

  //
  // NAVIGATION
  //

  const navItems = [
    {
      name: "Overview",
      icon: Home
    },
    {
      name: "Data Quality",
      icon: ShieldCheck
    },
    {
      name: "Statistics",
      icon: Activity
    },
    {
      name: "Visualizations",
      icon: TrendingUp
    },
    {
      name: "Insights",
      icon: Sparkles
    },
    {
      name: "Data Table",
      icon: Table2
    }
  ];

  const renderChart = (
    type,
    dataSet,
    title,
    yLabel = "Value"
  ) => {

    if (
      !dataSet?.length
    ) {
      return (
        <EmptyChart
          title="No chart available"
          text="Suitable data was not detected."
        />
      );
    }

    if (
      type ===
      "Line Chart"
    ) {

      return (
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={dataSet}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e8edf4"
            />

            <XAxis
              dataKey={
                dataSet[0]?.name
                  ? "name"
                  : "index"
              }
              tick={{
                fontSize: 9,
                fill: "#667085"
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fontSize: 9,
                fill: "#667085"
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5
              }}
            />

          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (
      type ===
      "Bar Chart"
    ) {

      return (
        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart
            data={dataSet}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e8edf4"
            />

            <XAxis
              dataKey="name"
              tick={{
                fontSize: 8,
                fill: "#667085"
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fontSize: 9,
                fill: "#667085"
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Bar
              dataKey="value"
              fill="#2563eb"
              radius={[
                5,
                5,
                0,
                0
              ]}
            />

          </BarChart>

        </ResponsiveContainer>
      );
    }

    if (
      type ===
      "Area Chart"
    ) {

      return (
        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart
            data={dataSet}
          >

            <defs>
              <linearGradient
                id="blueArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#2563eb"
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor="#2563eb"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e8edf4"
            />

            <XAxis
              dataKey="name"
              tick={{
                fontSize: 8,
                fill: "#667085"
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fontSize: 9,
                fill: "#667085"
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              fill="url(#blueArea)"
              strokeWidth={2}
            />

          </AreaChart>

        </ResponsiveContainer>
      );
    }

    if (
      type ===
      "Pie Chart" ||
      type ===
      "Donut Chart"
    ) {

      return (
        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <PieChart>

            <Pie
              data={dataSet}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={
                type ===
                "Donut Chart"
                  ? 58
                  : 0
              }
              outerRadius={90}
              paddingAngle={3}
            >

              {dataSet.map(
                (_, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index %
                        COLORS.length
                      ]
                    }
                  />
                )
              )}

            </Pie>

            <Tooltip />

            <Legend
              wrapperStyle={{
                fontSize: "9px"
              }}
            />

          </PieChart>

        </ResponsiveContainer>
      );
    }

    if (
      type ===
      "Histogram"
    ) {

      return (
        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart
            data={
              histogramData
            }
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e8edf4"
            />

            <XAxis
              dataKey="range"
              tick={{
                fontSize: 7,
                fill: "#667085"
              }}
              angle={-20}
              textAnchor="end"
              height={50}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fontSize: 9,
                fill: "#667085"
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Bar
              dataKey="count"
              fill="#16a34a"
              radius={[
                4,
                4,
                0,
                0
              ]}
            />

          </BarChart>

        </ResponsiveContainer>
      );
    }

    if (
      type ===
      "Scatter Plot"
    ) {

      return (
        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <ScatterChart>

            <CartesianGrid
              stroke="#e8edf4"
            />

            <XAxis
              type="number"
              dataKey="x"
              name={
                numericColumns[0]
              }
              tick={{
                fontSize: 9
              }}
            />

            <YAxis
              type="number"
              dataKey="y"
              name={
                numericColumns[1]
              }
              tick={{
                fontSize: 9
              }}
            />

            <Tooltip />

            <Scatter
              data={
                scatterData
              }
              fill="#7c3aed"
            />

          </ScatterChart>

        </ResponsiveContainer>
      );
    }

    if (
      type ===
      "Box Plot"
    ) {

      const values =
        preview
          .map(
            (row) =>
              Number(
                row?.[
                  numericColumns[0]
                ]
              )
          )
          .filter(
            Number.isFinite
          )
          .sort(
            (a, b) =>
              a - b
          );

      if (!values.length) {
        return (
          <EmptyChart
            title="No box plot"
            text="Numeric data is required."
          />
        );
      }

      const q1 =
        values[
          Math.floor(
            values.length *
              0.25
          )
        ];

      const median =
        values[
          Math.floor(
            values.length *
              0.5
          )
        ];

      const q3 =
        values[
          Math.floor(
            values.length *
              0.75
          )
        ];

      const min =
        values[0];

      const max =
        values[
          values.length - 1
        ];

      return (
        <div className="boxplot">

          <div className="boxplot-title">
            {numericColumns[0]}
          </div>

          <div className="boxplot-values">

            <span>
              Min {compactNumber(min)}
            </span>

            <span>
              Q1 {compactNumber(q1)}
            </span>

            <span>
              Median {compactNumber(median)}
            </span>

            <span>
              Q3 {compactNumber(q3)}
            </span>

            <span>
              Max {compactNumber(max)}
            </span>

          </div>

          <div className="boxplot-line">

            <div className="boxplot-whisker left" />
            <div className="boxplot-box">
              <div className="boxplot-median" />
            </div>
            <div className="boxplot-whisker right" />

          </div>

        </div>
      );
    }

    if (
      type ===
      "Heatmap"
    ) {

      if (
        !heatmapData.length
      ) {
        return (
          <EmptyChart
            title="No correlation heatmap"
            text="Multiple numeric columns are required."
          />
        );
      }

      const variables =
        Array.from(
          new Set(
            heatmapData.flatMap(
              (item) => [
                item.a,
                item.b
              ]
            )
          )
        ).slice(0, 8);

      return (
        <div className="heatmap">

          <div className="heatmap-header">
            <div />
            {variables.map(
              (name) => (
                <span
                  key={name}
                  title={name}
                >
                  {String(
                    name
                  ).slice(
                    0,
                    9
                  )}
                </span>
              )
            )}
          </div>

          {variables.map(
            (rowName) => (

              <div
                className="heatmap-row"
                key={rowName}
              >

                <strong
                  title={rowName}
                >
                  {String(
                    rowName
                  ).slice(
                    0,
                    11
                  )}
                </strong>

                {variables.map(
                  (colName) => {

                    const item =
                      heatmapData.find(
                        (entry) =>
                          (
                            entry.a ===
                              rowName &&
                            entry.b ===
                              colName
                          ) ||
                          (
                            entry.a ===
                              colName &&
                            entry.b ===
                              rowName
                          )
                      );

                    const value =
                      item?.value ??
                      (
                        rowName ===
                        colName
                          ? 1
                          : 0
                      );

                    const intensity =
                      Math.min(
                        1,
                        Math.abs(
                          Number(
                            value
                          )
                        )
                      );

                    return (
                      <div
                        key={
                          `${rowName}-${colName}`
                        }
                        className="heat-cell"
                        style={{
                          opacity:
                            0.18 +
                            intensity *
                              0.82
                        }}
                        title={
                          `${rowName} / ${colName}: ${Number(
                            value
                          ).toFixed(3)}`
                        }
                      >
                        {Number(
                          value
                        ).toFixed(2)}
                      </div>
                    );

                  }
                )}

              </div>
            )
          )}

        </div>
      );
    }

    return (
      <EmptyChart
        title={title}
        text="Select another visualization."
      />
    );
  };

  //
  // PAGE CONTENT
  //

  const renderOverview =
    () => (

      <>

        <div className="page-heading">

          <div>

            <div className="eyebrow">
              DATASET OVERVIEW
            </div>

            <h1>
              Your data at a glance
            </h1>

            <p>
              Automated analysis of{" "}
              <strong>
                {filename}
              </strong>
            </p>

          </div>

          <button
            className="secondary-button"
            onClick={onNewAnalysis}
          >
            <RefreshCw size={15} />
            Analyze another
          </button>

        </div>

        <div className="stats-grid">

          <StatCard
            icon={Database}
            title="Rows"
            value={formatNumber(
              overview.rows ||
              overview.rowCount ||
              data?.rows ||
              0
            )}
            subtitle="Records analyzed"
            tone="blue"
          />

          <StatCard
            icon={Columns3}
            title="Columns"
            value={formatNumber(
              overview.columns ||
              overview.columnCount ||
              columns.length
            )}
            subtitle={`${numericColumns.length} numeric • ${categoricalColumns.length} categorical • ${dateColumns.length} date`}
            tone="purple"
          />

          <StatCard
            icon={ShieldCheck}
            title="Completeness"
            value={`${completeness.toFixed(2)}%`}
            subtitle={`${formatNumber(
              overview.missingCells ||
              overview.missing ||
              0
            )} missing cells`}
            tone="green"
          />

          <StatCard
            icon={AlertTriangle}
            title="Duplicates"
            value={formatNumber(
              duplicateCount
            )}
            subtitle="Duplicate records"
            tone="orange"
          />

        </div>

        <div className="dashboard-grid top-charts">

          <section className="panel chart-panel large-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  {dateColumns.length
                    ? "Sales Trend Over Time"
                    : "Data Distribution"}
                </h2>

                <p>
                  {dateColumns.length
                    ? `Trend using ${numericColumns[0] || "numeric values"}`
                    : "Preview of your numeric data"}
                </p>
              </div>

              <ChartSelector
                value={
                  mainChartType
                }
                onChange={
                  setMainChartType
                }
              />

            </div>

            <div className="chart-area">

              {mainChartType ===
                "Line Chart" &&
                renderChart(
                  "Line Chart",
                  dateTrend.length
                    ? dateTrend
                    : numericTrend,
                  "Trend"
                )}

              {mainChartType ===
                "Area Chart" &&
                renderChart(
                  "Area Chart",
                  dateTrend.length
                    ? dateTrend
                    : numericTrend,
                  "Trend"
                )}

              {mainChartType ===
                "Bar Chart" &&
                renderChart(
                  "Bar Chart",
                  categoryData.length
                    ? categoryData
                    : numericTrend.map(
                        (item) => ({
                          name:
                            item.index,
                          value:
                            item.value
                        })
                      ),
                  "Distribution"
                )}

              {mainChartType ===
                "Histogram" &&
                renderChart(
                  "Histogram",
                  histogramData,
                  "Distribution"
                )}

              {mainChartType ===
                "Scatter Plot" &&
                renderChart(
                  "Scatter Plot",
                  scatterData,
                  "Relationship"
                )}

              {mainChartType ===
                "Pie Chart" &&
                renderChart(
                  "Pie Chart",
                  categoryData,
                  "Share"
                )}

              {mainChartType ===
                "Donut Chart" &&
                renderChart(
                  "Donut Chart",
                  categoryData,
                  "Share"
                )}

              {mainChartType ===
                "Box Plot" &&
                renderChart(
                  "Box Plot",
                  numericTrend,
                  "Box Plot"
                )}

              {mainChartType ===
                "Heatmap" &&
                renderChart(
                  "Heatmap",
                  heatmapData,
                  "Correlation"
                )}

            </div>

          </section>

          <section className="panel chart-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Category Distribution
                </h2>

                <p>
                  Top categories by count
                </p>
              </div>

              <ChartSelector
                value={
                  categoryChartType
                }
                onChange={
                  setCategoryChartType
                }
              />

            </div>

            <div className="chart-area">

              {[
                "Bar Chart",
                "Pie Chart",
                "Donut Chart"
              ].includes(
                categoryChartType
              )
                ? renderChart(
                    categoryChartType,
                    categoryData,
                    "Categories"
                  )
                : renderChart(
                    "Bar Chart",
                    categoryData,
                    "Categories"
                  )}

            </div>

          </section>

        </div>

        <section className="panel custom-builder">

          <div className="builder-heading">

            <div className="builder-icon">
              <Grid3X3 size={20} />
            </div>

            <div>
              <h2>
                Create Your Own Visualization
              </h2>

              <p>
                Choose columns and chart type to explore your data
              </p>
            </div>

          </div>

          <div className="builder-layout">

            <div className="builder-controls">

              <div className="control">

                <label>
                  X-axis column
                </label>

                <div className="select-wrap">

                  <select
                    value={customX}
                    onChange={(e) =>
                      setCustomX(
                        e.target.value
                      )
                    }
                  >

                    {columns.map(
                      (column) => (
                        <option
                          key={column}
                          value={column}
                        >
                          {column}
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={14}
                  />

                </div>

              </div>

              <div className="control">

                <label>
                  Y-axis column
                </label>

                <div className="select-wrap">

                  <select
                    value={customY}
                    onChange={(e) =>
                      setCustomY(
                        e.target.value
                      )
                    }
                  >

                    {columns.map(
                      (column) => (
                        <option
                          key={column}
                          value={column}
                        >
                          {column}
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={14}
                  />

                </div>

              </div>

              <div className="control">

                <label>
                  Chart type
                </label>

                <div className="select-wrap">

                  <select
                    value={customType}
                    onChange={(e) =>
                      setCustomType(
                        e.target.value
                      )
                    }
                  >

                    {CHART_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={14}
                  />

                </div>

              </div>

              <div className="control">

                <label>
                  Aggregation
                </label>

                <div className="select-wrap">

                  <select
                    value={aggregation}
                    onChange={(e) =>
                      setAggregation(
                        e.target.value
                      )
                    }
                  >

                    {AGGREGATIONS.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={14}
                  />

                </div>

              </div>

              <button
                className="generate-button"
                onClick={
                  generateCustomChart
                }
              >
                <Sparkles size={16} />
                Generate Chart
              </button>

            </div>

            <div className="builder-tip">

              <div className="tip-icon">
                <Zap size={17} />
              </div>

              <div>
                <strong>
                  Tip
                </strong>

                <p>
                  Try different columns and chart types to discover new insights.
                </p>
              </div>

            </div>

          </div>

        </section>

        {generatedChart && (
          <section className="panel generated-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  {generatedChart.type}
                </h2>

                <p>
                  {generatedChart.x}
                  {" → "}
                  {generatedChart.y}
                  {" • "}
                  {generatedChart.aggregation}
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() =>
                  setGeneratedChart(
                    null
                  )
                }
              >
                <X size={15} />
              </button>

            </div>

            <div className="generated-chart-area">

              {renderChart(
                generatedChart.type,
                generatedChart.data,
                "Generated Chart"
              )}

            </div>

          </section>
        )}

        <div className="dashboard-grid lower-grid">

          <section className="panel chart-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Sales Distribution
                </h2>

                <p>
                  Distribution of numeric values
                </p>
              </div>

              <span className="small-tag">
                Histogram
              </span>

            </div>

            <div className="chart-area small-chart">
              {renderChart(
                "Histogram",
                histogramData,
                "Histogram"
              )}
            </div>

          </section>

          <section className="panel chart-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  {numericColumns[0] ||
                    "Numeric"}{" "}
                  vs{" "}
                  {numericColumns[1] ||
                    "Numeric"}
                </h2>

                <p>
                  Relationship between numeric variables
                </p>
              </div>

              <span className="small-tag">
                Scatter Plot
              </span>

            </div>

            <div className="chart-area small-chart">
              {renderChart(
                "Scatter Plot",
                scatterData,
                "Scatter"
              )}
            </div>

          </section>

          <section className="panel chart-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Product Category Share
                </h2>

                <p>
                  Proportion by category
                </p>
              </div>

              <span className="small-tag">
                Donut Chart
              </span>

            </div>

            <div className="chart-area small-chart">
              {renderChart(
                "Donut Chart",
                categoryData,
                "Share"
              )}
            </div>

          </section>

          <section className="panel chart-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Correlation Heatmap
                </h2>

                <p>
                  Correlation between numeric columns
                </p>
              </div>

              <span className="small-tag">
                Heatmap
              </span>

            </div>

            <div className="chart-area small-chart">
              {renderChart(
                "Heatmap",
                heatmapData,
                "Heatmap"
              )}
            </div>

          </section>

        </div>

        <div className="dashboard-grid bottom-grid">

          <section className="panel insights-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  <Sparkles
                    size={17}
                  />
                  Automatic Insights
                </h2>

                <p>
                  Key findings from your dataset
                </p>
              </div>

              <button
                className="text-button"
                onClick={() =>
                  setPage(
                    "Insights"
                  )
                }
              >
                View all insights
                <ChevronRight
                  size={14}
                />
              </button>

            </div>

            <div className="insights-grid">

              {insights
                .slice(0, 4)
                .map(
                  (insight, index) => {

                    const text =
                      typeof insight ===
                      "string"
                        ? insight
                        : insight?.message ||
                          insight?.text ||
                          insight?.description ||
                          JSON.stringify(
                            insight
                          );

                    return (
                      <div
                        className={`insight-card insight-${index % 4}`}
                        key={index}
                      >

                        <Sparkles
                          size={16}
                        />

                        <strong>
                          {index === 0
                            ? "Data Insight"
                            : index === 1
                              ? "Pattern Detected"
                              : index === 2
                                ? "Data Quality"
                                : "Relationship"}
                        </strong>

                        <p>
                          {text}
                        </p>

                      </div>
                    );

                  }
                )}

              {!insights.length && (
                <div className="no-insights">
                  No automatic insights were returned by the backend.
                </div>
              )}

            </div>

          </section>

          <section className="panel preview-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  <Table2
                    size={17}
                  />
                  Data Preview
                </h2>

                <p>
                  First rows of your dataset
                </p>
              </div>

              <div className="search-box">

                <Search
                  size={14}
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search data..."
                />

              </div>

            </div>

            <div className="preview-table-wrap">

              <table>

                <thead>

                  <tr>

                    <th>#</th>

                    {columns
                      .slice(0, 6)
                      .map(
                        (column) => (
                          <th
                            key={column}
                          >
                            {column}
                          </th>
                        )
                      )}

                  </tr>

                </thead>

                <tbody>

                  {preview
                    .filter(
                      (row) =>
                        !search ||
                        JSON.stringify(
                          row
                        )
                          .toLowerCase()
                          .includes(
                            search.toLowerCase()
                          )
                    )
                    .slice(0, 8)
                    .map(
                      (row, index) => (

                        <tr
                          key={index}
                        >

                          <td>
                            {index + 1}
                          </td>

                          {columns
                            .slice(0, 6)
                            .map(
                              (
                                column
                              ) => (
                                <td
                                  key={
                                    column
                                  }
                                >
                                  {String(
                                    row?.[
                                      column
                                    ] ??
                                    "—"
                                  ).slice(
                                    0,
                                    30
                                  )}
                                </td>
                              )
                            )}

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

      </>
    );

  const renderDataQuality =
    () => (

      <div className="full-page-section">

        <div className="page-heading">

          <div>
            <div className="eyebrow">
              DATA QUALITY
            </div>

            <h1>
              Data quality overview
            </h1>

            <p>
              Understand missing values, duplicates and completeness.
            </p>
          </div>

        </div>

        <div className="quality-grid">

          <section className="panel quality-score">

            <div className="quality-ring">
              <svg
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#e8edf4"
                  strokeWidth="10"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="301.6"
                  strokeDashoffset={
                    301.6 -
                    (301.6 *
                      completeness) /
                      100
                  }
                  transform="rotate(-90 60 60)"
                />
              </svg>

              <strong>
                {completeness.toFixed(
                  1
                )}%
              </strong>

              <span>
                Complete
              </span>

            </div>

            <h2>
              Dataset completeness
            </h2>

            <p>
              {formatNumber(
                overview.missingCells ||
                overview.missing ||
                0
              )} missing cells detected.
            </p>

          </section>

          <section className="panel quality-bars">

            <h2>
              Quality indicators
            </h2>

            <QualityRow
              label="Complete cells"
              value={
                completeness
              }
              tone="blue"
            />

            <QualityRow
              label="Missing cells"
              value={
                missing
              }
              tone="orange"
            />

            <QualityRow
              label="Duplicate records"
              value={
                duplicateCount
                  ? 100
                  : 0
              }
              tone="purple"
            />

          </section>

        </div>

      </div>
    );

  const renderStatistics =
    () => (

      <div className="full-page-section">

        <div className="page-heading">

          <div>
            <div className="eyebrow">
              STATISTICS
            </div>

            <h1>
              Statistical overview
            </h1>

            <p>
              Numerical summaries calculated from your dataset.
            </p>
          </div>

        </div>

        <div className="statistics-grid">

          {numericColumns.map(
            (column) => {

              const stats =
                columnAnalysis?.[
                  column
                ] || {};

              return (
                <section
                  className="panel statistic-column"
                  key={column}
                >

                  <div className="column-title">
                    <BarChart3
                      size={17}
                    />

                    <strong>
                      {column}
                    </strong>
                  </div>

                  <div className="stat-row">
                    <span>Count</span>
                    <strong>
                      {formatNumber(
                        stats.count ||
                        0
                      )}
                    </strong>
                  </div>

                  <div className="stat-row">
                    <span>Mean</span>
                    <strong>
                      {formatNumber(
                        stats.mean ||
                        0
                      )}
                    </strong>
                  </div>

                  <div className="stat-row">
                    <span>Minimum</span>
                    <strong>
                      {formatNumber(
                        stats.min ||
                        0
                      )}
                    </strong>
                  </div>

                  <div className="stat-row">
                    <span>Maximum</span>
                    <strong>
                      {formatNumber(
                        stats.max ||
                        0
                      )}
                    </strong>
                  </div>

                  <div className="stat-row">
                    <span>Standard deviation</span>
                    <strong>
                      {formatNumber(
                        stats.std ||
                        stats.stdDev ||
                        0
                      )}
                    </strong>
                  </div>

                </section>
              );

            }
          )}

        </div>

      </div>
    );

  const renderVisualizations =
    () => (

      <div className="full-page-section">

        <div className="page-heading">

          <div>
            <div className="eyebrow">
              DATA VISUALIZATION
            </div>

            <h1>
              Explore your data
            </h1>

            <p>
              Switch between different visualization types and create your own charts.
            </p>
          </div>

        </div>

        <section className="panel visualization-builder-page">

          <div className="builder-heading">

            <div className="builder-icon">
              <BarChart3 size={20} />
            </div>

            <div>
              <h2>
                Create Your Own Visualization
              </h2>

              <p>
                Select columns, aggregation and visualization type.
              </p>
            </div>

          </div>

          <div className="builder-controls-page">

            <div className="control">
              <label>
                X-axis column
              </label>

              <select
                value={customX}
                onChange={(e) =>
                  setCustomX(
                    e.target.value
                  )
                }
              >
                {columns.map(
                  (column) => (
                    <option
                      key={column}
                      value={column}
                    >
                      {column}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="control">
              <label>
                Y-axis column
              </label>

              <select
                value={customY}
                onChange={(e) =>
                  setCustomY(
                    e.target.value
                  )
                }
              >
                {columns.map(
                  (column) => (
                    <option
                      key={column}
                      value={column}
                    >
                      {column}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="control">
              <label>
                Chart type
              </label>

              <select
                value={customType}
                onChange={(e) =>
                  setCustomType(
                    e.target.value
                  )
                }
              >
                {CHART_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="control">
              <label>
                Aggregation
              </label>

              <select
                value={aggregation}
                onChange={(e) =>
                  setAggregation(
                    e.target.value
                  )
                }
              >
                {AGGREGATIONS.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              className="generate-button"
              onClick={
                generateCustomChart
              }
            >
              <Sparkles size={16} />
              Generate Chart
            </button>

          </div>

        </section>

        <div className="visualization-gallery">

          <VisualizationGalleryCard
            title="Trend Analysis"
            subtitle={
              dateColumns[0] ||
              numericColumns[0] ||
              "Numeric data"
            }
            type="Line Chart"
            data={
              dateTrend.length
                ? dateTrend
                : numericTrend
            }
            renderChart={
              renderChart
            }
          />

          <VisualizationGalleryCard
            title="Category Comparison"
            subtitle={
              categoricalColumns[0] ||
              "Categorical data"
            }
            type="Bar Chart"
            data={
              categoryData
            }
            renderChart={
              renderChart
            }
          />

          <VisualizationGalleryCard
            title="Value Distribution"
            subtitle={
              numericColumns[0] ||
              "Numeric data"
            }
            type="Histogram"
            data={
              histogramData
            }
            renderChart={
              renderChart
            }
          />

          <VisualizationGalleryCard
            title="Relationship Analysis"
            subtitle={
              `${numericColumns[0] || "X"} × ${numericColumns[1] || "Y"}`
            }
            type="Scatter Plot"
            data={
              scatterData
            }
            renderChart={
              renderChart
            }
          />

          <VisualizationGalleryCard
            title="Category Share"
            subtitle={
              categoricalColumns[0] ||
              "Categories"
            }
            type="Donut Chart"
            data={
              categoryData
            }
            renderChart={
              renderChart
            }
          />

          <VisualizationGalleryCard
            title="Correlation"
            subtitle="Numeric relationships"
            type="Heatmap"
            data={
              heatmapData
            }
            renderChart={
              renderChart
            }
          />

        </div>

        {generatedChart && (

          <section className="panel generated-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Generated visualization
                </h2>

                <p>
                  {generatedChart.type}
                  {" • "}
                  {generatedChart.x}
                  {" × "}
                  {generatedChart.y}
                </p>
              </div>

            </div>

            <div className="generated-chart-area">
              {renderChart(
                generatedChart.type,
                generatedChart.data,
                "Generated"
              )}
            </div>

          </section>

        )}

      </div>
    );

  const renderInsights =
    () => (

      <div className="full-page-section">

        <div className="page-heading">

          <div>
            <div className="eyebrow">
              INSIGHTS
            </div>

            <h1>
              Discover what your data says
            </h1>

            <p>
              Automatically generated findings from the analytics backend.
            </p>
          </div>

        </div>

        <div className="all-insights">

          {insights.map(
            (insight, index) => {

              const text =
                typeof insight ===
                "string"
                  ? insight
                  : insight?.message ||
                    insight?.text ||
                    insight?.description ||
                    JSON.stringify(
                      insight
                    );

              return (
                <div
                  className="large-insight"
                  key={index}
                >

                  <div className="large-insight-icon">
                    <Sparkles
                      size={19}
                    />
                  </div>

                  <div>
                    <span>
                      INSIGHT{" "}
                      {index + 1}
                    </span>

                    <h3>
                      {index % 2 ===
                      0
                        ? "Pattern detected"
                        : "Data observation"}
                    </h3>

                    <p>
                      {text}
                    </p>
                  </div>

                </div>
              );
            }
          )}

          {!insights.length && (
            <div className="panel no-data">
              No insights returned.
            </div>
          )}

        </div>

      </div>
    );

  const renderDataTable =
    () => {

      const filtered =
        preview.filter(
          (row) =>
            !search ||
            JSON.stringify(
              row
            )
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );

      return (
        <div className="full-page-section">

          <div className="page-heading">

            <div>
              <div className="eyebrow">
                DATA TABLE
              </div>

              <h1>
                Explore your records
              </h1>

              <p>
                Search and inspect the dataset preview.
              </p>
            </div>

            <div className="search-box large-search">
              <Search size={15} />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search rows..."
              />
            </div>

          </div>

          <section className="panel table-panel">

            <div className="full-table-wrap">

              <table>

                <thead>

                  <tr>
                    <th>#</th>

                    {columns.map(
                      (column) => (
                        <th
                          key={column}
                        >
                          {column}
                        </th>
                      )
                    )}

                  </tr>

                </thead>

                <tbody>

                  {filtered
                    .slice(0, 50)
                    .map(
                      (row, index) => (

                        <tr
                          key={index}
                        >

                          <td>
                            {index + 1}
                          </td>

                          {columns.map(
                            (
                              column
                            ) => (
                              <td
                                key={
                                  column
                                }
                              >
                                {String(
                                  row?.[
                                    column
                                  ] ??
                                  "—"
                                )}
                              </td>
                            )
                          )}

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          </section>

        </div>
      );
    };

  const renderContent =
    () => {

      if (
        page ===
        "Data Quality"
      ) {
        return renderDataQuality();
      }

      if (
        page ===
        "Statistics"
      ) {
        return renderStatistics();
      }

      if (
        page ===
        "Visualizations"
      ) {
        return renderVisualizations();
      }

      if (
        page ===
        "Insights"
      ) {
        return renderInsights();
      }

      if (
        page ===
        "Data Table"
      ) {
        return renderDataTable();
      }

      return renderOverview();
    };

  return (
    <div className="app-shell">

      <aside
        className={`sidebar ${
          mobileMenu
            ? "mobile-open"
            : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="logo-icon">
            <BarChart3
              size={21}
            />
          </div>

          <div>
            <strong>
              DataVision<span>
                Pro
              </span>
            </strong>

            <small>
              Analytics workspace
            </small>
          </div>

        </div>

        <div className="sidebar-dataset">

          <div className="dataset-file-icon">
            <FileText
              size={17}
            />
          </div>

          <div>
            <strong>
              {filename}
            </strong>

            <small>
              {formatNumber(
                overview.rows ||
                0
              )}{" "}
              rows •{" "}
              {columns.length}{" "}
              columns
            </small>
          </div>

          <ChevronDown
            size={14}
          />

        </div>

        <div className="nav-section-title">
          ANALYSIS
        </div>

        <nav>

          {navItems.map(
            ({
              name,
              icon: Icon
            }) => (

              <button
                key={name}
                className={
                  page === name
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => {
                  setPage(name);
                  setMobileMenu(
                    false
                  );
                }}
              >

                <Icon size={17} />

                <span>
                  {name}
                </span>

                {page === name && (
                  <ChevronRight
                    size={15}
                  />
                )}

              </button>

            )
          )}

        </nav>

        <div className="sidebar-bottom">

          <button
            className="nav-item"
            onClick={
              onNewAnalysis
            }
          >
            <UploadCloud
              size={17}
            />
            <span>
              Upload New Data
            </span>
          </button>

          <button className="nav-item">
            <FolderOpen
              size={17}
            />
            <span>
              Saved Analyses
            </span>
          </button>

          <button className="nav-item">
            <Settings
              size={17}
            />
            <span>
              Settings
            </span>
          </button>

          <button className="nav-item">
            <HelpCircle
              size={17}
            />
            <span>
              Help & Support
            </span>
          </button>

          <div className="sidebar-card">

            <strong>
              DataVisionPro
            </strong>

            <p>
              Simple Analytics.
              <br />
              Deeper Insights.
            </p>

          </div>

        </div>

      </aside>

      {mobileMenu && (
        <div
          className="mobile-backdrop"
          onClick={() =>
            setMobileMenu(
              false
            )
          }
        />
      )}

      <main className="main-content">

        <header className="topbar">

          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenu(
                !mobileMenu
              )
            }
          >
            <Menu size={20} />
          </button>

          <div className="topbar-file">

            <div className="topbar-file-icon">
              <FileText size={17} />
            </div>

            <div>
              <strong>
                {filename}
              </strong>

              <span>
                {formatNumber(
                  overview.rows ||
                  0
                )}{" "}
                rows •{" "}
                {columns.length}{" "}
                columns
              </span>
            </div>

            <ChevronDown
              size={14}
            />

          </div>

          <div className="topbar-spacer" />

          <div className="connection-status">
            <span />
            Analysis complete
          </div>

          <button
            className="top-new-button"
            onClick={
              onNewAnalysis
            }
          >
            <UploadCloud
              size={16}
            />
            New Analysis
          </button>

          <button className="top-icon-button">
            <Bell size={17} />
          </button>

        </header>

        <div className="content-area">
          {renderContent()}
        </div>

      </main>

    </div>
  );
}

function QualityRow({
  label,
  value,
  tone
}) {
  return (
    <div className="quality-row">

      <div className="quality-label">
        <span>
          {label}
        </span>

        <strong>
          {Number(
            value
          ).toFixed(2)}%
        </strong>
      </div>

      <div className="quality-bar">
        <div
          className={`quality-fill ${tone}`}
          style={{
            width: `${Math.min(
              100,
              Math.max(
                0,
                value
              )
            )}%`
          }}
        />
      </div>

    </div>
  );
}

function VisualizationGalleryCard({
  title,
  subtitle,
  type,
  data,
  renderChart
}) {
  return (
    <section className="panel gallery-card">

      <div className="panel-heading">

        <div>
          <h2>
            {title}
          </h2>

          <p>
            {subtitle}
          </p>
        </div>

        <span className="small-tag">
          {type}
        </span>

      </div>

      <div className="gallery-chart">
        {renderChart(
          type,
          data,
          title
        )}
      </div>

    </section>
  );
}

export default function App() {

  const [dataset, setDataset] =
    useState(null);

  const [filename, setFilename] =
    useState("");

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");

  const analyzeFile =
    async (file) => {

      setError("");
      setFilename(
        file.name
      );
      setAnalyzing(true);

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () =>
            controller.abort(),
          30000
        );

      try {

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const response =
          await fetch(
            `${API_URL}/api/analyze`,
            {
              method:
                "POST",
              body:
                formData,
              signal:
                controller.signal
            }
          );

        clearTimeout(
          timeout
        );

        let result;

        try {
          result =
            await response.json();
        } catch {
          throw new Error(
            "Backend returned an invalid response."
          );
        }

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result?.error ||
            "Unable to analyze the dataset."
          );
        }

        if (!result.data) {
          throw new Error(
            "No analysis data was returned."
          );
        }

        setDataset(
          result.data
        );

        setAnalyzing(
          false
        );

      } catch (err) {

        clearTimeout(
          timeout
        );

        console.error(
          "DataVisionPro:",
          err
        );

        setAnalyzing(
          false
        );

        if (
          err?.name ===
          "AbortError"
        ) {
          setError(
            "The analysis exceeded 30 seconds. Try a smaller dataset."
          );
        } else if (
          err?.message?.includes(
            "Failed to fetch"
          )
        ) {
          setError(
            "Cannot connect to DataVisionPro backend. Make sure port 5000 is running."
          );
        } else {
          setError(
            err?.message ||
            "Unable to analyze the dataset."
          );
        }

      }
    };

  const reset =
    () => {
      setDataset(
        null
      );
      setFilename(
        ""
      );
      setError(
        ""
      );
      setAnalyzing(
        false
      );
    };

  if (!dataset) {

    return (
      <>
        <UploadScreen
          onFile={
            analyzeFile
          }
        />

        {analyzing && (
          <AnalyzingOverlay
            filename={
              filename
            }
          />
        )}

        {error && (
          <div className="global-error">
            <AlertTriangle
              size={17}
            />

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
            >
              <X size={15} />
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <Dashboard
      data={dataset}
      filename={filename}
      onNewAnalysis={
        reset
      }
    />
  );
}
