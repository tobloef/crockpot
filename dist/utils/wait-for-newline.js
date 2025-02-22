export function waitForEnter(printLog = true) {
    if (printLog) {
        console.log("Press Enter to continue...");
    }
    return new Promise((resolve) => {
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
//# sourceMappingURL=wait-for-newline.js.map