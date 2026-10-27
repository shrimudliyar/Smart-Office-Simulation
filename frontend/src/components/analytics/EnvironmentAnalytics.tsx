import { useState } from 'react';
import type { TimeSeriesData } from '../../types';
import { ChartCard } from './ChartCard';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface EnvironmentAnalyticsProps {
  temperatureHistory: TimeSeriesData[];
  humidityHistory: TimeSeriesData[];
  lightHistory: TimeSeriesData[];
  smokeHistory: TimeSeriesData[];
}

export function EnvironmentAnalytics({
  temperatureHistory,
  humidityHistory,
  lightHistory,
  smokeHistory,
}: EnvironmentAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('24H');

  const formatChartTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatChartDate = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filterDataByTimeRange = (data: TimeSeriesData[]) => {
    const now = new Date();
    let hours = 24;

    switch (timeRange) {
      case '24H':
        hours = 24;
        break;
      case '7D':
        hours = 24 * 7;
        break;
      case '30D':
        hours = 24 * 30;
        break;
    }

    const cutoff = new Date(now.getTime() - hours * 3600000);
    return data.filter(d => new Date(d.timestamp) >= cutoff);
  };

  const calculateStats = (data: TimeSeriesData[]) => {
    if (data.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0, trend: 0 };
    }

    const values = data.map(d => d.value);
    const current = values[values.length - 1];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const trend = values.length > 1 ? ((current - values[0]) / values[0]) * 100 : 0;

    return { current, average, min, max, trend };
  };

  const filteredTempHistory = filterDataByTimeRange(temperatureHistory);
  const filteredHumidityHistory = filterDataByTimeRange(humidityHistory);
  const filteredLightHistory = filterDataByTimeRange(lightHistory);
  const filteredSmokeHistory = filterDataByTimeRange(smokeHistory);

  const tempStats = calculateStats(filteredTempHistory);
  const humidityStats = calculateStats(filteredHumidityHistory);
  const lightStats = calculateStats(filteredLightHistory);
  const smokeStats = calculateStats(filteredSmokeHistory);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Environment Analytics</h2>
        <p className="text-gray-400 text-sm">Real-time environmental monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <ChartCard
          title="Temperature"
          current={tempStats.current}
          unit="°C"
          average={tempStats.average}
          min={tempStats.min}
          max={tempStats.max}
          trend={tempStats.trend}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTempHistory}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatChartTime}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelFormatter={formatChartTime}
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Humidity Chart */}
        <ChartCard
          title="Humidity"
          current={humidityStats.current}
          unit="%"
          average={humidityStats.average}
          min={humidityStats.min}
          max={humidityStats.max}
          trend={humidityStats.trend}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredHumidityHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatChartTime}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelFormatter={formatChartTime}
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Light Intensity Chart */}
        <ChartCard
          title="Light Intensity"
          current={lightStats.current}
          unit=" lux"
          average={lightStats.average}
          min={lightStats.min}
          max={lightStats.max}
          trend={lightStats.trend}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredLightHistory}>
                <defs>
                  <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatChartTime}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelFormatter={formatChartTime}
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#lightGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Air Quality / Smoke Chart */}
        <ChartCard
          title="Air Quality (Smoke Level)"
          current={smokeStats.current}
          unit=" ppm"
          average={smokeStats.average}
          min={smokeStats.min}
          max={smokeStats.max}
          trend={smokeStats.trend}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredSmokeHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatChartTime}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelFormatter={formatChartTime}
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
