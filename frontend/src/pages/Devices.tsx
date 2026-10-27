import { DeviceMonitoring } from '../components/devices/DeviceMonitoring';
import { DeviceControl } from '../components/devices/DeviceControl';

export function Devices() {
  return (
    <div className="p-6 space-y-8">
      <DeviceMonitoring />
      <DeviceControl />
    </div>
  );
}
