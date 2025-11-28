export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  uid: string; // Firebase Auth User ID
  email: string;
  nome: string;
  cognome: string;
  telefono: string;
  role: Role;
}

export interface Event {
  id: string;
  nome: string;
  descrizione: string;
  urlImmagine: string;
  dataInizio: string;
  dataFine: string;
  isVisible: boolean;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  userName: string; // Per comodità
  dataPrenotazione: string;
}

export interface AudioGuide {
  id: string;
  nomeFile: string;
  urlAudio: string;
  urlImmagine: string;
  ordinamento: number;
  isVisible: boolean;
}

export interface DirectoryMember {
  id: string;
  nome: string;
  cognome: string;
  telefono: string;
  professione: string;
  indirizzo: string;
  azienda: string;
  isVisible: boolean;
}

export interface InfoBox {
  id: string;
  titolo: string;
  contenuto: string;
  ordinamento: number;
}
