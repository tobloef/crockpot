export function waitForEnter(printLog = true): Promise<void> {
  if (printLog) {
    console.log("Press Enter to continue...");
  }

  return new Promise<void>((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", (key) => {
      if (key.toString() === "\r" || key.toString() === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve();
      }
    });
  });
}