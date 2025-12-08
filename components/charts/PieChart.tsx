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
  const filteredData = data.filter(item => item.value > 0);
  
  if (filteredData.length === 0) {
    return (
      <div className="w-full flex flex-col items-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const total = filteredData.reduce((sum, item) => sum + item.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 50;

  const slices: any[] = [];
  let currentPercentage = 0;

  filteredData.forEach((item) => {
    const percentage = (item.value / total) * 100;
    const slicePercentage = percentage;
    
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    slices.push({
      color: item.color,
      percentage: percentage.toFixed(1),
      name: item.name,
      value: item.value,
      offset: (circumference * currentPercentage) / 100,
      dashoffset: strokeDashoffset,
    });

    currentPercentage += percentage;
  });

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {title && <h3 className="text-lg font-semibold text-gray-700">{title}</h3>}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ backgroundColor: "#fafafa" }}
      >
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="2" />
        {slices.map((slice, index) => (
          <circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth="30"
            strokeDasharray={`${(parseFloat(slice.percentage) * 2 * Math.PI * radius) / 100} ${2 * Math.PI * radius}`}
            strokeDashoffset={-slice.offset}
            strokeLinecap="round"
          />
        ))}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fontWeight="bold"
          fill="#1f2937"
        >
          {total}
        </text>
      </svg>
      <div className="flex flex-wrap gap-4 justify-center">
        {filteredData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-700">
              <span className="font-semibold">{item.name}</span>: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
