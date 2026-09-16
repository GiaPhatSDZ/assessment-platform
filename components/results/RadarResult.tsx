"use client";

import { DimensionInterpretation } from "@/src/domain/assessment/types";

interface RadarResultProps {
  dimensions: DimensionInterpretation[];
  size?: number;
}

export function RadarResult({ dimensions, size = 320 }: RadarResultProps) {
  const count = dimensions.length;
  if (count < 3) return null;

  const center = size / 2;
  const radius = center - 45; // padding for labels
  const levels = [25, 50, 75, 100];

  // Helper to compute (x, y) for angle and radius
  const getCoordinates = (angleRad: number, r: number) => {
    return {
      x: center + r * Math.sin(angleRad),
      y: center - r * Math.cos(angleRad),
    };
  };

  // Polygon points for score
  const polygonPoints = dimensions
    .map((dim, i) => {
      const angle = (i * 2 * Math.PI) / count;
      const r = (dim.score / 100) * radius;
      const coords = getCoordinates(angle, r);
      return `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Biểu đồ radar phân tích 4 nhóm năng lực"
        >
          {/* Background concentric level polygons */}
          {levels.map((level) => {
            const levelRadius = (level / 100) * radius;
            const points = dimensions
              .map((_, i) => {
                const angle = (i * 2 * Math.PI) / count;
                const coords = getCoordinates(angle, levelRadius);
                return `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
              })
              .join(" ");

            return (
              <g key={level}>
                <polygon
                  points={points}
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                  strokeDasharray={level < 100 ? "3 3" : undefined}
                  className="dark:stroke-slate-700"
                />
                {/* Level label */}
                <text
                  x={center + 4}
                  y={center - levelRadius + 3}
                  fontSize="9"
                  fill="#94A3B8"
                  className="dark:fill-slate-500 font-mono"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Axes lines from center */}
          {dimensions.map((dim, i) => {
            const angle = (i * 2 * Math.PI) / count;
            const end = getCoordinates(angle, radius);
            return (
              <line
                key={dim.dimensionId}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="#E2E8F0"
                strokeWidth="1.5"
                className="dark:stroke-slate-800"
              />
            );
          })}

          {/* User Score Filled Polygon */}
          <polygon
            points={polygonPoints}
            fill="#2563EB"
            fillOpacity="0.25"
            stroke="#2563EB"
            strokeWidth="2.5"
            className="transition-all duration-500"
          />

          {/* Data Points and Labels */}
          {dimensions.map((dim, i) => {
            const angle = (i * 2 * Math.PI) / count;
            const r = (dim.score / 100) * radius;
            const pt = getCoordinates(angle, r);
            const labelCoords = getCoordinates(angle, radius + 22);

            let textAnchor: "middle" | "start" | "end" = "middle";
            if (labelCoords.x > center + 10) textAnchor = "start";
            else if (labelCoords.x < center - 10) textAnchor = "end";

            return (
              <g key={dim.dimensionId}>
                {/* Score point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="shadow-sm"
                />

                {/* Dimension label */}
                <text
                  x={labelCoords.x}
                  y={labelCoords.y}
                  textAnchor={textAnchor}
                  fontSize="11"
                  fontWeight="600"
                  fill="#1E293B"
                  className="dark:fill-slate-200"
                >
                  {dim.label} ({dim.score}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
