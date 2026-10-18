/**
 * `yarn e2e:android`: builds the Release app with EXPO_PUBLIC_E2E=1 and
 * installs it on the running emulator or device. Extra arguments go to
 * `expo run:android` (e.g. `--device Pixel_9_Pro_XL`).
 *
 * Only the native code the device can run is compiled: its CPU architecture
 * is read over adb (arm64 for an emulator on Apple silicon, x86_64 on a CI
 * runner) and handed to Gradle, instead of building all four — the bulk of
 * an Android build. With several devices attached, `--device` says which;
 * with none, it builds them all as usual.
 */
import { spawnSync } from "node:child_process";

function adb(args) {
  const result = spawnSync("adb", args, { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "";
}

const devices = adb(["devices"])
  .split("\n")
  .slice(1)
  .filter((line) => /\tdevice$/.test(line))
  .map((line) => line.split("\t")[0]);

/** `--device <AVD name>` as expo takes it, matched to its adb serial. */
function requested() {
  const args = process.argv.slice(2);
  const at = args.findIndex((arg) => arg === "--device" || arg === "-d");
  const name = at === -1 ? undefined : args[at + 1];
  if (name === undefined) return devices.length === 1 ? devices[0] : undefined;
  return devices.find(
    (serial) =>
      serial === name ||
      adb(["-s", serial, "emu", "avd", "name"]).split("\n")[0]?.trim() === name,
  );
}

const target = requested();
const architecture = target
  ? adb(["-s", target, "shell", "getprop", "ro.product.cpu.abi"])
  : "";

if (architecture) {
  console.log(`Building for ${architecture} only (${target}).`);
} else {
  console.log("Building every architecture (no single device attached).");
}

const result = spawnSync(
  "npx",
  [
    "expo",
    "run:android",
    "--variant",
    "release",
    "--no-bundler",
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      EXPO_PUBLIC_E2E: "1",
      // Gradle reads ORG_GRADLE_PROJECT_<name> as the project property
      // <name>, which React Native's build uses to pick architectures.
      ...(architecture
        ? { ORG_GRADLE_PROJECT_reactNativeArchitectures: architecture }
        : {}),
    },
  },
);
process.exit(result.status ?? 1);
