import React, { useState, useEffect, useRef } from 'react';
import { AudioGuide } from '../../types';
import { getAudioGuides } from '../../services/firebase';
import { Play, Pause } from 'lucide-react';

const AudioPlayer: React.FC<{ guide: AudioGuide }> = ({ guide }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            if (isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };
        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handlePause);

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handlePause);
        };
    }, []);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(e => console.error("Error playing audio:", e));
        }
    };
    
    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const progress = progressRef.current;
        if (!audio || !progress || !isFinite(duration) || duration === 0) return;

        const rect = progress.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = progress.offsetWidth;
        const newTime = (clickX / width) * duration;
        
        audio.currentTime = newTime;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="bg-gray-800 p-4 rounded-b-lg">
            <audio ref={audioRef} src={guide.urlAudio} preload="metadata" style={{ display: 'none' }}></audio>
            <div className="flex items-center space-x-4">
                <button onClick={togglePlayPause} className="p-2 bg-brand-gold rounded-full text-brand-dark focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="flex-1">
                    <div ref={progressRef} onClick={handleProgressClick} className="w-full bg-gray-600 rounded-full h-1.5 cursor-pointer group">
                        <div className="bg-brand-gold h-1.5 rounded-full relative" style={{ width: `${progressPercentage}%` }}>
                           <div className="absolute right-0 top-1/2 -mt-1.5 -mr-1.5 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const AudioGuidesScreen: React.FC = () => {
  const [guides, setGuides] = useState<AudioGuide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const data = await getAudioGuides();
        setGuides(data);
      } catch (error) {
        console.error("Failed to fetch audio guides", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  if (loading) return <div className="text-center p-10">Caricamento guide...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-gold mb-6">Audio Guide</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {guides.map(guide => (
          <div key={guide.id} className="bg-brand-blue rounded-lg shadow-lg flex flex-col">
            <img src={guide.urlImmagine} alt={guide.nomeFile} className="w-full h-48 object-cover rounded-t-lg"/>
            <div className="p-4 flex-1">
              <h3 className="font-semibold text-brand-light">{guide.nomeFile}</h3>
            </div>
            <AudioPlayer guide={guide} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioGuidesScreen;
