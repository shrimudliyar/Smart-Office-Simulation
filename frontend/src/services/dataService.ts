import type { Sensor, Device, Room, Alert, OccupancyData, EnergyData, EnvironmentData, TimeSeriesData, AutomationRule, KPIMetric, SystemHealth, Activity } from '../types';

export interface IDataService {
  // Sensors
  getSensors(): Sensor[];
  getSensorById(id: string): Sensor | undefined;
  getSensorsByRoom(roomId: string): Sensor[];

  // Devices
  getDevices(): Device[];
  getDeviceById(id: string): Device | undefined;
  getDevicesByRoom(roomId: string): Device[];
  updateDeviceState(id: string, state: 'on' | 'off'): Promise<void>;

  // Rooms
  getRooms(): Room[];
  getRoomById(id: string): Room | undefined;

  // Alerts
  getAlerts(): Alert[];
  getAlertById(id: string): Alert | undefined;
  resolveAlert(id: string): Promise<void>;

  // Analytics
  getOccupancyData(): OccupancyData;
  getEnergyData(): EnergyData;
  getEnvironmentData(): EnvironmentData;
  getTemperatureHistory(): TimeSeriesData[];
  getHumidityHistory(): TimeSeriesData[];
  getLightHistory(): TimeSeriesData[];
  getSmokeHistory(): TimeSeriesData[];

  // KPIs
  getKPIMetrics(): KPIMetric[];

  // Automation
  getAutomationRules(): AutomationRule[];
  toggleAutomationRule(id: string, enabled: boolean): Promise<void>;

  // System Health
  getSystemHealth(): SystemHealth;

  // Activities
  getActivities(): Activity[];

  // Real-time updates
  subscribeToUpdates(callback: () => void): () => void;
}

export type { IDataService };
