export function debounce<
  F extends (...args: any[]) => void
>(
  func: F,
  maxWait: number,
): F {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, maxWait);
  }) as F;
}