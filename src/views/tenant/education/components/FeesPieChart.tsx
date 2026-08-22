import React, { useState } from 'react';

export interface PieChartSlice {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
  percentage?: number;
}

interface FeesPieChartProps {
  data: PieChartSlice[];
  title?: string;
  centerLabel?: string;
  centerSublabel?: string;
  currencySymbol?: string;
  size?: number;
  donutWidth?: number;
  showLegend?: boolean;
  emptyMessage?: string;
}

export const FeesPieChart: React.FC<FeesPieChartProps> = ({
  data,
  title,
  centerLabel,
  centerSublabel,
  currencySymbol = 'KSh',
  size = 240,
  donutWidth = 42,
  showLegend = true,
  emptyMessage = 'No financial fee data available'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, slice) => sum + (slice.value > 0 ? slice.value : 0), 0);

  if (total <= 0 || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-600">{emptyMessage}</p>
        <span className="text-[11px] text-slate-400 mt-0.5">Records will reflect here once payments or invoices are processed</span>
      </div>
    );
  }

  // Precompute angle slices
  const radius = size / 2;
  const innerRadius = radius - donutWidth;
  const cx = radius;
  const cy = radius;

  let currentAngle = -Math.PI / 2; // Start from top 12 o'clock

  const slices = data
    .filter(d => d.value > 0)
    .map((slice, idx) => {
      const sliceAngle = (slice.value / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      const isHovered = hoveredIdx === idx;
      const scaleOffset = isHovered ? 4 : 0;

      // Arc coordinates
      const x1 = cx + (radius + scaleOffset) * Math.cos(startAngle);
      const y1 = cy + (radius + scaleOffset) * Math.sin(startAngle);
      const x2 = cx + (radius + scaleOffset) * Math.cos(endAngle);
      const y2 = cy + (radius + scaleOffset) * Math.sin(endAngle);

      const ix1 = cx + (innerRadius - (isHovered ? 2 : 0)) * Math.cos(endAngle);
      const iy1 = cy + (innerRadius - (isHovered ? 2 : 0)) * Math.sin(endAngle);
      const ix2 = cx + (innerRadius - (isHovered ? 2 : 0)) * Math.cos(startAngle);
      const iy2 = cy + (innerRadius - (isHovered ? 2 : 0)) * Math.sin(startAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      // Path data for doughnut segment
      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius + scaleOffset} ${radius + scaleOffset} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${ix1} ${iy1}`,
        `A ${innerRadius - (isHovered ? 2 : 0)} ${innerRadius - (isHovered ? 2 : 0)} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
        'Z'
      ].join(' ');

      const pct = Math.round((slice.value / total) * 100);

      return {
        ...slice,
        idx,
        pathData,
        percentage: pct,
        isHovered
      };
    });

  const activeSlice = hoveredIdx !== null ? slices.find(s => s.idx === hoveredIdx) : null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* SVG Donut / Pie */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size + 16}
          height={size + 16}
          viewBox={`0 0 ${size + 16} ${size + 16}`}
          className="transform transition-transform duration-200"
        >
          <g transform="translate(8, 8)">
            {slices.map(s => (
              <path
                key={s.label}
                d={s.pathData}
                fill={s.color}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: s.isHovered ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))' : 'none',
                  opacity: hoveredIdx === null || s.isHovered ? 1 : 0.65
                }}
                onMouseEnter={() => setHoveredIdx(s.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}
          </g>
        </svg>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeSlice ? (
            <>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
                {activeSlice.label}
              </span>
              <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                {activeSlice.percentage}%
              </span>
              <span className="text-[10px] font-semibold text-slate-500 font-mono">
                {currencySymbol} {activeSlice.value.toLocaleString()}
              </span>
            </>
          ) : (
            <>
              {centerLabel && (
                <span className="text-base font-extrabold text-slate-900 font-mono tracking-tight leading-tight">
                  {centerLabel}
                </span>
              )}
              {centerSublabel && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 max-w-[110px] leading-tight">
                  {centerSublabel}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Legend / Metrics breakdown */}
      {showLegend && (
        <div className="flex-1 w-full space-y-2.5">
          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.idx;
            return (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredIdx(slice.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isHovered
                    ? 'bg-slate-50 border-slate-300 shadow-xs'
                    : 'bg-white/80 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {slice.label}
                    </span>
                    {slice.sublabel && (
                      <span className="text-[10px] text-slate-400 block truncate">
                        {slice.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="flex items-center justify-end space-x-1.5">
                    <span className="text-xs font-bold font-mono text-slate-900">
                      {currencySymbol} {slice.value.toLocaleString()}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-white shadow-2xs"
                      style={{ backgroundColor: slice.color }}
                    >
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
