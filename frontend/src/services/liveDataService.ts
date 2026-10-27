import type { IDataService } from './dataService';
import { mockDataService } from './mockDataService';
import type { Sensor, Device, Room, Alert } from '../types';

type OfficeUpdate = {
  roomId: string;
  roomName: string;

  temperature: number;
  humidity: number;
  light: number;
  occupancy: boolean;
  smoke: number;

  devices: {
    light: boolean;
    fan: boolean;
    ac: boolean;
    alarm: boolean;
  };

  lastUpdated: string;
};

class LiveDataService implements IDataService {

  private liveData: OfficeUpdate | null = null;

  private subscribers = new Set<() => void>();

  private socket: WebSocket | null = null;


  constructor() {
    this.connectWebSocket();
  }


  // =========================================================
  // WEBSOCKET CONNECTION
  // =========================================================

  private connectWebSocket() {

    const wsUrl =
      import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

    this.socket = new WebSocket(wsUrl);


    this.socket.onopen = () => {

      console.log(
        'Connected to Smart Office WebSocket'
      );

    };


    this.socket.onmessage = (event) => {

      try {

        const message = JSON.parse(event.data);


        if (message.type === 'OFFICE_UPDATE') {

          console.log(
            'LIVE COOJA DATA:',
            message.data
          );

          this.liveData = message.data;

          this.notifySubscribers();

        }

      } catch (error) {

        console.error(
          'Invalid Smart Office WebSocket message:',
          error
        );

      }

    };


    this.socket.onerror = (error) => {

      console.error(
        'Smart Office WebSocket error:',
        error
      );

    };


    this.socket.onclose = () => {

      console.log(
        'Smart Office WebSocket disconnected'
      );


      setTimeout(() => {

        this.connectWebSocket();

      }, 3000);

    };

  }


  private notifySubscribers() {

    this.subscribers.forEach(
      callback => callback()
    );

  }


  // =========================================================
  // SENSORS
  // =========================================================

  getSensors(): Sensor[] {

    const sensors = mockDataService.getSensors();


    if (!this.liveData) {

      return sensors;

    }


    /*
     * Update existing Open Workspace sensors
     * with live Cooja values.
     */

    const updatedSensors = sensors.map(sensor => {

      if (sensor.roomId !== 'room-2') {

        return sensor;

      }


      let value = sensor.value;


      if (sensor.type === 'temperature') {

        value = this.liveData!.temperature;

      }


      if (sensor.type === 'humidity') {

        value = this.liveData!.humidity;

      }


      if (sensor.type === 'light') {

        value = this.liveData!.light;

      }


      if (sensor.type === 'motion') {

        value = this.liveData!.occupancy ? 1 : 0;

      }


      if (sensor.type === 'smoke') {

        value = this.liveData!.smoke;

      }


      return {

        ...sensor,

        value,

        lastUpdate:
          new Date(this.liveData!.lastUpdated),

        status: 'online' as const,

      };

    });


    /*
     * Check whether Open Workspace already
     * contains a smoke sensor.
     */

    const smokeSensorExists =
      updatedSensors.some(

        sensor =>
          sensor.roomId === 'room-2' &&
          sensor.type === 'smoke'

      );


    /*
     * If the original mock data does not contain
     * an Open Workspace smoke sensor, create one.
     */

    if (!smokeSensorExists) {

      updatedSensors.push({

        id: 'sensor-room-2-smoke',

        name: 'Workspace Smoke Sensor',

        type: 'smoke',

        value: this.liveData.smoke,

        unit: '',

        status: 'online',

        lastUpdate:
          new Date(this.liveData.lastUpdated),

        roomId: 'room-2',

      });

    }


    return updatedSensors;

  }


  getSensorById(
    id: string
  ): Sensor | undefined {

    return this.getSensors().find(
      sensor => sensor.id === id
    );

  }


  getSensorsByRoom(
    roomId: string
  ): Sensor[] {

    return this.getSensors().filter(
      sensor => sensor.roomId === roomId
    );

  }


  // =========================================================
  // DEVICES
  // =========================================================

  getDevices(): Device[] {

    const devices =
      mockDataService.getDevices();


    if (!this.liveData) {

      return devices;

    }


    /*
     * Update existing Open Workspace devices.
     */

    const updatedDevices =
      devices.map(device => {

        if (device.roomId !== 'room-2') {

          return device;

        }


        let state = device.state;


        if (device.type === 'light') {

          state =
            this.liveData!.devices.light
              ? 'on'
              : 'off';

        }


        if (device.type === 'fan') {

          state =
            this.liveData!.devices.fan
              ? 'on'
              : 'off';

        }


        if (device.type === 'ac') {

          state =
            this.liveData!.devices.ac
              ? 'on'
              : 'off';

        }


        if (device.type === 'alarm') {

          state =
            this.liveData!.devices.alarm
              ? 'on'
              : 'off';

        }


        return {

          ...device,

          state,

          lastUpdate:
            new Date(this.liveData!.lastUpdated),

          status: 'online' as const,

        };

      });


    /*
     * Check if Open Workspace already has
     * an alarm device.
     */

    const alarmExists =
      updatedDevices.some(

        device =>
          device.roomId === 'room-2' &&
          device.type === 'alarm'

      );


    /*
     * Create a Smoke Alarm if the mock dashboard
     * does not already contain one.
     */

    if (!alarmExists) {

      updatedDevices.push({

        id: 'device-room-2-alarm',

        name: 'Workspace Smoke Alarm',

        type: 'alarm',

        state:
          this.liveData.devices.alarm
            ? 'on'
            : 'off',

        status: 'online',

        lastUpdate:
          new Date(this.liveData.lastUpdated),

        roomId: 'room-2',

        health: 'good',

      });

    }


    return updatedDevices;

  }


  getDeviceById(
    id: string
  ): Device | undefined {

    return this.getDevices().find(
      device => device.id === id
    );

  }


  getDevicesByRoom(
    roomId: string
  ): Device[] {

    return this.getDevices().filter(
      device => device.roomId === roomId
    );

  }


  async updateDeviceState(
    id: string,
    state: 'on' | 'off'
  ): Promise<void> {

    return mockDataService.updateDeviceState(
      id,
      state
    );

  }


  // =========================================================
  // ROOMS
  // =========================================================

  getRooms(): Room[] {

    return mockDataService
      .getRooms()
      .map(room => {


        if (
          room.id !== 'room-2' ||
          !this.liveData
        ) {

          return room;

        }


        return {

          ...room,

          temperature:
            this.liveData.temperature,

          occupancy:
            this.liveData.occupancy
              ? 1
              : 0,

          status:
            this.liveData.occupancy
              ? 'occupied'
              : 'vacant',

          sensors:
            this.getSensorsByRoom(
              room.id
            ),

          devices:
            this.getDevicesByRoom(
              room.id
            ),

        };

      });

  }


  getRoomById(
    id: string
  ): Room | undefined {

    return this.getRooms().find(
      room => room.id === id
    );

  }


  // =========================================================
  // LIVE SMOKE ALERT
  // =========================================================

  getAlerts(): Alert[] {

    const alerts =
      mockDataService.getAlerts();


    if (!this.liveData) {

      return alerts;

    }


    /*
     * Remove any previous live smoke alert.
     * This prevents duplicate alerts.
     */

    const filteredAlerts =
      alerts.filter(

        alert =>
          alert.id !==
          'live-workspace-smoke-alert'

      );


    /*
     * Cooja automation rule:
     *
     * Smoke > 15
     *      ↓
     * Alarm ON
     *      ↓
     * Dashboard alert
     */

    if (this.liveData.devices.alarm) {

      const smokeAlert: Alert = {

        id:
          'live-workspace-smoke-alert',

        severity:
          'critical',

        message:
          `Smoke detected in Open Workspace - Smoke Level: ${this.liveData.smoke}`,

        sensorId:
          'sensor-room-2-smoke',

        deviceId:
          'device-room-2-alarm',

        roomId:
          'room-2',

        timestamp:
          new Date(
            this.liveData.lastUpdated
          ),

        status:
          'active',

      };


      return [
        smokeAlert,
        ...filteredAlerts
      ];

    }


    return filteredAlerts;

  }


  getAlertById(id: string) {

    return this.getAlerts().find(
      alert => alert.id === id
    );

  }


  resolveAlert(id: string) {

    /*
     * Live Cooja smoke alerts cannot really be
     * manually resolved because Cooja determines
     * whether the alarm is active.
     */

    if (
      id ===
      'live-workspace-smoke-alert'
    ) {

      return;

    }


    return mockDataService.resolveAlert(id);

  }


  // =========================================================
  // EXISTING MOCK ANALYTICS
  // =========================================================

  getOccupancyData() {

    return mockDataService
      .getOccupancyData();

  }


  getEnergyData() {

    return mockDataService
      .getEnergyData();

  }


  getEnvironmentData() {

    return mockDataService
      .getEnvironmentData();

  }


  getTemperatureHistory() {

    return mockDataService
      .getTemperatureHistory();

  }


  getHumidityHistory() {

    return mockDataService
      .getHumidityHistory();

  }


  getLightHistory() {

    return mockDataService
      .getLightHistory();

  }


  getSmokeHistory() {

    return mockDataService
      .getSmokeHistory();

  }


  getKPIMetrics() {

    return mockDataService
      .getKPIMetrics();

  }


  getAutomationRules() {

    return mockDataService
      .getAutomationRules();

  }


  toggleAutomationRule(
    id: string,
    enabled: boolean
  ) {

    return mockDataService
      .toggleAutomationRule(
        id,
        enabled
      );

  }


  getSystemHealth() {

    return mockDataService
      .getSystemHealth();

  }


  getActivities() {

    return mockDataService
      .getActivities();

  }


  // =========================================================
  // REACT SUBSCRIPTIONS
  // =========================================================

  subscribeToUpdates(
    callback: () => void
  ): () => void {

    this.subscribers.add(callback);


    return () => {

      this.subscribers.delete(callback);

    };

  }

}


export const liveDataService =
  new LiveDataService();