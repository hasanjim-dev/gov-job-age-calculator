import { useMemo, useState } from "react";
import "./govjobage.css";

const todayISO = () => new Date().toISOString().slice(0, 10);

const PRESETS = [
  { label: "General Govt Job / BCS", min: 18, max: 32 },
  { label: "Freedom Fighter Quota", min: 18, max: 32 },
  { label: "Disability / Third Gender Quota", min: 18, max: 35 },
  { label: "Higher-limit Post (custom)", min: 18, max: 35 },
];

function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function diffYMD(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export default function GovJobAgeCalculator() {
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState(todayISO());
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(32);
  const [presetIndex, setPresetIndex] = useState(0);

  const result = useMemo(() => {
    if (!dob || !asOf) return null;
    const dobDate = new Date(`${dob}T00:00:00`);
    const asOfDate = new Date(`${asOf}T00:00:00`);
    if (Number.isNaN(dobDate.getTime()) || Number.isNaN(asOfDate.getTime())) return null;
    if (dobDate > asOfDate) return { error: "Date of birth cannot be after the reference date." };

    const age = diffYMD(dobDate, asOfDate);
    const minDate = addYears(dobDate, minAge);
    const maxDate = addYears(dobDate, maxAge);
    const meetsMin = asOfDate >= minDate;
    const meetsMax = asOfDate <= maxDate;

    return {
      age,
      meetsMin,
      meetsMax,
      eligible: meetsMin && meetsMax,
      minDate,
      maxDate,
      daysUntilEligible: !meetsMin ? diffYMD(asOfDate, minDate) : null,
      daysUntilOverage: meetsMax ? diffYMD(asOfDate, maxDate) : null,
    };
  }, [dob, asOf, minAge, maxAge]);

  const applyPreset = (i) => {
    setPresetIndex(i);
    setMinAge(PRESETS[i].min);
    setMaxAge(PRESETS[i].max);
  };

  return (
    <div className="gac-root">
      <div className="gac-card">
        <header className="gac-header">
          <h1>Bangladesh Govt Job Age Eligibility Calculator</h1>
          <p>Check your exact age and eligibility for government job applications.</p>
        </header>

        <div className="gac-presets">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              className={`gac-preset ${i === presetIndex ? "active" : ""}`}
              onClick={() => applyPreset(i)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="gac-grid">
          <label className="gac-field">
            <span>Date of birth</span>
            <input type="date" value={dob} max={todayISO()} onChange={(e) => setDob(e.target.value)} />
          </label>

          <label className="gac-field">
            <span>Calculate age as of</span>
            <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
          </label>

          <label className="gac-field">
            <span>Minimum age (years)</span>
            <input
              type="number"
              min="0"
              value={minAge}
              onChange={(e) => setMinAge(Number(e.target.value) || 0)}
            />
          </label>

          <label className="gac-field">
            <span>Maximum age (years)</span>
            <input
              type="number"
              min="0"
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value) || 0)}
            />
          </label>
        </div>

        {result?.error && <p className="gac-error">{result.error}</p>}

        {result && !result.error && (
          <div className="gac-result">
            <div className="gac-age">
              <span className="gac-age-value">
                {result.age.years}y {result.age.months}m {result.age.days}d
              </span>
              <span className="gac-age-label">Exact age as of {asOf}</span>
            </div>

            <div className={`gac-badge ${result.eligible ? "eligible" : "not-eligible"}`}>
              {result.eligible ? "Eligible" : "Not eligible"}
            </div>

            <ul className="gac-details">
              <li>
                Required age range: <strong>{minAge}–{maxAge} years</strong>
              </li>
              {!result.meetsMin && result.daysUntilEligible && (
                <li>
                  Becomes eligible in{" "}
                  <strong>
                    {result.daysUntilEligible.years}y {result.daysUntilEligible.months}m{" "}
                    {result.daysUntilEligible.days}d
                  </strong>
                </li>
              )}
              {result.meetsMin && !result.meetsMax && (
                <li>Maximum age was exceeded on {result.maxDate.toISOString().slice(0, 10)}</li>
              )}
              {result.eligible && result.daysUntilOverage && (
                <li>
                  Time left before exceeding the age limit:{" "}
                  <strong>
                    {result.daysUntilOverage.years}y {result.daysUntilOverage.months}m{" "}
                    {result.daysUntilOverage.days}d
                  </strong>
                </li>
              )}
            </ul>
          </div>
        )}

        <footer className="gac-footer">
          <p>
            As of 2026, the general maximum entry age for Bangladesh Civil Service (BCS) and other
            government jobs is 32 years (raised from 30 in April 2026). Posts that already had a
            higher limit (33, 35, 40, 45) keep that limit, and defence / law-enforcement recruitment
            follows its own separate rules. Age is normally counted as of the application deadline
            stated in the specific circular — always confirm the exact figure there before applying.
          </p>
        </footer>
      </div>
    </div>
  );
}