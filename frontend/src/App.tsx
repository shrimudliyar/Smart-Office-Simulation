import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { FloorMap } from './pages/FloorMap';
import { Devices } from './pages/Devices';
import { Alerts } from './pages/Alerts';
import { Automation } from './pages/Automation';
import { SystemHealth } from './pages/SystemHealth';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'floor-map':
        return <FloorMap />;
      case 'environment':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'occupancy':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'energy':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'devices':
        return <Devices />;
      case 'alerts':
        return <Alerts />;
      case 'automation':
        return <Automation />;
      case 'system-health':
        return <SystemHealth />;
      case 'settings':
        return <Dashboard onNavigate={setActiveSection} />;
      default:
        return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </Layout>
  );
}

export default App;
