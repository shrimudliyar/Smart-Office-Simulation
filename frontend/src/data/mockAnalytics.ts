import type { OccupancyData, EnergyData, EnvironmentData, TimeSeriesData, AutomationRule, KPIMetric, SystemHealth, Activity } from '../types';

export const mockOccupancyData: OccupancyData = {
  current: 16,
  percentage: 64,
  byRoom: {
    'room-1': 2,
    'room-2': 8,
    'room-3': 4,
    'room-4': 1,
    'room-5': 0,
    'room-6': 1,
  },
  trend: 5,
  peakTime: '14:00',
};

export const mockEnergyData: EnergyData = {
  currentUsage: 2.4,
  dailyConsumption: 18.5,
  weeklyConsumption: 125.0,
  deviceWise: {
    'device-1': 0.2,
    'device-2': 0.3,
    'device-3': 0.4,
    'device-4': 0.4,
    'device-5': 1.2,
    'device-7': 0.3,
    'device-8': 1.0,
    'device-10': 0.3,
    'device-11': 0.9,
    'device-12': 1.5,
    'device-15': 0.2,
    'device-16': 0.3,
  },
  peakUsage: 3.2,
  efficiency: 85,
};

export const mockEnvironmentData: EnvironmentData = {
  temperature: 24.5,
  humidity: 52,
  lightIntensity: 420,
  airQuality: 85,
  smokeLevel: 10,
};

export const generateTimeSeriesData = (hours: number, baseValue: number, variance: number): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    const value = baseValue + (Math.random() - 0.5) * variance;
    data.push({ timestamp, value });
  }
  
  return data;
};

export const mockTemperatureHistory = generateTimeSeriesData(24, 24.5, 3);
export const mockHumidityHistory = generateTimeSeriesData(24, 52, 10);
export const mockLightHistory = generateTimeSeriesData(24, 420, 150);
export const mockSmokeHistory = generateTimeSeriesData(24, 10, 5);

export const mockAutomationRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Auto AC Control',
    condition: 'IF temperature > 28°C',
    action: 'THEN AC/Fan ON',
    enabled: true,
    lastTriggered: new Date(Date.now() - 7200000),
  },
  {
    id: 'rule-2',
    name: 'Vacancy Light Control',
    condition: 'IF occupancy = 0 for 10 minutes',
    action: 'THEN lights OFF',
    enabled: true,
    lastTriggered: new Date(Date.now() - 1800000),
  },
  {
    id: 'rule-3',
    name: 'Smoke Alarm',
    condition: 'IF smoke level > threshold',
    action: 'THEN alarm ON',
    enabled: true,
  },
  {
    id: 'rule-4',
    name: 'Occupancy Light Control',
    condition: 'IF room occupied AND light level is low',
    action: 'THEN lights ON',
    enabled: true,
    lastTriggered: new Date(Date.now() - 300000),
  },
];

export const mockKPIMetrics: KPIMetric[] = [
  {
    label: 'Temperature',
    value: 24.5,
    unit: '°C',
    status: 'normal',
    trend: 0.3,
    trendDirection: 'up',
  },
  {
    label: 'Humidity',
    value: 52,
    unit: '%',
    status: 'normal',
    trend: -2,
    trendDirection: 'down',
  },
  {
    label: 'Occupancy',
    value: 16,
    unit: 'people',
    status: 'normal',
    trend: 5,
    trendDirection: 'up',
  },
  {
    label: 'Energy',
    value: 2.4,
    unit: 'kW',
    status: 'normal',
    trend: 0.1,
    trendDirection: 'up',
  },
  {
    label: 'Active Devices',
    value: 14,
    unit: '/ 17',
    status: 'normal',
    trend: 0,
    trendDirection: 'stable',
  },
  {
    label: 'System Health',
    value: 98,
    unit: '%',
    status: 'normal',
    trend: 0,
    trendDirection: 'stable',
  },
];

export const mockSystemHealth: SystemHealth = {
  totalDevices: 17,
  onlineDevices: 17,
  offlineDevices: 0,
  sensorHealth: 100,
  networkHealth: 98,
  lastSync: new Date(),
};

export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    type: 'motion',
    message: 'Motion detected in Reception',
    timestamp: new Date(Date.now() - 120000),
    sensorId: 'sensor-3',
    roomId: 'room-1',
  },
  {
    id: 'activity-2',
    type: 'device',
    message: 'Workspace Light 1 switched ON',
    timestamp: new Date(Date.now() - 300000),
    deviceId: 'device-3',
    roomId: 'room-2',
  },
  {
    id: 'activity-3',
    type: 'threshold',
    message: 'Temperature threshold crossed in Pantry',
    timestamp: new Date(Date.now() - 600000),
    sensorId: 'sensor-15',
    roomId: 'room-6',
  },
  {
    id: 'activity-4',
    type: 'device',
    message: 'Meeting Room door opened',
    timestamp: new Date(Date.now() - 900000),
    deviceId: 'device-9',
    roomId: 'room-3',
  },
  {
    id: 'activity-5',
    type: 'connection',
    message: 'Server Room Alarm connected',
    timestamp: new Date(Date.now() - 1200000),
    deviceId: 'device-14',
    roomId: 'room-5',
  },
  {
    id: 'activity-6',
    type: 'alert',
    message: 'Alert resolved: Motion in Reception',
    timestamp: new Date(Date.now() - 1800000),
    roomId: 'room-1',
  },
];
