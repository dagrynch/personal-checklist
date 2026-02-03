import { motion } from 'framer-motion';

const PriorityChart = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  // Calculate angles for donut chart
  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = item.value / total;
    const startAngle = currentAngle;
    const endAngle = currentAngle + percentage * 360;
    currentAngle = endAngle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
    };
  });

  // SVG arc path generator
  const createArc = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = 50 + outerRadius * Math.cos(startRad);
    const y1 = 50 + outerRadius * Math.sin(startRad);
    const x2 = 50 + outerRadius * Math.cos(endRad);
    const y2 = 50 + outerRadius * Math.sin(endRad);
    const x3 = 50 + innerRadius * Math.cos(endRad);
    const y3 = 50 + innerRadius * Math.sin(endRad);
    const x4 = 50 + innerRadius * Math.cos(startRad);
    const y4 = 50 + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Donut Chart */}
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {segments.map((segment, index) => (
          <motion.path
            key={segment.name}
            d={createArc(segment.startAngle, segment.endAngle, 25, 40)}
            fill={segment.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="hover:brightness-110 transition-all cursor-pointer"
          />
        ))}
        {/* Center text */}
        <text
          x="50"
          y="47"
          textAnchor="middle"
          className="text-2xl font-bold fill-white"
          style={{ fontSize: '16px' }}
        >
          {total}
        </text>
        <text
          x="50"
          y="58"
          textAnchor="middle"
          className="fill-gray-500"
          style={{ fontSize: '6px' }}
        >
          tasks
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {segments.map((segment) => (
          <div key={segment.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-gray-400">
              {segment.name} ({segment.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityChart;
