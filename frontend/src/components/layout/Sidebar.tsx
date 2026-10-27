import { LayoutDashboard, Activity, Zap, Settings, AlertTriangle, Home, Layers, Thermometer, Users, HeartPulse } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'floor-map', label: 'Floor Map', icon: Home },
    { id: 'environment', label: 'Environment', icon: Thermometer },
    { id: 'occupancy', label: 'Occupancy', icon: Users },
    { id: 'energy', label: 'Energy', icon: Zap },
    { id: 'devices', label: 'Devices', icon: Layers },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'automation', label: 'Automation', icon: Activity },
    { id: 'system-health', label: 'System Health', icon: HeartPulse },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-14 sm:w-64 shrink-0 bg-surface border-r border-gray-800 flex flex-col">
      <div className="hidden sm:block p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Smart Office</h1>
        <p className="text-sm text-gray-400 mt-1">IoE Command Center</p>
      </div>

      <nav className="flex-1 p-1 sm:p-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  aria-label={item.label}
                  title={item.label}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center justify-center sm:justify-start gap-3 px-2 sm:px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-surfaceLight'
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="hidden sm:inline font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden sm:block p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-green-900/20 border border-green-800/30 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-400 font-medium">LIVE SIMULATION</span>
        </div>
      </div>
    </aside>
  );
}
