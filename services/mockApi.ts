
import { User, Role, Event, AudioGuide, DirectoryMember, Booking, InfoBox } from '../types';

// --- MOCK DATABASE ---

// Fix: Corrected User type to have uid and email, and removed mock-specific fields like id, nickname, and passwordHash to match the User interface.
let users: User[] = [
  { uid: 'admin1', email: 'admin@example.com', nome: 'Admin', cognome: 'Master', telefono: '1234567890', role: Role.ADMIN },
  { uid: 'user1', email: 'mario.rossi@example.com', nome: 'Mario', cognome: 'Rossi', telefono: '0987654321', role: Role.USER },
  { uid: 'user2', email: 'giuseppe.verdi@example.com', nome: 'Giuseppe', cognome: 'Verdi', telefono: '1122334455', role: Role.USER },
];

let events: Event[] = [
  { id: 'evt1', nome: 'Solstizio d\'Estate', descrizione: 'Celebrazione del solstizio estivo con un rituale speciale. Aperto a tutti i fratelli.', urlImmagine: 'https://picsum.photos/seed/event1/800/600', dataInizio: '2024-06-21T20:00:00', dataFine: '2024-06-21T23:00:00', isVisible: true },
  { id: 'evt2', nome: 'Conferenza su Dante Alighieri', descrizione: 'Approfondimento sul simbolismo esoterico nella Divina Commedia.', urlImmagine: 'https://picsum.photos/seed/event2/800/600', dataInizio: '2024-07-15T18:30:00', dataFine: '2024-07-15T20:00:00', isVisible: true },
  { id: 'evt3', nome: 'Tornata Rituale', descrizione: 'Lavori rituali del primo grado. Ingresso riservato agli Apprendisti.', urlImmagine: 'https://picsum.photos/seed/event3/800/600', dataInizio: '2024-08-05T21:00:00', dataFine: '2024-08-05T23:30:00', isVisible: true },
];

let audioGuides: AudioGuide[] = [
  { id: 'ag1', nomeFile: 'Introduzione ai Simboli', urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', urlImmagine: 'https://picsum.photos/seed/audio1/400/400', ordinamento: 1, isVisible: true },
  { id: 'ag2', nomeFile: 'Il Gabinetto di Riflessione', urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', urlImmagine: 'https://picsum.photos/seed/audio2/400/400', ordinamento: 2, isVisible: true },
  { id: 'ag3', nomeFile: 'Storia della Loggia', urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', urlImmagine: 'https://picsum.photos/seed/audio3/400/400', ordinamento: 3, isVisible: true },
];

// Fix: Removed non-existent 'userId' property from DirectoryMember mock data.
let directory: DirectoryMember[] = [
  { id: 'dir1', nome: 'Mario', cognome: 'Rossi', telefono: '0987654321', professione: 'Architetto', indirizzo: 'Via Roma 1, Firenze', azienda: 'Studio Architettura Rossi', isVisible: true },
  { id: 'dir2', nome: 'Giuseppe', cognome: 'Verdi', telefono: '1122334455', professione: 'Medico', indirizzo: 'Piazza della Signoria 5, Firenze', azienda: 'Ospedale Careggi', isVisible: true },
];

let infoBoxes: InfoBox[] = [
    { id: 'info1', titolo: 'Orari Segreteria', contenuto: 'La segreteria è aperta il Lunedì e il Venerdì dalle 18:00 alle 20:00.', ordinamento: 1 },
    { id: 'info2', titolo: 'Dress Code', contenuto: 'Per le Tornate Rituali è richiesto abito scuro, camicia bianca e cravatta nera. Guanti bianchi obbligatori.', ordinamento: 2 },
    { id: 'info3', titolo: 'Contatti Emergenza', contenuto: 'In caso di urgenze contattare il Maestro Venerabile o il Segretario ai numeri riservati.', ordinamento: 3 },
    { id: 'info4', titolo: 'Quote Sociali', contenuto: 'Si ricorda ai Fratelli di regolarizzare la quota annuale (capitazione) entro il mese di Febbraio.', ordinamento: 4 },
    { id: 'info5', titolo: 'Accesso al Tempio', contenuto: 'L\'accesso è consentito solo ai Fratelli in regola e muniti di grembiule del proprio grado.', ordinamento: 5 },
    { id: 'info6', titolo: 'Biblioteca', contenuto: 'La biblioteca di Loggia è disponibile per il prestito libri prima e dopo le tornate.', ordinamento: 6 },
];

let bookings: Booking[] = [];

// --- MOCK API FUNCTIONS ---

const simulateDelay = <T,>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), 500));

// AUTH
// Fix: Changed signature to use email instead of nickname. Removed password check as passwordHash was removed from the mock user to match the User type.
export const apiLogin = (email: string, password_raw: string): Promise<User | null> => {
  const user = users.find(u => u.email === email);
  return simulateDelay(user || null);
};

export const apiLogout = () => { /* No operation for mock */ };

// EVENTS
export const getEvents = (): Promise<Event[]> => simulateDelay([...events].filter(e => e.isVisible).sort((a,b) => new Date(a.dataInizio).getTime() - new Date(b.dataInizio).getTime()));
export const getAllEvents = (): Promise<Event[]> => simulateDelay([...events].sort((a,b) => new Date(a.dataInizio).getTime() - new Date(b.dataInizio).getTime()));
export const addEvent = (eventData: Omit<Event, 'id'>): Promise<Event> => {
    const newEvent: Event = { ...eventData, id: `evt${Date.now()}` };
    events.push(newEvent);
    return simulateDelay(newEvent);
}
export const updateEvent = (eventData: Event): Promise<Event> => {
    events = events.map(e => e.id === eventData.id ? eventData : e);
    return simulateDelay(eventData);
}
export const deleteEvent = (eventId: string): Promise<void> => {
    events = events.filter(e => e.id !== eventId);
    return simulateDelay(undefined);
}

// BOOKINGS
// Fix: Added `userName` to the function signature and booking object to match the Booking type.
export const bookEvent = (eventId: string, userId: string, userName: string): Promise<Booking> => {
  const newBooking: Booking = {
    id: `book${Date.now()}`,
    eventId,
    userId,
    userName,
    dataPrenotazione: new Date().toISOString(),
  };
  bookings.push(newBooking);
  return simulateDelay(newBooking);
};
export const getUserBookings = (userId: string): Promise<Booking[]> => {
    return simulateDelay(bookings.filter(b => b.userId === userId));
}


// AUDIO GUIDES
export const getAudioGuides = (): Promise<AudioGuide[]> => simulateDelay([...audioGuides].filter(g => g.isVisible).sort((a,b) => a.ordinamento - b.ordinamento));
export const getAllAudioGuides = (): Promise<AudioGuide[]> => simulateDelay([...audioGuides].sort((a,b) => a.ordinamento - b.ordinamento));
export const addAudioGuide = (guideData: Omit<AudioGuide, 'id'>): Promise<AudioGuide> => {
    const newGuide: AudioGuide = { ...guideData, id: `ag${Date.now()}` };
    audioGuides.push(newGuide);
    return simulateDelay(newGuide);
}
export const updateAudioGuide = (guideData: AudioGuide): Promise<AudioGuide> => {
    audioGuides = audioGuides.map(g => g.id === guideData.id ? guideData : g);
    return simulateDelay(guideData);
}
export const deleteAudioGuide = (guideId: string): Promise<void> => {
    audioGuides = audioGuides.filter(g => g.id !== guideId);
    return simulateDelay(undefined);
}

// DIRECTORY
export const getDirectory = (): Promise<DirectoryMember[]> => simulateDelay([...directory].filter(m => m.isVisible));
export const getAllDirectory = (): Promise<DirectoryMember[]> => simulateDelay([...directory]);
// Fix: Corrected parameter type and removed non-existent `userId` from new member creation.
export const addDirectoryMember = (memberData: Omit<DirectoryMember, 'id'>): Promise<DirectoryMember> => {
    const newMember: DirectoryMember = { ...memberData, id: `dir${Date.now()}`, isVisible: true };
    directory.push(newMember);
    return simulateDelay(newMember);
}
export const updateDirectoryMember = (memberData: DirectoryMember): Promise<DirectoryMember> => {
    directory = directory.map(m => m.id === memberData.id ? memberData : m);
    return simulateDelay(memberData);
}
export const deleteDirectoryMember = (memberId: string): Promise<void> => {
    directory = directory.filter(m => m.id !== memberId);
    return simulateDelay(undefined);
}

// USERS
export const getUsers = (): Promise<User[]> => simulateDelay([...users]);
// Fix: Corrected parameter type to use `uid` instead of `id`.
export const addUser = (userData: Omit<User, 'uid'>): Promise<User> => {
    // Fix: Used `uid` instead of `id`.
    const newUser: User = { ...userData, uid: `user${Date.now()}` };
    users.push(newUser);
    return simulateDelay(newUser);
}
export const updateUser = (userData: User): Promise<User> => {
    // Fix: Used `uid` for comparison instead of `id`.
    users = users.map(u => u.uid === userData.uid ? userData : u);
    return simulateDelay(userData);
}
export const deleteUser = (userId: string): Promise<void> => {
    // Fix: Used `uid` for comparison instead of `id`. `userId` parameter is expected to be a uid.
    users = users.filter(u => u.uid !== userId);
    return simulateDelay(undefined);
}

// INFO BOXES
export const getInfoBoxes = (): Promise<InfoBox[]> => simulateDelay([...infoBoxes].sort((a, b) => a.ordinamento - b.ordinamento));
export const updateInfoBox = (boxData: InfoBox): Promise<InfoBox> => {
    infoBoxes = infoBoxes.map(b => b.id === boxData.id ? boxData : b);
    return simulateDelay(boxData);
}
