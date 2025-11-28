import React, { useState, useEffect, useCallback } from 'react';
import { InfoBox } from '../../types';
import { getInfoBoxes, updateInfoBox } from '../../services/firebase';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Edit, Info } from 'lucide-react';

const InfoBoxForm: React.FC<{ box: InfoBox, onSave: (box: InfoBox) => void, onCancel: () => void }> = ({ box, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        titolo: box.titolo,
        contenuto: box.contenuto,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...box, ...formData });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Titolo Sezione</label>
                    <Input name="titolo" value={formData.titolo} onChange={handleChange} required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contenuto</label>
                    <textarea 
                        name="contenuto" 
                        value={formData.contenuto} 
                        onChange={handleChange} 
                        rows={6} 
                        className="w-full bg-gray-700 text-brand-light border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold" 
                        required
                    ></textarea>
                </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3 pt-4 border-t border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Annulla</Button>
                <Button type="submit">Salva Modifiche</Button>
            </div>
        </form>
    );
};

const ManageInfoScreen: React.FC = () => {
    const [boxes, setBoxes] = useState<InfoBox[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBox, setSelectedBox] = useState<InfoBox | null>(null);

    const fetchBoxes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getInfoBoxes();
            setBoxes(data);
        } catch (error) {
            console.error("Failed to fetch info boxes", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBoxes();
    }, [fetchBoxes]);

    const handleSave = async (box: InfoBox) => {
        const { id, ...dataToUpdate } = box;
        await updateInfoBox(id, dataToUpdate);
        fetchBoxes();
        setIsModalOpen(false);
        setSelectedBox(null);
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Caricamento informazioni...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brand-gold flex items-center">
                    <Info className="mr-3" /> Gestione Informazioni
                </h1>
                <p className="text-gray-400 mt-1">Gestisci i 6 riquadri informativi visibili agli utenti.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boxes.map(box => (
                    <div key={box.id} className="bg-brand-blue rounded-xl shadow-lg overflow-hidden border border-gray-700 flex flex-col h-full">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-brand-gold">{box.titolo}</h3>
                                <span className="bg-gray-700 text-xs text-gray-300 px-2 py-1 rounded">
                                    #{box.ordinamento}
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm whitespace-pre-line line-clamp-4">
                                {box.contenuto}
                            </p>
                        </div>
                        <div className="bg-gray-800/50 p-4 border-t border-gray-700 flex justify-end">
                             <Button 
                                onClick={() => { setSelectedBox(box); setIsModalOpen(true); }}
                                className="flex items-center text-sm py-1"
                            >
                                <Edit size={16} className="mr-2"/> Modifica
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Modifica Riquadro Informativo"
            >
                {selectedBox && (
                    <InfoBoxForm 
                        box={selectedBox} 
                        onSave={handleSave} 
                        onCancel={() => setIsModalOpen(false)} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default ManageInfoScreen;
