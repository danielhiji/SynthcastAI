// @ts-nocheck
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { formatTime } from "@/lib/formatTime";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Slider } from "./ui/slider";

const PLAY_TIME_REQUIRED_FOR_VIEW_IN_SECONDS = 10;

const PodcastPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const { audio, setAudio } = useAudio();
  const [hasViewBeenCounted, setHasViewBeenCounted] = useState(false);
  const incrementViews = useMutation(api.podcasts.incrementPodcastViews);

  const togglePlayPause = () => {
    if (audioRef.current?.paused) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const forward = () => {
    if (
      audioRef.current &&
      audioRef.current.currentTime &&
      audioRef.current.currentTime + 5 < audioRef.current.duration
    ) {
      audioRef.current.currentTime += 5;
    }
  };

  const rewind = () => {
    if (audioRef.current && audioRef.current.currentTime - 5 > 0) {
      audioRef.current.currentTime -= 5;
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateCurrentTime = () => {
      setCurrentTime(audioElement.currentTime);
      
      // Check if we should increment views
      if (
        !hasViewBeenCounted &&
        audioElement.currentTime >= PLAY_TIME_REQUIRED_FOR_VIEW_IN_SECONDS &&
        audio?.podcastId
      ) {
        incrementViews({ podcastId: audio.podcastId as Id<"podcasts"> });
        setHasViewBeenCounted(true);
      }
    };

    audioElement.addEventListener("timeupdate", updateCurrentTime);

    return () => {
      audioElement.removeEventListener("timeupdate", updateCurrentTime);
    };
  }, [audio?.podcastId, hasViewBeenCounted, incrementViews]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    if (!audio?.audioUrl) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }
    audioElement.play().then(() => setIsPlaying(true));
    setHasViewBeenCounted(false);
  }, [audio]);

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handlePlayerClose = () => {
    setAudio(undefined);
    setIsPlaying(false);
    setHasViewBeenCounted(false);
  };

  const handleVolumeChange = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = value / 100;
    audioRef.current.muted = value === 0;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const handleProgressChange = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  // set the volume to 0 when the audio is muted and vice versa
  useEffect(() => {
    if (!audioRef.current) return;
    setVolume(isMuted ? 0 : 100);
  }, [isMuted]);

  // set the volume and muted state when the volume or muted state changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  return (
    <div
      className={cn("sticky bottom-0 left-0 flex size-full flex-col", {
        hidden: !audio?.audioUrl || audio?.audioUrl === "",
      })}
    >
      <section className="glassmorphism-black relative flex h-[112px] w-full items-center justify-between px-4 max-md:justify-center md:gap-5 md:px-12">
        <audio
          ref={audioRef}
          src={audio?.audioUrl}
          className="hidden"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        >
          <track kind="captions" src="" label="English captions" />
        </audio>

        <div className="flex items-center gap-4 max-md:hidden">
          <Link href={`/podcasts/${audio?.podcastId}`}>
            <div className="relative w-16 h-16">
              <Image
                src={audio?.imageUrl || "/images/player1.png"}
                alt="podcast thumbnail"
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </Link>
          <div className="flex w-[160px] flex-col">
            <h2 className="text-14 truncate font-semibold text-white-1">
              {audio?.title}
            </h2>
            <p className="text-12 font-normal text-white-2">{audio?.author}</p>
          </div>
        </div>
        <div className="flex-center w-full max-w-[600px] flex-col gap-3">
          <div className="flex items-center cursor-pointer gap-3 md:gap-6">
            <div className="flex items-center gap-1.5">
              <div className="relative w-6 h-6">
                <Image
                  src="/icons/reverse.svg"
                  alt="rewind"
                  fill
                  className="object-contain cursor-pointer"
                  onClick={rewind}
                />
              </div>
              <h2 className="text-12 font-bold text-white-4">-5</h2>
            </div>
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={isPlaying ? "/icons/Pause.svg" : "/icons/Play.svg"}
                alt={isPlaying ? "pause" : "play"}
                fill
                className="object-contain cursor-pointer"
                onClick={togglePlayPause}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-12 font-bold text-white-4">+5</h2>
              <div className="relative w-6 h-6">
                <Image
                  src="/icons/forward.svg"
                  alt="forward"
                  fill
                  className="object-contain cursor-pointer"
                  onClick={forward}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full justify-between items-center gap-2">
            <div className="min-w-[40px] text-right text-sm font-normal text-white-2 max-md:hidden">
              {formatTime(currentTime)}
            </div>
            <div className="flex w-full h-4 items-center">
              <Slider
                min={0}
                max={duration}
                onValueChange={(value) => handleProgressChange(value[0])}
                value={[currentTime]}
                aria-label="Progress"
              />
            </div>

            <div className="min-w-[40px] text-left text-sm font-normal text-white-2 max-md:hidden">
              {formatTime(duration)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex w-full items-center justify-center h-full gap-2">
            <div className="relative w-6 h-6 md:block hidden">
              <Image
                src={isMuted ? "/icons/unmute.svg" : "/icons/mute.svg"}
                alt="mute unmute"
                fill
                className="object-contain cursor-pointer"
                onClick={toggleMute}
              />
            </div>
            <Slider
              min={0}
              max={100}
              onValueChange={(value) => handleVolumeChange(value[0])}
              value={[volume]}
              className="w-full md:min-w-[93px] hidden md:flex h-4"
              aria-label="Volume"
            />
          </div>
        </div>
        <div className="relative w-6 h-6">
          <Image
            src="/icons/close-circle.svg"
            alt="close"
            fill
            className="object-contain cursor-pointer absolute top-2 right-4"
            onClick={handlePlayerClose}
          />
        </div>
      </section>
    </div>
  );
};

export default PodcastPlayer;
