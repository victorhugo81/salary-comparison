
function calcMonthlyInsurance() {
  const unionCaps     = getVal('union_ins_caps', 0, 99999, 0);
  const unionPremiums = getVal('union_ins_premiums', 0, 99999, 0);
  const insUnionEl    = document.getElementById('ins_union');
  if (insUnionEl) insUnionEl.value = Math.max(0, (unionPremiums - unionCaps) / 10).toFixed(2);

  const distCaps     = getVal('dist_ins_caps', 0, 99999, 0);
  const distPremiums = getVal('dist_ins_premiums', 0, 99999, 0);
  const insDistEl    = document.getElementById('ins_dist');
  if (insDistEl) insDistEl.value = Math.max(0, (distPremiums - distCaps) / 10).toFixed(2);
}

function syncInsForYears() {
  // Monthly Insurance is auto-calculated from (Premiums - Caps) / 10
}

function sanitizeNumber(value, min, max, fallback = 0) {
  const n = parseFloat(value);
  if (isNaN(n)) return fallback;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

function getVal(id, min, max, fallback) {
  const el = document.getElementById(id);
  return sanitizeNumber(el ? el.value : '', min, max, fallback);
}

function validateField(inputEl, fieldId, min, max) {
  const val = parseFloat(inputEl.value);
  const field = document.getElementById(fieldId);
  if (!field) return true;
  const isValid = inputEl.value === '' || (!isNaN(val) && val >= min && val <= max);
  field.classList.toggle('has-error', !isValid);
  inputEl.classList.toggle('invalid', !isValid);
  return isValid;
}

const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function calculate() {
  const monthly     = getVal('monthly', 0, 9999999, 0);
  const growth      = getVal('growth', 0, 1, 0);
  const fixedDed    = getVal('deductions', 0, 9999999, 0);
  const insCurrent  = getVal('ins_current', 0, 99999, 0);
  const unionPct    = getVal('union_pct', -100, 1000, 0) / 100;
  const insUnionVal = getVal('ins_union', 0, 99999, 0);
  const unionLock   = parseInt(document.getElementById('union_years').value) || 1;
  const distPct     = getVal('dist_pct', -100, 1000, 0) / 100;
  const insDistVal  = getVal('ins_dist', 0, 99999, 0);
  const distLock    = parseInt(document.getElementById('dist_years').value) || 1;
  const projYears   = parseInt(document.getElementById('projection_period').value) || 5;

  const baseAnnual = monthly * 12 * (1 + growth);
  const unionGross = baseAnnual * (1 + unionPct);
  const distGross  = baseAnnual * (1 + distPct);
  const fixedDedNoIns  = fixedDed - insCurrent;
  const annualDed  = fixedDedNoIns * 12;

  const monthlyUnionGross   = unionGross / 12;
  const monthlyDistGross    = distGross  / 12;
  const monthlyCurrentGross = monthly * (1 + growth);          // Total Monthly Earnings incl. professional growth
  const monthlyUnionNet     = monthlyUnionGross   - fixedDedNoIns - insUnionVal;
  const monthlyDistNet      = monthlyDistGross    - fixedDedNoIns - insDistVal;
  const monthlyCurrentNet   = monthlyCurrentGross - fixedDedNoIns - insCurrent;
  const monthlyDiffUnion    = monthlyUnionNet - monthlyCurrentNet;
  const monthlyDiffDist     = monthlyDistNet  - monthlyCurrentNet;

  const growthAmt       = monthly * growth;
  const totalDedCurrent = fixedDedNoIns + insCurrent;   // = fixedDed
  const totalDedUnion   = fixedDedNoIns + insUnionVal;
  const totalDedDist    = fixedDedNoIns + insDistVal;

  document.getElementById('monthlyBody').innerHTML = `
    <tr><td>Monthly Gross</td><td>${f.format(monthlyCurrentGross)}</td><td class="union-col">${f.format(monthlyUnionGross)}</td><td class="dist-col">${f.format(monthlyDistGross)}</td></tr>
    <tr><td>Professional Growth</td><td>${f.format(growthAmt)}</td><td class="union-col">${f.format(growthAmt)}</td><td class="dist-col">${f.format(growthAmt)}</td></tr>
    <tr><td>Partial Deductions (Taxes / SS / Dues)</td><td>${f.format(fixedDedNoIns)}</td><td class="union-col">${f.format(fixedDedNoIns)}</td><td class="dist-col">${f.format(fixedDedNoIns)}</td></tr>
    <tr><td>Monthly Insurance</td><td>${f.format(insCurrent)}</td><td class="union-col">${f.format(insUnionVal)}</td><td class="dist-col">${f.format(insDistVal)}</td></tr>
    <tr><td>Total Deductions</td><td>${f.format(totalDedCurrent)}</td><td class="union-col">${f.format(totalDedUnion)}</td><td class="dist-col">${f.format(totalDedDist)}</td></tr>
    <tr class="highlight-row">
      <td>Monthly Net</td>
      <td>${f.format(monthlyCurrentNet)}</td>
      <td class="union-col">${f.format(monthlyUnionNet)}</td>
      <td class="dist-col">${f.format(monthlyDistNet)}</td>
    </tr>
    <tr>
      <td>Monthly Difference vs Current</td>
      <td>—</td>
      <td class="${monthlyDiffUnion >= 0 ? 'diff-pos' : 'diff-neg'}">${monthlyDiffUnion >= 0 ? '+' : ''}${f.format(monthlyDiffUnion)}/mo</td>
      <td class="${monthlyDiffDist  >= 0 ? 'diff-pos' : 'diff-neg'}">${monthlyDiffDist  >= 0 ? '+' : ''}${f.format(monthlyDiffDist)}/mo</td>
    </tr>
  `;

  let html = '';
  let totalU = 0, totalD = 0;

  for (let i = 1; i <= projYears; i++) {
    const curInsU = i <= unionLock ? insUnionVal : insCurrent;
    const curInsD = i <= distLock  ? insDistVal  : insCurrent;
    const yrU = unionGross - annualDed - (curInsU * 12);
    const yrD = distGross  - annualDed - (curInsD * 12);
    totalU += yrU; totalD += yrD;
    const diff = yrU - yrD;
    html += `<tr>
      <td>Year ${i}</td>
      <td class="union-col">${f.format(yrU)}</td>
      <td class="dist-col">${f.format(yrD)}</td>
      <td class="${diff >= 0 ? 'diff-pos' : 'diff-neg'}">${f.format(diff)}</td>
    </tr>`;
  }

  document.getElementById('multiYearBody').innerHTML = html;

  const totalDiff = totalU - totalD;
  document.getElementById('totalRow').innerHTML = `
    <td style="height:25px;">Total Net</td>
    <td class="union-col">${f.format(totalU)}</td>
    <td class="dist-col">${f.format(totalD)}</td>
    <td class="${totalDiff >= 0 ? 'diff-pos' : 'diff-neg'}">${f.format(totalDiff)}</td>
  `;

  const winner = totalDiff >= 0 ? 'Option 1' : 'Option 2';
  const winnerColor = totalDiff >= 0 ? 'var(--accent-union)' : 'var(--accent-dist)';
  const monthlyAvg = Math.abs(totalDiff / (projYears * 12));

  document.getElementById('summaryTitle').textContent = `${projYears}-Year Financial Verdict`;
  document.getElementById('winnerText').textContent = winner;
  document.getElementById('winnerText').style.color = winnerColor;
  document.getElementById('totalAdvantage').textContent = `${f.format(Math.abs(totalDiff))} total advantage`;
  document.getElementById('advantageText').innerHTML = `The <strong>${winner}</strong> puts more money in your pocket — <strong>${f.format(monthlyAvg)}/month</strong> more on average over ${projYears} years.`;
}

// Theme toggle
const toggle = document.getElementById('themeToggle');
const icon = document.getElementById('toggleIcon');
// Default to light theme
let isDark = false;
document.documentElement.setAttribute('data-theme', 'light');
icon.textContent = '☀️';
toggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  icon.textContent = isDark ? '🌙' : '☀️';
});

// Validation config
const validations = [
  ['monthly',    'field-monthly',    0, 9999999],
  ['deductions', 'field-deductions', 0, 9999999],
  ['union_pct',  'field-union_pct',  -100, 1000],
  ['dist_pct',   'field-dist_pct',   -100, 1000],
];

validations.forEach(([id, fieldId, min, max]) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      validateField(el, fieldId, min, max);
      calculate();
    });
  }
});

document.getElementById('ins_current').addEventListener('input', function() {
  validateField(this, 'field-ins_current', 0, 99999);
  calculate();
});

['union_ins_caps', 'union_ins_premiums', 'dist_ins_caps', 'dist_ins_premiums'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => { calcMonthlyInsurance(); calculate(); });
});

document.getElementById('union_years').addEventListener('change', calculate);
document.getElementById('dist_years').addEventListener('change', calculate);
['growth', 'projection_period'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', calculate);
});

calcMonthlyInsurance();
calculate();
