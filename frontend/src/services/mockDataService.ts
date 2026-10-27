import { type IDataService } from './dataService';
import type { Sensor, Device, Room, Alert, OccupancyData, EnergyData, EnvironmentData, TimeSeriesData, AutomationRule, KPIMetric, SystemHealth, Activity } from '../types';
import { mockRooms } from '../data/mockRooms';
import { mockSensors } from '../data/mockSensors';
import { mockDevices } from '../data/mockDevices';
import { mockAlerts } from '../data/mockAlerts';
import {
  mockOccupancyData,
  mockEnergyData,
  mockEnvironmentData,
  mockTemperatureHistory,
  mockHumidityHistory,
  mockLightHistory,
  mockSmokeHistory,
  mockAutomationRules,
  mockKPIMetrics,
  mockSystemHealth,
  mockActivities,
  generateTimeSeriesData,
} from '../data/mockAnalytics';

class MockDataService implements IDataService {
  private sensors: Sensor[] = [...mockSensors];
  private devices: Device[] = [...mockDevices];
  private rooms: Room[] = [...mockRooms];
  private alerts: Alert[] = [...mockAlerts];
  private automationRules: AutomationRule[] = [...mockAutomationRules];
  private activities: Activity[] = [...mockActivities];
  private temperatureHistory: TimeSeriesData[] = [...mockTemperatureHistory];
  private humidityHistory: TimeSeriesData[] = [...mockHumidityHistory];
  private lightHistory: TimeSeriesData[] = [...mockLightHistory];
  private smokeHistory: TimeSeriesData[] = [...mockSmokeHistory];
  private updateCallbacks: Set<() => void> = new Set();
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    this.simulationInterval = setInterval(() => {
      this.simulateDataUpdates();
      this.notifySubscribers();
    }, 3000);
  }

  private simulateDataUpdates() {
    const now = new Date();
    const hour = now.getHours();

    // Time-based simulation patterns
    const isWorkingHours = hour >= 8 && hour <= 18;
    const isLunchTime = hour >= 12 && hour <= 13;
    const isMorning = hour >= 8 && hour <= 11;
    const isEvening = hour >= 17 && hour <= 18;

    // Update sensor values with realistic variations
    this.sensors = this.sensors.map(sensor => {
      let newValue = sensor.value;
      let variation = 0;

      if (sensor.type === 'temperature') {
        // Temperature varies by time of day
        if (isMorning) {
          variation = 0.2; // Warming up
        } else if (isLunchTime) {
          variation = 0.1; // Stable
        } else if (isEvening) {
          variation = -0.1; // Cooling down
        } else {
          variation = (Math.random() - 0.5) * 0.3; // Random small changes
        }
        newValue = sensor.value + variation;
      } else if (sensor.type === 'humidity') {
        variation = (Math.random() - 0.5) * 1.5;
        newValue = sensor.value + variation;
      } else if (sensor.type === 'light') {
        // Light varies significantly based on time
        if (isWorkingHours) {
          variation = (Math.random() - 0.5) * 30;
        } else {
          variation = (Math.random() - 0.5) * 10;
        }
        newValue = Math.max(0, sensor.value + variation);
      } else if (sensor.type === 'smoke') {
        variation = (Math.random() - 0.5) * 1;
        newValue = Math.max(0, sensor.value + variation);
      } else if (sensor.type === 'motion') {
        // Motion detection based on time
        if (isWorkingHours && !isLunchTime) {
          newValue = Math.random() > 0.3 ? 1 : 0; // More activity during work hours
        } else {
          newValue = Math.random() > 0.8 ? 1 : 0; // Less activity outside work hours
        }
      }

      return {
        ...sensor,
        value: Math.round(newValue * 10) / 10,
        lastUpdate: now,
      };
    });

    // Update room temperatures based on sensors
    this.rooms = this.rooms.map(room => {
      const tempSensor = this.sensors.find(s => s.roomId === room.id && s.type === 'temperature');
      const motionSensor = this.sensors.find(s => s.roomId === room.id && s.type === 'motion');

      // Update occupancy based on motion
      let newOccupancy = room.occupancy;
      if (motionSensor && motionSensor.value === 1 && room.occupancy === 0) {
        newOccupancy = Math.min(room.capacity, Math.floor(Math.random() * 3) + 1);
      } else if (motionSensor && motionSensor.value === 0 && Math.random() > 0.7) {
        newOccupancy = Math.max(0, room.occupancy - 1);
      }

      return {
        ...room,
        temperature: tempSensor?.value || room.temperature,
        occupancy: newOccupancy,
        status: newOccupancy > 0 ? 'occupied' : 'vacant',
      };
    });

    // Update time series data with realistic patterns
    const tempBase = isWorkingHours ? 25 : 22;
    const tempVariance = isWorkingHours ? 2 : 1;
    this.temperatureHistory = generateTimeSeriesData(24, tempBase, tempVariance);

    const lightBase = isWorkingHours ? 450 : 100;
    const lightVariance = isWorkingHours ? 100 : 50;
    this.lightHistory = generateTimeSeriesData(24, lightBase, lightVariance);

    this.humidityHistory = generateTimeSeriesData(24, 52, 10);
    this.smokeHistory = generateTimeSeriesData(24, 10, 5);

    // Update system health
    mockSystemHealth.lastSync = now;

    // Randomly trigger automation rules occasionally
    if (Math.random() > 0.95) {
      const enabledRules = this.automationRules.filter(r => r.enabled);
      if (enabledRules.length > 0) {
        const randomRule = enabledRules[Math.floor(Math.random() * enabledRules.length)];
        randomRule.lastTriggered = now;
      }
    }
  }

  private notifySubscribers() {
    this.updateCallbacks.forEach(callback => callback());
  }

  // Sensors
  getSensors(): Sensor[] {
    return this.sensors;
  }

  getSensorById(id: string): Sensor | undefined {
    return this.sensors.find(s => s.id === id);
  }

  getSensorsByRoom(roomId: string): Sensor[] {
    return this.sensors.filter(s => s.roomId === roomId);
  }

  // Devices
  getDevices(): Device[] {
    return this.devices;
  }

  getDeviceById(id: string): Device | undefined {
    return this.devices.find(d => d.id === id);
  }

  getDevicesByRoom(roomId: string): Device[] {
    return this.devices.filter(d => d.roomId === roomId);
  }

  async updateDeviceState(id: string, state: 'on' | 'off'): Promise<void> {
    const device = this.devices.find(d => d.id === id);
    if (device) {
      const oldState = device.state;
      device.state = state;
      device.lastUpdate = new Date();

      // Add activity
      this.activities.unshift({
        id: `activity-${Date.now()}`,
        type: 'device',
        message: `${device.name} switched ${state.toUpperCase()}`,
        timestamp: new Date(),
        deviceId: device.id,
        roomId: device.roomId,
      });

      // Keep only last 20 activities
      if (this.activities.length > 20) {
        this.activities = this.activities.slice(0, 20);
      }

      this.notifySubscribers();
    }
  }

  // Rooms
  getRooms(): Room[] {
    return this.rooms;
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.find(r => r.id === id);
  }

  // Alerts
  getAlerts(): Alert[] {
    return this.alerts;
  }

  getAlertById(id: string): Alert | undefined {
    return this.alerts.find(a => a.id === id);
  }

  async resolveAlert(id: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'resolved';

      // Add activity
      this.activities.unshift({
        id: `activity-${Date.now()}`,
        type: 'alert',
        message: `Alert resolved: ${alert.message}`,
        timestamp: new Date(),
        roomId: alert.roomId,
        deviceId: alert.deviceId,
      });

      // Keep only last 20 activities
      if (this.activities.length > 20) {
        this.activities = this.activities.slice(0, 20);
      }

      this.notifySubscribers();
    }
  }

  // Analytics
  getOccupancyData(): OccupancyData {
    return mockOccupancyData;
  }

  getEnergyData(): EnergyData {
    return mockEnergyData;
  }

  getEnvironmentData(): EnvironmentData {
    return mockEnvironmentData;
  }

  getTemperatureHistory(): TimeSeriesData[] {
    return this.temperatureHistory;
  }

  getHumidityHistory(): TimeSeriesData[] {
    return this.humidityHistory;
  }

  getLightHistory(): TimeSeriesData[] {
    return this.lightHistory;
  }

  getSmokeHistory(): TimeSeriesData[] {
    return this.smokeHistory;
  }

  // KPIs
  getKPIMetrics(): KPIMetric[] {
    return mockKPIMetrics;
  }

  // Automation
  getAutomationRules(): AutomationRule[] {
    return this.automationRules;
  }

  async toggleAutomationRule(id: string, enabled: boolean): Promise<void> {
    const rule = this.automationRules.find(r => r.id === id);
    if (rule) {
      rule.enabled = enabled;
      this.notifySubscribers();
    }
  }

  // System Health
  getSystemHealth(): SystemHealth {
    return mockSystemHealth;
  }

  // Activities
  getActivities(): Activity[] {
    return this.activities;
  }

  // Real-time updates
  subscribeToUpdates(callback: () => void): () => void {
    this.updateCallbacks.add(callback);
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  destroy() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }
}

// Singleton instance
export const mockDataService = new MockDataService();
