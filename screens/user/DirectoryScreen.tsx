import React, { useState, useEffect, useMemo } from 'react';
import { DirectoryMember } from '../../types';
import { getDirectory } from '../../services/firebase';
import Input from '../../components/ui/Input';
import { User, Briefcase, MapPin, Building, Phone } from 'lucide-react';


const DirectoryScreen: React.FC = () => {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const data = await getDirectory();
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch directory", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(member =>
      member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.professione.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  if (loading) return <div className="text-center p-10">Caricamento lista...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-gold mb-6">Fratelli in Lista</h1>
      <div className="mb-6 max-w-lg">
        <Input
          type="text"
          placeholder="Cerca per nome, cognome o professione..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="bg-brand-blue md:rounded-lg shadow-lg overflow-hidden bg-transparent md:bg-brand-blue">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700 block md:table">
            <thead className="bg-gray-800 hidden md:table-header-group">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gold uppercase tracking-wider">Nominativo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gold uppercase tracking-wider">Contatti</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gold uppercase tracking-wider">Professione</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gold uppercase tracking-wider">Azienda</th>
              </tr>
            </thead>
            <tbody className="bg-transparent md:bg-brand-blue divide-y divide-gray-700 block md:table-row-group">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-gray-800 block md:table-row bg-gray-800 md:bg-transparent mb-4 md:mb-0 rounded-lg md:rounded-none p-4 md:p-0 border border-gray-700 md:border-none shadow-md md:shadow-none">
                  <td className="px-0 md:px-6 py-2 md:py-4 block md:table-cell">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center">
                           <User className="h-6 w-6 text-brand-light"/>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-brand-light text-lg md:text-sm">{member.nome} {member.cognome}</div>
                            {/* Mobile only info that usually goes in other columns */}
                            <div className="md:hidden text-gray-400 text-sm mt-1">{member.professione}</div>
                        </div>
                    </div>
                  </td>
                  
                  <td className="px-0 md:px-6 py-2 md:py-4 block md:table-cell border-t border-gray-700 md:border-none mt-2 md:mt-0 pt-2 md:pt-4">
                    <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mb-1 block">Contatti</span>
                    <div className="text-sm text-gray-300">
                        <div className="flex items-center md:block">
                            <Phone className="md:hidden w-4 h-4 mr-2 text-gray-500" />
                            {member.telefono}
                        </div>
                        <div className="text-gray-400 text-xs md:text-sm mt-1 md:mt-0 flex items-center md:block">
                             <MapPin className="md:hidden w-4 h-4 mr-2 text-gray-500" />
                            {member.indirizzo}
                        </div>
                    </div>
                  </td>

                  <td className="px-0 md:px-6 py-2 md:py-4 block md:table-cell border-t border-gray-700 md:border-none mt-2 md:mt-0 pt-2 md:pt-4">
                      <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mb-1 block">Professione</span>
                      <div className="flex items-center text-sm text-gray-300">
                          <Briefcase className="mr-2 h-4 w-4 text-brand-gold hidden md:block"/>
                          {member.professione}
                      </div>
                  </td>
                   <td className="px-0 md:px-6 py-2 md:py-4 block md:table-cell border-t border-gray-700 md:border-none mt-2 md:mt-0 pt-2 md:pt-4">
                      <span className="md:hidden text-xs text-brand-gold font-bold uppercase tracking-wider mb-1 block">Azienda</span>
                      <div className="flex items-center text-sm text-gray-300">
                          <Building className="mr-2 h-4 w-4 text-brand-gold hidden md:block"/>
                          {member.azienda}
                      </div>
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

export default DirectoryScreen;
