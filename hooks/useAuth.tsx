import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { apiLogin, apiLogout } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Utente loggato su Firebase, ora recupero i dati custom da Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              ...userData
            } as User);
          } else {
            // L'utente esiste in Auth ma non in Firestore, logout forzato
            console.error(`User with UID ${firebaseUser.uid} exists in Auth, but no document found in Firestore 'users' collection.`);
            await apiLogout();
            setUser(null);
          }
        } catch(e) {
          console.error("Error fetching user data from Firestore. This is likely a permissions issue. Check your Firestore rules.", e);
          await apiLogout();
          setUser(null);
        }
      } else {
        // Nessun utente loggato
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await apiLogin(email, password);
      // Lo stato verrà aggiornato automaticamente dal listener onAuthStateChanged
      // setLoading(false) è gestito dal listener
    } catch (error) {
      setLoading(false); // Assicurati di fermare il caricamento in caso di errore
      throw error; // Rilancia l'errore per gestirlo nella UI
    }
  };

  const logout = async () => {
    await apiLogout();
    // Lo stato verrà aggiornato automaticamente dal listener onAuthStateChanged
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};