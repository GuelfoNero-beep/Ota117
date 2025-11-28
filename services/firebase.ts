import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { User, Role, Event, AudioGuide, DirectoryMember, Booking, InfoBox } from '../types';

// Configurazione Firebase dalle variabili d'ambiente
// Fix: Cast `import.meta` to `any` to resolve TypeScript error "Property 'env' does not exist on type 'ImportMeta'". This is a common workaround for type resolution issues with Vite's environment variables.
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
};

// Inizializzazione Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


// --- HELPERS ---
const dateToFirebaseTimestamp = (dateStr: string) => Timestamp.fromDate(new Date(dateStr));
const docToType = <T>(doc: any): T => {
    const data = doc.data();
    // Converte i Timestamp di Firebase in stringhe ISO per coerenza
    Object.keys(data).forEach(key => {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        }
    });
    return { id: doc.id, ...data } as T;
};


// --- AUTH ---
export const apiLogin = async (email: string, password_raw: string): Promise<User | null> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password_raw);
  const firebaseUser = userCredential.user;
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDocSnap = await getDoc(userDocRef);
  if (!userDocSnap.exists()) throw new Error("User data not found in Firestore.");
  
  return { uid: firebaseUser.uid, email: firebaseUser.email || '', ...userDocSnap.data() } as User;
};

export const apiLogout = () => signOut(auth);


// --- FILE STORAGE ---
export const uploadFile = async (fileDataUrl: string, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadString(storageRef, fileDataUrl, 'data_url');
  return getDownloadURL(storageRef);
};
export const deleteFile = async (fileUrl: string): Promise<void> => {
    if(!fileUrl) return;
    try {
        const storageRef = ref(storage, fileUrl);
        await deleteObject(storageRef);
    } catch (error: any) {
        if(error.code !== 'storage/object-not-found') {
            console.error("Error deleting file from storage:", error);
            throw error;
        }
        console.warn("File to delete not found in storage, skipping:", fileUrl);
    }
}


// --- GENERIC CRUD ---
const getCollection = async <T>(colName: string, orderField?: string): Promise<T[]> => {
    const colRef = collection(db, colName);
    const q = orderField ? query(colRef, orderBy(orderField)) : colRef;
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToType<T>(d));
}
const getVisibleCollection = async <T>(colName: string, orderField?: string): Promise<T[]> => {
    const colRef = collection(db, colName);
    let q = query(colRef, where("isVisible", "==", true));
    if (orderField) {
        q = query(q, orderBy(orderField));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToType<T>(d));
}

// EVENTS
export const getEvents = (): Promise<Event[]> => getVisibleCollection<Event>('events', 'dataInizio');
export const getAllEvents = (): Promise<Event[]> => getCollection<Event>('events', 'dataInizio');
export const addEvent = (data: Omit<Event, 'id'>) => addDoc(collection(db, 'events'), { ...data, dataInizio: dateToFirebaseTimestamp(data.dataInizio), dataFine: dateToFirebaseTimestamp(data.dataFine) });
export const updateEvent = (id: string, data: Partial<Event>) => updateDoc(doc(db, 'events', id), { ...data, ...(data.dataInizio && { dataInizio: dateToFirebaseTimestamp(data.dataInizio) }), ...(data.dataFine && { dataFine: dateToFirebaseTimestamp(data.dataFine) })});
export const deleteEvent = (id: string) => deleteDoc(doc(db, 'events', id));

// BOOKINGS
export const bookEvent = (eventId: string, userId: string, userName: string) => addDoc(collection(db, 'bookings'), { eventId, userId, userName, dataPrenotazione: Timestamp.now() });
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
    const q = query(collection(db, 'bookings'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToType<Booking>(d));
}

// AUDIO GUIDES
export const getAudioGuides = (): Promise<AudioGuide[]> => getVisibleCollection<AudioGuide>('audioGuides', 'ordinamento');
export const getAllAudioGuides = (): Promise<AudioGuide[]> => getCollection<AudioGuide>('audioGuides', 'ordinamento');
export const addAudioGuide = (data: Omit<AudioGuide, 'id'>) => addDoc(collection(db, 'audioGuides'), data);
export const updateAudioGuide = (id: string, data: Partial<AudioGuide>) => updateDoc(doc(db, 'audioGuides', id), data);
export const deleteAudioGuide = (id: string) => deleteDoc(doc(db, 'audioGuides', id));

// DIRECTORY
export const getDirectory = (): Promise<DirectoryMember[]> => getVisibleCollection<DirectoryMember>('directory');
export const getAllDirectory = (): Promise<DirectoryMember[]> => getCollection<DirectoryMember>('directory');
export const addDirectoryMember = (data: Omit<DirectoryMember, 'id'>) => addDoc(collection(db, 'directory'), data);
export const updateDirectoryMember = (id: string, data: Partial<DirectoryMember>) => updateDoc(doc(db, 'directory', id), data);
export const deleteDirectoryMember = (id: string) => deleteDoc(doc(db, 'directory', id));

// USERS (Firestore data, not Auth)
export const getUsers = async (): Promise<Omit<User, 'uid'>[]> => getCollection('users');
export const updateUserRole = (uid: string, role: Role) => updateDoc(doc(db, 'users', uid), { role });

// INFO BOXES
export const getInfoBoxes = (): Promise<InfoBox[]> => getCollection<InfoBox>('infoBoxes', 'ordinamento');
export const updateInfoBox = (id: string, data: Partial<InfoBox>) => updateDoc(doc(db, 'infoBoxes', id), data);
