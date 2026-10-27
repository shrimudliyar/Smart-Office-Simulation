import type { Room as RoomType } from '../../types';
import { motion } from 'framer-motion';
import { Users, Thermometer, Activity } from 'lucide-react';

interface RoomProps {
  room: RoomType;
  isSelected: boolean;
  onClick: () => void;
}

export function Room({ room, isSelected, onClick }: RoomProps) {
  const getOccupancyColor = () => {
    if (room.occupancy === 0) return 'bg-gray-700/50 border-gray-600';
    if (room.occupancy >= room.capacity) return 'bg-green-900/30 border-green-700';
    return 'bg-blue-900/30 border-blue-700';
  };

  const getTemperatureColor = () => {
    if (room.temperature > 28) return 'text-red-400';
    if (room.temperature < 20) return 'text-blue-400';
    return 'text-green-400';
  };

  return (
    <motion.div
      layout
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${getOccupancyColor()}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-white text-sm">{room.name}</h3>
        <div className={`flex items-center gap-1 text-xs ${room.occupancy > 0 ? 'text-green-400' : 'text-gray-400'}`}>
          <Users size={14} />
          <span>
            {room.id === 'room-2'
              ? (room.occupancy > 0 ? 'Occupied' : 'Vacant')
              : <>{room.occupancy}/{room.capacity}</>}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Thermometer size={14} className={getTemperatureColor()} />
          <span className={`text-sm font-medium ${getTemperatureColor()}`}>
            {room.temperature.toFixed(1)}°C
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Activity size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">
            {room.status === 'occupied' ? 'Occupied' : room.status === 'vacant' ? 'Vacant' : 'Restricted'}
          </span>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"
        />
      )}
    </motion.div>
  );
}
