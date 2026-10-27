import { useDataService } from '../hooks/useDataService';
import { KPICards } from '../components/dashboard/KPICards';
import { OfficeFloorMap } from '../components/floorMap/OfficeFloorMap';
import { EnvironmentAnalytics } from '../components/analytics/EnvironmentAnalytics';
import { OccupancyAnalytics } from '../components/analytics/OccupancyAnalytics';
import { EnergyAnalytics } from '../components/analytics/EnergyAnalytics';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Zap, Clock, CheckCircle } from 'lucide-react';

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const dataService = useDataService();
  const kpiMetrics = dataService.getKPIMetrics();
  const rooms = dataService.getRooms();
  const sensors = dataService.getSensors();
  const devices = dataService.getDevices();
  const alerts = dataService.getAlerts();
  const temperatureHistory = dataService.getTemperatureHistory();
  const humidityHistory = dataService.getHumidityHistory();
  const lightHistory = dataService.getLightHistory();
  const smokeHistory = dataService.getSmokeHistory();
  const occupancyData = dataService.getOccupancyData();
  const energyData = dataService.getEnergyData();
  const systemHealth = dataService.getSystemHealth();
  const activities = dataService.getActivities();

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active');
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const overallHealth = Math.round(
    ((systemHealth.onlineDevices / systemHealth.totalDevices) * 0.4) +
    (systemHealth.sensorHealth * 0.3) +
    (systemHealth.networkHealth * 0.3)
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">Real-time monitoring and control center</p>
      </motion.div>

      {/* Phase 3 Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {/* Critical Alerts */}
        <div
          onClick={() => onNavigate?.('alerts')}
          className={`bg-surface rounded-lg border p-4 cursor-pointer transition-all hover:scale-105 ${
          criticalAlerts.length > 0 ? 'border-red-700' : 'border-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle size={20} className={criticalAlerts.length > 0 ? 'text-red-400' : 'text-gray-400'} />
            <span className={`text-xs ${criticalAlerts.length > 0 ? 'text-red-400' : 'text-gray-400'}`}>
              Critical
            </span>
          </div>
          <div className={`text-2xl font-bold ${criticalAlerts.length > 0 ? 'text-red-400' : 'text-white'}`}>
            {criticalAlerts.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Active Alerts</div>
        </div>

        {/* Online Devices */}
        <div
          onClick={() => onNavigate?.('devices')}
          className="bg-surface rounded-lg border border-gray-800 p-4 cursor-pointer transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity size={20} className="text-green-400" />
            <span className="text-xs text-green-400">Online</span>
          </div>
          <div className="text-2xl font-bold text-white">{onlineDevices}</div>
          <div className="text-xs text-gray-400 mt-1">of {devices.length} devices</div>
        </div>

        {/* System Health */}
        <div
          onClick={() => onNavigate?.('system-health')}
          className={`bg-surface rounded-lg border p-4 cursor-pointer transition-all hover:scale-105 ${
          overallHealth >= 90 ? 'border-green-700' : overallHealth >= 70 ? 'border-yellow-700' : 'border-red-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={20} className={overallHealth >= 90 ? 'text-green-400' : overallHealth >= 70 ? 'text-yellow-400' : 'text-red-400'} />
            <span className={`text-xs ${overallHealth >= 90 ? 'text-green-400' : overallHealth >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
              {overallHealth >= 90 ? 'Healthy' : overallHealth >= 70 ? 'Degraded' : 'Critical'}
            </span>
          </div>
          <div className={`text-2xl font-bold ${overallHealth >= 90 ? 'text-green-400' : overallHealth >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
            {overallHealth}%
          </div>
          <div className="text-xs text-gray-400 mt-1">System Health</div>
        </div>

        {/* Current Occupancy */}
        <div
          onClick={() => onNavigate?.('occupancy')}
          className="bg-surface rounded-lg border border-gray-800 p-4 cursor-pointer transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity size={20} className="text-blue-400" />
            <span className="text-xs text-blue-400">People</span>
          </div>
          <div className="text-2xl font-bold text-white">{occupancyData.current}</div>
          <div className="text-xs text-gray-400 mt-1">Current Occupancy</div>
        </div>

        {/* Energy Usage */}
        <div
          onClick={() => onNavigate?.('energy')}
          className="bg-surface rounded-lg border border-gray-800 p-4 cursor-pointer transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <Zap size={20} className="text-yellow-400" />
            <span className="text-xs text-yellow-400">kW</span>
          </div>
          <div className="text-2xl font-bold text-white">{energyData.currentUsage.toFixed(1)}</div>
          <div className="text-xs text-gray-400 mt-1">Energy Usage</div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <KPICards metrics={kpiMetrics} />
      </motion.div>

      {/* Recent Activity (Preview) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="bg-surface rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              Recent Activity
            </h3>
            <span className="text-sm text-gray-400">Last 5 events</span>
          </div>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-surfaceLight rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'device' ? 'bg-blue-900/30 text-blue-400' :
                  activity.type === 'alert' ? 'bg-red-900/30 text-red-400' :
                  activity.type === 'threshold' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-gray-900/30 text-gray-400'
                }`}>
                  <Clock size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white">{activity.message}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-sm">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Office Floor Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <OfficeFloorMap
          rooms={rooms}
          sensors={sensors}
          devices={devices}
          alerts={alerts}
        />
      </motion.div>

      {/* Environment Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <EnvironmentAnalytics
          temperatureHistory={temperatureHistory}
          humidityHistory={humidityHistory}
          lightHistory={lightHistory}
          smokeHistory={smokeHistory}
        />
      </motion.div>

      {/* Occupancy Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <OccupancyAnalytics
          occupancyData={occupancyData}
          rooms={rooms}
        />
      </motion.div>

      {/* Energy Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <EnergyAnalytics
          energyData={energyData}
          devices={devices}
        />
      </motion.div>
    </div>
  );
}
