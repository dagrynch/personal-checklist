import { motion } from 'framer-motion';

const CompletionChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.completed, d.created)), 1);
  const chartHeight = 120;
  const chartWidth = 100;
  const barWidth = 10;
  const groupWidth = chartWidth / data.length;

  return (
    <div className="w-full">
      {/* Chart */}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
        className="w-full h-48"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={chartHeight * (1 - ratio)}
            x2={chartWidth}
            y2={chartHeight * (1 - ratio)}
            stroke="#333"
            strokeDasharray="2,2"
          />
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const x = index * groupWidth + groupWidth / 2;
          const completedHeight = (item.completed / maxValue) * chartHeight;
          const createdHeight = (item.created / maxValue) * chartHeight;

          return (
            <g key={item.date}>
              {/* Created bar */}
              <motion.rect
                x={x - barWidth - 1}
                y={chartHeight - createdHeight}
                width={barWidth}
                height={createdHeight}
                rx="2"
                fill="#3b82f6"
                fillOpacity="0.6"
                initial={{ height: 0, y: chartHeight }}
                animate={{ height: createdHeight, y: chartHeight - createdHeight }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              />

              {/* Completed bar */}
              <motion.rect
                x={x + 1}
                y={chartHeight - completedHeight}
                width={barWidth}
                height={completedHeight}
                rx="2"
                fill="#10b981"
                initial={{ height: 0, y: chartHeight }}
                animate={{ height: completedHeight, y: chartHeight - completedHeight }}
                transition={{ duration: 0.5, delay: index * 0.05 + 0.1 }}
              />

              {/* Day label */}
              <text
                x={x}
                y={chartHeight + 12}
                textAnchor="middle"
                className="fill-gray-500"
                style={{ fontSize: '6px' }}
              >
                {item.date}
              </text>
            </g>
          );
        })}

        {/* Y-axis labels */}
        <text
          x="2"
          y="8"
          className="fill-gray-500"
          style={{ fontSize: '5px' }}
        >
          {maxValue}
        </text>
        <text
          x="2"
          y={chartHeight - 2}
          className="fill-gray-500"
          style={{ fontSize: '5px' }}
        >
          0
        </text>
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/60" />
          <span className="text-xs text-gray-400">Created</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-xs text-gray-400">Completed</span>
        </div>
      </div>
    </div>
  );
};

export default CompletionChart;
