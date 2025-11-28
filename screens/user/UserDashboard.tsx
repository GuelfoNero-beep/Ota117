
import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import EventsScreen from './EventsScreen';
import AudioGuidesScreen from './AudioGuidesScreen';
import DirectoryScreen from './DirectoryScreen';
import InfoScreen from './InfoScreen';
import MasonicIcon from '../../components/icons/MasonicIcon';
import { Menu } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('events');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'events':
        return <EventsScreen />;
      case 'audioGuides':
        return <AudioGuidesScreen />;
      case 'directory':
        return <DirectoryScreen />;
      case 'info':
        return <InfoScreen />;
      default:
        return <EventsScreen />;
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row bg-brand-dark">
      {/* Mobile Header */}
      <div className="bg-brand-blue p-4 flex items-center justify-between shadow-md md:hidden sticky top-0 z-30">
        <div className="flex items-center space-x-3">
           <MasonicIcon className="w-8 h-8 text-brand-gold" />
           <span className="font-bold text-brand-gold text-lg">Oriente O117</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="text-brand-light p-2 hover:bg-gray-700 rounded-md"
        >
          <Menu size={28} />
        </button>
      </div>

      <Sidebar 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto w-full">
        {renderScreen()}
      </main>
    </div>
  );
};

export default UserDashboard;
