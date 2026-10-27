import { useEffect, useState } from 'react';
import type { Room, Sensor, Device, Alert } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Users,
  Thermometer,
  Activity,
  AlertTriangle,
  X,
} from 'lucide-react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { useDataService } from '../../hooks/useDataService';


interface RoomDetailsProps {
  room: Room | null;
  sensors: Sensor[];
  devices: Device[];
  alerts: Alert[];
  onClose: () => void;
  compact?: boolean;
}


interface SensorHistoryPoint {
  time: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  light: number;
  smoke: number;
}


export function RoomDetails({
  room,
  sensors,
  devices,
  alerts,
  onClose,
  compact = false,
}: RoomDetailsProps) {

  const dataService = useDataService();

  const [sensorHistory, setSensorHistory] = useState<SensorHistoryPoint[]>([]);

  const selectedRoomId = room?.id ?? '';


  /*
   * Collect live sensor readings for Open Workspace.
   */
  useEffect(() => {

    if (selectedRoomId !== 'room-2') {
      return;
    }

    const liveRoom = dataService.getRoomById(selectedRoomId);

    if (!liveRoom) {
      return;
    }

    const liveSensors =
      dataService.getSensorsByRoom(selectedRoomId);

    const temperatureSensor =
      liveSensors.find(
        sensor => sensor.type === 'temperature'
      );

    const humiditySensor =
      liveSensors.find(
        sensor => sensor.type === 'humidity'
      );

    const lightSensor =
      liveSensors.find(
        sensor => sensor.type === 'light'
      );

    const smokeSensor =
      liveSensors.find(
        sensor => sensor.type === 'smoke'
      );

    if (
      !temperatureSensor ||
      !humiditySensor ||
      !lightSensor ||
      !smokeSensor
    ) {
      return;
    }

    const now = new Date();

    const newReading: SensorHistoryPoint = {

      time: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),

      timestamp: now.getTime(),

      temperature: temperatureSensor.value,

      humidity: humiditySensor.value,

      light: lightSensor.value,

      smoke: smokeSensor.value,
    };


    setSensorHistory(previousHistory => {

      const previousReading =
        previousHistory[
          previousHistory.length - 1
        ];

      /*
       * Prevent duplicate readings.
       */
      if (
        previousReading &&
        previousReading.temperature === newReading.temperature &&
        previousReading.humidity === newReading.humidity &&
        previousReading.light === newReading.light &&
        previousReading.smoke === newReading.smoke
      ) {
        return previousHistory;
      }

      /*
       * Keep latest 20 readings.
       */
      return [
        ...previousHistory,
        newReading,
      ].slice(-20);

    });

  }, [
    selectedRoomId,
    dataService,
    sensors,
    devices,
  ]);


  if (!room) {
    return null;
  }


  /*
   * Get latest room data.
   */
  const liveRoom =
    dataService.getRoomById(room.id) ?? room;


  /*
   * Use live sensors/devices for Open Workspace.
   */
  const roomSensors =
    liveRoom.id === 'room-2'
      ? dataService.getSensorsByRoom(liveRoom.id)
      : sensors.filter(
          sensor => sensor.roomId === liveRoom.id
        );


  const roomDevices =
    liveRoom.id === 'room-2'
      ? dataService.getDevicesByRoom(liveRoom.id)
      : devices.filter(
          device => device.roomId === liveRoom.id
        );

  const displayDevices = compact
    ? roomDevices.filter((device, index, items) =>
        ['light', 'fan', 'ac', 'alarm'].includes(device.type) &&
        items.findIndex(item => item.type === device.type) === index
      )
    : roomDevices;


  const roomAlerts =
    dataService
      .getAlerts()
      .filter(
        alert =>
          alert.roomId === liveRoom.id &&
          alert.status === 'active' &&
          (!compact || alert.id === 'live-workspace-smoke-alert')
      );


  const handleToggleDevice = async (
    deviceId: string,
    currentState: 'on' | 'off'
  ) => {

    const newState =
      currentState === 'on'
        ? 'off'
        : 'on';

    await dataService.updateDeviceState(
      deviceId,
      newState
    );

  };


  const isControllable = (
    device: Device
  ) => {

    return [
      'light',
      'fan',
      'ac',
      'door',
      'alarm',
    ].includes(device.type);

  };


  return (

    <AnimatePresence>

      <motion.div
        initial={{
          opacity: 0,
          x: 300,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        exit={{
          opacity: 0,
          x: 300,
        }}

        /*
         * IMPORTANT LAYOUT CHANGE:
         * Old version used: w-80
         *
         * New version fills the wider column provided
         * by OfficeFloorMap.
         */
        className="w-full min-w-0 bg-surface border border-gray-800 rounded-lg p-3 sm:p-5 overflow-hidden"
      >


        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex items-center justify-between mb-4">

          <div>

            {compact && <p className="text-sm font-medium text-gray-400 mb-1">Smart Office Automation</p>}
            <h2 className="text-xl font-bold text-white">
              {liveRoom.name}
            </h2>

            {!compact && liveRoom.id === 'room-2' && (

              <div className="flex items-center gap-2 mt-1">

                <span className="w-2 h-2 rounded-full bg-green-400" />

                <span className="text-xs text-green-400 font-medium">
                  LIVE COOJA DATA
                </span>

              </div>

            )}

          </div>


          {!compact && <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >

            <X size={20} />

          </button>}

        </div>



        <div className={compact ? 'flex flex-col gap-4' : 'space-y-6'}>


          {/* ================================= */}
          {/* ROOM STATS */}
          {/* ================================= */}

          <div className={compact ? 'order-2 grid grid-cols-1 gap-3' : 'grid grid-cols-2 gap-4'}>


            {/* Occupancy */}

            <div className="bg-surfaceLight rounded-lg p-3">

              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">

                <Users size={14} />

                <span>
                  Occupancy
                </span>

              </div>

              <div className="text-2xl font-bold text-white">

                {liveRoom.id === 'room-2'
                  ? (liveRoom.occupancy > 0 ? 'Occupied' : 'Vacant')
                  : <>{liveRoom.occupancy}/{liveRoom.capacity}</>}

              </div>

            </div>



            {/* Temperature */}

            {!compact && <div className="bg-surfaceLight rounded-lg p-3">

              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">

                <Thermometer size={14} />

                <span>
                  Temperature
                </span>

              </div>

              <div className="text-2xl font-bold text-white">

                {liveRoom.temperature.toFixed(1)}°C

              </div>

            </div>}

          </div>



          {/* ================================= */}
          {/* ROOM STATUS */}
          {/* ================================= */}

          {!compact && <div className="bg-surfaceLight rounded-lg p-4">

            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">

              <Activity size={16} />

              <span>
                Status
              </span>

            </div>

            <div
              className={`text-sm font-medium ${
                liveRoom.status === 'occupied'
                  ? 'text-green-400'
                  : liveRoom.status === 'vacant'
                  ? 'text-gray-400'
                  : 'text-yellow-400'
              }`}
            >

              {liveRoom.status.charAt(0).toUpperCase() +
                liveRoom.status.slice(1)}

            </div>

          </div>}



          {/* ================================= */}
          {/* LIVE SENSORS */}
          {/* ================================= */}

          {roomSensors.length > 0 && (

            <div className={compact ? 'order-1' : undefined}>

              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                {compact ? 'Sensor readings' : 'Live Sensors'}
              </h3>

              <div className={compact ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3' : 'grid grid-cols-1 2xl:grid-cols-2 gap-2'}>

                {roomSensors.map(sensor => (

                  <div
                    key={sensor.id}
                    className="bg-surfaceLight rounded-lg p-3 flex justify-between items-center"
                  >

                    <div className="min-w-0 pr-2">

                      <div className="text-sm text-white truncate">
                        {compact ? ({ temperature: 'Temperature', humidity: 'Humidity', light: 'Light intensity', smoke: 'Simulated smoke level', motion: 'Motion' }[sensor.type]) : sensor.name}
                      </div>

                      <div className="text-xs text-gray-400 capitalize">
                        {sensor.type}
                      </div>

                    </div>


                    <div className="text-right shrink-0">

                      <div className="text-lg font-semibold text-white">

                        {sensor.value.toFixed(1)}
                        {compact && sensor.type === 'smoke' ? '' : sensor.unit}

                      </div>

                      {!compact && <div
                        className={`text-xs ${
                          sensor.status === 'online'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >

                        {sensor.status}

                      </div>}

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* ================================= */}
          {/* LIVE SENSOR HISTORY */}
          {/* ================================= */}

          {liveRoom.id === 'room-2' && (

            <div className={compact ? 'order-4 min-w-0' : undefined}>

              <div className="flex items-center justify-between mb-3">

                <h3 className="text-sm font-semibold text-gray-400">
                  {compact ? 'Recent readings — this browser session' : 'Live Sensor History'}
                </h3>


                {!compact && <div className="flex items-center gap-1">

                  <span className="w-2 h-2 rounded-full bg-green-400" />

                  <span className="text-xs text-green-400">
                    LIVE
                  </span>

                </div>}

              </div>


              <div className="bg-surfaceLight rounded-lg p-3">

                <div className="text-xs text-gray-400 mb-3">
                  {compact ? 'Latest 20 readings collected while this panel is open.' : 'Real-time sensor readings from Cooja'}
                </div>


                {sensorHistory.length < 2 ? (

                  <div className="h-40 sm:h-52 flex items-center justify-center">

                    <div className="text-center">

                      <Activity
                        size={28}
                        className="mx-auto mb-2 text-green-400"
                      />

                      <div className="text-sm text-gray-300">
                        Collecting live data...
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        Waiting for sensor readings
                      </div>

                    </div>

                  </div>

                ) : (

                  <>

                    <div
                      style={{
                        width: '100%',
                        height: compact ? 220 : 280,
                      }}
                    >

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <LineChart
                          data={sensorHistory}
                          margin={{
                            top: 10,
                            right: 10,
                            left: -15,
                            bottom: 5,
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#4b5563"
                            opacity={0.25}
                          />


                          <XAxis
                            dataKey="time"
                            tick={{
                              fontSize: 8,
                              fill: '#9ca3af',
                            }}
                            tickLine={false}
                            axisLine={{
                              stroke: '#4b5563',
                            }}
                            interval="preserveStartEnd"
                          />


                          <YAxis
                            tick={{
                              fontSize: 8,
                              fill: '#9ca3af',
                            }}
                            tickLine={false}
                            axisLine={{
                              stroke: '#4b5563',
                            }}
                          />


                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#111827',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              fontSize: '11px',
                            }}
                          />


                          <Legend
                            wrapperStyle={{
                              fontSize: '9px',
                            }}
                          />


                          <Line
                            type="monotone"
                            dataKey="temperature"
                            name="Temp °C"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                              r: 4,
                            }}
                            isAnimationActive={false}
                          />


                          <Line
                            type="monotone"
                            dataKey="humidity"
                            name="Humidity %"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                              r: 4,
                            }}
                            isAnimationActive={false}
                          />


                          <Line
                            type="monotone"
                            dataKey="light"
                            name="Light lux"
                            stroke="#eab308"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                              r: 4,
                            }}
                            isAnimationActive={false}
                          />


                          <Line
                            type="monotone"
                            dataKey="smoke"
                            name="Smoke"
                            stroke="#a855f7"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                              r: 4,
                            }}
                            isAnimationActive={false}
                          />

                        </LineChart>

                      </ResponsiveContainer>

                    </div>


                    <div className="text-center text-xs text-gray-500 mt-3">

                      Latest {sensorHistory.length} sensor readings

                    </div>

                  </>

                )}

              </div>

            </div>

          )}



          {/* ================================= */}
          {/* CURRENT ENVIRONMENT */}
          {/* ================================= */}

          {!compact && liveRoom.id === 'room-2' &&
            sensorHistory.length > 0 && (

              <div>

                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Current Environment
                </h3>


                <div className="grid grid-cols-2 gap-2">

                  <div className="bg-surfaceLight rounded-lg p-3">

                    <div className="text-xs text-gray-400">
                      Temperature
                    </div>

                    <div className="text-lg font-bold text-white mt-1">

                      {
                        sensorHistory[
                          sensorHistory.length - 1
                        ].temperature
                      }°C

                    </div>

                  </div>


                  <div className="bg-surfaceLight rounded-lg p-3">

                    <div className="text-xs text-gray-400">
                      Humidity
                    </div>

                    <div className="text-lg font-bold text-white mt-1">

                      {
                        sensorHistory[
                          sensorHistory.length - 1
                        ].humidity
                      }%

                    </div>

                  </div>


                  <div className="bg-surfaceLight rounded-lg p-3">

                    <div className="text-xs text-gray-400">
                      Light
                    </div>

                    <div className="text-lg font-bold text-white mt-1">

                      {
                        sensorHistory[
                          sensorHistory.length - 1
                        ].light
                      } lux

                    </div>

                  </div>


                  <div className="bg-surfaceLight rounded-lg p-3">

                    <div className="text-xs text-gray-400">
                      Smoke
                    </div>

                    <div
                      className={`text-lg font-bold mt-1 ${
                        sensorHistory[
                          sensorHistory.length - 1
                        ].smoke > 15
                          ? 'text-red-400'
                          : 'text-white'
                      }`}
                    >

                      {
                        sensorHistory[
                          sensorHistory.length - 1
                        ].smoke
                      }

                    </div>

                  </div>

                </div>

              </div>

            )}



          {/* ================================= */}
          {/* AUTOMATED DEVICES */}
          {/* ================================= */}

          {displayDevices.length > 0 && (

            <div className={compact ? 'order-3' : undefined}>

              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                {compact ? 'Automatic device status' : 'Automated Devices'}
              </h3>


              <div className={compact ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3' : 'grid grid-cols-1 2xl:grid-cols-2 gap-2'}>

                {displayDevices.map(device => (

                  <div
                    key={device.id}
                    className="bg-surfaceLight rounded-lg p-3 flex justify-between items-center"
                  >

                    <div className="flex-1 min-w-0 pr-2">

                      <div className="text-sm text-white truncate">
                        {compact ? ({ light: 'Light', fan: 'Fan', ac: 'AC', alarm: 'Smoke Alarm', door: 'Door' }[device.type]) : device.name}
                      </div>

                      <div className="text-xs text-gray-400 capitalize">
                        {device.type}
                      </div>

                    </div>


                    <div className="flex items-center gap-3 shrink-0">

                      {!compact && isControllable(device) &&
                        device.status === 'online' && (

                          <button
                            onClick={() =>
                              handleToggleDevice(
                                device.id,
                                device.state
                              )
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              device.state === 'on'
                                ? 'bg-green-600'
                                : 'bg-gray-600'
                            }`}
                          >

                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                device.state === 'on'
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />

                          </button>

                        )}


                      <div
                        className={`w-2 h-2 rounded-full ${
                          device.state === 'on'
                            ? 'bg-green-400'
                            : 'bg-gray-500'
                        }`}
                      />


                      <div
                        className={`text-xs font-medium ${
                          (compact ? device.state === 'on' : device.status === 'online')
                            ? 'text-green-400'
                            : compact ? 'text-gray-400' : 'text-red-400'
                        }`}
                      >

                        {compact ? device.state.toUpperCase() : device.status}

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* ================================= */}
          {/* ACTIVE ALERTS */}
          {/* ================================= */}

          {roomAlerts.length > 0 && (

            <div className={compact ? 'order-5' : undefined}>

              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">

                <AlertTriangle
                  size={16}
                  className="text-yellow-400"
                />

                {compact ? 'Safety alerts' : 'Active Alerts'}

              </h3>


              <div className="space-y-2">

                {roomAlerts.map(alert => (

                  <div
                    key={alert.id}
                    className={`bg-surfaceLight rounded-lg p-3 border-l-4 ${
                      alert.severity === 'critical'
                        ? 'border-red-500'
                        : alert.severity === 'warning'
                        ? 'border-yellow-500'
                        : 'border-blue-500'
                    }`}
                  >

                    <div className="flex items-start gap-2">

                      <AlertTriangle
                        size={16}
                        className={
                          alert.severity === 'critical'
                            ? 'text-red-400 mt-0.5'
                            : 'text-yellow-400 mt-0.5'
                        }
                      />


                      <div>

                        <div className="text-sm text-white">
                          {alert.message}
                        </div>

                        <div className="text-xs text-gray-400 mt-1 capitalize">
                          {alert.severity}
                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* ================================= */}
          {/* AUTOMATION RULES */}
          {/* ================================= */}

          {!compact && liveRoom.id === 'room-2' && (

            <div>

              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Automation Rules
              </h3>


              <div className="bg-surfaceLight rounded-lg p-3 space-y-2">

                <div className="text-xs text-gray-300">

                  Motion + Light &lt; 300

                  <span className="text-green-400">
                    {' '}→ Light ON
                  </span>

                </div>


                <div className="text-xs text-gray-300">

                  Motion + Temp &gt; 28°C

                  <span className="text-green-400">
                    {' '}→ Fan ON
                  </span>

                </div>


                <div className="text-xs text-gray-300">

                  Motion + Temp &gt; 32°C

                  <span className="text-green-400">
                    {' '}→ AC ON
                  </span>

                </div>


                <div className="text-xs text-gray-300">

                  Smoke &gt; 15

                  <span className="text-red-400">
                    {' '}→ Alarm ON
                  </span>

                </div>

              </div>

            </div>

          )}


        </div>

      </motion.div>

    </AnimatePresence>

  );

}
