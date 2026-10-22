import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function SoundAmbiance() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const stopAudio = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1.2);
      setTimeout(() => {
        oscillatorsRef.current.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped
          }
        });
        oscillatorsRef.current = [];
        setIsPlaying(false);
      }, 1250);
    } else {
      setIsPlaying(false);
    }
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 2.5);
      gainNodeRef.current = masterGain;

      // Filter for warm ethereal tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // Warm ambient chord: F# minor 9th (F#2, C#3, A3, E4)
      const frequencies = [92.5, 138.59, 220.0, 329.63];
      const oscs: OscillatorNode[] = [];

      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(index === 0 ? 0.6 : 0.25, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      oscillatorsRef.current = oscs;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // ignore
        }
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors rounded-full border border-white/10 hover:border-white/25 bg-white/[0.02] backdrop-blur-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/50"
      aria-label={isPlaying ? 'Mute ambient sound' : 'Enable ambient sound'}
      title={isPlaying ? 'Mute ambient sound' : 'Enable ambient sound'}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-mono text-[11px] tracking-wider uppercase">Ambiance On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono text-[11px] tracking-wider uppercase">Ambiance Off</span>
        </>
      )}
    </button>
  );
}
