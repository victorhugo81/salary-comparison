# Salary & Insurance Long-Term Comparison

A single-page web tool built for **CSEA Local 399** to help members compare the long-term financial impact of competing contract proposals — side by side.

## What It Does

During labor negotiations, employees are often presented with multiple contract offers that differ in salary increases and insurance costs. This calculator makes it easy to see which proposal actually puts more money in your pocket over time.

Enter your current salary and deductions, then configure two proposals (Union and District). The tool instantly shows:

- **Monthly breakdown** — gross pay, fixed deductions, insurance costs, and net take-home for each scenario
- **Multi-year net projection** — year-by-year comparison over 5, 10, 15, or 20 years, accounting for insurance lock-in periods
- **Financial verdict** — which proposal delivers a greater cumulative net advantage and by how much per month on average

## Key Features

- Compare a Union proposal vs. a District offer side by side
- Account for insurance rates that are locked for a set number of years before reverting to the standard rate
- Optional professional growth rate (0–15% annual) applied to base salary
- Live recalculation on every input change — no submit button needed
- Input validation with inline error hints
- Light/dark theme toggle
- Fully client-side — no server, no data sent anywhere

## How to Use

1. **Step 1 — Base Salary & Deductions**: Enter your current monthly gross earnings, any fixed monthly deductions, and your standard monthly insurance cost. Optionally select an annual professional growth rate.

2. **Step 2 — Proposals**: Enter the salary increase percentage, monthly insurance cost, and insurance lock duration for each proposal (Union and District).

3. **Results**: The monthly breakdown and multi-year projection tables update automatically. Use the year selector to adjust the projection horizon. The summary at the bottom declares which proposal has the greater financial advantage.

## Tech Stack

- HTML / CSS / Vanilla JavaScript — no frameworks, no build step
- `Intl.NumberFormat` for USD currency formatting
- CSS custom properties for theming

## Disclaimer

All figures are estimates based on values you enter and do not account for taxes, overtime, benefit changes, or other variable compensation. Results are for informational and comparison purposes only and should not be relied upon as financial or legal advice.