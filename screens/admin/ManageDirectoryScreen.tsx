import React, { useState, useEffect, useCallback } from 'react';
import { DirectoryMember } from '../../types';
import { getAllDirectory, addDirectoryMember, updateDirectoryMember, deleteDirectoryMember } from '../../services/firebase';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Input from '../../components/ui/Input';
import { Edit, PlusCircle, Eye, EyeOff, Trash2, User } from 'lucide-react';

type MemberFormData = Omit<DirectoryMember, 'id'>;

const MemberForm: React.FC<{ member?: DirectoryMember | null, onSave: (member: MemberFormData | DirectoryMember) => void, onCancel: () => void }> = ({ member, onSave, onCancel }) => {
    const [formData, setFormData] = useState<MemberFormData>({
        nome: member?.nome || '',
        cognome: member?.cognome || '',
        telefono: member?.telefono || '',
        professione: member?.professione || '',
        indirizzo: member?.indirizzo || '',
        azienda: member?.azienda || '',
        isVisible: member?.isVisible ?? true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (member?.id) {
            onSave({ ...formData, id: member.id });
        } else {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="nome" placeholder="Nome" value={formData.nome} onChange={handleChange} required/>
                <Input name="cognome" placeholder="Cognome" value={formData.cognome} onChange={handleChange} required/>
                <Input name="telefono" placeholder="Telefono" value={formData.telefono} onChange={handleChange} required/>
                <Input name="professione" placeholder="Professione" value={formData.professione} onChange={handleChange} required/>
                <Input name="indirizzo" placeholder="Indirizzo" value={formData.indirizzo} onChange={handleChange} className="md:col-span-2" required/>
                <Input name="azienda" placeholder="Azienda" value={formData.azienda} onChange={handleChange} className="md:col-span-2" required/>
            </div>
            <div className="flex justify-end mt-6 space-x-3 pt-4 border-t border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Annulla</Button>
                <Button type="submit">Salva Membro</Button>
            </div>
        </form>
    );
};

const ManageDirectoryScreen: React.FC = () => {
    const [members, setMembers] = useState<DirectoryMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<DirectoryMember | null>(null);
    const [itemToDelete, setItemToDelete] = useState<DirectoryMember | null>(null);

    const fetchDirectory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllDirectory();
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch directory", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDirectory();
    }, [fetchDirectory]);

    const handleSave = async (memberData: MemberFormData | DirectoryMember) => {
        if ('id' in memberData) {
            const { id, ...dataToUpdate } = memberData;
            await updateDirectoryMember(id, dataToUpdate);
        } else {
            await addDirectoryMember(memberData);
        }
        fetchDirectory();
        setIsModalOpen(false);
        setSelectedMember(null);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteDirectoryMember(itemToDelete.id);
            setMembers(currentMembers => currentMembers.filter(member => member.id !== itemToDelete.id));
        } catch (error) {
            console.error("Failed to delete directory member:", error);
            alert("Errore durante l'eliminazione del membro.");
        } finally {
            setItemToDelete(null);
        }
    };

     const handleToggleVisibility = async (member: DirectoryMember) => {
        await updateDirectoryMember(member.id, { isVisible: !member.isVisible });
        fetchDirectory();
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Caricamento lista...</div>;
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold">Lista Fratelli</h1>
                    <p className="text-gray-400 mt-1">Gestisci l'elenco dei membri e i loro contatti</p>
                </div>
                <Button onClick={() => { setSelectedMember(null); setIsModalOpen(true); }} className="flex items-center shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5">
                    <PlusCircle size={20} className="mr-2"/>
                    Aggiungi Membro
                </Button>
            </div>

            <div className="bg-brand-blue md:rounded-xl shadow-xl overflow-hidden md:border border-gray-700 bg-transparent md:bg-brand-blue">
                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700 block md:table">
                        <thead className="bg-gray-800/50 hidden md:table-header-group">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-gold uppercase tracking-wider">Nominativo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-gold uppercase tracking-wider">Professione</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-brand-gold uppercase tracking-wider w-24">Stato</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-gold uppercase tracking-wider w-32">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 block md:table-row-group">
                            {members.map(member => (
                                <tr key={member.id} className="hover:bg-brand-dark/20 transition-colors group block md:table-row bg-gray-800 md:bg-transparent mb-4 md:mb-0 rounded-lg md:rounded-none border border-gray-700 md:border-none p-4 md:p-0">
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap block md:table-cell">
                                        <div className="flex items-center">
                                            <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-brand-light">
                                                <User size={16}/>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-brand-light">{member.nome} {member.cognome}</div>
                                                <div className="text-xs text-gray-500">{member.telefono}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-300 block md:table-cell">
                                        <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mb-1 mt-2">Professione</span>
                                        {member.professione}
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap text-left md:text-center block md:table-cell">
                                        <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mr-2">Visibilità:</span>
                                        <button onClick={() => handleToggleVisibility(member)} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all ${member.isVisible ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-gray-700/30 text-gray-400 border border-gray-600'}`}>
                                            {member.isVisible ? <><Eye size={12} className="mr-1.5"/> Visibile</> : <><EyeOff size={12} className="mr-1.5"/> Nascosto</>}
                                        </button>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium block md:table-cell border-t border-gray-700 md:border-none mt-2 md:mt-0 pt-2 md:pt-4">
                                        <div className="flex items-center justify-end space-x-3 opacity-100 md:opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedMember(member); setIsModalOpen(true); }} className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-400/10 rounded-full flex items-center" title="Modifica"><span className="md:hidden mr-2">Modifica</span> <Edit size={18}/></button>
                                            <button onClick={() => setItemToDelete(member)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-full flex items-center" title="Elimina"><span className="md:hidden mr-2">Elimina</span> <Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedMember ? 'Modifica Membro' : 'Nuovo Membro'}>
                <MemberForm member={selectedMember} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>

            <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={confirmDelete} title="Elimina Membro" message={`Sei sicuro di voler rimuovere ${itemToDelete?.nome} ${itemToDelete?.cognome} dalla lista?`}/>
        </div>
    );
};

export default ManageDirectoryScreen;
