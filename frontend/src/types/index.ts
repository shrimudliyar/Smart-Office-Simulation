export type DeviceStatus = 'online' | 'offline';
export type DeviceState = 'on' | 'off';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'resolved';
export type RoomStatus = 'occupied' | 'vacant' | 'restricted';

export interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'motion' | 'smoke' | 'light';
  value: number;
  unit: string;
  status: DeviceStatus;
  lastUpdate: Date;
  roomId: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'light' | 'fan' | 'ac' | 'door' | 'alarm';
  state: DeviceState;
  status: DeviceStatus;
  lastUpdate: Date;
  roomId: string;
  health: 'good' | 'degraded' | 'poor';
}

export interface Room {
  id: string;
  name: string;
  occupancy: number;
  capacity: number;
  temperature: number;
  status: RoomStatus;
  devices: Device[];
  sensors: Sensor[];
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  deviceId?: string;
  sensorId?: string;
  roomId: string;
  timestamp: Date;
  status: AlertStatus;
}

export interface OccupancyData {
  current: number;
  percentage: number;
  byRoom: Record<string, number>;
  trend: number;
  peakTime: string;
}

export interface EnergyData {
  currentUsage: number;
  dailyConsumption: number;
  weeklyConsumption: number;
  deviceWise: Record<string, number>;
  peakUsage: number;
  efficiency: number;
}

export interface EnvironmentData {
  temperature: number;
  humidity: number;
  lightIntensity: number;
  airQuality: number;
  smokeLevel: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
  lastTriggered?: Date;
}

export interface KPIMetric {
  label: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface SystemHealth {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  sensorHealth: number;
  networkHealth: number;
  lastSync: Date;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  deviceId?: string;
  roomId?: string;
}
