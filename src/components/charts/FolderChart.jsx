import { motion } from 'framer-motion';

const FolderChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.name} className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300 truncate">{item.name}</span>
            <span className="text-gray-500 ml-2">{item.value}</span>
          </div>
          <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FolderChart;
