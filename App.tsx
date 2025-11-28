import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginScreen from './screens/LoginScreen';
import UserDashboard from './screens/user/UserDashboard';
import AdminDashboard from './screens/admin/AdminDashboard';
import { Role } from './types';
import MasonicIcon from './components/icons/MasonicIcon';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-brand-dark text-brand-light">
        <MasonicIcon className="w-16 h-16 text-brand-gold animate-pulse" />
        <p className="mt-4 text-lg text-gray-400">Inizializzazione in corso...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light">
      {user.role === Role.ADMIN ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
};

export default App;
