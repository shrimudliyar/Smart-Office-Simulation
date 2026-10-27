import { useState, useMemo } from 'react';
import type { Device, Sensor, Room } from '../../types';
import { useDataService } from '../../hooks/useDataService';
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, Power, Thermometer, Activity, Zap, DoorOpen, Bell } from 'lucide-react';

export function DeviceMonitoring() {
  const dataService = useDataService();
  const devices = dataService.getDevices();
  const sensors = dataService.getSensors();
  const rooms = dataService.getRooms();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'device' | 'sensor'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'light': return Power;
      case 'fan': return Activity;
      case 'ac': return Thermometer;
      case 'door': return DoorOpen;
      case 'alarm': return Bell;
      case 'temperature': return Thermometer;
      case 'humidity': return Activity;
      case 'motion': return Activity;
      case 'smoke': return AlertTriangle;
      default: return Activity;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const allItems = useMemo(() => {
    const deviceItems = devices.map(d => ({
      ...d,
      itemType: 'device' as const,
      category: d.type,
    }));

    const sensorItems = sensors.map(s => ({
      ...s,
      itemType: 'sensor' as const,
      category: s.type,
    }));

    return [...deviceItems, ...sensorItems];
  }, [devices, sensors]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || item.itemType === filterType;
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesRoom = filterRoom === 'all' || item.roomId === filterRoom;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesType && matchesCategory && matchesRoom && matchesStatus;
    });
  }, [allItems, searchTerm, filterType, filterCategory, filterRoom, filterStatus]);

  const categories = useMemo(() => {
    const cats = new Set(allItems.map(item => item.category));
    return Array.from(cats);
  }, [allItems]);

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || roomId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Device Monitoring</h2>
        <p className="text-gray-400 text-sm">Real-time device and sensor status</p>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-gray-800 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surfaceLight border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'device' | 'sensor')}
            className="bg-surfaceLight border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="device">Devices</option>
            <option value="sensor">Sensors</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surfaceLight border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'online' | 'offline')}
            className="bg-surfaceLight border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-white">{allItems.length}</div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Online</div>
          <div className="text-2xl font-bold text-green-400">
            {allItems.filter(i => i.status === 'online').length}
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Offline</div>
          <div className="text-2xl font-bold text-red-400">
            {allItems.filter(i => i.status === 'offline').length}
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Filtered</div>
          <div className="text-2xl font-bold text-white">{filteredItems.length}</div>
        </div>
      </div>

      {/* Device List */}
      <div className="bg-surface rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surfaceLight">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Room</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">State/Value</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Health</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredItems.map((item) => {
                const Icon = getDeviceIcon(item.category);
                const isDevice = item.itemType === 'device';
                const deviceItem = item as Device;
                const sensorItem = item as Sensor;

                return (
                  <tr key={item.id} className="hover:bg-surfaceLight transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-surfaceLight rounded-lg flex items-center justify-center mr-3">
                          <Icon size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{item.name}</div>
                          <div className="text-xs text-gray-400 capitalize">{item.itemType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-surfaceLight text-gray-300 capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getRoomName(item.roomId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'online' ? (
                        <div className="flex items-center text-green-400">
                          <CheckCircle size={16} className="mr-1" />
                          <span className="text-sm">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-400">
                          <XCircle size={16} className="mr-1" />
                          <span className="text-sm">Offline</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {isDevice ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          deviceItem.state === 'on' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {deviceItem.state.toUpperCase()}
                        </span>
                      ) : (
                        <span>{sensorItem.value.toFixed(1)}{sensorItem.unit}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isDevice && deviceItem.health ? (
                        <span className={`text-sm font-medium ${getHealthColor(deviceItem.health)}`}>
                          {deviceItem.health}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(item.lastUpdate).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No devices match the current filters
          </div>
        )}
      </div>
    </div>
  );
}
