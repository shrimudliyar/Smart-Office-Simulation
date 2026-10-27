import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  current?: number;
  unit?: string;
  average?: number;
  min?: number;
  max?: number;
  trend?: number;
  timeRange?: '24H' | '7D' | '30D';
  onTimeRangeChange?: (range: '24H' | '7D' | '30D') => void;
}

export function ChartCard({
  title,
  children,
  current,
  unit,
  average,
  min,
  max,
  trend,
  timeRange = '24H',
  onTimeRangeChange,
}: ChartCardProps) {
  const timeRanges: Array<'24H' | '7D' | '30D'> = ['24H', '7D', '30D'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-lg border border-gray-800 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {onTimeRangeChange && (
          <div className="flex gap-2">
            {timeRanges.map(range => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'bg-surfaceLight text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {current !== undefined && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <div className="text-xs text-gray-400 mb-1">Current</div>
            <div className="text-xl font-bold text-white">
              {current.toFixed(1)}{unit}
            </div>
          </div>
          {average !== undefined && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Average</div>
              <div className="text-xl font-bold text-gray-300">
                {average.toFixed(1)}{unit}
              </div>
            </div>
          )}
          {min !== undefined && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Minimum</div>
              <div className="text-xl font-bold text-gray-300">
                {min.toFixed(1)}{unit}
              </div>
            </div>
          )}
          {max !== undefined && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Maximum</div>
              <div className="text-xl font-bold text-gray-300">
                {max.toFixed(1)}{unit}
              </div>
            </div>
          )}
        </div>
      )}

      {children}

      {trend !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Trend:</span>
            <span className={trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
