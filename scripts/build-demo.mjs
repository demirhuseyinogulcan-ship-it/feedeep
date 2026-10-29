// Builds a static demo of feedeep into out/ without Supabase or any API route.
// The API folder is moved aside during the build and always restored afterwards.
import { spawnSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";

const API_DIR = "src/app/api";
const PARKED_API_DIR = ".api-parked";

if (existsSync(PARKED_API_DIR)) {
  console.error(`${PARKED_API_DIR} already exists. Move it back to ${API_DIR} before building.`);
  process.exit(1);
}

renameSync(API_DIR, PARKED_API_DIR);
let exitCode = 1;
try {
  const result = spawnSync("npx", ["next", "build", "--webpack"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, FEEDEEP_STATIC_DEMO: "1" },
  });
  exitCode = result.status ?? 1;
} finally {
  renameSync(PARKED_API_DIR, API_DIR);
}
process.exit(exitCode);
