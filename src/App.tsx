import { useState } from 'react';
import LandingPage from './components/LandingPage';
import RoleSelection from './components/RoleSelection';
import EnhancedNavigationSystem from './components/EnhancedNavigationSystem';

type Screen = 'landing' | 'roleSelection' | 'navigation';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleGetStarted = () => {
    setCurrentScreen('roleSelection');
  };

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setCurrentScreen('navigation');
  };

  const handleBack = () => {
    setCurrentScreen('roleSelection');
    setSelectedRole('');
  };

  return (
    <>
      {currentScreen === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      {currentScreen === 'roleSelection' && (
        <RoleSelection onSelectRole={handleSelectRole} />
      )}
      {currentScreen === 'navigation' && selectedRole && (
        <EnhancedNavigationSystem role={selectedRole} onBack={handleBack} />
      )}
    </>
  );
}

export default App;
