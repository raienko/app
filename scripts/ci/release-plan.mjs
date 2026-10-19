/**
 * The Release workflow's first job: checks the form's combination, resolves
 * the version and which platforms run, and writes "what will happen" to the
 * job summary — so a wrong choice fails in seconds, before anything builds.
 *
 * Reads the inputs from env (KIND, PLATFORM, ENVIRONMENT, DISTRIBUTION,
 * VERSION, NOTES); writes `key=value` outputs to $GITHUB_OUTPUT and Markdown
 * to $GITHUB_STEP_SUMMARY, or both to stdout locally:
 *
 *   KIND=build PLATFORM=native ENVIRONMENT=staging DISTRIBUTION=internal \
 *     node scripts/ci/release-plan.mjs
 */
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const input = {
  kind: process.env.KIND || "build",
  platform: process.env.PLATFORM || "all",
  environment: process.env.ENVIRONMENT || "staging",
  distribution: process.env.DISTRIBUTION || "internal",
  version: (process.env.VERSION || "").trim(),
  notes: (process.env.NOTES || "").trim(),
};

const PLATFORMS = {
  all: ["ios", "android", "web"],
  native: ["ios", "android"],
  ios: ["ios"],
  android: ["android"],
  web: ["web"],
};
const NAMES = { ios: "iOS", android: "Android", web: "Web" };
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const errors = [];
const warnings = [];

// Web has no over-the-air updates: an update to "all" is iOS + Android.
const platforms = PLATFORMS[input.platform]?.filter(
  (p) => input.kind !== "update" || p !== "web",
);
if (!platforms) errors.push(`Unknown platform "${input.platform}".`);

if (input.kind === "update") {
  if (input.platform === "web") {
    errors.push(
      "Web has no over-the-air updates — release it with kind: build.",
    );
  }
  if (input.distribution !== "internal" || input.version) {
    warnings.push(
      "An update goes to the builds already installed, on their own version and channel — distribution and version are ignored.",
    );
  }
} else {
  if (input.distribution === "store" && input.environment !== "production") {
    errors.push(
      `Store releases are production builds — pick environment: production, or distribution: internal / testing for ${input.environment}.`,
    );
  }
  if (input.distribution === "testing" && input.platform === "web") {
    errors.push(
      "Web has no testing track — use internal (a preview URL) or store (live).",
    );
  }
  if (input.version && !SEMVER.test(input.version)) {
    errors.push(
      `Version "${input.version}" isn't semver — e.g. 1.4.0 or 1.4.0-rc.1.`,
    );
  }
}

for (const message of warnings)
  console.log(`::warning title=Release::${message}`);
for (const message of errors) console.log(`::error title=Release::${message}`);

// The app config's version when none was given — what the binary would
// carry anyway. Updates don't have one of their own.
function appVersion() {
  const config = execFileSync(
    "npx",
    ["expo", "config", "--json", "--type", "public"],
    { encoding: "utf8" },
  );
  return JSON.parse(config).version;
}
const version =
  input.kind === "update"
    ? ""
    : input.version || (errors.length ? "" : appVersion());

// Where each platform ends up, in words — the job summary and the
// platform jobs' placeholder notices say the same thing.
const DESTINATION = {
  build: {
    internal: {
      ios: "Install link for the team (ad hoc)",
      android: "Install link for the team (APK)",
      web: "Preview URL",
    },
    testing: {
      ios: "TestFlight",
      android: "Play Console internal testing",
    },
    store: {
      ios: "App Store review",
      android: "Google Play review",
      web: "Live site",
    },
  },
  update: {
    internal: {
      ios: `Installed ${input.environment} builds`,
      android: `Installed ${input.environment} builds`,
    },
  },
};
const destinations =
  DESTINATION[input.kind]?.[
    input.kind === "update" ? "internal" : input.distribution
  ];

const summary = [
  `### ${input.kind === "update" ? "Update" : `Release ${version || "—"}`} · ${input.environment}`,
  "",
  "| | |",
  "| --- | --- |",
  `| Kind | ${input.kind === "update" ? "Over-the-air update" : "New build"} |`,
  `| Environment | ${input.environment} |`,
  ...(input.kind === "build"
    ? [
        `| Distribution | ${input.distribution} |`,
        `| Version | ${version || "—"} |`,
      ]
    : []),
  `| Platforms | ${(platforms ?? []).map((p) => `${NAMES[p]} → ${destinations?.[p] ?? "—"}`).join("<br>")} |`,
  `| Notes | ${input.notes ? input.notes.replace(/\r?\n/g, "<br>") : "—"} |`,
  "",
  ...(errors.length
    ? ["**Stopped:**", "", ...errors.map((e) => `- ${e}`), ""]
    : []),
  ...(warnings.length ? warnings.map((w) => `> ${w}`) : []),
];

const outputs = {
  version,
  ios: String(Boolean(platforms?.includes("ios"))),
  android: String(Boolean(platforms?.includes("android"))),
  web: String(Boolean(platforms?.includes("web"))),
  ...Object.fromEntries(
    Object.entries(destinations ?? {})
      .filter(([p]) => platforms?.includes(p))
      .map(([p, d]) => [`${p}_destination`, d]),
  ),
};
const outputLines = Object.entries(outputs).map(([k, v]) => `${k}=${v}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `${outputLines.join("\n")}\n`);
} else {
  console.log(outputLines.join("\n"));
}
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary.join("\n")}\n`);
} else {
  console.log(`\n${summary.join("\n")}`);
}

process.exit(errors.length ? 1 : 0);
