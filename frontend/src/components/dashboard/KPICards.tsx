import type { KPIMetric } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardsProps {
  metrics: KPIMetric[];
}

export function KPICards({ metrics }: KPICardsProps) {
  const getStatusColor = (status: KPIMetric['status']) => {
    switch (status) {
      case 'normal':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: KPIMetric['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-green-900/20 border-green-800/30';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-800/30';
      case 'critical':
        return 'bg-red-900/20 border-red-800/30';
      default:
        return 'bg-gray-900/20 border-gray-800/30';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${getStatusBg(metric.status)}`}
        >
          <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
          <div className="flex items-end justify-between">
            <div>
              <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-500">{metric.unit}</div>
            </div>
            <div className="flex items-center gap-1">
              {metric.trendDirection === 'up' && metric.trend > 0 && (
                <TrendingUp size={16} className="text-green-400" />
              )}
              {metric.trendDirection === 'down' && metric.trend < 0 && (
                <TrendingDown size={16} className="text-red-400" />
              )}
              {metric.trendDirection === 'stable' && (
                <Minus size={16} className="text-gray-400" />
              )}
              <span className={`text-xs font-medium ${
                metric.trend > 0 ? 'text-green-400' : metric.trend < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {Math.abs(metric.trend)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
