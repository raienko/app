/**
 * Turns Jest's coverage/coverage-summary.json into a Markdown table on the
 * GitHub job summary (or stdout locally). Reports only — no threshold gate
 * yet; that comes once there's a baseline worth holding.
 */
import { appendFileSync, readFileSync } from "node:fs";

const { total } = JSON.parse(
  readFileSync("coverage/coverage-summary.json", "utf8"),
);

const rows = ["lines", "statements", "functions", "branches"].map((metric) => {
  const { covered, total: all, pct } = total[metric];
  return `| ${metric[0].toUpperCase()}${metric.slice(1)} | ${pct}% | ${covered} / ${all} |`;
});

const markdown = [
  "### Test coverage",
  "",
  "| Metric | Coverage | Covered |",
  "| --- | ---: | ---: |",
  ...rows,
  "",
].join("\n");

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
} else {
  console.log(markdown);
}
