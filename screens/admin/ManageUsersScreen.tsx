import React, { useState, useEffect, useCallback } from 'react';
import { User, Role } from '../../types';
import { getUsers, updateUserRole } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Shield, User as UserIcon } from 'lucide-react';

const ManageUsersScreen: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data as User[]);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleRoleChange = async (user: User, newRole: Role) => {
        if(user.uid === currentUser?.uid && newRole === Role.USER){
            alert("Non puoi rimuovere il ruolo di amministratore a te stesso.");
            return;
        }
        if(window.confirm(`Sei sicuro di voler cambiare il ruolo di ${user.email} a ${newRole}?`)){
            try {
                await updateUserRole(user.uid, newRole);
                fetchUsers();
            } catch (error) {
                console.error("Error updating user role:", error);
                alert("Impossibile aggiornare il ruolo dell'utente.");
            }
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-400">Caricamento utenti...</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold">Gestione Utenti</h1>
                    <p className="text-gray-400 mt-1">Amministra i ruoli degli utenti registrati</p>
                </div>
                 <div className="bg-yellow-900/30 text-yellow-300 border border-yellow-800 text-sm p-4 rounded-lg">
                    <p>La creazione e l'eliminazione degli utenti va effettuata dalla <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-yellow-200">console di Firebase</a> per motivi di sicurezza.</p>
                </div>
            </div>
            
            <div className="bg-brand-blue md:rounded-xl shadow-xl overflow-hidden md:border border-gray-700 bg-transparent md:bg-brand-blue">
                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700 block md:table">
                        <thead className="bg-gray-800/50 hidden md:table-header-group">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-gold uppercase tracking-wider">Nominativo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-gold uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-brand-gold uppercase tracking-wider w-48">Ruolo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 block md:table-row-group">
                            {users.map(user => (
                                <tr key={user.uid} className="hover:bg-brand-dark/20 transition-colors group block md:table-row bg-gray-800 md:bg-transparent mb-4 md:mb-0 rounded-lg md:rounded-none border border-gray-700 md:border-none p-4 md:p-0">
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap block md:table-cell">
                                        <div className="flex items-center">
                                            <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center mr-3 text-brand-light">
                                                {user.role === Role.ADMIN ? <Shield size={16} className="text-yellow-400"/> : <UserIcon size={16}/>}
                                            </div>
                                            <div className="text-sm font-medium text-brand-light">{user.nome} {user.cognome}</div>
                                        </div>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap block md:table-cell">
                                        <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mr-2">Email:</span>
                                        <span className="text-sm text-gray-300">{user.email}</span>
                                    </td>
                                    <td className="px-0 md:px-6 py-2 md:py-4 whitespace-nowrap text-left md:text-center block md:table-cell">
                                        <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mr-2">Ruolo:</span>
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                                            disabled={currentUser?.uid === user.uid}
                                            className={`
                                                w-full md:w-auto bg-gray-700/50 text-brand-light border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-gold
                                                ${user.role === Role.ADMIN ? 'border-yellow-800 text-yellow-400' : 'border-blue-800 text-blue-400'}
                                                ${currentUser?.uid === user.uid ? 'cursor-not-allowed opacity-70' : ''}
                                            `}
                                        >
                                            <option value={Role.USER}>Utente</option>
                                            <option value={Role.ADMIN}>Amministratore</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsersScreen;
