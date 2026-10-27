import { useState } from 'react';
import type { Device, Room } from '../../types';
import { useDataService } from '../../hooks/useDataService';
import { Power, Fan, Thermometer, DoorOpen, Bell, AlertTriangle } from 'lucide-react';

export function DeviceControl() {
  const dataService = useDataService();
  const devices = dataService.getDevices();
  const rooms = dataService.getRooms();
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'light': return Power;
      case 'fan': return Fan;
      case 'ac': return Thermometer;
      case 'door': return DoorOpen;
      case 'alarm': return Bell;
      default: return Power;
    }
  };

  const getDeviceLabel = (type: string) => {
    switch (type) {
      case 'light': return 'Light';
      case 'fan': return 'Fan';
      case 'ac': return 'AC';
      case 'door': return 'Door';
      case 'alarm': return 'Alarm';
      default: return type;
    }
  };

  const handleToggle = async (device: Device) => {
    const newState = device.state === 'on' ? 'off' : 'on';

    // Require confirmation for alarm and door
    if (device.type === 'alarm' || device.type === 'door') {
      setConfirmAction({ id: device.id, action: newState });
      return;
    }

    await dataService.updateDeviceState(device.id, newState);
  };

  const handleConfirm = async () => {
    if (confirmAction) {
      await dataService.updateDeviceState(confirmAction.id, confirmAction.action as 'on' | 'off');
      setConfirmAction(null);
    }
  };

  const filteredDevices = selectedRoom === 'all'
    ? devices
    : devices.filter(d => d.roomId === selectedRoom);

  const controllableDevices = filteredDevices.filter(d =>
    ['light', 'fan', 'ac', 'door', 'alarm'].includes(d.type)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Device Control</h2>
        <p className="text-gray-400 text-sm">Control office devices in real-time</p>
      </div>

      {/* Room Filter */}
      <div className="bg-surface rounded-lg border border-gray-800 p-4">
        <label className="text-sm text-gray-400 mb-2 block">Filter by Room</label>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full bg-surfaceLight border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
        >
          <option value="all">All Rooms</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>{room.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Controllable Devices</div>
          <div className="text-2xl font-bold text-white">{controllableDevices.length}</div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Currently ON</div>
          <div className="text-2xl font-bold text-green-400">
            {controllableDevices.filter(d => d.state === 'on').length}
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Currently OFF</div>
          <div className="text-2xl font-bold text-gray-400">
            {controllableDevices.filter(d => d.state === 'off').length}
          </div>
        </div>
      </div>

      {/* Device Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {controllableDevices.map((device) => {
          const Icon = getDeviceIcon(device.type);
          const room = rooms.find(r => r.id === device.roomId);
          const isCritical = device.type === 'alarm' || device.type === 'door';

          return (
            <div
              key={device.id}
              className={`bg-surface rounded-lg border ${
                device.state === 'on' ? 'border-green-700/50' : 'border-gray-800'
              } p-4 transition-all hover:border-gray-700`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    device.state === 'on' ? 'bg-green-900/30' : 'bg-surfaceLight'
                  } mr-3`}>
                    <Icon size={20} className={device.state === 'on' ? 'text-green-400' : 'text-gray-400'} />
                  </div>
                  <div>
                    <div className="font-medium text-white">{device.name}</div>
                    <div className="text-xs text-gray-400">{room?.name || 'Unknown Room'}</div>
                  </div>
                </div>
                {isCritical && device.state === 'on' && (
                  <AlertTriangle size={16} className="text-yellow-400" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400 capitalize">{getDeviceLabel(device.type)}</div>
                <button
                  onClick={() => handleToggle(device)}
                  disabled={device.status === 'offline'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    device.state === 'on' ? 'bg-green-600' : 'bg-gray-600'
                  } ${device.status === 'offline' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      device.state === 'on' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between items-center">
                <span className={`text-xs ${device.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                  {device.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(device.lastUpdate).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {controllableDevices.length === 0 && (
        <div className="bg-surface rounded-lg border border-gray-800 p-12 text-center text-gray-400">
          No controllable devices found
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg border border-gray-800 p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="text-yellow-400 mr-3" />
              <h3 className="text-lg font-bold text-white">Confirm Action</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to {confirmAction.action} this {confirmAction.action === 'on' ? 'turn on' : 'turn off'}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2 bg-surfaceLight border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-primary rounded-lg text-white hover:bg-primaryLight transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
