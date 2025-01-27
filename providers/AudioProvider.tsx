'use client';

import { AudioPlayerContextState } from "@/types";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

const MediaPlayerContext = createContext<AudioPlayerContextState | undefined>(undefined);

const MediaPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioPlayerContextState['currentTrack']>();
  const pathname = usePathname();

  useEffect(() => {
    if(pathname === '/create-podcast') setCurrentTrack(undefined);
  }, [pathname])

  return (
    <MediaPlayerContext.Provider value={{ currentTrack, setCurrentTrack }}>
      {children}
    </MediaPlayerContext.Provider>
  )
}

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);

  if(!context) throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');

  return context;
}

export default MediaPlayerProvider;