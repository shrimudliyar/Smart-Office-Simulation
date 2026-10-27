import type { EnergyData, Device } from '../../types';
import { ChartCard } from './ChartCard';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Zap, TrendingUp, Activity } from 'lucide-react';

interface EnergyAnalyticsProps {
  energyData: EnergyData;
  devices: Device[];
}

export function EnergyAnalytics({ energyData, devices }: EnergyAnalyticsProps) {
  // Generate mock daily consumption data
  const dailyConsumptionData = [
    { day: 'Mon', consumption: 18.5 },
    { day: 'Tue', consumption: 22.3 },
    { day: 'Wed', consumption: 19.8 },
    { day: 'Thu', consumption: 24.1 },
    { day: 'Fri', consumption: 21.5 },
    { day: 'Sat', consumption: 12.3 },
    { day: 'Sun', consumption: 15.7 },
  ];

  // Generate mock hourly consumption data
  const hourlyConsumptionData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    consumption: 1.5 + Math.random() * 2,
  }));

  // Device consumption data
  const deviceConsumptionData = Object.entries(energyData.deviceWise).map(([deviceId, consumption]) => {
    const device = devices.find(d => d.id === deviceId);
    return {
      name: device?.name || deviceId,
      consumption,
      type: device?.type || 'unknown',
    };
  }).sort((a, b) => b.consumption - a.consumption);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Energy Analytics</h2>
        <p className="text-gray-400 text-sm">Real-time energy consumption monitoring</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Zap size={16} />
            <span>Current Usage</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {energyData.currentUsage.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400 mt-1">kW</div>
        </div>

        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Zap size={16} />
            <span>Today</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {energyData.dailyConsumption.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400 mt-1">kWh</div>
        </div>

        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Zap size={16} />
            <span>This Week</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {energyData.weeklyConsumption.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400 mt-1">kWh</div>
        </div>

        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <TrendingUp size={16} />
            <span>Peak Usage</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {energyData.peakUsage.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400 mt-1">kW</div>
        </div>

        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Activity size={16} />
            <span>Efficiency</span>
          </div>
          <div className={`text-3xl font-bold ${
            energyData.efficiency >= 80 ? 'text-green-400' :
            energyData.efficiency >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {energyData.efficiency}%
          </div>
          <div className="text-sm text-gray-400 mt-1">score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Consumption Chart */}
        <ChartCard title="Hourly Energy Consumption">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyConsumptionData}>
                <defs>
                  <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="hour"
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
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                  formatter={(value: number) => [`${value.toFixed(2)} kW`, 'Consumption']}
                />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#energyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Daily Consumption Chart */}
        <ChartCard title="Daily Energy Consumption (Last 7 Days)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="day"
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
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                  formatter={(value: number) => [`${value.toFixed(1)} kWh`, 'Consumption']}
                />
                <Bar dataKey="consumption" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Device-wise Consumption */}
      <ChartCard title="Device-wise Energy Consumption">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deviceConsumptionData.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#f3f4f6' }}
                formatter={(value: number) => [`${value.toFixed(2)} kW`, 'Consumption']}
              />
              <Bar dataKey="consumption" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
