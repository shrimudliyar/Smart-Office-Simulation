import { useDataService } from '../../hooks/useDataService';
import { Clock, Power, AlertTriangle, CheckCircle, Activity, DoorOpen, Zap, Thermometer } from 'lucide-react';

export function RecentActivity() {
  const dataService = useDataService();
  const activities = dataService.getActivities();
  const rooms = dataService.getRooms();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'device':
        return Power;
      case 'alert':
        return AlertTriangle;
      case 'threshold':
        return Thermometer;
      case 'motion':
        return Activity;
      case 'connection':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'device':
        return 'bg-blue-900/30 text-blue-400';
      case 'alert':
        return 'bg-red-900/30 text-red-400';
      case 'threshold':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'motion':
        return 'bg-green-900/30 text-green-400';
      case 'connection':
        return 'bg-purple-900/30 text-purple-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const getRoomName = (roomId?: string) => {
    if (!roomId) return 'System';
    const room = rooms.find(r => r.id === roomId);
    return room?.name || roomId;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Recent Activity</h2>
        <p className="text-gray-400 text-sm">Timeline of recent system events</p>
      </div>

      {/* Activity Timeline */}
      <div className="bg-surface rounded-lg border border-gray-800 p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800" />

          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const iconColor = getActivityColor(activity.type);

              return (
                <div key={activity.id} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center ${iconColor}`}>
                    <Icon size={12} />
                  </div>

                  <div className="bg-surfaceLight rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${iconColor}`}>
                            {activity.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-white font-medium">{activity.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {activity.roomId && (
                        <span>Room: {getRoomName(activity.roomId)}</span>
                      )}
                      {activity.deviceId && (
                        <span>Device: {activity.deviceId}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No recent activity
          </div>
        )}
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Total Events</div>
          <div className="text-2xl font-bold text-white">{activities.length}</div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Device Actions</div>
          <div className="text-2xl font-bold text-blue-400">
            {activities.filter(a => a.type === 'device').length}
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Alerts</div>
          <div className="text-2xl font-bold text-red-400">
            {activities.filter(a => a.type === 'alert').length}
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-gray-800 p-4">
          <div className="text-sm text-gray-400 mb-1">Threshold Events</div>
          <div className="text-2xl font-bold text-yellow-400">
            {activities.filter(a => a.type === 'threshold').length}
          </div>
        </div>
      </div>
    </div>
  );
}
