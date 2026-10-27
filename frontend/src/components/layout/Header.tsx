import { Bell, User, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatTime, formatDate } from '../../utils/formatting';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 shrink-0 bg-surface border-b border-gray-800 flex items-center justify-between px-3 sm:px-6">
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle size={20} />
          <span className="text-sm font-medium">System Online</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="text-right">
          <div className="text-sm text-gray-400">{formatDate(currentTime)}</div>
          <div className="text-sm sm:text-lg font-semibold text-white">{formatTime(currentTime)}</div>
        </div>

        <div className="relative hidden sm:block">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 pl-6 border-l border-gray-800">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="text-sm">
            <div className="text-white font-medium">Admin</div>
            <div className="text-gray-400 text-xs">System Operator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
