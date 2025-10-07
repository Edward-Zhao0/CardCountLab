import React, { useMemo } from "react";
import "../styles/PracticeMetrics.css";


const PracticeMetrics = ({ isOpen, onClose, metrics }) => {
  if (!isOpen) return null;

  const wins = metrics?.wins ?? 0;
  const losses = metrics?.losses ?? 0;
  const pushes = metrics?.pushes ?? 0;
  const results = metrics?.results ?? [];
  const totalHands = wins + losses + pushes;

  const winRate = totalHands ? ((wins / totalHands) * 100).toFixed(1) : "0.0";

  const { currentStreak, bestStreak, streakSeries } = useMemo(() => {
    let cur = 0;
    let best = 0;
    const series = [];
    let run = 0;

    for (const r of results) {
      if (r === "W") {
        run += 1;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
      series.push(run);
    }
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i] === "W") cur += 1;
      else break;
    }

    return { currentStreak: cur, bestStreak: best, streakSeries: series };
  }, [results]);

  const Sparkline = () => {
    const width = 520;
    const height = 80;
    const pad = 8;

    const n = streakSeries.length;
    const maxY = Math.max(1, ...streakSeries);

    const pathD =
      n >= 2
        ? streakSeries
            .map((v, i) => {
              const x = pad + (i * (width - 2 * pad)) / Math.max(1, n - 1);
              const y = height - pad - (v / maxY) * (height - 2 * pad);
              return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
            })
            .join(" ")
        : "";

    return (
      <svg
        className="metrics-sparkline"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Win streak over time"
      >
        <line
          x1={pad}
          x2={width - pad}
          y1={height - pad}
          y2={height - pad}
          className="sparkline-baseline"
        />
        {n >= 2 && <path d={pathD} className="sparkline-path" fill="none" />}
        {streakSeries.map((v, i) => {
          const x = pad + (i * (width - 2 * pad)) / Math.max(1, n - 1);
          const y = height - pad - (v / maxY) * (height - 2 * pad);
          return <circle key={i} cx={x} cy={y} r="2.5" className="sparkline-dot" />;
        })}
      </svg>
    );
  };

  return (
    <div className="metrics-backdrop" onClick={onClose}>
      <div
        className="metrics-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="metrics-title"
      >
        <div className="metrics-header">
          <h2 id="metrics-title">Practice Metrics</h2>
          <button className="metrics-close" onClick={onClose} aria-label="Close metrics">
            ✕
          </button>
        </div>

        <div className="metrics-grid">
          <div className="metric">
            <h3>Wins</h3>
            <p className="metric-value win">{wins}</p>
          </div>
          <div className="metric">
            <h3>Losses</h3>
            <p className="metric-value loss">{losses}</p>
          </div>
          <div className="metric">
            <h3>Pushes</h3>
            <p className="metric-value push">{pushes}</p>
          </div>
          <div className="metric">
            <h3>Hands Played</h3>
            <p className="metric-value">{totalHands}</p>
          </div>
          <div className="metric">
            <h3>Win Rate</h3>
            <p className="metric-value">{winRate}%</p>
          </div>
          <div className="metric">
            <h3>Best Streak</h3>
            <p className="metric-value">{bestStreak}</p>
          </div>
          <div className="metric">
            <h3>Current Streak</h3>
            <p className="metric-value">{currentStreak}</p>
          </div>
        </div>

        <div className="metrics-section">
          <div className="metrics-section-head">
            <h4>Win Streak Over Time</h4>
            <span className="metrics-subtle">Each point = win streak after that hand</span>
          </div>
          {results.length === 0 ? (
            <div className="metrics-empty">No hands yet — play a hand to see your chart.</div>
          ) : (
            <Sparkline />
          )}
        </div>

        <div className="metrics-section">
          <div className="metrics-section-head">
            <h4>Result Strip</h4>
            <span className="metrics-subtle">W = win, L = loss, P = push</span>
          </div>
          {results.length === 0 ? (
            <div className="metrics-empty">No results yet.</div>
          ) : (
            <div className="result-strip" aria-label="Results sequence">
              {results.map((r, i) => (
                <span
                  key={i}
                  className={`result-dot ${r === "W" ? "win" : r === "L" ? "loss" : "push"}`}
                  title={`Hand ${i + 1}: ${r === "W" ? "Win" : r === "L" ? "Loss" : "Push"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeMetrics;