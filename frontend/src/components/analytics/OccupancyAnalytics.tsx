import type { OccupancyData, Room } from '../../types';
import { ChartCard } from './ChartCard';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, TrendingUp, Clock } from 'lucide-react';

interface OccupancyAnalyticsProps {
  occupancyData: OccupancyData;
  rooms: Room[];
}

export function OccupancyAnalytics({ occupancyData, rooms }: OccupancyAnalyticsProps) {
  const roomOccupancyData = rooms.map(room => ({
    name: room.name,
    current: occupancyData.byRoom[room.id] || 0,
    capacity: room.capacity,
    percentage: ((occupancyData.byRoom[room.id] || 0) / room.capacity) * 100,
  }));

  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const vacant = totalCapacity - occupancyData.current;

  const pieData = [
    { name: 'Occupied', value: occupancyData.current, color: '#3b82f6' },
    { name: 'Vacant', value: vacant, color: '#374151' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Occupancy Analytics</h2>
        <p className="text-gray-400 text-sm">Real-time occupancy monitoring</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Users size={16} />
            <span>Current Occupancy</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {occupancyData.current}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            of {totalCapacity} total capacity
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Users size={16} />
            <span>Occupancy Rate</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {occupancyData.percentage.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {vacant} spots available
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <TrendingUp size={16} />
            <span>Trend</span>
          </div>
          <div className={`text-3xl font-bold ${occupancyData.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {occupancyData.trend > 0 ? '+' : ''}{occupancyData.trend}%
          </div>
          <div className="text-sm text-gray-400 mt-1">
            vs previous period
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Clock size={16} />
            <span>Peak Time</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {occupancyData.peakTime}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            daily peak
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy by Room Bar Chart */}
        <ChartCard title="Occupancy by Room">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                />
                <Legend />
                <Bar dataKey="current" name="Current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Capacity" fill="#374151" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Occupancy Distribution Pie Chart */}
        <ChartCard title="Occupancy Distribution">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Room Occupancy Percentage */}
      <ChartCard title="Room Occupancy Percentage">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roomOccupancyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#f3f4f6' }}
                formatter={(value: number) => [`${value.toFixed(0)}%`, 'Occupancy']}
              />
              <Bar dataKey="percentage" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
