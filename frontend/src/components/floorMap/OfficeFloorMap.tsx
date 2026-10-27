import { useState } from 'react';
import type { Room as RoomType, Sensor, Device, Alert } from '../../types';
import { Room } from './Room';
import { RoomDetails } from './RoomDetails';

interface OfficeFloorMapProps {
  rooms: RoomType[];
  sensors: Sensor[];
  devices: Device[];
  alerts: Alert[];
}

export function OfficeFloorMap({
  rooms: allRooms,
  sensors,
  devices,
  alerts,
}: OfficeFloorMapProps) {
  const rooms = allRooms.filter(room => room.id === 'room-2');
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);

  const workspace = rooms[0];
  if (workspace) {
    return (
      <RoomDetails
        room={workspace}
        sensors={sensors}
        devices={devices}
        alerts={alerts}
        onClose={() => setSelectedRoom(null)}
        compact
      />
    );
  }

  const floorPlan = {
    topRow: ['room-1', 'room-2', 'room-3'],
    middleRow: ['room-4', 'room-5'],
    bottomRow: ['room-6'],
  };

  const getRoomSpan = (roomId: string) => {
    if (roomId === 'room-2') return 'col-span-2';
    if (roomId === 'room-5') return 'col-span-2';
    return 'col-span-1';
  };

  return (
    <div className="bg-surface rounded-lg border border-gray-800 p-5">

      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white mb-1">
          Office Floor Map
        </h2>

        <p className="text-gray-400 text-sm">
          Real-time Smart Office monitoring and automation
        </p>
      </div>

      {/* Main Layout */}
      <div
        className={`grid gap-5 items-start ${
          selectedRoom
            ? 'grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.85fr)]'
            : 'grid-cols-1'
        }`}
      >

        {/* ===================================== */}
        {/* FLOOR PLAN */}
        {/* ===================================== */}

        <div className="min-w-0">

          <div className="bg-background rounded-lg p-5 border border-gray-800">

            <div className="flex items-center justify-between mb-4">

              <div>
                <h3 className="text-sm font-semibold text-white">
                  Office Layout
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Select a room to view monitoring details
                </p>
              </div>

              {selectedRoom && (
                <div className="text-xs text-gray-400">
                  Selected:{' '}
                  <span className="text-blue-400 font-medium">
                    {selectedRoom.name}
                  </span>
                </div>
              )}

            </div>


            {/* Rooms */}

            <div className="grid grid-cols-3 gap-3">

              {/* Top Row */}
              {floorPlan.topRow.map(roomId => {
                const room = rooms.find(r => r.id === roomId);

                if (!room) return null;

                return (
                  <div
                    key={roomId}
                    className={getRoomSpan(roomId)}
                  >
                    <Room
                      room={room}
                      isSelected={selectedRoom?.id === roomId}
                      onClick={() => setSelectedRoom(room)}
                    />
                  </div>
                );
              })}


              {/* Middle Row */}
              {floorPlan.middleRow.map(roomId => {
                const room = rooms.find(r => r.id === roomId);

                if (!room) return null;

                return (
                  <div
                    key={roomId}
                    className={getRoomSpan(roomId)}
                  >
                    <Room
                      room={room}
                      isSelected={selectedRoom?.id === roomId}
                      onClick={() => setSelectedRoom(room)}
                    />
                  </div>
                );
              })}


              {/* Bottom Row */}
              {floorPlan.bottomRow.map(roomId => {
                const room = rooms.find(r => r.id === roomId);

                if (!room) return null;

                return (
                  <div
                    key={roomId}
                    className={`${getRoomSpan(roomId)} col-start-2`}
                  >
                    <Room
                      room={room}
                      isSelected={selectedRoom?.id === roomId}
                      onClick={() => setSelectedRoom(room)}
                    />
                  </div>
                );
              })}

            </div>


            {/* Legend */}

            <div className="mt-5 pt-4 border-t border-gray-800 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-400">

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-900/30 border border-blue-700 rounded" />
                <span>Occupied</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-700/50 border border-gray-600 rounded" />
                <span>Vacant</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-900/30 border border-green-700 rounded" />
                <span>Full Capacity</span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Live IoE Monitoring</span>
              </div>

            </div>

          </div>

        </div>


        {/* ===================================== */}
        {/* ROOM DETAILS */}
        {/* ===================================== */}

        {selectedRoom && (

          <div className="min-w-0">

            <RoomDetails
              room={selectedRoom}
              sensors={sensors}
              devices={devices}
              alerts={alerts}
              onClose={() => setSelectedRoom(null)}
            />

          </div>

        )}

      </div>

    </div>
  );
}
