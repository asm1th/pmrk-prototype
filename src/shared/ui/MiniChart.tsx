import { useState } from 'react';

/* Лёгкие SVG-графики (обёртка с тултипом «дата + значение»). Намеренно не тянем
   тяжёлый charts-пакет: полный контроль над тултипами/доступностью, мгновенный
   рендер. В дизайн-решениях помечено как осознанный выбор (см. 01_decisions). */

export interface Series {
  name: string;
  color: string;
  points: number[];
  area?: boolean;
}

export function LineChart(props: {
  series: Series[];
  labels: string[];
  height?: number;
  format?: (n: number) => string;
}) {
  const H = props.height ?? 160;
  const W = 640;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 22;
  const [hover, setHover] = useState<number | null>(null);

  const all = props.series.flatMap((s) => s.points);
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const n = props.labels.length;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const x = (i: number) => padL + (innerW * i) / Math.max(n - 1, 1);
  const y = (v: number) => padT + innerH - (innerH * (v - min)) / Math.max(max - min, 1);
  const fmt = props.format ?? ((v) => String(v));

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
          const rel = ((e.clientX - rect.left) / rect.width) * W;
          const idx = Math.round(((rel - padL) / innerW) * (n - 1));
          setHover(Math.max(0, Math.min(n - 1, idx)));
        }}
      >
        {/* сетка */}
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={padL} x2={W - padR} y1={padT + innerH * t} y2={padT + innerH * t} stroke="var(--color-bg-border)" strokeWidth={1} />
        ))}
        {/* серии */}
        {props.series.map((s, si) => {
          const d = s.points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
          const area = `${d} L ${x(n - 1)} ${padT + innerH} L ${x(0)} ${padT + innerH} Z`;
          return (
            <g key={si}>
              {s.area && <path d={area} fill={s.color} opacity={0.1} />}
              <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          );
        })}
        {/* hover */}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke="var(--color-typo-ghost)" strokeDasharray="3 3" />
            {props.series.map((s, si) => (
              <circle key={si} cx={x(hover)} cy={y(s.points[hover])} r={3.5} fill={s.color} stroke="var(--color-bg-default)" strokeWidth={1.5} />
            ))}
          </g>
        )}
        {/* подписи X (разрежённые) */}
        {props.labels.map((l, i) =>
          i % Math.ceil(n / 6) === 0 || i === n - 1 ? (
            <text key={i} x={x(i)} y={H - 6} fontSize={10} fill="var(--color-typo-secondary)" textAnchor="middle">
              {l}
            </text>
          ) : null,
        )}
      </svg>

      {hover != null && (
        <div
          style={{
            position: 'absolute',
            left: `calc(${(x(hover) / W) * 100}% )`,
            top: 0,
            transform: 'translateX(-50%)',
            background: 'var(--color-bg-default)',
            border: '1px solid var(--color-bg-border)',
            borderRadius: 8,
            boxShadow: 'var(--pmrk-shadow-2)',
            padding: '8px 10px',
            pointerEvents: 'none',
            fontSize: 12,
            whiteSpace: 'nowrap',
            zIndex: 5,
          }}
        >
          <div className="pmrk-muted" style={{ marginBottom: 4 }}>{props.labels[hover]}</div>
          {props.series.map((s, si) => (
            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              <span style={{ flex: 1 }}>{s.name}</span>
              <b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(s.points[hover])}</b>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        {props.series.map((s, si) => (
          <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 10, height: 3, borderRadius: 2, background: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Sparkline({ points, color = 'var(--color-bg-brand)', width = 80, height = 24 }: { points: number[]; color?: string; width?: number; height?: number }) {
  if (!points.length) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const d = points
    .map((v, i) => {
      const x = (width * i) / Math.max(points.length - 1, 1);
      const y = height - (height * (v - min)) / Math.max(max - min, 1);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

/** Горизонтальный индикатор вклада (для декомпозиции оценки AI-3). */
export function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color }} />
    </div>
  );
}

/** Кольцевой прогресс — использование лимита и т.п. */
export function Gauge({ value, color, label }: { value: number; color: string; label?: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 64, height: 64 }}>
      <svg width={64} height={64}>
        <circle cx={32} cy={32} r={r} fill="none" stroke="var(--color-bg-secondary)" strokeWidth={6} />
        <circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
        {Math.round(value * 100)}%
      </div>
      {label && <div className="pmrk-muted" style={{ textAlign: 'center', fontSize: 11 }}>{label}</div>}
    </div>
  );
}
