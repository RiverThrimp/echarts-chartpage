import type { ChartType, GenerateChartPageResult, NormalizedChartPageSpec } from "../types/index.js";
import { escapeHtml, safeJsonForHtml } from "../utils/html.js";
import { ECHARTS_CDN } from "./templates/page-template.js";

function buildThemeTokens(theme: NormalizedChartPageSpec["theme"]): string {
  if (theme === "dark") {
    return `
      --bg: #09111f;
      --bg-accent: rgba(30, 71, 124, 0.38);
      --panel: rgba(10, 20, 36, 0.82);
      --panel-border: rgba(151, 183, 255, 0.18);
      --text: #eef4ff;
      --muted: #b5c3de;
      --shadow: 0 24px 80px rgba(2, 8, 20, 0.45);
      --warning: rgba(255, 196, 84, 0.14);
      --warning-border: rgba(255, 196, 84, 0.35);
    `;
  }

  return `
    --bg: #f4f8ff;
    --bg-accent: rgba(22, 119, 255, 0.12);
    --panel: rgba(255, 255, 255, 0.88);
    --panel-border: rgba(71, 102, 155, 0.16);
    --text: #10233d;
    --muted: #5f728d;
    --shadow: 0 24px 80px rgba(36, 56, 92, 0.14);
    --warning: rgba(255, 196, 84, 0.18);
    --warning-border: rgba(173, 111, 0, 0.18);
  `;
}

function buildWarningsHtml(warnings: string[]): string {
  if (warnings.length === 0) {
    return "";
  }

  const items = warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("");
  return `<section class="warnings"><h2>Generation Notes</h2><ul>${items}</ul></section>`;
}

function buildDescription(description?: string): string {
  if (!description) {
    return "";
  }

  return `<p class="description">${escapeHtml(description)}</p>`;
}

function buildRuntime(chartType: ChartType): string {
  const renderStrategy = chartType === "table" ? "renderTable(payload);" : "renderChart(payload);";
  return `
    const payload = ${"__PAYLOAD__"};

    function renderChart(input) {
      if (!window.echarts || !input.option) {
        renderTable(input);
        return;
      }

      const root = document.getElementById("chart-root");
      const chart = window.echarts.init(root, input.spec.theme === "dark" ? "dark" : undefined, {
        renderer: "canvas"
      });
      chart.setOption(input.option);
      window.addEventListener("resize", () => chart.resize());
    }

    function renderTable(input) {
      const chartRoot = document.getElementById("chart-root");
      chartRoot.style.display = "none";

      const tableRoot = document.getElementById("table-root");
      tableRoot.hidden = false;

      const headers = Array.from(
        new Set([
          input.spec.fields.x,
          ...input.spec.fields.y,
          input.spec.fields.series,
          input.spec.fields.category
        ].filter(Boolean))
      );

      const thead = tableRoot.querySelector("thead");
      const tbody = tableRoot.querySelector("tbody");

      thead.innerHTML = "<tr>" + headers.map((field) => "<th>" + field + "</th>").join("") + "</tr>";
      tbody.innerHTML = input.spec.data
        .map((row) => {
          return "<tr>" + headers.map((field) => "<td>" + String(row[field] ?? "") + "</td>").join("") + "</tr>";
        })
        .join("");
    }

    function bootstrap() {
      ${renderStrategy}
    }

    if (document.readyState === "complete") {
      bootstrap();
    } else {
      window.addEventListener("load", bootstrap, { once: true });
    }
  `;
}

export function buildChartHtml(result: GenerateChartPageResult): string {
  const payload = {
    chartType: result.chartType,
    option: result.option,
    spec: result.spec,
    warnings: result.warnings
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content="echarts-chartpage" />
    <title>${escapeHtml(result.spec.title)}</title>
    <script defer src="${ECHARTS_CDN}"></script>
    <style>
      :root {
        ${buildThemeTokens(result.spec.theme)}
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, var(--bg-accent), transparent 28%),
          linear-gradient(180deg, var(--bg), color-mix(in srgb, var(--bg) 84%, #000 16%));
      }

      .page {
        width: min(1100px, calc(100% - 32px));
        margin: 32px auto;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 24px;
        box-shadow: var(--shadow);
        backdrop-filter: blur(18px);
      }

      .hero {
        padding: 28px 28px 20px;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 999px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: 12px;
        color: var(--muted);
        background: rgba(127, 155, 196, 0.12);
      }

      h1 {
        margin: 16px 0 10px;
        font-size: clamp(28px, 4vw, 40px);
        line-height: 1.05;
      }

      .description,
      .meta,
      .footer {
        color: var(--muted);
      }

      .meta {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 12px;
        font-size: 14px;
      }

      .chart-panel {
        margin-top: 20px;
        padding: 20px;
      }

      #chart-root {
        width: 100%;
        min-height: 520px;
      }

      .warnings {
        margin-top: 20px;
        padding: 18px 20px;
        border-radius: 20px;
        background: var(--warning);
        border: 1px solid var(--warning-border);
      }

      .warnings h2 {
        margin: 0 0 10px;
        font-size: 16px;
      }

      .warnings ul {
        margin: 0;
        padding-left: 20px;
      }

      .table-wrap {
        overflow: auto;
        border-radius: 18px;
        border: 1px solid var(--panel-border);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 12px 14px;
        text-align: left;
        border-bottom: 1px solid var(--panel-border);
      }

      th {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--muted);
      }

      .footer {
        margin-top: 18px;
        font-size: 13px;
      }

      @media (max-width: 720px) {
        .page {
          width: min(100%, calc(100% - 20px));
          margin: 20px auto;
        }

        .hero,
        .chart-panel {
          padding: 18px;
        }

        #chart-root {
          min-height: 400px;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="panel hero">
        <span class="eyebrow">${escapeHtml(result.chartType)}</span>
        <h1>${escapeHtml(result.spec.title)}</h1>
        ${buildDescription(result.spec.description)}
        <div class="meta">
          <span>Goal: ${escapeHtml(result.spec.goal)}</span>
          <span>Theme: ${escapeHtml(result.spec.theme)}</span>
          <span>Rows: ${result.spec.data.length}</span>
        </div>
      </section>

      <section class="panel chart-panel">
        <div id="chart-root" aria-label="chart canvas"></div>
        <div id="table-root" class="table-wrap" hidden>
          <table>
            <thead></thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      ${buildWarningsHtml(result.warnings)}

      <p class="footer">Generated with echarts-chartpage.</p>
    </main>

    <script>
      ${buildRuntime(result.chartType).replace("__PAYLOAD__", safeJsonForHtml(payload))}
    </script>
  </body>
</html>`;
}
