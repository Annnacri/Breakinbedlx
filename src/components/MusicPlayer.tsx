import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Play automatically on first user interaction if possible
  useEffect(() => {
    const handleFirstClick = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        setIsPlaying(true);
        window.removeEventListener('click', handleFirstClick);
      }
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, [hasInteracted]);

  return (
    <div className="fixed bottom-6 left-6 z-[100] group">
      {/* Hidden Player */}
      <div className="hidden pointer-events-none">
        <ReactPlayer
          url="https://www.youtube.com/watch?v=_v2vM4C5P7A"
          playing={isPlaying}
          loop={true}
          volume={0.3}
          config={{
            youtube: {
              playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
            }
          }}
        />
      </div>

      <div className="relative">
        <motion.button
          id="music-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying(!isPlaying);
            if (!hasInteracted) setHasInteracted(true);
          }}
          className={`w-12 h-12 flex items-center justify-center rounded-full shadow-2xl transition-all duration-500 overflow-hidden ${
            isPlaying 
              ? 'bg-brand-terracotta text-white' 
              : 'bg-white text-brand-dark'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="playing"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
              >
                <Volume2 className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="paused"
                initial={{ opacity: 0, rotate: 180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -180 }}
              >
                <VolumeX className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated rings when playing */}
          {isPlaying && (
            <>
              <motion.div
                className="absolute inset-0 border-2 border-white/40 rounded-full"
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 border-2 border-white/20 rounded-full"
                animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
            </>
          )}
        </motion.button>

        {/* Status tooltip */}
        <div 
          className="absolute left-14 top-1/2 -translate-y-1/2 px-4 py-2 bg-brand-dark/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl border border-white/10"
        >
          {isPlaying ? 'Som: Breakfast in Bed' : 'Som: Desligado'}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
