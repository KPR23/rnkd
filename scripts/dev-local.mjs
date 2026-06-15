#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { resolve } from "node:path";

const WEB_PORT = process.env.WEB_PORT ?? "3000";
const MOBILE_HOST = process.env.MOBILE_HOST ?? detectLanIp();
const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL ?? `http://${MOBILE_HOST}:${WEB_PORT}`;

const mobileEnvPath = resolve("apps/mobile/.env");
writeMobileEnv(mobileEnvPath, SERVER_URL);

console.log(`Using mobile server URL: ${SERVER_URL}`);
console.log(`Wrote ${mobileEnvPath}`);

const children = [
  run("web", "pnpm", ["--filter", "web", "dev"], {
    BETTER_AUTH_URL: SERVER_URL,
    EXPO_PUBLIC_SERVER_URL: SERVER_URL,
  }),
  run("mobile", "pnpm", ["--filter", "mobile", "dev"], {
    EXPO_PUBLIC_SERVER_URL: SERVER_URL,
  }),
];

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

function run(name, command, args, extraEnv) {
  const child = spawn(command, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const other of children) {
      if (other !== child) other.kill("SIGTERM");
    }

    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exitCode = code ?? 1;
    console.error(`${name} exited with code ${process.exitCode}`);
  });

  return child;
}

function detectLanIp() {
  const interfaces = networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses ?? []) {
      if (address.family !== "IPv4" || address.internal) continue;
      if (address.address.startsWith("169.254.")) continue;
      return address.address;
    }
  }

  return "127.0.0.1";
}

function writeMobileEnv(filePath, serverUrl) {
  const current = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
  const nextLine = `EXPO_PUBLIC_SERVER_URL=${serverUrl}`;

  if (current.match(/^EXPO_PUBLIC_SERVER_URL=.*$/m)) {
    writeFileSync(
      filePath,
      current.replace(/^EXPO_PUBLIC_SERVER_URL=.*$/m, nextLine),
    );
    return;
  }

  const separator = current.length > 0 && !current.endsWith("\n") ? "\n" : "";
  writeFileSync(filePath, `${current}${separator}${nextLine}\n`);
}
