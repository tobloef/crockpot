export function debounce(func, maxWait) {
    let timeout;
    return ((...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, maxWait);
    });
}
//# sourceMappingURL=debounce.js.map