
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import MasonicIcon from '../icons/MasonicIcon';
import { Calendar, Music, Users, Shield, BookUser, LogOut, Info, X } from 'lucide-react';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeScreen, setActiveScreen, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const userNavItems = [
    { id: 'events', label: 'Eventi', icon: Calendar },
    { id: 'audioGuides', label: 'Audio Guide', icon: Music },
    { id: 'directory', label: 'Fratelli in Lista', icon: Users },
    { id: 'info', label: 'Informazioni Utili', icon: Info },
  ];

  const adminNavItems = [
    { id: 'manageEvents', label: 'Gestione Eventi', icon: Calendar },
    { id: 'manageAudioGuides', label: 'Gestione Audio', icon: Music },
    { id: 'manageDirectory', label: 'Gestione Lista', icon: Users },
    { id: 'manageUsers', label: 'Gestione Utenti', icon: BookUser },
    { id: 'manageInfo', label: 'Gestione Info', icon: Info },
  ];

  const navItems = user?.role === Role.ADMIN ? adminNavItems : userNavItems;

  const handleItemClick = (id: string) => {
    setActiveScreen(id);
    onClose(); // Chiude il menu su mobile quando si clicca
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative inset-y-0 left-0 z-50 w-64 bg-brand-blue text-brand-light flex flex-col shadow-2xl md:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 text-center border-b border-gray-700 relative">
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden"
          >
            <X size={24} />
          </button>

          <div className="flex items-center justify-center space-x-2">
              <MasonicIcon className="w-8 h-8 text-brand-gold" />
              <h1 className="text-2xl font-bold text-brand-gold">Oriente O117</h1>
          </div>
          <p className="text-sm mt-2 text-gray-400">Loggia Dante 117</p>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 my-1 rounded-md text-left transition-colors ${
                    activeScreen === item.id
                      ? 'bg-brand-gold text-brand-dark font-medium'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${activeScreen === item.id ? 'text-brand-dark' : 'text-brand-gold'}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-700 bg-brand-blue">
           <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 rounded-md text-left transition-colors hover:bg-red-900/50 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
