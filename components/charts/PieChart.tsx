interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  width?: number;
  height?: number;
  title?: string;
}

export const PieChart = ({
  data,
  width = 300,
  height = 300,
  title,
}: PieChartProps) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Generate pie slices
  let currentAngle = -Math.PI / 2;
  const slices = data.map((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    // Calculate path
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const path = `
      M ${centerX} ${centerY}
      L ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
      Z
    `;

    // Calculate label position
    const labelAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);

    const percentage = ((item.value / total) * 100).toFixed(0);

    currentAngle = endAngle;

    return {
      path,
      labelX,
      labelY,
      percentage,
      name: item.name,
      value: item.value,
      color: item.color,
    };
  });

  return (
    <div className="w-full flex flex-col items-center">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {slices.map((slice, index) => (
          <g key={index}>
            <path
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={slice.labelX}
              y={slice.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold fill-white"
              pointerEvents="none"
            >
              {slice.percentage}%
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-600">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
