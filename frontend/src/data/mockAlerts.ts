import type { Alert } from '../types';

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    severity: 'warning',
    message: 'Temperature slightly elevated in Pantry',
    sensorId: 'sensor-15',
    roomId: 'room-6',
    timestamp: new Date(Date.now() - 300000),
    status: 'active',
  },
  {
    id: 'alert-2',
    severity: 'info',
    message: 'Motion detected in Reception',
    sensorId: 'sensor-3',
    roomId: 'room-1',
    timestamp: new Date(Date.now() - 600000),
    status: 'resolved',
  },
  {
    id: 'alert-3',
    severity: 'info',
    message: 'Meeting Room door opened',
    deviceId: 'device-9',
    roomId: 'room-3',
    timestamp: new Date(Date.now() - 1800000),
    status: 'resolved',
  },
  {
    id: 'alert-4',
    severity: 'warning',
    message: 'High energy consumption detected',
    roomId: 'room-2',
    timestamp: new Date(Date.now() - 3600000),
    status: 'active',
  },
];
