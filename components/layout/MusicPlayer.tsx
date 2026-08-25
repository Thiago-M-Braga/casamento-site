"use client";

import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/config/wedding";
import { cn } from "@/lib/utils/cn";

/**
 * Música ambiente OPCIONAL.
 *
 * Regras (spec §26): nunca toca sozinha, nunca em volume alto, e o visitante
 * controla play/pause e volume. Não renderiza nada se não houver arquivo
 * configurado em `weddingConfig.music.src`.
 */
export function MusicPlayer() {
  const { src, title, defaultVolume } = weddingConfig.music;
  const enabled = weddingConfig.features.music && Boolean(src);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(defaultVolume);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  if (!enabled) return null;

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      audio.volume = volume;
      await audio.play();
      setPlaying(true);
      setExpanded(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
      <audio ref={audioRef} src={src} loop preload="none" />

      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `Pausar ${title}` : `Tocar ${title}`}
        className={cn(
          "flex items-center gap-2 rounded-full border border-green-200 bg-beige-50/95 px-4 py-2.5 text-[0.65rem] uppercase tracking-widest text-green-800 shadow-soft backdrop-blur transition-colors hover:border-green-400",
          playing && "border-bordo-300 text-bordo-600",
        )}
      >
        <span aria-hidden="true">{playing ? "🔊" : "🔈"}</span>
        <span className="hidden sm:inline">Música</span>
      </button>

      {expanded ? (
        <label className="flex items-center gap-2 rounded-full border border-green-200 bg-beige-50/95 px-3 py-2 shadow-soft backdrop-blur">
          <span className="sr-only">Volume da música</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="h-1 w-20 accent-bordo-500"
          />
        </label>
      ) : null}
    </div>
  );
}
