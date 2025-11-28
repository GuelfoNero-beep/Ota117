import React, { useState, useEffect, useCallback } from 'react';
import { Event, Booking } from '../../types';
import { getEvents, bookEvent, getUserBookings } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { generateIcsFile, downloadIcsFile } from '../../utils/calendar';
import Button from '../../components/ui/Button';
import { Calendar, CheckCircle } from 'lucide-react';

const EventCard: React.FC<{ event: Event, onBook: (event: Event) => void, isBooked: boolean }> = ({ event, onBook, isBooked }) => {
  const { nome, descrizione, urlImmagine, dataInizio, dataFine } = event;
  
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-brand-blue rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      <img src={urlImmagine} alt={nome} className="w-full h-48 object-cover"/>
      <div className="p-6">
        <h3 className="text-xl font-bold text-brand-gold mb-2">{nome}</h3>
        <div className="text-sm text-gray-300 mb-4 flex items-center">
            <Calendar size={16} className="mr-2"/>
            <span>{formatDate(dataInizio)} | {formatTime(dataInizio)} - {formatTime(dataFine)}</span>
        </div>
        <p className="text-gray-400 mb-6 line-clamp-3">{descrizione}</p>
        <div className="flex justify-end">
            {isBooked ? (
                <div className="flex items-center text-green-400 font-semibold">
                    <CheckCircle size={20} className="mr-2"/>
                    <span>Prenotato</span>
                </div>
            ) : (
                <Button onClick={() => onBook(event)}>Prenota Evento</Button>
            )}
        </div>
      </div>
    </div>
  );
};

const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEventsAndBookings = useCallback(async () => {
    if(!user) return;
    setLoading(true);
    try {
      const [eventsData, bookingsData] = await Promise.all([
        getEvents(),
        getUserBookings(user.uid)
      ]);
      setEvents(eventsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEventsAndBookings();
  }, [fetchEventsAndBookings]);

  const handleBookEvent = async (event: Event) => {
    if (!user) return;
    try {
      await bookEvent(event.id, user.uid, `${user.nome} ${user.cognome}`);
      // Generate and download .ics file
      const icsContent = generateIcsFile(event);
      downloadIcsFile(icsContent, event.nome.replace(/\s/g, '_'));
      // Refresh bookings
      fetchEventsAndBookings();
    } catch (error) {
      console.error("Failed to book event:", error);
    }
  };

  if (loading) return <div className="text-center p-10">Caricamento eventi...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-gold mb-6">Eventi in Programma</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            onBook={handleBookEvent}
            isBooked={bookings.some(b => b.eventId === event.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default EventsScreen;
