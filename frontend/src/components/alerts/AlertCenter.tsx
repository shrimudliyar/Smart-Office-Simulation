import { useState, useMemo } from 'react';
import type { Alert, Room } from '../../types';
import { useDataService } from '../../hooks/useDataService';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';

export function AlertCenter() {
  const dataService = useDataService();
  const alerts = dataService.getAlerts();
  const rooms = dataService.getRooms();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
      const matchesRoom = filterRoom === 'all' || alert.roomId === filterRoom;
      const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;

      return matchesSearch && matchesSeverity && matchesRoom && matchesStatus;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [alerts, searchTerm, filterSeverity, filterRoom, filterStatus]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/30 border-red-700 text-red-400';
      case 'warning': return 'bg-yellow-900/30 border-yellow-700 text-yellow-400';
      case 'info': return 'bg-blue-900/30 border-blue-700 text-blue-400';
      default: return 'bg-gray-900/30 border-gray-700 text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return AlertTriangle;
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || roomId;
  };

  const handleResolve = async (alertId: string) => {
    await dataService.resolveAlert(alertId);
  };

  const handleClearResolved = async () => {
    // Resolve all active alerts that are marked as resolved
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved');
    for (const alert of resolvedAlerts) {
      await dataService.resolveAlert(alert.id);
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Alert Center</h2>
        <p className="text-gray-400 text-sm">Monitor and manage system alerts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Total Alerts</div>
          <div className="text-2xl font-bold text-white">{alerts.length}</div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Active</div>
          <div className="text-2xl font-bold text-yellow-400">{activeAlerts.length}</div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Critical</div>
          <div className="text-2xl font-bold text-red-400">{criticalAlerts.length}</div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Resolved</div>
          <div className="text-2xl font-bold text-green-400">
            {alerts.filter(a => a.status === 'resolved').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-gray-800 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surfaceLight border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as 'all' | 'critical' | 'warning' | 'info')}
            className="bg-surfaceLight border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="bg-surfaceLight border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Rooms</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'resolved')}
            className="bg-surfaceLight border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>

          {alerts.some(a => a.status === 'resolved') && (
            <button
              onClick={handleClearResolved}
              className="px-4 py-2 bg-surfaceLight border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
            >
              Clear Resolved
            </button>
          )}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const SeverityIcon = getSeverityIcon(alert.severity);
          const isActive = alert.status === 'active';

          return (
            <div
              key={alert.id}
              className={`bg-surface rounded-lg border-l-4 p-4 ${
                alert.severity === 'critical' ? 'border-red-500' :
                alert.severity === 'warning' ? 'border-yellow-500' : 'border-blue-500'
              } ${!isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className={`p-2 rounded-lg mr-4 ${getSeverityColor(alert.severity)}`}>
                    <SeverityIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${
                        alert.severity === 'critical' ? 'bg-red-900/50 text-red-400' :
                        alert.severity === 'warning' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-blue-900/50 text-blue-400'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className={`text-xs ${
                        isActive ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {isActive ? 'Active' : 'Resolved'}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <span>Room: {getRoomName(alert.roomId)}</span>
                    </div>
                  </div>
                </div>

                {isActive && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="ml-4 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="bg-surface rounded-lg border border-gray-800 p-12 text-center text-gray-400">
            No alerts match the current filters
          </div>
        )}
      </div>
    </div>
  );
}
