import React, { useState, useEffect } from 'react';
import { InfoBox } from '../../types';
import { getInfoBoxes } from '../../services/firebase';
import { Info } from 'lucide-react';

const InfoScreen: React.FC = () => {
  const [boxes, setBoxes] = useState<InfoBox[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const data = await getInfoBoxes();
        setBoxes(data);
      } catch (error) {
        console.error("Failed to fetch info boxes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  if (loading) return <div className="text-center p-10">Caricamento informazioni...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-gold mb-6 flex items-center">
        <Info className="mr-3" /> Informazioni Utili
      </h1>
      <p className="text-gray-400 mb-8">Informazioni di servizio e linee guida per i Fratelli della Loggia.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boxes.map(box => (
          <div key={box.id} className="bg-brand-blue rounded-lg shadow-lg p-6 border-t-4 border-brand-gold hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold text-brand-light mb-4">{box.titolo}</h3>
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {box.contenuto}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoScreen;
