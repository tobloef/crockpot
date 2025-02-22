import {  writeFile } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";

type PackageVersion = string;
type SuiteFile = string;

const ITERATIONS = 10;
const SEED = "1234";

const suites: Record<SuiteFile, PackageVersion[]> = {
  "query/find-one-of-type.ts": [
    //"@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0",
    "@tobloef/crockpot-local",
  ],
  "query/find-many-of-type.ts": [
    //"@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0",
    "@tobloef/crockpot-local",
  ],
  "query/find-many-deep-query.ts": [
    //"@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0",
    "@tobloef/crockpot-local",
  ],
  "query/find-many-wide-query.ts": [
    //"@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0",
    "@tobloef/crockpot-local",
  ],
  "query/spaceship.ts": [
    //"@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0",
    "@tobloef/crockpot-local",
  ],
};

const results: Record<SuiteFile, string> = {};

for (const [suiteFile, packageVersions] of Object.entries(suites)) {
  const suiteFilePath = join("suites", suiteFile);
  const suiteName = suiteFile.replace(/\.ts$/, "");

  let command = `hyperfine`;

  for (const version of packageVersions) {
    command += ` 'node --disable-warning=ExperimentalWarning ${suiteFilePath} ${version} ${ITERATIONS} ${SEED}'`;
  }

  const RESET = "\x1b[0m";
  const CYAN = "\x1b[36m";
  const BRIGHT_CYAN = "\x1b[96m";

  console.log(`${CYAN}Running suite "${BRIGHT_CYAN}${suiteName}${CYAN}" for versions ${packageVersions.map((v) => `"${BRIGHT_CYAN}${v}${CYAN}"`).join(", ")}.${RESET}`);

  await new Promise<void>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        results[suiteName] = stdout.trim();
        resolve();
      }
    });
  });
}

const dateString = new Date().toISOString();

const suitesText = Object.entries(results)
  .map(([suiteName, result]) => `### ${suiteName}\n\n\`\`\`\n${result}\n\`\`\``)
  .join("\n\n");

const outputText = `# Benchmark Results\n\nThis benchmark was run at ${dateString}.\n\n## Suites\n\n${suitesText}`;

const outputFilename = `results-${dateString.replace(/:/g, "-")}.md`;

await writeFile(join(process.cwd(), "results", outputFilename), outputText);