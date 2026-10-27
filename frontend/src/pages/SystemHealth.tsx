import { SystemHealth as SystemHealthComponent } from '../components/system/SystemHealth';
import { RecentActivity } from '../components/system/RecentActivity';

export function SystemHealth() {
  return (
    <div className="p-6 space-y-8">
      <SystemHealthComponent />
      <RecentActivity />
    </div>
  );
}
