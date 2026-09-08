import express from "express";
import cors from "cors";
import multer from "multer";
import XLSX from "xlsx";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  methods: ["GET", "POST"],
}));

app.use(express.json({
  limit: "10mb"
}));

// ============================================================
// FILE UPLOAD CONFIGURATION
// ============================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 25 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowed = [
      ".csv",
      ".xlsx",
      ".xls",
      ".json"
    ];

    const ext =
      "." +
      file.originalname
        .split(".")
        .pop()
        .toLowerCase();

    if (!allowed.includes(ext)) {
      return cb(
        new Error(
          "Unsupported file format. Use CSV, XLSX, XLS, or JSON."
        )
      );
    }

    cb(null, true);
  }
});

// ============================================================
// HEALTH
// ============================================================

app.get("/api/health", (req, res) => {

  res.json({
    status: "ok",
    service: "DataVisionPro API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });

});

// ============================================================
// HELPERS
// ============================================================

function cleanValue(value) {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return value;
}

function isMissing(value) {

  return (
    value === null ||
    value === undefined ||
    value === ""
  );

}

function isNumericValue(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  const converted =
    Number(
      String(value)
        .replace(/,/g, "")
        .trim()
    );

  return Number.isFinite(converted);

}

function toNumber(value) {

  if (typeof value === "number") {
    return value;
  }

  return Number(
    String(value)
      .replace(/,/g, "")
      .trim()
  );

}

function median(values) {

  if (!values.length) {
    return null;
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const middle =
    Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {

    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;

  }

  return sorted[middle];

}

function standardDeviation(values) {

  if (!values.length) {
    return 0;
  }

  const mean =
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  const variance =
    values.reduce(
      (sum, value) =>
        sum +
        Math.pow(value - mean, 2),
      0
    ) / values.length;

  return Math.sqrt(variance);

}

function percentile(values, p) {

  if (!values.length) {
    return null;
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const index =
    (sorted.length - 1) * p;

  const lower =
    Math.floor(index);

  const upper =
    Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  return (
    sorted[lower] +
    (sorted[upper] - sorted[lower]) *
      (index - lower)
  );

}

function detectDate(values) {

  const valid =
    values
      .filter((v) => !isMissing(v))
      .slice(0, 30);

  if (valid.length === 0) {
    return false;
  }

  let matches = 0;

  for (const value of valid) {

    if (typeof value === "number") {
      continue;
    }

    const parsed =
      Date.parse(String(value));

    if (!Number.isNaN(parsed)) {
      matches++;
    }

  }

  return (
    matches / valid.length >= 0.8
  );

}

function detectColumnType(values) {

  const valid =
    values.filter(
      (value) => !isMissing(value)
    );

  if (!valid.length) {
    return "empty";
  }

  const numericCount =
    valid.filter(
      isNumericValue
    ).length;

  if (
    numericCount / valid.length >= 0.8
  ) {
    return "numeric";
  }

  if (detectDate(valid)) {
    return "date";
  }

  return "categorical";

}

function uniqueCount(values) {

  return new Set(
    values
      .filter(
        (value) => !isMissing(value)
      )
      .map(String)
  ).size;

}

function frequencyTable(values) {

  const frequency = {};

  values
    .filter(
      (value) => !isMissing(value)
    )
    .forEach((value) => {

      const key = String(value);

      frequency[key] =
        (frequency[key] || 0) + 1;

    });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      count
    }));

}

// ============================================================
// CORRELATION
// ============================================================

function correlation(x, y) {

  const pairs = [];

  for (
    let i = 0;
    i < Math.min(x.length, y.length);
    i++
  ) {

    const a = toNumber(x[i]);
    const b = toNumber(y[i]);

    if (
      Number.isFinite(a) &&
      Number.isFinite(b)
    ) {
      pairs.push([a, b]);
    }

  }

  if (pairs.length < 3) {
    return null;
  }

  const xValues =
    pairs.map((p) => p[0]);

  const yValues =
    pairs.map((p) => p[1]);

  const xMean =
    xValues.reduce(
      (a, b) => a + b,
      0
    ) / xValues.length;

  const yMean =
    yValues.reduce(
      (a, b) => a + b,
      0
    ) / yValues.length;

  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;

  for (let i = 0; i < pairs.length; i++) {

    const dx =
      xValues[i] - xMean;

    const dy =
      yValues[i] - yMean;

    numerator += dx * dy;
    xDenominator += dx * dx;
    yDenominator += dy * dy;

  }

  if (
    xDenominator === 0 ||
    yDenominator === 0
  ) {
    return null;
  }

  return (
    numerator /
    Math.sqrt(
      xDenominator *
      yDenominator
    )
  );

}

// ============================================================
// OUTLIERS
// ============================================================

function detectOutliers(values) {

  if (values.length < 4) {
    return {
      count: 0,
      percentage: 0,
      lowerBound: null,
      upperBound: null
    };
  }

  const q1 =
    percentile(values, 0.25);

  const q3 =
    percentile(values, 0.75);

  const iqr =
    q3 - q1;

  const lower =
    q1 - 1.5 * iqr;

  const upper =
    q3 + 1.5 * iqr;

  const count =
    values.filter(
      (value) =>
        value < lower ||
        value > upper
    ).length;

  return {
    count,
    percentage:
      Number(
        (
          (count / values.length) *
          100
        ).toFixed(2)
      ),
    lowerBound: lower,
    upperBound: upper
  };

}

// ============================================================
// DATA PROCESSING
// ============================================================

function analyzeDataset(
  rows,
  filename
) {

  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {

    throw new Error(
      "Dataset is empty."
    );

  }

  const columns =
    Object.keys(rows[0]);

  const columnAnalysis = {};

  const numericColumns = [];
  const categoricalColumns = [];
  const dateColumns = [];

  // ----------------------------------------------------------
  // COLUMN ANALYSIS
  // ----------------------------------------------------------

  for (const column of columns) {

    const values =
      rows.map(
        (row) => cleanValue(row[column])
      );

    const valid =
      values.filter(
        (value) => !isMissing(value)
      );

    const missing =
      values.length -
      valid.length;

    const type =
      detectColumnType(values);

    const base = {
      name: column,
      type,
      count: valid.length,
      missing,
      missingPercentage:
        Number(
          (
            (missing / rows.length) *
            100
          ).toFixed(2)
        ),
      unique:
        uniqueCount(values)
    };

    if (type === "numeric") {

      const numbers =
        valid
          .map(toNumber)
          .filter(Number.isFinite);

      const sorted =
        [...numbers].sort(
          (a, b) => a - b
        );

      const mean =
        numbers.reduce(
          (a, b) => a + b,
          0
        ) / numbers.length;

      const std =
        standardDeviation(numbers);

      const outliers =
        detectOutliers(numbers);

      columnAnalysis[column] = {
        ...base,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean,
        median: median(numbers),
        std,
        variance: std * std,
        q1: percentile(numbers, 0.25),
        q3: percentile(numbers, 0.75),
        outliers,
        topValues: []
      };

      numericColumns.push(column);

    } else {

      const topValues =
        frequencyTable(values);

      columnAnalysis[column] = {
        ...base,
        min: null,
        max: null,
        mean: null,
        median: null,
        std: null,
        variance: null,
        q1: null,
        q3: null,
        outliers: null,
        topValues
      };

      if (type === "categorical") {
        categoricalColumns.push(column);
      }

      if (type === "date") {
        dateColumns.push(column);
      }

    }

  }

  // ----------------------------------------------------------
  // COMPLETENESS
  // ----------------------------------------------------------

  let filled = 0;

  for (const row of rows) {

    for (const column of columns) {

      if (!isMissing(row[column])) {
        filled++;
      }

    }

  }

  const totalCells =
    rows.length * columns.length;

  const missingCells =
    totalCells - filled;

  const completeness =
    totalCells === 0
      ? 0
      : Number(
          (
            (filled / totalCells) *
            100
          ).toFixed(2)
        );

  // ----------------------------------------------------------
  // DUPLICATES
  // ----------------------------------------------------------

  const seen = new Set();
  let duplicateRows = 0;

  for (const row of rows) {

    const key =
      JSON.stringify(
        columns.map(
          (column) => row[column]
        )
      );

    if (seen.has(key)) {
      duplicateRows++;
    } else {
      seen.add(key);
    }

  }

  // ----------------------------------------------------------
  // CORRELATION MATRIX
  // ----------------------------------------------------------

  const correlations = [];

  for (
    let i = 0;
    i < numericColumns.length;
    i++
  ) {

    for (
      let j = i + 1;
      j < numericColumns.length;
      j++
    ) {

      const a =
        numericColumns[i];

      const b =
        numericColumns[j];

      const value =
        correlation(
          rows.map((row) => row[a]),
          rows.map((row) => row[b])
        );

      if (value !== null) {

        correlations.push({
          columnA: a,
          columnB: b,
          correlation:
            Number(value.toFixed(4)),
          absolute:
            Number(
              Math.abs(value).toFixed(4)
            )
        });

      }

    }

  }

  correlations.sort(
    (a, b) =>
      b.absolute - a.absolute
  );

  // ----------------------------------------------------------
  // INSIGHTS
  // ----------------------------------------------------------

  const insights = [];

  insights.push({
    type: "info",
    title: "Dataset Overview",
    message:
      `The dataset contains ${rows.length.toLocaleString()} rows and ${columns.length} columns with ${completeness}% data completeness.`
  });

  if (missingCells > 0) {

    insights.push({
      type: "warning",
      title: "Missing Data",
      message:
        `${missingCells.toLocaleString()} cells contain missing values.`
    });

  } else {

    insights.push({
      type: "success",
      title: "Complete Dataset",
      message:
        "No missing values were detected."
    });

  }

  if (duplicateRows > 0) {

    insights.push({
      type: "warning",
      title: "Duplicate Rows",
      message:
        `${duplicateRows.toLocaleString()} duplicate rows were detected.`
    });

  } else {

    insights.push({
      type: "success",
      title: "Unique Records",
      message:
        "No duplicate rows were detected."
    });

  }

  for (const column of numericColumns) {

    const analysis =
      columnAnalysis[column];

    if (
      analysis.outliers &&
      analysis.outliers.count > 0
    ) {

      insights.push({
        type: "warning",
        title: "Potential Outliers",
        message:
          `"${column}" contains ${analysis.outliers.count} potential outliers (${analysis.outliers.percentage}%).`
      });

    }

  }

  if (correlations.length > 0) {

    const strongest =
      correlations[0];

    insights.push({
      type: "info",
      title: "Strongest Relationship",
      message:
        `"${strongest.columnA}" and "${strongest.columnB}" have a correlation of ${strongest.correlation}.`
    });

  }

  // Highest mean numeric column

  if (numericColumns.length > 0) {

    const highestMean =
      [...numericColumns]
        .sort(
          (a, b) =>
            columnAnalysis[b].mean -
            columnAnalysis[a].mean
        )[0];

    insights.push({
      type: "success",
      title: "Highest Average",
      message:
        `"${highestMean}" has the highest average value among numeric columns.`
    });

  }

  return {

    filename,

    generatedAt:
      new Date().toISOString(),

    overview: {

      rows: rows.length,

      columns: columns.length,

      missingValues: missingCells,

      duplicateRows,

      completeness,

      numericColumns:
        numericColumns.length,

      categoricalColumns:
        categoricalColumns.length,

      dateColumns:
        dateColumns.length

    },

    columns,

    numericColumns,

    categoricalColumns,

    dateColumns,

    columnAnalysis,

    correlations,

    insights,

    preview: rows.slice(0, 100)

  };

}

// ============================================================
// FILE PARSER
// ============================================================

function parseUploadedFile(file) {

  const filename =
    file.originalname;

  const extension =
    filename
      .split(".")
      .pop()
      .toLowerCase();

  // ----------------------------------------------------------
  // JSON
  // ----------------------------------------------------------

  if (extension === "json") {

    const text =
      file.buffer.toString("utf8");

    const parsed =
      JSON.parse(text);

    let rows;

    if (Array.isArray(parsed)) {

      rows = parsed;

    } else if (
      Array.isArray(parsed.data)
    ) {

      rows = parsed.data;

    } else {

      rows = [parsed];

    }

    return rows;

  }

  // ----------------------------------------------------------
  // CSV / XLSX / XLS
  // ----------------------------------------------------------

  const workbook =
    XLSX.read(
      file.buffer,
      {
        type: "buffer",
        cellDates: true
      }
    );

  if (
    !workbook.SheetNames.length
  ) {

    throw new Error(
      "No worksheet found."
    );

  }

  const worksheet =
    workbook.Sheets[
      workbook.SheetNames[0]
    ];

  return XLSX.utils.sheet_to_json(
    worksheet,
    {
      defval: null,
      raw: true
    }
  );

}

// ============================================================
// ANALYZE UPLOAD
// ============================================================

app.post(
  "/api/analyze",
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          success: false,
          error: "No file uploaded."
        });

      }

      const rows =
        parseUploadedFile(
          req.file
        );

      const analysis =
        analyzeDataset(
          rows,
          req.file.originalname
        );

      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {

      console.error(
        "Analysis error:",
        error
      );

      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Unable to analyze dataset."
      });

    }

  }
);

// ============================================================
// JSON DATA ANALYSIS
// ============================================================

app.post(
  "/api/analyze-json",
  async (req, res) => {

    try {

      const {
        rows,
        filename = "dataset.json"
      } = req.body;

      if (!Array.isArray(rows)) {

        return res.status(400).json({
          success: false,
          error:
            "rows must be an array."
        });

      }

      const analysis =
        analyzeDataset(
          rows,
          filename
        );

      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {

      res.status(400).json({
        success: false,
        error:
          error?.message ||
          "Unable to analyze data."
      });

    }

  }
);

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
  (error, req, res, next) => {

    console.error(error);

    if (
      error.code ===
      "LIMIT_FILE_SIZE"
    ) {

      return res.status(413).json({
        success: false,
        error:
          "File is too large. Maximum size is 25 MB."
      });

    }

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Server error."
    });

  }
);

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "      DataVisionPro Backend API"
    );
    console.log(
      "=========================================="
    );
    console.log(
      `Server: http://localhost:${PORT}`
    );
    console.log(
      `Health: http://localhost:${PORT}/api/health`
    );
    console.log(
      `Analyze: POST /api/analyze`
    );
    console.log(
      "Maximum upload: 25 MB"
    );
    console.log(
      "=========================================="
    );
    console.log("");

  }
);

