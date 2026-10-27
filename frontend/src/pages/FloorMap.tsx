import { useDataService } from '../hooks/useDataService';
import { OfficeFloorMap } from '../components/floorMap/OfficeFloorMap';

export function FloorMap() {
  const dataService = useDataService();
  const rooms = dataService.getRooms();
  const sensors = dataService.getSensors();
  const devices = dataService.getDevices();
  const alerts = dataService.getAlerts();

  return (
    <div className="p-6">
      <OfficeFloorMap
        rooms={rooms}
        sensors={sensors}
        devices={devices}
        alerts={alerts}
      />
    </div>
  );
}
