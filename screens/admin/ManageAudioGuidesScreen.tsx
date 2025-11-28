import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AudioGuide } from '../../types';
import { getAllAudioGuides, addAudioGuide, updateAudioGuide, deleteAudioGuide, uploadFile, deleteFile } from '../../services/firebase';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Input from '../../components/ui/Input';
import ImageUpload from '../../components/ui/ImageUpload';
import { Edit, PlusCircle, Eye, EyeOff, Trash2, Music, ListOrdered, X, FileAudio } from 'lucide-react';

const GuideForm: React.FC<{ 
    guide?: AudioGuide | null, 
    onSave: (guide: Omit<AudioGuide, 'id'> | AudioGuide, newImageFile?: string, newAudioFile?: File) => void, 
    onCancel: () => void 
}> = ({ guide, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        nomeFile: guide?.nomeFile || '',
        urlImmagine: guide?.urlImmagine || '',
        urlAudio: guide?.urlAudio || '',
        ordinamento: guide?.ordinamento || 0,
        isVisible: guide?.isVisible ?? true,
    });
    
    // Stati per la gestione dei nuovi file
    const [newImageFile, setNewImageFile] = useState<string>(''); // Base64 for preview
    const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(guide?.urlAudio || null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        return () => {
            if (audioPreviewUrl && audioPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(audioPreviewUrl);
            }
        };
    }, [audioPreviewUrl]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };
    
    const handleImageSelected = (base64: string) => {
        setNewImageFile(base64);
        setFormData(prev => ({ ...prev, urlImmagine: base64 })); // For preview
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndSetAudio(file);
    };
    
    const validateAndSetAudio = (file: File) => {
        if (!file.type.startsWith('audio/')) {
            alert("Per favore carica solo file audio (MP3, WAV).");
            return;
        }
        if (audioPreviewUrl && audioPreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(audioPreviewUrl);
        }
        setNewAudioFile(file);
        setAudioPreviewUrl(URL.createObjectURL(file));
    };

    const removeAudio = () => {
        setNewAudioFile(null);
        setAudioPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!guide && !newAudioFile) {
            alert("È necessario caricare un file audio.");
            return;
        }

        const guideData = { ...formData };
        
        if (guide?.id) {
            onSave({ ...guideData, id: guide.id, urlImmagine: guide.urlImmagine, urlAudio: guide.urlAudio }, newImageFile, newAudioFile || undefined);
        } else {
            onSave(guideData, newImageFile, newAudioFile || undefined);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Titolo Guida</label>
                    <Input name="nomeFile" value={formData.nomeFile} onChange={handleFormChange} required/>
                </div>
                
                <ImageUpload 
                    currentImage={formData.urlImmagine} 
                    onImageSelected={handleImageSelected}
                    label="Copertina Guida"
                />

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">File Audio (MP3, WAV)</label>
                    {!audioPreviewUrl ? (
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-600 bg-gray-800/50 hover:border-gray-400 hover:bg-gray-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
                            <Music size={24} className="text-brand-gold mb-2" />
                            <span className="text-gray-300 font-medium">Clicca o trascina un file audio</span>
                        </div>
                    ) : (
                        <div className="bg-gray-800 rounded-xl border border-gray-600 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-brand-light truncate">{newAudioFile?.name || guide?.nomeFile}</span>
                                <button type="button" onClick={removeAudio} className="p-2 text-red-400 hover:text-red-300"><X size={18} /></button>
                            </div>
                            <audio controls className="w-full h-8 block" src={audioPreviewUrl}></audio>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Ordinamento</label>
                    <Input type="number" name="ordinamento" value={formData.ordinamento} onChange={handleFormChange} required/>
                </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3 pt-4 border-t border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Annulla</Button>
                <Button type="submit">Salva Guida</Button>
            </div>
        </form>
    );
};

const ManageAudioGuidesScreen: React.FC = () => {
    const [guides, setGuides] = useState<AudioGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<AudioGuide | null>(null);
    const [itemToDelete, setItemToDelete] = useState<AudioGuide | null>(null);

    const fetchGuides = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllAudioGuides();
            setGuides(data);
        } catch (error) {
            console.error("Failed to fetch guides", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGuides();
    }, [fetchGuides]);

    const handleSave = async (guideData: Omit<AudioGuide, 'id'> | AudioGuide, newImageFile?: string, newAudioFile?: File) => {
        try {
            let imageUrl = 'id' in guideData ? guideData.urlImmagine : '';
            let audioUrl = 'id' in guideData ? guideData.urlAudio : '';

            if (newImageFile) {
                const imagePath = `guides/images/${Date.now()}`;
                imageUrl = await uploadFile(newImageFile, imagePath);
                if ('id' in guideData && guideData.urlImmagine) await deleteFile(guideData.urlImmagine);
            }
            if (newAudioFile) {
                // Per i file audio (e altri tipi di file), la conversione a base64 è necessaria
                 const audioBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(newAudioFile);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
                const audioPath = `guides/audio/${Date.now()}_${newAudioFile.name}`;
                audioUrl = await uploadFile(audioBase64, audioPath);
                if ('id' in guideData && guideData.urlAudio) await deleteFile(guideData.urlAudio);
            }

            const finalGuideData = { ...guideData, urlImmagine: imageUrl, urlAudio: audioUrl };

            if ('id' in finalGuideData) {
                const { id, ...dataToUpdate } = finalGuideData;
                await updateAudioGuide(id, dataToUpdate);
            } else {
                await addAudioGuide(finalGuideData as Omit<AudioGuide, 'id'>);
            }
        } catch (error) {
            console.error("Error saving guide:", error);
            alert("Errore durante il salvataggio.");
        } finally {
            fetchGuides();
            setIsModalOpen(false);
            setSelectedGuide(null);
        }
    };
    
    const confirmDelete = async () => {
        if(!itemToDelete) return;
        try {
            if(itemToDelete.urlImmagine) await deleteFile(itemToDelete.urlImmagine);
            if(itemToDelete.urlAudio) await deleteFile(itemToDelete.urlAudio);
            await deleteAudioGuide(itemToDelete.id);
            setGuides(currentGuides => currentGuides.filter(guide => guide.id !== itemToDelete.id));
        } catch (error) {
            console.error("Failed to delete audio guide:", error);
            alert("Errore durante l'eliminazione.");
        } finally {
            setItemToDelete(null);
        }
    };
    
    const handleToggleVisibility = async (guide: AudioGuide) => {
        await updateAudioGuide(guide.id, { isVisible: !guide.isVisible });
        fetchGuides();
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Caricamento guide...</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold">Gestione Audio</h1>
                    <p className="text-gray-400 mt-1">Carica e organizza le guide audio</p>
                </div>
                <Button onClick={() => { setSelectedGuide(null); setIsModalOpen(true); }} className="flex items-center shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5">
                    <PlusCircle size={20} className="mr-2"/>
                    Aggiungi Guida
                </Button>
            </div>
            
             <div className="bg-brand-blue md:rounded-xl shadow-xl overflow-hidden md:border border-gray-700 bg-transparent md:bg-brand-blue">
                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700 block md:table">
                        <thead className="bg-gray-800/50 hidden md:table-header-group">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-gold uppercase tracking-wider w-16">Cover</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-gold uppercase tracking-wider">Titolo e File</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-brand-gold uppercase tracking-wider w-20">Ord.</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-brand-gold uppercase tracking-wider w-24">Stato</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-gold uppercase tracking-wider w-32">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 block md:table-row-group">
                            {guides.map(guide => (
                                <tr key={guide.id} className="hover:bg-brand-dark/20 transition-colors group block md:table-row bg-gray-800 md:bg-transparent mb-4 md:mb-0 rounded-lg md:rounded-none border border-gray-700 md:border-none p-4 md:p-0">
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap block md:table-cell">
                                        <div className="flex items-center">
                                            <img src={guide.urlImmagine} alt="" className="h-12 w-12 rounded object-cover border border-gray-600 shadow-sm" />
                                            <div className="ml-3 md:hidden font-bold text-brand-light flex-1">{guide.nomeFile}</div>
                                        </div>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 block md:table-cell">
                                        <div className="text-sm font-semibold text-brand-light hidden md:block">{guide.nomeFile}</div>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Music size={12} className="mr-1" /> File audio caricato
                                        </div>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap text-left md:text-center block md:table-cell">
                                        <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mr-2">Ordine:</span>
                                        <div className="inline-flex items-center justify-center px-2 py-1 rounded bg-gray-700 text-gray-300 text-sm font-mono">
                                            <ListOrdered size={12} className="mr-1 text-gray-400"/> {guide.ordinamento}
                                        </div>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap text-left md:text-center block md:table-cell">
                                         <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mr-2">Visibilità:</span>
                                         <button onClick={() => handleToggleVisibility(guide)} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all ${guide.isVisible ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-gray-700/30 text-gray-400 border border-gray-600'}`}>
                                            {guide.isVisible ? <><Eye size={12} className="mr-1.5"/> Visibile</> : <><EyeOff size={12} className="mr-1.5"/> Nascosto</>}
                                        </button>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium block md:table-cell border-t border-gray-700 md:border-none mt-2 md:mt-0 pt-2 md:pt-4">
                                        <div className="flex items-center justify-end space-x-3 opacity-100 md:opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedGuide(guide); setIsModalOpen(true); }} className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-400/10 rounded-full flex items-center" title="Modifica"><span className="md:hidden mr-2">Modifica</span> <Edit size={18}/></button>
                                            <button onClick={() => setItemToDelete(guide)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-full flex items-center" title="Elimina"><span className="md:hidden mr-2">Elimina</span> <Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedGuide ? 'Modifica Guida Audio' : 'Nuova Guida Audio'}>
                <GuideForm guide={selectedGuide} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>

            <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={confirmDelete} title="Elimina Guida Audio" message={`Sei sicuro di voler eliminare la guida "${itemToDelete?.nomeFile}"? I file associati verranno rimossi.`} />
        </div>
    );
};

export default ManageAudioGuidesScreen;
