import React, { useState, useEffect, useCallback } from 'react';
import { Event } from '../../types';
import { getAllEvents, addEvent, updateEvent, deleteEvent, uploadFile, deleteFile } from '../../services/firebase';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Input from '../../components/ui/Input';
import ImageUpload from '../../components/ui/ImageUpload';
import { Edit, PlusCircle, Eye, EyeOff, Trash2, Calendar, Image as ImageIcon } from 'lucide-react';

const EventForm: React.FC<{ event?: Event | null, onSave: (event: Omit<Event, 'id'> | Event, newImageFile?: string) => void, onCancel: () => void }> = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        nome: event?.nome || '',
        descrizione: event?.descrizione || '',
        urlImmagine: event?.urlImmagine || '',
        dataInizio: event?.dataInizio ? event.dataInizio.substring(0, 16) : '',
        dataFine: event?.dataFine ? event.dataFine.substring(0, 16) : '',
        isVisible: event?.isVisible ?? true,
    });
    const [newImageFile, setNewImageFile] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelected = (base64: string) => {
        setNewImageFile(base64);
        setFormData(prev => ({ ...prev, urlImmagine: base64 })); // For preview
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const eventData = {
            ...formData,
            dataInizio: new Date(formData.dataInizio).toISOString(),
            dataFine: new Date(formData.dataFine).toISOString(),
        };
        // L'URL immagine viene gestito nella funzione onSave principale
        if(event?.id) {
            onSave({ ...eventData, id: event.id, urlImmagine: event.urlImmagine }, newImageFile);
        } else {
            onSave(eventData, newImageFile);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome Evento</label>
                    <Input name="nome" value={formData.nome} onChange={handleChange} required/>
                </div>
                
                <ImageUpload 
                    currentImage={formData.urlImmagine} 
                    onImageSelected={handleImageSelected}
                    label="Locandina Evento" 
                />

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Descrizione</label>
                    <textarea name="descrizione" value={formData.descrizione} onChange={handleChange} rows={4} className="w-full bg-gray-700 text-brand-light border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold" required></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Data Inizio</label>
                        <Input type="datetime-local" name="dataInizio" value={formData.dataInizio} onChange={handleChange} required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Data Fine</label>
                        <Input type="datetime-local" name="dataFine" value={formData.dataFine} onChange={handleChange} required/>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3 pt-4 border-t border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Annulla</Button>
                <Button type="submit">Salva Evento</Button>
            </div>
        </form>
    );
};


const ManageEventsScreen: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Event | null>(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllEvents();
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSave = async (eventData: Omit<Event, 'id'> | Event, newImageFile?: string) => {
        try {
            let imageUrl = 'id' in eventData ? eventData.urlImmagine : '';

            if (newImageFile) {
                // Se c'è una nuova immagine, la carico
                const imagePath = `events/${Date.now()}`;
                imageUrl = await uploadFile(newImageFile, imagePath);
                // Se sto modificando e c'era una vecchia immagine, la elimino
                if ('id' in eventData && eventData.urlImmagine) {
                    await deleteFile(eventData.urlImmagine);
                }
            }

            const finalEventData = { ...eventData, urlImmagine: imageUrl };

            if ('id' in finalEventData) {
                const { id, ...dataToUpdate } = finalEventData;
                await updateEvent(id, dataToUpdate);
            } else {
                await addEvent(finalEventData);
            }
        } catch (error) {
            console.error("Error saving event:", error);
            alert("Errore durante il salvataggio dell'evento.");
        } finally {
            fetchEvents();
            setIsModalOpen(false);
            setSelectedEvent(null);
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            // Elimino prima l'immagine dallo storage, se esiste
            if (itemToDelete.urlImmagine) {
                await deleteFile(itemToDelete.urlImmagine);
            }
            // Poi elimino il documento da Firestore
            await deleteEvent(itemToDelete.id);
            setEvents(currentEvents => currentEvents.filter(event => event.id !== itemToDelete.id));
        } catch (error) {
            console.error("Failed to delete event:", error);
            alert("Errore durante l'eliminazione dell'evento.");
        } finally {
            setItemToDelete(null);
        }
    };

    const handleToggleVisibility = async (event: Event) => {
        const updatedData = { isVisible: !event.isVisible };
        try {
            await updateEvent(event.id, updatedData);
            setEvents(currentEvents =>
                currentEvents.map(e => (e.id === event.id ? {...e, ...updatedData} : e))
            );
        } catch (error) {
            console.error("Failed to toggle visibility:", error);
        }
    };


    if (loading) return <div className="p-8 text-center text-gray-400">Caricamento eventi...</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold">Gestione Eventi</h1>
                    <p className="text-gray-400 mt-1">Gestisci le tornate, le conferenze e i rituali</p>
                </div>
                <Button onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }} className="flex items-center shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5">
                    <PlusCircle size={20} className="mr-2"/>
                    Nuovo Evento
                </Button>
            </div>
            
            <div className="bg-brand-blue md:rounded-xl shadow-xl overflow-hidden md:border border-gray-700 bg-transparent md:bg-brand-blue">
                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700 block md:table">
                        <thead className="bg-gray-800/50 hidden md:table-header-group">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-gold uppercase tracking-wider w-16">Img</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-gold uppercase tracking-wider">Nome Evento</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-gold uppercase tracking-wider">Data e Ora</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-brand-gold uppercase tracking-wider w-24">Stato</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-gold uppercase tracking-wider w-32">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 block md:table-row-group">
                            {events.map(event => (
                                <tr key={event.id} className="hover:bg-brand-dark/20 transition-colors group block md:table-row bg-gray-800 md:bg-transparent mb-4 md:mb-0 rounded-lg md:rounded-none border border-gray-700 md:border-none p-4 md:p-0">
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap block md:table-cell">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center border border-gray-600 flex-shrink-0">
                                                {event.urlImmagine ? (
                                                    <img src={event.urlImmagine} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={16} className="text-gray-500" />
                                                )}
                                            </div>
                                            <div className="ml-3 md:hidden font-bold text-brand-light">{event.nome}</div>
                                        </div>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 block md:table-cell">
                                        <div className="text-sm font-semibold text-brand-light hidden md:block">{event.nome}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-xs">{event.descrizione}</div>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap block md:table-cell">
                                        <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mr-2">Data:</span>
                                        <div className="inline-flex items-center text-sm text-gray-300">
                                            <Calendar size={14} className="mr-2 text-brand-gold/70" />
                                            {new Date(event.dataInizio).toLocaleDateString('it-IT')}
                                            <span className="mx-1 text-gray-600">|</span>
                                            {new Date(event.dataInizio).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap text-left md:text-center block md:table-cell">
                                        <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mr-2">Visibilità:</span>
                                        <button 
                                            onClick={() => handleToggleVisibility(event)}
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                                event.isVisible 
                                                ? 'bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50' 
                                                : 'bg-gray-700/30 text-gray-400 border border-gray-600 hover:bg-gray-700/50'
                                            }`}
                                        >
                                            {event.isVisible ? (
                                                <><Eye size={12} className="mr-1.5"/> Visibile</>
                                            ) : (
                                                <><EyeOff size={12} className="mr-1.5"/> Nascosto</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium block md:table-cell border-t border-gray-700 md:border-none mt-2 md:mt-0 pt-2 md:pt-4">
                                        <div className="flex items-center justify-end space-x-3 opacity-100 md:opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }} 
                                                className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-400/10 rounded-full transition-colors flex items-center"
                                                title="Modifica"
                                            >
                                                <span className="md:hidden mr-2">Modifica</span> <Edit size={18}/>
                                            </button>
                                            <button 
                                                onClick={() => setItemToDelete(event)} 
                                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-full transition-colors flex items-center"
                                                title="Elimina"
                                            >
                                                 <span className="md:hidden mr-2">Elimina</span> <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedEvent ? 'Modifica Evento' : 'Nuovo Evento'}>
                <EventForm event={selectedEvent} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Elimina Evento"
                message={`Sei sicuro di voler eliminare l'evento "${itemToDelete?.nome}"? L'immagine associata verrà rimossa permanentemente.`}
            />
        </div>
    );
};

export default ManageEventsScreen;
