export function validatePage(page, maxPage = 1000) {
  const parsed = parseInt(page, 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  return Math.min(parsed, maxPage);
}
