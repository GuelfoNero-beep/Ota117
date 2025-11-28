import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import MasonicIcon from '../components/icons/MasonicIcon';
import { FirebaseError } from 'firebase/app';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
        await login(cleanEmail, cleanPassword);
        // La navigazione avviene in automatico tramite il context
    } catch(err) {
        if (err instanceof FirebaseError) {
            switch(err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('Email o password non corretti.');
                    break;
                case 'auth/invalid-email':
                    setError('Il formato dell\'email non è valido.');
                    break;
                case 'permission-denied':
                     setError('Accesso al profilo negato. Contattare l\'amministratore per verificare le autorizzazioni.');
                     break;
                default:
                    setError('Si è verificato un errore. Riprova più tardi.');
                    break;
            }
        } else {
             setError('Si è verificato un errore imprevisto.');
        }
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <div className="w-full max-w-md bg-brand-blue rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
            <MasonicIcon className="w-16 h-16 text-brand-gold mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-brand-gold">Oriente O117</h1>
            <p className="text-gray-400 mt-2">Loggia "Dante 117 all'Oriente di Firenze"</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-red-400 text-center mb-4">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Accesso...' : 'Accedi'}
          </Button>

          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <h3 className="text-red-500/80 font-bold text-xs uppercase mb-2 tracking-wider">Accesso Riservato</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              L'accesso è consentito esclusivamente agli utenti autorizzati. Qualsiasi tentativo di intrusione, forzatura o elusione dei sistemi di sicurezza sarà tracciato e perseguito a norma di legge.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;