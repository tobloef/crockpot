import seedrandom from "seedrandom";
import { waitForEnter } from "../src/utils/wait-for-newline.ts";

import * as crockpot_1_0_0 from "@tobloef/crockpot-v1.0.0";
import * as crockpot_1_1_0 from "@tobloef/crockpot-v1.1.0";
import * as crockpot_1_2_0 from "@tobloef/crockpot-v1.2.0";
import * as crockpot_1_3_0 from "@tobloef/crockpot-v1.3.0";
import * as crockpot_local from "@tobloef/crockpot-local";

import * as suite_spaceship from "./suites/query/spaceship.ts";
import * as suite_find_one_of_type from "./suites/query/find-one-of-type.ts";
import * as suite_find_many_of_type from "./suites/query/find-many-of-type.ts";
import * as suite_find_many_deep_query from "./suites/query/find-many-deep-query.ts";
import * as suite_find_many_wide_query from "./suites/query/find-many-wide-query.ts";

////////////////////////////////////////////////

const crockpot = crockpot_local;
const suite = suite_spaceship;
const iterations = 100;

////////////////////////////////////////////////

const rng = seedrandom("1234");

const setupOutput = suite.setup({
  crockpot,
  rng,
});

function getHeapUsed() {
  return (process.memoryUsage().heapUsed/1024/1024).toPrecision(2) + " MB";
}
console.log("\nHeap used, pre-run, pre-gc:", getHeapUsed());
gc();
console.log("Heap used, pre-run, post-gc:", getHeapUsed());

console.log(`\nSetup complete, running suite ${iterations} times...`);

//await waitForEnter();

let runTimes: number[] = [];

for (let i = 0; i < iterations; i++) {
  const startTime = performance.now();

  suite.run(setupOutput);

  const endTime = performance.now();
  const duration = endTime - startTime;

  runTimes.push(duration);
}

console.log("\nHeap used, post-run, pre-gc:", getHeapUsed());
gc();
console.log("Heap used, post-run, post-gc:", getHeapUsed());

const numerically = (a: number, b: number) => a - b;

console.log(`\nMedian: ${runTimes.toSorted(numerically)[Math.floor(runTimes.length / 2)]!.toPrecision(3)}ms`);
console.log(`Average: ${(runTimes.reduce((a, b) => a + b, 0) / runTimes.length).toPrecision(3)}ms`);
console.log(`Minimum: ${runTimes.toSorted(numerically)[0]!.toPrecision(3)}ms`);
console.log(`Maximum: ${runTimes.toSorted(numerically)[runTimes.length - 1]!.toPrecision(3)}ms`);

console.log("Checksum:", suite.run(setupOutput));