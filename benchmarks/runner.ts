// TODO: Run specific versions and compare results

import { readdir, writeFile } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";

const suitesDirectory = join(process.cwd(), "suites");
const suiteFiles = await readdir(suitesDirectory, { recursive: true });

const results: Record<string, string> = {};

for (const suiteFile of suiteFiles) {
  if (!suiteFile.endsWith(".ts")) {
    continue;
  }

  const suiteFilePath = join(suitesDirectory, suiteFile);
  const suiteName = suiteFile.replace(/\.ts$/, "");

  const command = `hyperfine 'node ${suiteFilePath}'`;

  console.log(`Running suite: ${suiteName}`);

  await new Promise<void>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        results[suiteName] = stdout.split("\n").slice(1, 3).join("\n");
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