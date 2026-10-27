import { useDataService } from '../../hooks/useDataService';
import { Activity, CheckCircle, XCircle, AlertTriangle, Zap, Server, Clock } from 'lucide-react';

export function SystemHealth() {
  const dataService = useDataService();
  const systemHealth = dataService.getSystemHealth();
  const devices = dataService.getDevices();
  const sensors = dataService.getSensors();
  const alerts = dataService.getAlerts();

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active');
  const onlinePercentage = (systemHealth.onlineDevices / systemHealth.totalDevices) * 100;
  const sensorHealth = systemHealth.sensorHealth;
  const networkHealth = systemHealth.networkHealth;

  const overallHealth = Math.round(
    (onlinePercentage * 0.4) +
    (sensorHealth * 0.3) +
    (networkHealth * 0.3)
  );

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return 'HEALTHY';
    if (score >= 70) return 'DEGRADED';
    return 'CRITICAL';
  };

  const getHealthBg = (score: number) => {
    if (score >= 90) return 'bg-green-900/20 border-green-700';
    if (score >= 70) return 'bg-yellow-900/20 border-yellow-700';
    return 'bg-red-900/20 border-red-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">System Health</h2>
        <p className="text-gray-400 text-sm">Overall system status and health metrics</p>
      </div>

      {/* Overall Health Score */}
      <div className={`bg-surface rounded-lg border-2 p-8 ${getHealthBg(overallHealth)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-2">System Health</div>
            <div className="text-6xl font-bold text-white mb-2">{overallHealth}%</div>
            <div className={`text-xl font-semibold ${getHealthColor(overallHealth)}`}>
              {getHealthStatus(overallHealth)}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-gray-400 mb-2">
              <Clock size={16} className="mr-2" />
              Last Sync
            </div>
            <div className="text-white">
              {new Date(systemHealth.lastSync).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Health Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Device Health */}
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-400">
              <Activity size={18} className="mr-2" />
              <span className="text-sm">Devices</span>
            </div>
            <div className={`text-2xl font-bold ${getHealthColor(onlinePercentage)}`}>
              {onlinePercentage.toFixed(0)}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Online</span>
              <span className="text-green-400">{systemHealth.onlineDevices}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Offline</span>
              <span className="text-red-400">{systemHealth.offlineDevices}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total</span>
              <span className="text-white">{systemHealth.totalDevices}</span>
            </div>
          </div>
        </div>

        {/* Sensor Health */}
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-400">
              <Server size={18} className="mr-2" />
              <span className="text-sm">Sensors</span>
            </div>
            <div className={`text-2xl font-bold ${getHealthColor(sensorHealth)}`}>
              {sensorHealth}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Sensors</span>
              <span className="text-white">{sensors.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active</span>
              <span className="text-green-400">{sensors.filter(s => s.status === 'online').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Inactive</span>
              <span className="text-red-400">{sensors.filter(s => s.status === 'offline').length}</span>
            </div>
          </div>
        </div>

        {/* Network Health */}
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-400">
              <Zap size={18} className="mr-2" />
              <span className="text-sm">Network</span>
            </div>
            <div className={`text-2xl font-bold ${getHealthColor(networkHealth)}`}>
              {networkHealth}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Latency</span>
              <span className="text-white">12ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Uptime</span>
              <span className="text-green-400">99.9%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Packets</span>
              <span className="text-white">Normal</span>
            </div>
          </div>
        </div>

        {/* Alert Status */}
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-400">
              <AlertTriangle size={18} className="mr-2" />
              <span className="text-sm">Alerts</span>
            </div>
            <div className={`text-2xl font-bold ${criticalAlerts.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {criticalAlerts.length}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Critical</span>
              <span className="text-red-400">{criticalAlerts.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Warning</span>
              <span className="text-yellow-400">{alerts.filter(a => a.severity === 'warning' && a.status === 'active').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Info</span>
              <span className="text-blue-400">{alerts.filter(a => a.severity === 'info' && a.status === 'active').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Device Health Detail */}
      <div className="bg-surface rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Device Health Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['light', 'fan', 'ac', 'door', 'alarm'].map((type) => {
            const typeDevices = devices.filter(d => d.type === type);
            const online = typeDevices.filter(d => d.status === 'online').length;
            const percentage = typeDevices.length > 0 ? (online / typeDevices.length) * 100 : 100;

            return (
              <div key={type} className="bg-surfaceLight rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white capitalize">{type}s</span>
                  <span className={`text-sm font-semibold ${getHealthColor(percentage)}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      percentage >= 90 ? 'bg-green-500' :
                      percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{online} online</span>
                  <span>{typeDevices.length - online} offline</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-surface rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-surfaceLight rounded-lg">
            <div className="flex items-center">
              <CheckCircle size={20} className="text-green-400 mr-3" />
              <span className="text-white">Data Pipeline</span>
            </div>
            <span className="text-green-400 text-sm">Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-surfaceLight rounded-lg">
            <div className="flex items-center">
              <CheckCircle size={20} className="text-green-400 mr-3" />
              <span className="text-white">Mock Simulation</span>
            </div>
            <span className="text-green-400 text-sm">Running</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-surfaceLight rounded-lg">
            <div className="flex items-center">
              <CheckCircle size={20} className="text-green-400 mr-3" />
              <span className="text-white">Service Layer</span>
            </div>
            <span className="text-green-400 text-sm">Healthy</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-surfaceLight rounded-lg">
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-yellow-400 mr-3" />
              <span className="text-white">MQTT Connection</span>
            </div>
            <span className="text-yellow-400 text-sm">Not Configured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
