
import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import ManageEventsScreen from './ManageEventsScreen';
import ManageAudioGuidesScreen from './ManageAudioGuidesScreen';
import ManageDirectoryScreen from './ManageDirectoryScreen';
import ManageUsersScreen from './ManageUsersScreen';
import ManageInfoScreen from './ManageInfoScreen';
import MasonicIcon from '../../components/icons/MasonicIcon';
import { Menu } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('manageEvents');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'manageEvents':
        return <ManageEventsScreen />;
      case 'manageAudioGuides':
        return <ManageAudioGuidesScreen />;
      case 'manageDirectory':
        return <ManageDirectoryScreen />;
      case 'manageUsers':
        return <ManageUsersScreen />;
      case 'manageInfo':
        return <ManageInfoScreen />;
      default:
        return <ManageEventsScreen />;
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row bg-brand-dark">
      {/* Mobile Header */}
      <div className="bg-brand-blue p-4 flex items-center justify-between shadow-md md:hidden sticky top-0 z-30">
        <div className="flex items-center space-x-3">
           <MasonicIcon className="w-8 h-8 text-brand-gold" />
           <span className="font-bold text-brand-gold text-lg">Admin Panel</span>
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

export default AdminDashboard;
