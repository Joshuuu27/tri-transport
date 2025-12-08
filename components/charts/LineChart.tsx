interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  width?: number;
  height?: number;
  title?: string;
  lineColor?: string;
  showGrid?: boolean;
}

export const LineChart = ({
  data,
  width = 600,
  height = 300,
  title,
  lineColor = "#3b82f6",
  showGrid = true,
}: LineChartProps) => {
  if (data.length === 0) return <div className="text-gray-500">No data available</div>;

  // Calculate min and max values
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const padding = { top: 30, right: 20, bottom: 40, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const normalizedValue = (item.value - minValue) / range;
    const y = padding.top + chartHeight - normalizedValue * chartHeight;
    return { x, y, label: item.label, value: item.value };
  });

  // Create path
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  // Grid lines (horizontal)
  const gridLines = [];
  if (showGrid) {
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartHeight;
      const value = maxValue - (i / 4) * range;
      gridLines.push(
        <g key={`grid-${i}`}>
          <line
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <text
            x={padding.left - 10}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-gray-500"
          >
            {value.toFixed(1)}
          </text>
        </g>
      );
    }
  }

  return (
    <div className="w-full flex flex-col">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full border border-gray-200 rounded-lg"
      >
        {/* Grid */}
        {gridLines}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth="2"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Line */}
        <path d={pathData} stroke={lineColor} strokeWidth="3" fill="none" />

        {/* Points */}
        {points.map((point, index) => (
          <g key={`point-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={lineColor}
              stroke="white"
              strokeWidth="2"
            />
            {/* Tooltip on hover - using title element */}
            <title>{`${point.label}: ${point.value.toFixed(2)}`}</title>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((point, index) => (
          <text
            key={`label-${index}`}
            x={point.x}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {point.label}
          </text>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 justify-center">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: lineColor }}></div>
        <span className="text-sm text-gray-600">Rating</span>
      </div>
    </div>
  );
};
