import {  writeFile } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";

type PackageVersion = string;
type SuiteFile = string;

const suites: Record<SuiteFile, PackageVersion[]> = {
  "query/find-one-of-type.ts": [
    "@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0"
  ],
  "query/find-many-of-type.ts": [
    "@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0"
  ],
  "query/find-many-deep-query.ts": [
    "@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0"
  ],
  "query/find-many-wide-query.ts": [
    "@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0"
  ],
  "query/spaceship.ts": [
    "@tobloef/crockpot-v1.0.0",
    "@tobloef/crockpot-v1.1.0"
  ],
};

const results: Record<SuiteFile, string> = {};

for (const [suiteFile, packageVersions] of Object.entries(suites)) {
  const suiteFilePath = join("suites", suiteFile);
  const suiteName = suiteFile.replace(/\.ts$/, "");

  let command = `hyperfine`;

  for (const version of packageVersions) {
    command += ` 'node ${suiteFilePath} ${version}'`;
  }

  console.log(`Running suite "${suiteName}" with command "${command}".`);

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