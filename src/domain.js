export const sample = (id, k) => {
  if (id === '1a') return (1 / 3) ** k;
  if (id === '1f') return k % 6 === 0 ? 0 : Math.sin(k * Math.PI / 6);
  if (id === '3d') return (-1 / 3) ** k + Number(k === 2) + Number(k === 3);
  return ((-3) ** k - 1) / 4;
};
export const fmt = n => n === 0 ? '0' : Number.isInteger(n) ? String(n) : Math.abs(n) < .001 ? n.toExponential(2) : Number(n.toFixed(4)).toString();
export function recurrence(n) {
  const y = [0, -1, 2];
  for (let k = 0; k < n - 3; k++) y.push(-y[k + 2] + 5 * y[k + 1] - 3 * y[k]);
  return y.slice(0, n);
}
